import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import type {
  GeminiImageModel,
  PostGenerationInput,
  PosterPromptOutput,
  ImageVariation,
  ReferenceImage,
} from "@/lib/types/postGeneration";
import { POST_IMAGE_SIZES } from "@/lib/types/postGeneration";
import { buildPosterPrompt } from "@/lib/postGeneration/posterPromptBuilder";

// Imagen models use generateImages(); Gemini models use generateContent()
const IMAGEN_MODELS = new Set([
  "imagen-4.0-generate-001",
  "imagen-4.0-fast-generate-001",
  "imagen-4.0-ultra-generate-001",
]);

// Platform to aspect ratio mapping
const PLATFORM_ASPECT_RATIO: Record<string, string> = {
  instagram_post: "1:1",
  instagram_story: "9:16",
  linkedin: "16:9",
  x: "16:9",
  facebook: "16:9",
  tiktok: "9:16",
  pinterest: "2:3",
  youtube_community: "16:9",
};

/** Extract base64 string from a data URL or return as-is if already raw base64 */
function stripDataUrlPrefix(dataUrl: string): string {
  // Use indexOf + slice instead of regex to avoid call stack overflow on large base64 strings
  const marker = ";base64,";
  const markerIdx = dataUrl.indexOf(marker);
  if (markerIdx !== -1) {
    return dataUrl.slice(markerIdx + marker.length);
  }
  return dataUrl;
}

/** Call Gemini generateContent() and extract the first image part */
async function callGeminiGenerateContent(
  ai: GoogleGenAI,
  modelId: string,
  prompt: string,
  logoBase64?: string,
  logoMimeType?: string,
  referenceImages?: ReferenceImage[]
): Promise<{ data: string; mimeType: string } | null> {
  const contentParts: object[] = [];

  // Inject reference images first (subject/style references)
  if (referenceImages && referenceImages.length > 0) {
    for (const ref of referenceImages) {
      const mimeMatch = ref.dataUrl.match(/^data:([^;]+);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64 = stripDataUrlPrefix(ref.dataUrl);
      contentParts.push({
        inlineData: { mimeType: mime, data: base64 },
      });
      // Add a label so the model understands what this reference is
      if (ref.label) {
        contentParts.push({ text: `[Reference: ${ref.label}]` });
      }
    }
  }

  // If logo provided, inject as a reference image
  if (logoBase64) {
    contentParts.push({
      inlineData: {
        mimeType: logoMimeType ?? "image/png",
        data: logoBase64,
      },
    });
    contentParts.push({ text: "[Logo — include in image]" });
  }

  // Text prompt
  contentParts.push({ text: prompt });

  const config: Record<string, unknown> = {
    responseModalities: [Modality.IMAGE, Modality.TEXT],
  };

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ role: "user", parts: contentParts }],
    config,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if ("inlineData" in part && part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }
  return null;
}

/** Call Imagen generateImages() — supports numberOfImages natively */
async function callImagenGenerateImages(
  ai: GoogleGenAI,
  modelId: string,
  prompt: string,
  aspectRatio: string,
  count: number
): Promise<Array<{ data: string; mimeType: string }>> {
  const response = await ai.models.generateImages({
    model: modelId,
    prompt,
    config: {
      numberOfImages: count,
      aspectRatio,
    },
  });

  const results: Array<{ data: string; mimeType: string }> = [];
  for (const generatedImage of response.generatedImages ?? []) {
    const imageBytes = generatedImage.image?.imageBytes;
    if (imageBytes) {
      const data =
        typeof imageBytes === "string"
          ? imageBytes
          : Buffer.from(imageBytes as Uint8Array).toString("base64");
      results.push({ data, mimeType: "image/png" });
    }
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const body = (await req.json()) as {
      posterOutput: PosterPromptOutput;
      input: PostGenerationInput;
      imageModel?: GeminiImageModel;
      accountId?: string;
    };

    if (!body.posterOutput || !body.input) {
      return NextResponse.json(
        { error: "posterOutput and input are required" },
        { status: 400 }
      );
    }

    // Server-side persona brand asset merge — fills missing brandAssets from persona
    try {
      if (auth.userId && body.accountId) {
        const persona = await getPersonaByUserAndAccount(auth.userId, body.accountId);
        if (persona) {
          const personaColors = persona.colorPalette?.length
            ? persona.colorPalette
            : persona.brandColorHex ? [persona.brandColorHex] : [];
          if (body.input.brandAssets.colorPalette.length === 0 && personaColors.length > 0) {
            body.input.brandAssets.colorPalette = personaColors;
          }
          if (!body.input.brandAssets.fontFamily && persona.fontFamily) {
            body.input.brandAssets.fontFamily = persona.fontFamily;
          }
          if (!body.input.brandAssets.logoUrl && persona.logoUrl) {
            body.input.brandAssets.logoUrl = persona.logoUrl;
          }
        }
      }
    } catch {
      // Non-fatal — proceed without persona brand assets
    }

    const modelId: string = body.imageModel ?? "gemini-2.5-flash-image";
    const primaryPlatform = body.input.platforms[0] ?? "instagram_post";
    // Prefer explicit user size selection over platform default
    const selectedSize = POST_IMAGE_SIZES.find((s) => s.id === body.input.imageSize);
    const aspectRatio = selectedSize?.ratio ?? PLATFORM_ASPECT_RATIO[primaryPlatform] ?? "1:1";
    const imageSizeLabel = selectedSize
      ? `${selectedSize.width}×${selectedSize.height}`
      : undefined;

    // Build the complete poster prompt
    const posterPrompt = buildPosterPrompt(body.input, body.posterOutput, aspectRatio);

    // Append reference image labels to the prompt text for Imagen (which can't take inline images)
    const referenceImages = body.input.referenceImages ?? [];
    let promptWithRefs = posterPrompt;
    if (referenceImages.length > 0) {
      const refDescriptions = referenceImages
        .map((r) => r.label || "reference subject")
        .join(", ");
      promptWithRefs = `${posterPrompt}\n\nIncorporate the following subjects/elements in the image: ${refDescriptions}.`;
    }

    // Extract logo base64 if provided
    let logoBase64: string | undefined;
    let logoMimeType: string | undefined;
    if (body.input.brandAssets.logoUrl) {
      const raw = body.input.brandAssets.logoUrl;
      // Detect mime type from data URL prefix
      const mimeMatch = raw.match(/^data:([^;]+);base64,/);
      logoMimeType = mimeMatch ? mimeMatch[1] : "image/png";
      logoBase64 = stripDataUrlPrefix(raw);
    }

    const ai = new GoogleGenAI({ apiKey });
    const imageVariations: ImageVariation[] = [];

    try {
      if (IMAGEN_MODELS.has(modelId)) {
        // Imagen: single call with numberOfImages: 3
        // Imagen doesn't support inline reference images — labels are injected into the prompt text
        const results = await callImagenGenerateImages(ai, modelId, promptWithRefs, aspectRatio, 3);
        results.forEach((result, index) => {
          imageVariations.push({
            id: index + 1,
            imageUrl: `data:${result.mimeType};base64,${result.data}`,
            model: modelId,
            aspectRatio,
          });
        });
      } else {
        // Gemini: 3 parallel generateContent() calls, with reference images injected as inline parts
        const calls = await Promise.allSettled([
          callGeminiGenerateContent(ai, modelId, posterPrompt, logoBase64, logoMimeType, referenceImages),
          callGeminiGenerateContent(ai, modelId, posterPrompt, logoBase64, logoMimeType, referenceImages),
          callGeminiGenerateContent(ai, modelId, posterPrompt, logoBase64, logoMimeType, referenceImages),
        ]);

        calls.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            imageVariations.push({
              id: index + 1,
              imageUrl: `data:${result.value.mimeType};base64,${result.value.data}`,
              model: modelId,
              aspectRatio,
            });
          } else if (result.status === "rejected") {
            console.warn(`Variation ${index + 1} failed:`, result.reason);
          }
        });
      }
    } catch (aiError) {
      console.error("Image generation error:", aiError);
      return NextResponse.json(
        {
          error: "Image generation failed",
          details: aiError instanceof Error ? aiError.message : String(aiError),
        },
        { status: 500 }
      );
    }

    if (imageVariations.length === 0) {
      return NextResponse.json(
        { error: "No images were generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: imageVariations,
      aspectRatio,
      model: modelId,
    });
  } catch (error) {
    console.error("Generate image route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

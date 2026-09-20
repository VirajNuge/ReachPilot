import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { AI_MODELS } from "@/lib/aiConfig";
import { generateImage, getSafeAiError } from "@/lib/ai/openrouter";
import type {
  CreativeHandoffV2,
  ImageCreativeDirectorOutput,
  PostGenerationInput,
  PosterPromptOutput,
  ImageVariation,
} from "@/lib/types/postGeneration";
import { POST_IMAGE_SIZES } from "@/lib/types/postGeneration";
import { buildPosterPrompt, PLATFORM_ASPECT_RATIO } from "@/lib/postGeneration/posterPromptBuilder";
import { POSTGEN_CREATIVE_DIRECTOR_STAGE } from "@/lib/postGeneration/featureFlags";

function stripDataUrlPrefix(dataUrl: string): string {
  return dataUrl.includes(";base64,") ? dataUrl.slice(dataUrl.indexOf(";base64,") + 8) : dataUrl;
}

function normalizeImageReference(value: string): string {
  if (value.startsWith("data:")) return value;
  return `data:image/png;base64,${stripDataUrlPrefix(value)}`;
}

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      posterOutput: PosterPromptOutput;
      creativeHandoff?: CreativeHandoffV2;
      creativeDirector?: ImageCreativeDirectorOutput;
      input: PostGenerationInput;
      imageModel?: string;
      accountId?: string;
    };

    if (!body.posterOutput || !body.input) {
      return NextResponse.json({ error: "posterOutput and input are required" }, { status: 400 });
    }

    const maxImagePayload = 10 * 1024 * 1024;
    const logoUrl = body.input.brandAssets?.logoUrl;
    if (logoUrl && logoUrl.length > maxImagePayload) {
      return NextResponse.json({ error: "Logo image is too large (max 10MB)" }, { status: 413 });
    }
    for (const reference of body.input.referenceImages ?? []) {
      if (reference.dataUrl.length > maxImagePayload) {
        return NextResponse.json({ error: "Reference image is too large (max 10MB)" }, { status: 413 });
      }
    }

    try {
      if (body.accountId) {
        const persona = await getPersonaByUserAndAccount(auth.userId, body.accountId);
        if (persona) {
          const personaColors = persona.colorPalette?.length
            ? persona.colorPalette
            : persona.brandColorHex
              ? [persona.brandColorHex]
              : [];
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
      // Persona assets are an enhancement; image generation can continue without them.
    }

    const primaryPlatform = body.input.platforms[0] ?? "instagram_post";
    const selectedSize = POST_IMAGE_SIZES.find((size) => size.id === body.input.imageSize);
    const aspectRatio = selectedSize?.ratio ?? PLATFORM_ASPECT_RATIO[primaryPlatform] ?? "1:1";
    const posterPrompt = buildPosterPrompt(
      body.input,
      body.posterOutput,
      body.creativeHandoff,
      POSTGEN_CREATIVE_DIRECTOR_STAGE ? body.creativeDirector : undefined,
      aspectRatio,
    );

    const references = [
      ...(body.input.referenceImages ?? []).map((reference) => normalizeImageReference(reference.dataUrl)),
      ...(body.input.brandAssets.logoUrl
        ? [normalizeImageReference(body.input.brandAssets.logoUrl)]
        : []),
    ];

    const result = await generateImage({
      model: body.imageModel ?? AI_MODELS.IMAGE_DEFAULT,
      prompt: posterPrompt,
      aspectRatio,
      count: 1,
      referenceImages: references.length > 0 ? references : undefined,
    });

    const images: ImageVariation[] = result.images.map((image, index) => ({
      id: index + 1,
      imageUrl: `data:${image.mimeType};base64,${image.data}`,
      model: result.model,
      aspectRatio,
    }));

    return NextResponse.json({ images, aspectRatio, model: result.model });
  } catch (error) {
    const safe = getSafeAiError(error);
    console.error("[generate-image] AI request failed", { code: safe.code, requestId: safe.requestId });
    return NextResponse.json(
      { error: safe.message, code: safe.code, requestId: safe.requestId },
      { status: safe.code === "rate_limit" ? 429 : 502 },
    );
  }
}

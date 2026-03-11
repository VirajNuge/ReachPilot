import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { buildPosterPromptGeneratorPrompt } from "@/lib/postGeneration/posterPromptBuilder";
import type {
  ContentStrategyOutput,
  PosterPromptOutput,
  PostGenerationInput,
  LayoutStyle,
} from "@/lib/types/postGeneration";

const VALID_LAYOUTS: LayoutStyle[] = [
  "hero_center",
  "top_headline",
  "split_layout",
  "bottom_overlay",
  "minimal_card",
];

function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPosterPromptOutput(value: unknown): value is PosterPromptOutput {
  if (!isObject(value)) return false;
  return (
    typeof value.posterPrompt === "string" &&
    typeof value.headline === "string" &&
    typeof value.subtext === "string" &&
    typeof value.cta === "string" &&
    typeof value.layout === "string" &&
    VALID_LAYOUTS.includes(value.layout as LayoutStyle) &&
    typeof value.typographyStyle === "string" &&
    typeof value.compositionNotes === "string"
  );
}

/**
 * Load persona context text and return persona document for brand asset merging.
 */
async function loadPersonaData(accountId?: string): Promise<{
  personaContext: string;
  colorPalette: string[];
  fontFamily: string;
  logoUrl: string;
}> {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) return { personaContext: "", colorPalette: [], fontFamily: "", logoUrl: "" };
    const persona = await getPersonaByUserAndAccount(auth.userId, accountId);
    if (!persona) return { personaContext: "", colorPalette: [], fontFamily: "", logoUrl: "" };

    const personaContext = buildContentGenerationContext(persona);
    // Derive color palette: prefer colorPalette array, fall back to single brandColorHex
    const colorPalette =
      persona.colorPalette?.length
        ? persona.colorPalette
        : persona.brandColorHex
        ? [persona.brandColorHex]
        : [];

    return {
      personaContext,
      colorPalette,
      fontFamily: persona.fontFamily ?? "",
      logoUrl: persona.logoUrl ?? "",
    };
  } catch {
    return { personaContext: "", colorPalette: [], fontFamily: "", logoUrl: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      input?: PostGenerationInput;
      strategy?: ContentStrategyOutput;
      accountId?: string;
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json(
        { error: "input and strategy are required" },
        { status: 400 },
      );
    }

    const personaData = await loadPersonaData(body.accountId);

    // Server-side merge: fill missing brand assets from persona
    const mergedBrandAssets = { ...body.input.brandAssets };
    if (mergedBrandAssets.colorPalette.length === 0 && personaData.colorPalette.length > 0) {
      mergedBrandAssets.colorPalette = personaData.colorPalette;
    }
    if (!mergedBrandAssets.fontFamily && personaData.fontFamily) {
      mergedBrandAssets.fontFamily = personaData.fontFamily;
    }
    if (!mergedBrandAssets.logoUrl && personaData.logoUrl) {
      mergedBrandAssets.logoUrl = personaData.logoUrl;
    }
    const mergedInput: PostGenerationInput = { ...body.input, brandAssets: mergedBrandAssets };

    const { systemPrompt, generatorPrompt } = buildPosterPromptGeneratorPrompt(
      mergedInput,
      body.strategy,
      personaData.personaContext,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    let responseText = "";
    try {
      const result = await model.generateContent(generatorPrompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Poster prompt AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Poster prompt JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isPosterPromptOutput(parsed)) {
      console.error("Invalid poster prompt shape:", parsed);
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ imagePrompt: parsed });
  } catch (error) {
    console.error("Image prompt route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

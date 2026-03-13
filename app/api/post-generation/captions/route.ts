import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { buildCaptionGeneratorPrompt } from "@/lib/postGenerationPrompts";
import { parseAIJson } from "@/lib/parseAIJson";
import type {
  CaptionGeneratorOutput,
  ContentStrategyOutput,
  PostGenerationInput,
  PostPlatform,
} from "@/lib/types/postGeneration";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeCaptionOutput(
  value: unknown,
  input: PostGenerationInput,
): CaptionGeneratorOutput | null {
  if (!isObject(value) || !isObject(value.hashtags)) return null;

  const hashtags = value.hashtags;
  if (
    !isStringArray(hashtags.highReach) ||
    !isStringArray(hashtags.niche) ||
    !isStringArray(hashtags.branded)
  ) {
    return null;
  }

  const captionsValue = value.captions;
  if (Array.isArray(captionsValue)) {
    const allValid = captionsValue.every(
      (item) =>
        isObject(item) &&
        typeof item.platform === "string" &&
        typeof item.caption === "string" &&
        typeof item.characterCount === "number",
    );
    if (!allValid) return null;

    return {
      captions: captionsValue as CaptionGeneratorOutput["captions"],
      hashtags: {
        highReach: hashtags.highReach,
        niche: hashtags.niche,
        branded: hashtags.branded,
      },
    };
  }

  if (!isObject(captionsValue)) return null;

  const captions = input.platforms
    .map((platform) => {
      const caption = captionsValue[platform as PostPlatform];
      if (typeof caption !== "string") return null;
      return {
        platform,
        caption,
        characterCount: caption.length,
      };
    })
    .filter((item): item is CaptionGeneratorOutput["captions"][number] => item !== null);

  return {
    captions,
    hashtags: {
      highReach: hashtags.highReach,
      niche: hashtags.niche,
      branded: hashtags.branded,
    },
  };
}

async function loadPersonaContext(accountId?: string): Promise<string> {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) return "";
    const persona = await getPersonaByUserAndAccount(auth.userId, accountId);
    if (!persona) return "";
    return buildContentGenerationContext(persona);
  } catch {
    return "";
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
      includePersona?: boolean;
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json(
        { error: "input and strategy are required" },
        { status: 400 },
      );
    }

    const personaContext = body.includePersona ? await loadPersonaContext(body.accountId) : "";
    const prompt = buildCaptionGeneratorPrompt(
      body.input,
      body.strategy,
      personaContext,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Captions AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Captions JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    const normalized = normalizeCaptionOutput(parsed, body.input);
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ captions: normalized });
  } catch (error) {
    console.error("Captions route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

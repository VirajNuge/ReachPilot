import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { buildCaptionGeneratorPrompt } from "@/lib/postGenerationPrompts";
import { parseAIJson } from "@/lib/parseAIJson";
import { AI_MODELS } from "@/lib/aiConfig";
import { getWritingStyleById } from "@/lib/models/adminStyles";
import { getCaptionTemplateById } from "@/lib/models/captionTemplates";
import type { WritingStyleDocument } from "@/lib/models/adminStyles";
import type { CaptionTemplateDocument } from "@/lib/models/captionTemplates";
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

function clampCaptionOptions(options: string[], fallback?: string): string[] {
  const normalized = options
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const unique = Array.from(new Set(normalized));
  const limited = unique.slice(0, 3);

  if (limited.length > 0) {
    return limited;
  }

  return fallback ? [fallback] : [];
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
    .map((platform): CaptionGeneratorOutput["captions"][number] | null => {
      const rawCaption = captionsValue[platform as PostPlatform];
      if (typeof rawCaption === "string") {
        return {
          platform,
          caption: rawCaption,
          characterCount: rawCaption.length,
          options: [rawCaption],
        };
      }

      if (isStringArray(rawCaption) && rawCaption.length > 0) {
        const options = clampCaptionOptions(rawCaption);
        const firstCaption = options[0];
        return {
          platform,
          caption: firstCaption,
          characterCount: firstCaption.length,
          options,
        };
      }

      if (isObject(rawCaption) && isStringArray(rawCaption.options) && rawCaption.options.length > 0) {
        const options = clampCaptionOptions(rawCaption.options);
        const firstCaption = options[0];
        return {
          platform,
          caption: firstCaption,
          characterCount: firstCaption.length,
          options,
        };
      }

      return null;
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

async function loadPersonaContext(userId: string, accountId?: string): Promise<string> {
  try {
    const persona = await getPersonaByUserAndAccount(userId, accountId);
    if (!persona) return "";
    return buildContentGenerationContext(persona);
  } catch {
    return "";
  }
}

// Normalise loose platform aliases to canonical PostPlatform values
const PLATFORM_ALIAS_MAP: Record<string, string> = {
  instagram: "instagram_post",
  twitter: "x",
};

function normalisePlatforms(platforms: string[]): string[] {
  return platforms.map((p) => PLATFORM_ALIAS_MAP[p.toLowerCase()] ?? p);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

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

    const personaContext = body.includePersona ? await loadPersonaContext(userId, body.accountId) : "";

    // Normalise platform aliases (e.g. "instagram" → "instagram_post", "twitter" → "x")
    if (body.input.platforms) {
      body.input.platforms = normalisePlatforms(body.input.platforms) as typeof body.input.platforms;
    }

    // Fetch writing style if provided
    let writingStyle: WritingStyleDocument | undefined;
    if (body.input.writingStyleId) {
      try {
        const fetched = await getWritingStyleById(body.input.writingStyleId);
        if (fetched) writingStyle = fetched;
      } catch {
        // Non-fatal — proceed without writing style
      }
    }

    // Fetch DB caption template if provided
    let dbTemplate: CaptionTemplateDocument | undefined;
    if (body.input.selectedTemplateId) {
      try {
        const fetched = await getCaptionTemplateById(body.input.selectedTemplateId);
        if (fetched) dbTemplate = fetched;
      } catch {
        // Non-fatal — proceed without DB template
      }
    }

    const prompt = buildCaptionGeneratorPrompt(
      body.input,
      body.strategy,
      personaContext,
      writingStyle,
      dbTemplate,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });

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

    return NextResponse.json({
      captions: normalized,
      usedTemplateId: dbTemplate?._id?.toString(),
      usedTemplateName: dbTemplate?.name,
      templateAutoSelected: false,
      templateAICurated: false,
    });
  } catch (error) {
    console.error("Captions route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

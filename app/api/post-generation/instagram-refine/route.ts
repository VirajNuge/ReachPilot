import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildInstagramRefinePrompt } from "@/lib/postGenerationPrompts";
import type {
  ContentStrategyOutput,
  PostGenerationInput,
  InstagramPostType,
} from "@/lib/types/postGeneration";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const VALID_POST_TYPES = new Set<InstagramPostType>([
  "carousel_tips",
  "mini_story",
  "myth_vs_fact",
  "step_by_step_guide",
  "mistake_list",
]);

interface InstagramRefineResult {
  refinedCaption: string;
  engagementScore: number;
  qualityFlags: string[];
  postType: InstagramPostType;
}

function normalizeRefineOutput(value: unknown): InstagramRefineResult | null {
  if (!isObject(value)) return null;

  const { refinedCaption, engagementScore, qualityFlags, postType } = value;

  if (typeof refinedCaption !== "string" || !refinedCaption.trim()) return null;
  if (typeof engagementScore !== "number" || engagementScore < 1 || engagementScore > 10) return null;
  if (!isStringArray(qualityFlags)) return null;

  const resolvedPostType: InstagramPostType =
    typeof postType === "string" && VALID_POST_TYPES.has(postType as InstagramPostType)
      ? (postType as InstagramPostType)
      : "carousel_tips";

  return {
    refinedCaption: refinedCaption.trim(),
    engagementScore: Math.round(engagementScore),
    qualityFlags,
    postType: resolvedPostType,
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

async function runRefine(
  caption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext: string,
  genAI: GoogleGenerativeAI
): Promise<InstagramRefineResult | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = buildInstagramRefinePrompt(caption, input, strategy, personaContext);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseAIJson(text);
    return normalizeRefineOutput(parsed);
  } catch (err) {
    console.error("Instagram refine AI error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      caption?: string;
      input?: PostGenerationInput;
      strategy?: ContentStrategyOutput;
      accountId?: string;
      includePersona?: boolean;
    };

    if (!body.caption || !body.input || !body.strategy) {
      return NextResponse.json(
        { error: "caption, input, and strategy are required" },
        { status: 400 }
      );
    }

    const personaContext = body.includePersona ? await loadPersonaContext(body.accountId) : "";
    const genAI = new GoogleGenerativeAI(apiKey);

    // First refinement pass
    let refined = await runRefine(body.caption, body.input, body.strategy, personaContext, genAI);

    if (!refined) {
      return NextResponse.json(
        { error: "Failed to refine Instagram post" },
        { status: 500 }
      );
    }

    // Auto-regenerate if engagement score is below 8
    if (refined.engagementScore < 8) {
      const secondPass = await runRefine(
        refined.refinedCaption,
        body.input,
        body.strategy,
        personaContext,
        genAI
      );
      // Only use second pass if it's actually better
      if (secondPass && secondPass.engagementScore > refined.engagementScore) {
        refined = secondPass;
      }
    }

    return NextResponse.json({
      refinedCaption: refined.refinedCaption,
      engagementScore: refined.engagementScore,
      qualityFlags: refined.qualityFlags,
      postType: refined.postType,
    });
  } catch (error) {
    console.error("Instagram refine route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

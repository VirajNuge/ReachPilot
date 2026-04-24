import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildXRefinePrompt } from "@/lib/postGenerationPrompts";
import { AI_MODELS } from "@/lib/aiConfig";
import type {
  ContentStrategyOutput,
  PostGenerationInput,
} from "@/lib/types/postGeneration";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

interface XRefineResult {
  refinedPost: string;
  engagementScore: number;
  qualityFlags: string[];
}

function normalizeRefineOutput(value: unknown): XRefineResult | null {
  if (!isObject(value)) return null;

  const { refinedPost, engagementScore, qualityFlags } = value;

  if (typeof refinedPost !== "string" || !refinedPost.trim()) return null;
  if (typeof engagementScore !== "number" || engagementScore < 1 || engagementScore > 10) return null;
  if (!isStringArray(qualityFlags)) return null;

  return {
    refinedPost: refinedPost.trim(),
    engagementScore: Math.round(engagementScore),
    qualityFlags,
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

async function runRefine(
  caption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext: string,
  genAI: GoogleGenerativeAI
): Promise<XRefineResult | null> {
  const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });
  const prompt = buildXRefinePrompt(caption, input, strategy, personaContext);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseAIJson(text);
    return normalizeRefineOutput(parsed);
  } catch (err) {
    console.error("X refine AI error:", err);
    return null;
  }
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

    const personaContext = body.includePersona ? await loadPersonaContext(userId, body.accountId) : "";
    const genAI = new GoogleGenerativeAI(apiKey);

    // First refinement pass
    let refined = await runRefine(body.caption, body.input, body.strategy, personaContext, genAI);

    if (!refined) {
      return NextResponse.json(
        { error: "Failed to refine X post" },
        { status: 500 }
      );
    }

    // Auto-regenerate if engagement score is below 8
    if (refined.engagementScore < 8) {
      const secondPass = await runRefine(
        refined.refinedPost,
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
      refinedPost: refined.refinedPost,
      engagementScore: refined.engagementScore,
      qualityFlags: refined.qualityFlags,
    });
  } catch (error) {
    console.error("X refine route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

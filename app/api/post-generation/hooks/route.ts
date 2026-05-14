import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildHookGeneratorPrompt } from "@/lib/postGenerationPrompts";
import { AI_MODELS } from "@/lib/aiConfig";
import type {
  ContentStrategyOutput,
  HookOption,
  PostGenerationInput,
} from "@/lib/types/postGeneration";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHookOption(value: unknown): value is HookOption {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.style === "string"
  );
}

function isHooksResponse(value: unknown): value is { hooks: HookOption[] } {
  if (!isObject(value) || !Array.isArray(value.hooks)) return false;
  return value.hooks.every((hook) => isHookOption(hook));
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

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
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
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json(
        { error: "input and strategy are required" },
        { status: 400 },
      );
    }

    const personaContext = await loadPersonaContext(userId, body.accountId);
    const prompt = buildHookGeneratorPrompt(
      body.input,
      body.strategy,
      personaContext,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Hooks AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Hooks JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isHooksResponse(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ hooks: parsed.hooks });
  } catch (error) {
    console.error("Hooks route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

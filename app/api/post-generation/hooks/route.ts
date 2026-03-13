import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildHookGeneratorPrompt } from "@/lib/postGenerationPrompts";
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
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json(
        { error: "input and strategy are required" },
        { status: 400 },
      );
    }

    const personaContext = await loadPersonaContext(body.accountId);
    const prompt = buildHookGeneratorPrompt(
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

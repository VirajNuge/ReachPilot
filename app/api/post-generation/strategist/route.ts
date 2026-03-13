import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildContentStrategistPrompt } from "@/lib/postGenerationPrompts";
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

function isContentStrategyOutput(value: unknown): value is ContentStrategyOutput {
  if (!isObject(value)) return false;
  return (
    typeof value.postAngle === "string" &&
    typeof value.hookIdea === "string" &&
    typeof value.contentStructure === "string" &&
    typeof value.visualIdea === "string" &&
    isStringArray(value.talkingPoints)
  );
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
      accountId?: string;
      includePersona?: boolean;
    };

    if (!body.input) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const personaContext = body.includePersona ? await loadPersonaContext(body.accountId) : "";
    const prompt = buildContentStrategistPrompt(body.input, personaContext);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Strategist AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Strategist JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isContentStrategyOutput(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ strategy: parsed });
  } catch (error) {
    console.error("Strategist route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

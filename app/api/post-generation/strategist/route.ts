import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildContentStrategistPrompt } from "@/lib/postGenerationPrompts";
import { AI_MODELS } from "@/lib/aiConfig";
import type {
  ContentStrategyOutput,
  PostGenerationInput,
} from "@/lib/types/postGeneration";

const RETRYABLE_STATUSES = new Set([429, 500, 503]);
const RETRY_DELAYS_MS = [1200, 2500];
const MAX_ATTEMPTS = 3;

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

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown AI provider error";
}

function isQuotaExhaustedRateLimit(error: unknown): boolean {
  if (getErrorStatus(error) !== 429) return false;
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("resource exhausted") || message.includes("quota");
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateStrategistContent(genAI: GoogleGenerativeAI, prompt: string): Promise<string> {
  const modelId = AI_MODELS.TEXT;
  const model = genAI.getGenerativeModel({ model: modelId });
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (isQuotaExhaustedRateLimit(error)) {
        console.warn(
          `Strategist model ${modelId} hit quota-exhausted 429. Skipping retries and returning 503.`,
        );
        throw error;
      }

      const status = getErrorStatus(error);
      const isRetriable = status !== undefined && RETRYABLE_STATUSES.has(status);
      const hasRetryLeft = attempt < MAX_ATTEMPTS - 1;

      if (!isRetriable) {
        throw error;
      }

      if (hasRetryLeft) {
        const delayMs = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
        console.warn(
          `Strategist model ${modelId} attempt ${attempt + 1} failed with ${status}. Retrying in ${delayMs}ms...`,
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error("AI generation failed");
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
      accountId?: string;
      includePersona?: boolean;
    };

    if (!body.input) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const personaContext = body.includePersona ? await loadPersonaContext(userId, body.accountId) : "";
    const prompt = buildContentStrategistPrompt(body.input, personaContext);

    const genAI = new GoogleGenerativeAI(apiKey);

    let responseText = "";
    try {
      responseText = await generateStrategistContent(genAI, prompt);
    } catch (error) {
      console.error("Strategist AI generation error:", error);
      const status = getErrorStatus(error);
      const message = getErrorMessage(error);
      const quotaExhausted = isQuotaExhaustedRateLimit(error);

      if (status === 429) {
        const retryAfter = quotaExhausted ? "60" : "3";
        return NextResponse.json(
          {
            error: quotaExhausted
              ? `Gemini quota is exhausted for ${AI_MODELS.TEXT}. Please retry later.`
              : "AI provider is temporarily rate-limited. Please retry in a few seconds.",
            details: message,
          },
          { status: 503, headers: { "Retry-After": retryAfter } },
        );
      }

      return NextResponse.json(
        { error: "AI Generation failed", details: message },
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

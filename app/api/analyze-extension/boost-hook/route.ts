import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseAIJson } from "@/lib/parseAIJson";

interface HookAlternative {
  trigger: "Curiosity" | "FOMO" | "High-Value Promise";
  text: string;
  why: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHookAlternative(v: unknown): v is HookAlternative {
  if (!isObject(v)) return false;
  return (
    typeof v.trigger === "string" &&
    typeof v.text === "string" &&
    typeof v.why === "string" &&
    ["Curiosity", "FOMO", "High-Value Promise"].includes(v.trigger as string)
  );
}

function isBoostHookResponse(v: unknown): v is { hooks: HookAlternative[] } {
  if (!isObject(v) || !Array.isArray(v.hooks)) return false;
  return v.hooks.every((hook) => isHookAlternative(hook));
}

function buildBoostHookPrompt(
  currentHook: string | undefined,
  velocityCategory: string,
  hookRate: number,
  insight: string,
): string {
  const hookLine = currentHook
    ? `Current hook: "${currentHook}"\nAI Observation: "${insight}"\n\nGenerate exactly 3 improved hook alternatives that inject proven emotional triggers.`
    : `AI Observation: "${insight}"\n\nThis account's content has a ${hookRate}% Hook Rate in the "${velocityCategory}" category. Generate exactly 3 original hook examples that demonstrate the strongest hook styles for this account's niche and voice.`;

  return `You are an expert social media hook optimizer.
The account has a ${hookRate}% Hook Rate (category: ${velocityCategory}).

${hookLine}
Each hook must use ONE of these trigger types:
- "Curiosity" (open loops, surprising facts, cliffhangers)
- "FOMO" (urgency, exclusivity, "before it's too late")
- "High-Value Promise" (clear benefit, specific outcome, number-driven)

Return ONLY valid JSON (no markdown, no backticks):
{
  "hooks": [
    { "trigger": "Curiosity", "text": "...", "why": "One sentence why this works" },
    { "trigger": "FOMO", "text": "...", "why": "One sentence why this works" },
    { "trigger": "High-Value Promise", "text": "...", "why": "One sentence why this works" }
  ]
}`;
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
      currentHook?: string;
      velocityCategory?: string;
      hookRate?: number;
      insight?: string;
      platform?: string;
    };

    if (!body.velocityCategory) {
      return NextResponse.json(
        { error: "velocityCategory is required" },
        { status: 400 },
      );
    }

    const prompt = buildBoostHookPrompt(
      body.currentHook,
      body.velocityCategory,
      body.hookRate ?? 0,
      body.insight ?? "",
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Boost hook AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Boost hook JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isBoostHookResponse(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ hooks: parsed.hooks });
  } catch (error) {
    console.error("Boost hook route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

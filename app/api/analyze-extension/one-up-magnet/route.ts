import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseAIJson } from "@/lib/parseAIJson";

interface OneUpMagnetResponse {
  headline: string;
  outline: string[];
  positioning: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOneUpMagnetResponse(v: unknown): v is OneUpMagnetResponse {
  if (!isObject(v)) return false;
  return (
    typeof v.headline === "string" &&
    Array.isArray(v.outline) &&
    (v.outline as unknown[]).every((item) => typeof item === "string") &&
    typeof v.positioning === "string"
  );
}

function buildOneUpPrompt(
  competitorTitle: string,
  competitorType: string,
  competitorHook: string,
): string {
  return `You are an expert lead magnet strategist and conversion copywriter.

The competitor has this lead magnet:
- Title: "${competitorTitle}"
- Type: ${competitorType}
- Hook: "${competitorHook}"

Your job: Generate a "One-Up" lead magnet that is OBJECTIVELY better — more specific, more actionable, higher perceived value, and directly positions against the competitor's weakness.

Rules:
- The headline must reference the competitor's angle and surpass it with a concrete mechanism (e.g., "Don't just check boxes — automate it")
- The outline must have 4-6 items that are actionable steps/sections, not vague topics
- The positioning must be 1-2 sentences explaining exactly WHY this beats theirs

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "headline": "The One-Up lead magnet headline (specific, benefit-driven, mechanism-clear)",
  "outline": [
    "Section 1: ...",
    "Section 2: ...",
    "Section 3: ...",
    "Section 4: ...",
    "Section 5: ..."
  ],
  "positioning": "Why this beats theirs in 1-2 sentences"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitorTitle, competitorType, competitorHook } = body as {
      competitorTitle?: string;
      competitorType?: string;
      competitorHook?: string;
    };

    if (!competitorTitle || !competitorType || !competitorHook) {
      return NextResponse.json(
        { error: "competitorTitle, competitorType, and competitorHook are required" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = buildOneUpPrompt(competitorTitle, competitorType, competitorHook);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = parseAIJson(text);

    if (!isOneUpMagnetResponse(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[one-up-magnet] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

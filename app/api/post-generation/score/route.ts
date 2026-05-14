import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { buildContentScorePrompt } from "@/lib/postGenerationPrompts";
import { parseAIJson } from "@/lib/parseAIJson";
import { AI_MODELS } from "@/lib/aiConfig";
import type { ContentScore } from "@/lib/types/postGeneration";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isContentScore(value: unknown): value is ContentScore {
  if (!isObject(value)) return false;
  return (
    typeof value.hookStrength === "number" &&
    typeof value.clarity === "number" &&
    typeof value.engagementPotential === "number" &&
    typeof value.virality === "number" &&
    typeof value.overall === "number" &&
    typeof value.feedback === "string"
  );
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      caption?: string;
      platform?: string;
      headline?: string;
    };

    if (!body.caption || !body.platform || !body.headline) {
      return NextResponse.json(
        { error: "caption, platform, and headline are required" },
        { status: 400 },
      );
    }

    const prompt = buildContentScorePrompt(
      body.caption,
      body.platform,
      body.headline,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Score AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Score JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isContentScore(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ score: parsed });
  } catch (error) {
    console.error("Score route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

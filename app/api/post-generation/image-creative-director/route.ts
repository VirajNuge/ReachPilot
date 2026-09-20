import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";

import { AI_MODELS } from "@/lib/aiConfig";
import { parseAIJson } from "@/lib/parseAIJson";
import type {
  ContentStrategyOutput,
  PosterPromptOutput,
  PostGenerationInput,
} from "@/lib/types/postGeneration";
import { requireAuth } from "@/lib/withAuth";
import {
  buildCreativeDirectorPrompt,
  normalizeCreativeDirectorOutput,
} from "@/lib/postGeneration/imageCreativeDirectorContract";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 500 });
    }

    const body = (await req.json()) as {
      input?: PostGenerationInput;
      strategy?: ContentStrategyOutput;
      imagePrompt?: PosterPromptOutput;
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json({ error: "input and strategy are required" }, { status: 400 });
    }

    const prompt = buildCreativeDirectorPrompt(body.input, body.strategy, body.imagePrompt);
    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: AI_MODELS.TEXT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1800,
      },
    });

    const result = await model.generateContent(prompt);

    // Safety/Empty check
    if (!result.response) {
      console.error("Image Creative Director: AI returned no candidates.");
      return NextResponse.json({ error: "AI returned an empty response" }, { status: 500 });
    }

    const responseText = result.response.text();
    if (!responseText || responseText.trim().length === 0) {
      console.error("Image Creative Director: AI returned empty text.");
      return NextResponse.json({ error: "AI returned empty text" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = parseAIJson(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI JSON. Raw response head:", responseText.slice(0, 500));
      return NextResponse.json({ 
        error: "Failed to parse AI response", 
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 500 });
    }

    const normalized = normalizeCreativeDirectorOutput(parsed);

    if (!normalized) {
      return NextResponse.json({ error: "Invalid creative director output" }, { status: 500 });
    }

    return NextResponse.json({ creativeDirector: normalized });
  } catch (error) {
    console.error("Image creative director route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

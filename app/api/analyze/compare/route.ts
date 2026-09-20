import { OpenRouterClient } from "@/lib/ai/openrouter";
import { SchemaType, type Schema } from "@/lib/ai/schema";
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import {
  Platform,
  getComparisonPrompt,
  PLATFORM_BENCHMARKS,
} from "../platformPrompts";

// Platform comparison endpoint
// POST /api/analyze/compare { platform, yourProfile, competitorProfile }

const comparisonSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overview: {
      type: SchemaType.OBJECT,
      properties: {
        yourScore: { type: SchemaType.NUMBER },
        competitorScore: { type: SchemaType.NUMBER },
        winner: { type: SchemaType.STRING },
        summary: { type: SchemaType.STRING },
      },
      required: ["yourScore", "competitorScore", "winner", "summary"],
    },
    metrics: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          yourValue: { type: SchemaType.STRING },
          competitorValue: { type: SchemaType.STRING },
          winner: { type: SchemaType.STRING },
          importance: { type: SchemaType.STRING },
        },
        required: ["name", "yourValue", "competitorValue", "winner"],
      },
    },
    contentComparison: {
      type: SchemaType.OBJECT,
      properties: {
        yourTopTypes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        competitorTopTypes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        typesToAdopt: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["yourTopTypes", "competitorTopTypes", "typesToAdopt"],
    },
    whatTheyDoBetter: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          area: { type: SchemaType.STRING },
          theirApproach: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          howToAdopt: { type: SchemaType.STRING },
        },
        required: ["area", "theirApproach", "howToAdopt"],
      },
    },
    yourAdvantages: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          area: { type: SchemaType.STRING },
          yourApproach: { type: SchemaType.STRING },
          howToLeverage: { type: SchemaType.STRING },
        },
        required: ["area", "yourApproach", "howToLeverage"],
      },
    },
    actionPlan: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          priority: { type: SchemaType.NUMBER },
          action: { type: SchemaType.STRING },
          expectedImpact: { type: SchemaType.STRING },
          timeframe: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.STRING },
        },
        required: ["priority", "action", "expectedImpact", "timeframe"],
      },
    },
    whatIfScenarios: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          scenario: { type: SchemaType.STRING },
          potentialGain: { type: SchemaType.STRING },
          implementation: { type: SchemaType.STRING },
        },
        required: ["scenario", "potentialGain"],
      },
    },
  },
  required: [
    "overview",
    "metrics",
    "whatTheyDoBetter",
    "yourAdvantages",
    "actionPlan",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { platform, yourProfile, competitorProfile } = body;

    // Validate inputs
    if (!platform || !PLATFORM_BENCHMARKS[platform as Platform]) {
      return NextResponse.json(
        {
          error:
            "Valid platform is required (linkedin, facebook, twitter, instagram, pinterest)",
        },
        { status: 400 },
      );
    }

    if (!yourProfile || !competitorProfile) {
      return NextResponse.json(
        { error: "Both yourProfile and competitorProfile are required" },
        { status: 400 },
      );
    }

    // Setup Gemini with comparison prompt
    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: "openrouter/free",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema,
      },
    });

    const prompt = getComparisonPrompt(
      platform as Platform,
      JSON.stringify(yourProfile),
      JSON.stringify(competitorProfile),
    );

    const result = await model.generateContent(prompt);
    const comparison = JSON.parse(result.response.text());

    return NextResponse.json({
      success: true,
      platform,
      comparison,
      benchmarks: PLATFORM_BENCHMARKS[platform as Platform],
    });
  } catch (error) {
    console.error("Comparison analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to compare profiles",
      },
      { status: 500 },
    );
  }
}

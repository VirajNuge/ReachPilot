import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import {
  Platform,
  getPlatformPrompt,
  PLATFORM_BENCHMARKS,
  getQuickWins,
} from "../platformPrompts";

// Platform-specific analysis endpoint
// POST /api/analyze/[platform] { profileData: string }

interface RouteContext {
  params: Promise<{ platform: string }>;
}

// Unified schema that works for all platforms
const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    profile: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        headline: { type: SchemaType.STRING },
        followers: { type: SchemaType.NUMBER },
        following: { type: SchemaType.NUMBER },
        posts: { type: SchemaType.NUMBER },
        engagementRate: { type: SchemaType.NUMBER },
      },
      required: ["name", "followers"],
    },
    scores: {
      type: SchemaType.OBJECT,
      properties: {
        overall: { type: SchemaType.NUMBER },
        profile: { type: SchemaType.NUMBER },
        content: { type: SchemaType.NUMBER },
        engagement: { type: SchemaType.NUMBER },
        growth: { type: SchemaType.NUMBER },
      },
      required: ["overall", "profile", "content", "engagement", "growth"],
    },
    quickFixes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          headline: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: {
            type: SchemaType.STRING,
            enum: ["HIGH", "MEDIUM", "LOW"],
          } as any,
          timeToImplement: { type: SchemaType.STRING },
        },
        required: ["headline", "description", "impact"],
      },
    },
    bioAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        clarityScore: { type: SchemaType.NUMBER },
        keywordScore: { type: SchemaType.NUMBER },
        tone: { type: SchemaType.STRING },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        weaknesses: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        suggestedBio: { type: SchemaType.STRING },
      },
      required: [
        "clarityScore",
        "keywordScore",
        "tone",
        "strengths",
        "weaknesses",
      ],
    },
    contentStrategy: {
      type: SchemaType.OBJECT,
      properties: {
        currentMix: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              percentage: { type: SchemaType.NUMBER },
            },
            required: ["type", "percentage"],
          },
        },
        recommendedMix: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              percentage: { type: SchemaType.NUMBER },
            },
            required: ["type", "percentage"],
          },
        },
        topPerformingTypes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        contentGaps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        "currentMix",
        "recommendedMix",
        "topPerformingTypes",
        "contentGaps",
      ],
    },
    keywords: {
      type: SchemaType.OBJECT,
      properties: {
        current: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        missing: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        trending: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["current", "missing"],
    },
    schedule: {
      type: SchemaType.OBJECT,
      properties: {
        optimalDays: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        optimalTimes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        recommendedFrequency: { type: SchemaType.STRING },
        weeklyPlan: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              day: { type: SchemaType.STRING },
              posts: { type: SchemaType.NUMBER },
              bestTime: { type: SchemaType.STRING },
              contentType: { type: SchemaType.STRING },
            },
            required: ["day", "posts", "bestTime"],
          },
        },
      },
      required: ["optimalDays", "optimalTimes", "recommendedFrequency"],
    },
    competitorInsights: {
      type: SchemaType.OBJECT,
      properties: {
        industryPosition: { type: SchemaType.STRING },
        strengthsVsCompetitors: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        areasToImprove: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["industryPosition"],
    },
  },
  required: [
    "profile",
    "scores",
    "quickFixes",
    "bioAnalysis",
    "contentStrategy",
    "keywords",
    "schedule",
  ],
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { platform: platformParam } = await context.params;
    const platform = platformParam as Platform;

    // Validate platform
    if (!PLATFORM_BENCHMARKS[platform]) {
      return NextResponse.json(
        {
          error: `Invalid platform: ${platform}. Supported: linkedin, facebook, twitter, instagram, pinterest`,
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { profileData, scrapedText } = body;

    if (!profileData && !scrapedText) {
      return NextResponse.json(
        { error: "profileData or scrapedText is required" },
        { status: 400 },
      );
    }

    const dataToAnalyze = profileData || scrapedText;

    // Setup Gemini with platform-specific prompt
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const prompt = getPlatformPrompt(platform, JSON.stringify(dataToAnalyze));
    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());

    // Add platform-specific quick wins
    const quickWins = getQuickWins(platform);

    return NextResponse.json({
      success: true,
      platform,
      analysis,
      benchmarks: PLATFORM_BENCHMARKS[platform],
      quickWins,
    });
  } catch (error) {
    console.error("Platform analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze profile",
      },
      { status: 500 },
    );
  }
}

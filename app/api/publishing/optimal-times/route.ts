import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { parseAIJson } from "@/lib/parseAIJson";
import { AI_MODELS } from "@/lib/aiConfig";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown AI provider error";
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const { country, niche, targetAudience } = await req.json();

    if (!country || !niche || !targetAudience) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const prompt = `You are an expert social media strategist.
Based on the following profile, suggest the 5 best optimal posting times for maximum engagement.

Country: ${country}
Niche/Industry: ${niche}
Target Audience: ${targetAudience}

Return ONLY a JSON array of objects with this EXACT format:
[
  {
    "day": 1, // 0 = Sunday, 1 = Monday, etc.
    "hour": 9, // 24-hour format (0-23)
    "minute": 30, // 0-59
    "label": "Morning commute",
    "reason": "Brief explanation of why this works"
  }
]
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (e) {
      console.error("JSON parse error:", responseText);
      throw new Error("Failed to parse AI response");
    }

    if (!Array.isArray(parsed)) {
      throw new Error("AI returned invalid structure");
    }

    return NextResponse.json({ slots: parsed });

  } catch (error) {
    console.error("Optimal times API error:", error);
    return NextResponse.json(
      { error: "Failed to generate optimal times", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

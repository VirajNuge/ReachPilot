import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analysisSchema } from "@/lib/analysisSchema";
import { formatExtensionData } from "./extensionDataFormatter";
import { buildExtensionPrompt } from "./extensionPrompts";

// CORS headers for extension requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// In-memory cache of the latest analysis (persists across requests in the same server process)
let latestAnalysisCache: {
  analysis: any;
  platform: string;
  postCount: number;
  timestamp: number;
} | null = null;

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET: Retrieve cached analysis for the dashboard
export async function GET() {
  if (!latestAnalysisCache) {
    return NextResponse.json(
      { error: "No analysis available yet. Run the extension first." },
      { status: 404, headers: corsHeaders },
    );
  }

  return NextResponse.json(
    {
      success: true,
      ...latestAnalysisCache,
    },
    { headers: corsHeaders },
  );
}

export async function POST(req: Request) {
  try {
    // 1. Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 2. Parse and validate request body
    const data = await req.json();

    if (!data.posts || !Array.isArray(data.posts) || data.posts.length === 0) {
      return NextResponse.json(
        { error: "Invalid data: non-empty 'posts' array required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const platform = data.posts[0]?.platform || "unknown";
    const postCount = data.posts.length;

    console.log(
      `[analyze-extension] Received ${postCount} posts from platform: ${platform}`,
    );

    // 3. Format scraped data into rich text for Gemini
    const formattedData = formatExtensionData(data.posts);
    console.log(
      `[analyze-extension] Formatted data length: ${formattedData.length} chars`,
    );

    // 4. Build the extension-specific prompt
    const prompt = buildExtensionPrompt(formattedData, platform);

    // 5. Setup Gemini with structured output
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    console.log(`[analyze-extension] Sending to Gemini...`);
    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();

    console.log(
      `[analyze-extension] Gemini response received (${analysisText.length} chars)`,
    );

    // 6. Parse and cache the structured analysis
    const analysis = JSON.parse(analysisText);

    latestAnalysisCache = {
      analysis,
      platform,
      postCount,
      timestamp: Date.now(),
    };

    return NextResponse.json(
      {
        success: true,
        platform,
        postCount,
        analysis,
      },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    console.error("[analyze-extension] Error:", error);

    // Provide specific error messages
    const message = error.message?.includes("API_KEY")
      ? "Invalid Gemini API key"
      : error.message?.includes("SAFETY")
        ? "Content was blocked by Gemini safety filters"
        : error.message?.includes("quota")
          ? "Gemini API quota exceeded — try again later"
          : "Failed to analyze profile data";

    return NextResponse.json(
      { error: message, details: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  coreSchema,
  audienceSchema,
  strategySchema,
} from "@/lib/analysisSchema";
import { formatExtensionData } from "./extensionDataFormatter";
import { buildExtensionPrompt } from "./extensionPrompts";
import fs from "fs/promises";
import path from "path";

// CORS headers for extension requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// File path for caching (persists across dev server restarts)
const CACHE_FILE_PATH = path.join(process.cwd(), "analysis_cache.json");

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET: Retrieve cached analysis for the dashboard
export async function GET() {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    const cachedAnalysis = JSON.parse(data);

    return NextResponse.json(
      {
        success: true,
        ...cachedAnalysis,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    // File doesn't exist or error reading
    return NextResponse.json(
      { error: "No analysis available yet. Run the extension first." },
      { status: 404, headers: corsHeaders },
    );
  }
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
    const profile = data.profile || {};
    const source = data.source || "extension_scrape";

    console.log(
      `[analyze-extension] Received ${postCount} posts from platform: ${platform} (Source: ${source})`,
    );

    // 3. Format scraped data into rich text for Gemini
    const formattedData = formatExtensionData(data.posts);
    console.log(
      `[analyze-extension] Formatted data length: ${formattedData.length} chars`,
    );

    // 4. Build the extension-specific prompt
    const prompt = buildExtensionPrompt(formattedData, platform, profile);

    // 5. Setup Gemini Models for Parallel Execution
    const genAI = new GoogleGenerativeAI(apiKey);

    const coreModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: coreSchema,
      },
    });

    const audienceModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: audienceSchema,
      },
    });

    const strategyModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: strategySchema,
      },
    });

    console.log(`[analyze-extension] Sending 3 parallel requests to Gemini...`);

    // 6. Execute Parallel Requests
    const [coreResult, audienceResult, strategyResult] = await Promise.all([
      coreModel.generateContent(prompt),
      audienceModel.generateContent(prompt),
      strategyModel.generateContent(prompt),
    ]);

    const coreText = coreResult.response.text();
    const audienceText = audienceResult.response.text();
    const strategyText = strategyResult.response.text();

    console.log(
      `[analyze-extension] Responses received: Core(${coreText.length}), Audience(${audienceText.length}), Strategy(${strategyText.length})`,
    );

    // 7. Parse and Merge Results
    const coreData = JSON.parse(coreText);
    const audienceData = JSON.parse(audienceText);
    const strategyData = JSON.parse(strategyText);

    // Merge into single analysis object
    const analysis = {
      ...coreData,
      ...audienceData,
      ...strategyData,
    };

    // Overwrite analysis.profile with scraped profile data if available for better UI accuracy
    if (profile.name) analysis.profile.name = profile.name;
    if (profile.followers) analysis.profile.followers = profile.followers;
    // Store additional scraped fields
    analysis.profile.bio = profile.bio;
    analysis.profile.pfp = profile.pfp;
    analysis.profile.banner = profile.banner;
    analysis.profile.followingCount = profile.following;

    const cacheData = {
      analysis,
      platform,
      postCount,
      source,
      timestamp: Date.now(),
    };

    // Write to file for persistence
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));

    return NextResponse.json(
      {
        success: true,
        ...cacheData,
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

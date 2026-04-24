import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { postAnalysisSchema } from "@/lib/postAnalysisSchema";
import { buildPostPrompt } from "./postPrompts";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_FILE_PATH = path.join(process.cwd(), "post_analysis_cache.json");

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500, headers: corsHeaders },
      );
    }

    const postData = await req.json();

    if (!postData.content && !postData.author) {
      return NextResponse.json(
        { error: "Invalid data: post content and author required" },
        { status: 400, headers: corsHeaders },
      );
    }

    console.log(
      `[analyze-post] Analyzing post by ${postData.author} on ${postData.platform}`,
    );

    const prompt = buildPostPrompt(postData);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: postAnalysisSchema,
      },
    });

    console.log(`[analyze-post] Sending request to Gemini...`);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const analysis = JSON.parse(responseText);

    // Patch highIntentLeads with real pfps from scraped comments
    if (analysis.leadPersona?.highIntentLeads && postData.comments) {
      const pfpMap: Record<string, string> = {};
      for (const comment of postData.comments) {
        if (comment.user && comment.pfp) {
          pfpMap[comment.user.toLowerCase().trim()] = comment.pfp;
        }
      }
      analysis.leadPersona.highIntentLeads = analysis.leadPersona.highIntentLeads.map(
        (lead: { name: string; role: string; intent: string; avatar: string }) => {
          const realPfp = pfpMap[lead.name.toLowerCase().trim()];
          return {
            ...lead,
            avatar: realPfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lead.name)}`,
          };
        }
      );
    }

    const analysisId = uuidv4();
    const cacheData = {
      id: analysisId,
      analysis,
      postData,
      timestamp: Date.now(),
    };

    // Load existing cache array
    let cacheArray = [];
    try {
      const existingData = await fs.readFile(CACHE_FILE_PATH, "utf-8");
      cacheArray = JSON.parse(existingData);
      if (!Array.isArray(cacheArray)) cacheArray = [];
    } catch (e) {
      // File doesn't exist yet, which is fine
      cacheArray = [];
    }

    // Prepend new analysis and keep last 20
    cacheArray.unshift(cacheData);
    if (cacheArray.length > 20) cacheArray = cacheArray.slice(0, 20);

    // Save back to file
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheArray, null, 2));

    console.log(
      `[analyze-post] Successfully analyzed and cached with ID: ${analysisId}`,
    );

    return NextResponse.json(
      {
        success: true,
        id: analysisId,
      },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    console.error("[analyze-post] Error:", error);

    const message = error.message?.includes("API_KEY")
      ? "Invalid Gemini API key"
      : error.message?.includes("SAFETY")
        ? "Content was blocked by Gemini safety filters"
        : error.message?.includes("quota")
          ? "Gemini API quota exceeded — try again later"
          : "Failed to analyze post data";

    return NextResponse.json(
      { error: message, details: error.message, success: false },
      { status: 500, headers: corsHeaders },
    );
  }
}

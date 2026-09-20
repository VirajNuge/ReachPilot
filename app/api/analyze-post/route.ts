import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";
import { postAnalysisSchema } from "@/lib/postAnalysisSchema";
import { buildPostPrompt } from "./postPrompts";
import { v4 as uuidv4 } from "uuid";
import { getAuthFromRequest } from "@/lib/auth";
import { getExtensionSession } from "@/lib/extensionAuth";
import { createPostAnalysisHistory } from "@/lib/models/postAnalyzerHistory";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.EXTENSION_ALLOWED_ORIGINS?.split(",")[0]?.trim() || "null",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const postData = (await req.json()) as Record<string, unknown>;

    const appAuth = await getAuthFromRequest(req);
    const extensionAuth = appAuth?.userId ? null : await getExtensionSession(req);
    const userId = appAuth?.userId ?? extensionAuth?.userId;
    const accountId =
      (typeof postData.accountId === "string" ? postData.accountId : undefined) ??
      extensionAuth?.accountId;
    if (!userId || !accountId) {
      return NextResponse.json(
        { error: "Authentication and accountId are required", code: "unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

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

    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.OPENROUTER_TEXT_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: postAnalysisSchema,
      },
    });

    console.log(`[analyze-post] Sending request to OpenRouter...`);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const analysis = JSON.parse(responseText);

    // Patch highIntentLeads with real pfps from scraped comments
    if (analysis.leadPersona?.highIntentLeads && Array.isArray(postData.comments)) {
      const pfpMap: Record<string, string> = {};
      for (const comment of postData.comments) {
        if (
          comment &&
          typeof comment === "object" &&
          typeof (comment as Record<string, unknown>).user === "string" &&
          typeof (comment as Record<string, unknown>).pfp === "string"
        ) {
          const record = comment as Record<string, string>;
          pfpMap[record.user.toLowerCase().trim()] = record.pfp;
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

    await createPostAnalysisHistory(userId, accountId, {
      analysisId,
      platform: typeof postData.platform === "string" ? postData.platform : "x",
      postUrl: typeof postData.url === "string" ? postData.url : undefined,
      postAuthor: typeof postData.author === "string" ? postData.author : undefined,
      postContent: typeof postData.content === "string" ? postData.content : undefined,
      overallScore: typeof analysis.overallScore === "number" ? analysis.overallScore : undefined,
      analysisData: cacheData,
      snapshot: {
        summary: typeof analysis.summary === "string" ? analysis.summary : undefined,
      },
      source: typeof postData.source === "string" ? postData.source : "web",
      status: "completed",
      analyzedAt: new Date(),
    });

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

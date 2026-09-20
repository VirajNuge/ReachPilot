import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";
import {
  coreSchema,
  audienceSchema,
  strategySchema,
} from "@/lib/analysisSchema";
import { formatExtensionData } from "./extensionDataFormatter";
import { buildExtensionPrompt } from "./extensionPrompts";
import { getAuthFromRequest } from "@/lib/auth";
import { extensionCorsHeaders, getExtensionSession } from "@/lib/extensionAuth";
import {
  createProfileAnalysisHistory,
  getAnalysisHistoryForAccount,
} from "@/lib/models/profileAnalyzerHistory";

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: extensionCorsHeaders(request) });
}

// GET: Retrieve cached analysis for the dashboard
export async function GET(request: NextRequest) {
  try {
    const appAuth = await getAuthFromRequest(request);
    const extensionAuth = appAuth?.userId ? null : await getExtensionSession(request);
    const userId = appAuth?.userId ?? extensionAuth?.userId;
    const accountId = request.nextUrl.searchParams.get("accountId") ?? extensionAuth?.accountId;
    if (!userId || !accountId) {
      return NextResponse.json({ error: "Authentication and accountId are required" }, { status: 401 });
    }
    const history = await getAnalysisHistoryForAccount(userId, accountId, 1, 0);
    const latest = history.analyses[0];
    if (!latest) {
      return NextResponse.json(
        { error: "No analysis available yet. Run the extension first." },
        { status: 404, headers: extensionCorsHeaders(request) },
      );
    }

    return NextResponse.json(
      {
        success: true,
        analysis: latest.analysisData,
        platform: latest.platform,
        source: latest.source,
        timestamp: latest.createdAt,
        historyId: latest._id?.toHexString?.(),
      },
      { headers: extensionCorsHeaders(request) },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load analysis" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500, headers: extensionCorsHeaders(req) },
      );
    }

    // 2. Parse and validate request body
    const data = await req.json();

    const appAuth = await getAuthFromRequest(req);
    const extensionAuth = appAuth?.userId ? null : await getExtensionSession(req);
    const userId = appAuth?.userId ?? extensionAuth?.userId;
    const accountId =
      (typeof data.accountId === "string" ? data.accountId : undefined) ??
      extensionAuth?.accountId;
    if (!userId || !accountId) {
      return NextResponse.json(
        { error: "Authentication and accountId are required", code: "unauthorized" },
        { status: 401, headers: extensionCorsHeaders(req) },
      );
    }

    if (!data.posts || !Array.isArray(data.posts) || data.posts.length === 0) {
      return NextResponse.json(
        { error: "Invalid data: non-empty 'posts' array required" },
        { status: 400, headers: extensionCorsHeaders(req) },
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
    const genAI = new OpenRouterClient(apiKey);

    const coreModel = genAI.getGenerativeModel({
      model: "openrouter/free",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: coreSchema,
      },
    });

    const audienceModel = genAI.getGenerativeModel({
      model: "openrouter/free",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: audienceSchema,
      },
    });

    const strategyModel = genAI.getGenerativeModel({
      model: "openrouter/free",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: strategySchema,
      },
    });

    console.log(`[analyze-extension] Sending 3 parallel requests to Gemini...`);

    // 6. Execute Parallel Requests — collect full text then merge
    // (streaming the merge of 3 JSON blobs requires the full text anyway)
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

    const historyId = await createProfileAnalysisHistory(userId, accountId, {
      platform,
      profileUrl: typeof profile.url === "string" ? profile.url : undefined,
      profileHandle:
        typeof profile.handle === "string"
          ? profile.handle
          : typeof profile.username === "string"
            ? profile.username
            : typeof profile.name === "string"
              ? profile.name
              : "unknown",
      profileName: typeof profile.name === "string" ? profile.name : undefined,
      overallScore: typeof analysis.profile?.profileScore === "number" ? analysis.profile.profileScore : 0,
      profileScore: typeof analysis.profile?.profileScore === "number" ? analysis.profile.profileScore : undefined,
      analysisData: cacheData,
      snapshot: {
        quickFixes: Array.isArray(analysis.quickFixes)
          ? analysis.quickFixes.map((fix: { headline?: unknown; tag?: unknown }) => ({
              headline: String(fix.headline ?? ""),
              ...(fix.tag ? { tag: String(fix.tag) } : {}),
            }))
          : undefined,
      },
      source,
      status: "completed",
      analyzedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, ...cacheData, historyId },
      { headers: extensionCorsHeaders(req) },
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
      { status: 500, headers: extensionCorsHeaders(req) },
    );
  }
}

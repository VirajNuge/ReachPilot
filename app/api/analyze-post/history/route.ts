import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getAccountById } from "../../../../lib/models/account";
import { getPostAnalysisHistoryForAccount } from "../../../../lib/models/postAnalyzerHistory";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.EXTENSION_ALLOWED_ORIGINS?.split(",")[0]?.trim() || "null",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400, headers: corsHeaders });
    }

    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders });
    }

    const platform = url.searchParams.get("platform") || undefined;
    const minScore = url.searchParams.get("minScore") ? Number(url.searchParams.get("minScore")) : undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 50;
    const skip = url.searchParams.get("skip") ? Number(url.searchParams.get("skip")) : 0;

    const { analyses, total } = await getPostAnalysisHistoryForAccount(auth.userId, accountId, limit, skip, {
      platform: platform || undefined,
      minScore: minScore as any,
    });

    const items = analyses.map((item) => ({
      id: item._id?.toHexString?.() || "",
      analysisId: item.analysisId,
      timestamp: item.createdAt.toISOString(),
      postAuthor: item.postAuthor || "Unknown",
      postHandle: item.postHandle || "",
      postPreview: item.postContent ? item.postContent.slice(0, 180) : "",
      platform: item.platform,
      summary: item.snapshot?.summary || "",
      score: item.overallScore ?? 0,
      postUrl: item.postUrl || "",
    }));

    return NextResponse.json({ analyses: items, total, hasMore: skip + analyses.length < total }, { headers: corsHeaders });
  } catch (error) {
    console.error("/api/analyze-post/history error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500, headers: corsHeaders });
  }
}

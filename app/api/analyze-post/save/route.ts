import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getAccountById } from "../../../../lib/models/account";
import {
  upsertPostAnalysisHistory,
} from "../../../../lib/models/postAnalyzerHistory";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function buildSnapshot(analysisData: any) {
  const analysis = analysisData?.analysis || {};
  const topHooks = [analysis?.hookCTA?.trigger, analysis?.hookCTA?.ctaType].filter(Boolean);
  const topGaps = Array.isArray(analysis?.commentGap?.gapData)
    ? analysis.commentGap.gapData.map((item: any) => item?.gap).filter(Boolean).slice(0, 3)
    : [];
  const recommendedActions = Array.isArray(analysis?.retention?.segments)
    ? analysis.retention.segments.map((item: any) => item?.fix || item?.text).filter(Boolean).slice(0, 3)
    : [];

  return {
    summary:
      analysis?.viralVelocity?.growthPrediction ||
      analysis?.sentiment?.dominantEmotion ||
      analysis?.competitor?.benchmarkData?.botSignal ||
      "Post analysis completed",
    topHooks,
    topGaps,
    recommendedActions,
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const accountId = body.accountId;
    const analysisData = body.analysisData;

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400, headers: corsHeaders });
    }

    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders });
    }

    if (!analysisData || typeof analysisData !== "object") {
      return NextResponse.json({ error: "analysisData is required" }, { status: 400, headers: corsHeaders });
    }

    const analysisId = body.analysisId || analysisData.id;
    if (!analysisId) {
      return NextResponse.json({ error: "analysisId is required" }, { status: 400, headers: corsHeaders });
    }

    const postData = analysisData.postData || {};
    const analysis = analysisData.analysis || {};
    const snapshot = body.snapshot || buildSnapshot(analysisData);

    const payload = {
      analysisId,
      platform: postData.platform || body.platform || "unknown",
      postUrl: postData.postUrl,
      postAuthor: postData.author || body.postAuthor || "",
      postHandle: postData.handle || body.postHandle || "",
      postContent: postData.content || body.postContent || "",
      overallScore: body.overallScore ?? analysis?.viralVelocity?.velocityData?.likesPerHour ?? postData.metrics?.views ?? 0,
      analysisData,
      snapshot,
      source: body.source || "web",
      status: "completed" as const,
      analyzedAt: body.analyzedAt ? new Date(body.analyzedAt) : new Date(),
      tags: body.tags || [],
      notes: body.notes || undefined,
    };

    const historyId = await upsertPostAnalysisHistory(auth.userId, accountId, analysisId, payload);

    return NextResponse.json({ success: true, analysisId, historyId }, { headers: corsHeaders });
  } catch (error) {
    console.error("/api/analyze-post/save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
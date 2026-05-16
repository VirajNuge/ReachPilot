import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getAccountById } from "../../../../lib/models/account";
import { createProfileAnalysisHistory } from "../../../../lib/models/profileAnalyzerHistory";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Minimal validation
    if (!body.analysisData) {
      return NextResponse.json({ error: "analysisData is required" }, { status: 400 });
    }

    const doc = {
      platform: body.platform || "unknown",
      profileUrl: body.profileUrl,
      profileHandle: body.profileHandle || "",
      profileName: body.profileName || "",
      overallScore: body.overallScore ?? (body.analysisData?.scores?.overall ?? 0),
      profileScore: body.analysisData?.scores?.profile,
      contentScore: body.analysisData?.scores?.content,
      engagementScore: body.analysisData?.scores?.engagement,
      growthScore: body.analysisData?.scores?.growth,
      analysisData: body.analysisData,
      snapshot: body.snapshot || {},
      source: body.source || "api",
      status: "completed",
      analyzedAt: body.analyzedAt ? new Date(body.analyzedAt) : new Date(),
      tags: body.tags || [],
      notes: body.notes || undefined,
    } as any;

    const id = await createProfileAnalysisHistory(auth.userId, accountId, doc);
    return NextResponse.json({ success: true, analysisId: id });
  } catch (error) {
    console.error("/api/analyze/save error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

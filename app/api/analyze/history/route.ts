import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getAccountById } from "../../../../lib/models/account";
import { getAnalysisHistoryForAccount } from "../../../../lib/models/profileAnalyzerHistory";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const platform = url.searchParams.get("platform") || undefined;
    const minScore = url.searchParams.get("minScore") ? Number(url.searchParams.get("minScore")) : undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 50;
    const skip = url.searchParams.get("skip") ? Number(url.searchParams.get("skip")) : 0;

    const { analyses, total } = await getAnalysisHistoryForAccount(auth.userId, accountId, limit, skip, {
      platform: platform || undefined,
      minScore: minScore as any,
    });

    const items = analyses.map((a) => ({
      id: a._id?.toHexString?.() || "",
      profileHandle: a.profileHandle,
      profileName: a.profileName,
      overallScore: a.overallScore,
      platform: a.platform,
      createdAt: a.createdAt.toISOString(),
      snapshot: a.snapshot,
    }));

    return NextResponse.json({ analyses: items, total, hasMore: skip + analyses.length < total });
  } catch (error) {
    console.error("/api/analyze/history error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const lookback = Number(req.nextUrl.searchParams.get("lookback") || 30);

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const since = new Date(Date.now() - lookback * 24 * 60 * 60 * 1000);
  const { db } = await connectToDatabase();

  const rows = await db
    .collection("social_media_metrics")
    .find({ userId, accountId, date: { $gte: since } })
    .sort({ date: 1 })
    .toArray();

  if (!rows.length) {
    return NextResponse.json({
      success: true,
      data: {
        impressions: 0,
        engagement: 0,
        engagementRate: 0,
        topPlatform: "all",
        trend: [0, 0, 0, 0, 0, 0, 0],
      },
    });
  }

  const impressions = rows.reduce(
    (sum: number, row: any) => sum + (row.metrics?.totalImpressions || 0),
    0
  );
  const engagement = rows.reduce(
    (sum: number, row: any) => sum + (row.metrics?.totalEngagements || 0),
    0
  );
  const engagementRate = impressions > 0 ? Number(((engagement / impressions) * 100).toFixed(2)) : 0;

  const platformTotals: Record<string, number> = {};
  rows.forEach((row: any) => {
    const key = row.platform || "unknown";
    platformTotals[key] = (platformTotals[key] || 0) + (row.metrics?.totalEngagements || 0);
  });

  const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "all";

  const trend = rows
    .filter((row: any) => row.granularity === "daily")
    .slice(-7)
    .map((row: any) => Math.max(5, Math.round((row.metrics?.averageEngagementRate || 0) * 100)));

  while (trend.length < 7) {
    trend.unshift(0);
  }

  return NextResponse.json({
    success: true,
    data: {
      impressions,
      engagement,
      engagementRate,
      topPlatform,
      trend,
    },
  });
}

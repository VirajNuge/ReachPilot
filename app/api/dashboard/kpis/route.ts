import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  ensureDashboardMetricsIndexes,
  getDashboardMetricsSnapshot,
  saveDashboardMetricsSnapshot,
} from "@/lib/models/dashboardMetricsSnapshot";
import type { DashboardPeriodType } from "@/lib/models/dashboardConfig";
import { buildDashboardKpiSnapshot } from "@/lib/dashboard/dashboardMetrics";

const VALID_PERIODS: DashboardPeriodType[] = ["7days", "30days", "90days", "all"];

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const period = (req.nextUrl.searchParams.get("period") || "7days") as DashboardPeriodType;

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  await ensureDashboardMetricsIndexes();

  const existing = await getDashboardMetricsSnapshot(userId, accountId, period);
  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  const snapshot = await buildDashboardKpiSnapshot(userId, accountId, period);
  await saveDashboardMetricsSnapshot(snapshot);

  return NextResponse.json({ success: true, data: snapshot });
}

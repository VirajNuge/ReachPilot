import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  ensureDashboardMetricsIndexes,
  saveDashboardMetricsSnapshot,
} from "@/lib/models/dashboardMetricsSnapshot";
import type { DashboardPeriodType } from "@/lib/models/dashboardConfig";
import { buildDashboardKpiSnapshot } from "@/lib/dashboard/dashboardMetrics";

const VALID_PERIODS: DashboardPeriodType[] = ["7days", "30days", "90days", "all"];

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { accountId, period = "7days" } = body as {
    accountId?: string;
    period?: DashboardPeriodType;
  };

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  await ensureDashboardMetricsIndexes();

  const snapshot = await buildDashboardKpiSnapshot(userId, accountId, period);
  await saveDashboardMetricsSnapshot(snapshot);

  return NextResponse.json({ success: true, data: snapshot });
}

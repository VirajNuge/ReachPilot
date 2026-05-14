import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  ensureDashboardConfigIndexes,
  resetDashboardConfig,
} from "@/lib/models/dashboardConfig";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { accountId } = body as { accountId?: string };

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  await ensureDashboardConfigIndexes();

  const config = await resetDashboardConfig(userId, accountId);
  return NextResponse.json({ success: true, config });
}

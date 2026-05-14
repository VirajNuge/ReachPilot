import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  ensureDashboardConfigIndexes,
  getDashboardConfig,
  upsertDashboardConfig,
} from "@/lib/models/dashboardConfig";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  await ensureDashboardConfigIndexes();

  const existing = await getDashboardConfig(userId, accountId);
  if (existing) {
    return NextResponse.json({ success: true, config: existing });
  }

  const created = await upsertDashboardConfig(userId, accountId, {});
  return NextResponse.json({ success: true, config: created });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { accountId, config } = body as {
    accountId?: string;
    config?: Record<string, unknown>;
  };

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  await ensureDashboardConfigIndexes();

  const updated = await upsertDashboardConfig(
    userId,
    accountId,
    (config || body) as any
  );

  return NextResponse.json({ success: true, config: updated });
}

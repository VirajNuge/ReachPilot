import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  ensureDashboardEventIndexes,
  logDashboardEvent,
  DashboardEventType,
} from "@/lib/models/dashboardEvent";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { accountId, event, metadata } = body as {
    accountId?: string;
    event?: DashboardEventType;
    metadata?: Record<string, unknown>;
  };

  if (!accountId || !event) {
    return NextResponse.json(
      { error: "accountId and event are required" },
      { status: 400 }
    );
  }

  await ensureDashboardEventIndexes();
  const id = await logDashboardEvent({
    userId,
    accountId,
    event,
    metadata,
  });

  return NextResponse.json({ success: true, id });
}

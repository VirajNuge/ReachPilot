import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();

  const [drafts, scheduled, failed, nextScheduled] = await Promise.all([
    db.collection("postGenerations").countDocuments({ userId, accountId, status: "draft" }),
    db.collection("postGenerations").countDocuments({ userId, accountId, status: "scheduled" }),
    db.collection("postGenerations").countDocuments({ userId, accountId, status: "failed" }),
    db
      .collection("postGenerations")
      .find({ userId, accountId, status: "scheduled", scheduledDate: { $exists: true } })
      .sort({ scheduledDate: 1 })
      .limit(1)
      .toArray(),
  ]);

  const nextPublish = nextScheduled[0]?.scheduledDate || null;

  return NextResponse.json({
    success: true,
    data: {
      drafts,
      scheduled,
      failed,
      nextPublish,
    },
  });
}

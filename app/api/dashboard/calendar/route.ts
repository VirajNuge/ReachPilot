import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const daysAhead = Number(req.nextUrl.searchParams.get("daysAhead") || 14);

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const { db } = await connectToDatabase();
  const posts = await db
    .collection("postGenerations")
    .find(
      {
        userId,
        accountId,
        $or: [
          { status: "scheduled", scheduledDate: { $gte: now, $lte: endDate } },
          { status: "draft", createdAt: { $gte: now, $lte: endDate } },
        ],
      },
      { projection: { status: 1, scheduledDate: 1, createdAt: 1 } }
    )
    .sort({ scheduledDate: 1, createdAt: 1 })
    .toArray();

  const calendar: Record<string, { count: number; status: string }> = {};
  posts.forEach((post: any) => {
    const date = post.scheduledDate || post.createdAt;
    const key = date instanceof Date ? date.toISOString().slice(0, 10) : String(date);
    if (!calendar[key]) {
      calendar[key] = { count: 0, status: post.status || "draft" };
    }
    calendar[key].count += 1;
  });

  return NextResponse.json({ success: true, calendar });
}

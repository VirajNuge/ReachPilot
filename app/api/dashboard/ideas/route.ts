import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const limit = Number(req.nextUrl.searchParams.get("limit") || 5);

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const ideas = await db
    .collection("savedIdeas")
    .find(
      { userId, accountId },
      { projection: { "idea.title": 1, mode: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({ success: true, ideas });
}

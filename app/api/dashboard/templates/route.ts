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
  const templates = await db
    .collection("userSavedPostTemplates")
    .find(
      { userId, accountId },
      {
        projection: {
          "template.name": 1,
          "template.category": 1,
          "metadata.usageCount": 1,
          createdAt: 1,
        },
      }
    )
    .sort({ "metadata.usageCount": -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({ success: true, templates });
}

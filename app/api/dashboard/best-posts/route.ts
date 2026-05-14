import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const limit = Number(req.nextUrl.searchParams.get("limit") || 10);
  const lookback = Number(req.nextUrl.searchParams.get("lookback") || 30);

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const since = new Date(Date.now() - lookback * 24 * 60 * 60 * 1000);
  const { db } = await connectToDatabase();

  const posts = await db
    .collection("social_media_posts")
    .aggregate([
      {
        $match: {
          userId,
          accountId,
          postedAt: { $gte: since },
        },
      },
      {
        $addFields: {
          engagementRate: {
            $cond: [
              { $gt: ["$metrics.views", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $add: [
                          "$metrics.likes",
                          "$metrics.comments",
                          "$metrics.shares",
                          { $ifNull: ["$metrics.reposts", 0] },
                        ],
                      },
                      "$metrics.views",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { engagementRate: -1 } },
      { $limit: limit },
      {
        $project: {
          platform: 1,
          caption: 1,
          engagementRate: 1,
          postedAt: 1,
        },
      },
    ])
    .toArray();

  return NextResponse.json({ success: true, posts });
}

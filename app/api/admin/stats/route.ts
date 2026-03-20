import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/adminAuth";
import { connectToDatabase } from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { db } = await connectToDatabase();

    const [
      totalUsers,
      totalPersonas,
      totalPosts,
      totalBrandStyles,
      recentUsers,
      postsByStatus,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("personas").countDocuments(),
      db.collection("postGenerations").countDocuments(),
      db.collection("savedBrandStyles").countDocuments(),
      db
        .collection("users")
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      db
        .collection("postGenerations")
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray(),
    ]);

    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await db
      .collection("users")
      .countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Posts in the last 30 days
    const newPostsThisMonth = await db
      .collection("postGenerations")
      .countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPersonas,
        totalPosts,
        totalBrandStyles,
        newUsersThisMonth,
        newPostsThisMonth,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      })),
      postsByStatus: postsByStatus.map((s) => ({
        status: s._id,
        count: s.count,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

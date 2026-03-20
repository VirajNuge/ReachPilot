import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../../lib/adminAuth";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try { objectId = new ObjectId(id); } catch { return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); }

    const user = await db.collection("users").findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch their personas
    const personas = await db
      .collection("personas")
      .find({ userId: id }, { projection: { writingSamples: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();

    // Fetch their post generation stats
    const postCount = await db.collection("postGenerations").countDocuments({ userId: id });
    const recentPosts = await db
      .collection("postGenerations")
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Fetch their saved brand styles
    const brandStyles = await db
      .collection("savedBrandStyles")
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      },
      personas: personas.map((p) => ({
        ...p,
        _id: p._id?.toString(),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
      })),
      postStats: {
        total: postCount,
        recent: recentPosts.map((p) => ({
          id: p._id?.toString(),
          platform: p.input?.platforms?.[0],
          objective: p.input?.objective,
          status: p.status,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        })),
      },
      brandStyles: brandStyles.map((b) => ({
        ...b,
        _id: b._id?.toString(),
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try { objectId = new ObjectId(id); } catch { return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); }

    // Delete user and cascade their data
    await db.collection("users").deleteOne({ _id: objectId });
    await db.collection("personas").deleteMany({ userId: id });
    await db.collection("postGenerations").deleteMany({ userId: id });
    await db.collection("savedBrandStyles").deleteMany({ userId: id });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

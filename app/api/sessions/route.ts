import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";

// GET: Fetch all analysis sessions for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const sessions = await db
      .collection("analysis_sessions")
      .find({ userId: auth.userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ sessions }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST: Save a new analysis session for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: "Analysis data is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sessionDoc = {
      userId: auth.userId,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      profileHandle: data.profile?.headline || "Unknown",
      profileName: data.profile?.name || "Unknown",
      score: data.profile?.profileScore || 0,
      data: data,
    };

    await db.collection("analysis_sessions").insertOne(sessionDoc);

    return NextResponse.json(
      { success: true, session: sessionDoc },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

// DELETE: Clear all sessions for the logged-in user
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    await db
      .collection("analysis_sessions")
      .deleteMany({ userId: auth.userId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to clear sessions" },
      { status: 500 }
    );
  }
}

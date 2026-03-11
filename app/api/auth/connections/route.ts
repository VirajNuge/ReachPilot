import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getConnections, deleteConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  // Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get accountId from query params
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json(
      { error: "accountId is required" },
      { status: 400 }
    );
  }

  try {
    // Get all connections for this user + account
    const connections = await getConnections(auth.userId, accountId);

    // Return connections without sensitive data
    const safeConnections = connections.map((conn) => ({
      platform: conn.platform,
      platformUserId: conn.platformUserId,
      platformUsername: conn.platformUsername,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }));

    return NextResponse.json({ connections: safeConnections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { platform, accountId } = body;

    if (!platform || !accountId) {
      return NextResponse.json(
        { error: "platform and accountId are required" },
        { status: 400 }
      );
    }

    // Validate platform
    if (!["meta", "x", "linkedin", "google"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Delete the connection
    await deleteConnection(auth.userId, accountId, platform);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

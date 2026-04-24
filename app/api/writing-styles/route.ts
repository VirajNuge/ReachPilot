import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getAllWritingStyles } from "@/lib/models/adminStyles";

export async function GET(_request: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeStyles = await getAllWritingStyles(true);

    return NextResponse.json({
      styles: activeStyles.map((s) => ({
        ...s,
        _id: s._id?.toString(),
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch writing styles" }, { status: 500 });
  }
}

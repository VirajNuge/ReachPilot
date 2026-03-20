import { NextRequest, NextResponse } from "next/server";
import { getAllVisualStyles } from "../../../lib/models/adminStyles";

export async function GET(_request: NextRequest) {
  try {
    const styles = await getAllVisualStyles({ isActive: true });
    return NextResponse.json({
      styles: styles.map((s) => ({
        ...s,
        _id: s._id?.toString(),
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch visual styles" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAllVisualStyleOptions, type VisualStyleTab } from "../../../../lib/models/adminStyles";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") as VisualStyleTab | null;

    const options = await getAllVisualStyleOptions({
      isActive: true,
      ...(tab ? { tab } : {}),
    });

    return NextResponse.json({
      options: options.map((o) => ({
        ...o,
        _id: o._id?.toString(),
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
        updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch visual style options" }, { status: 500 });
  }
}

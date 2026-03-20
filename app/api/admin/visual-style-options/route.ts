import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/adminAuth";
import {
  getAllVisualStyleOptions,
  createVisualStyleOption,
  type VisualStyleTab,
} from "../../../../lib/models/adminStyles";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") as VisualStyleTab | null;

    const options = await getAllVisualStyleOptions(tab ? { tab } : undefined);
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

export async function POST(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { tab, value, label, description, referenceImageUrl, sortOrder, isActive } = body;

    if (!tab || !value || !label) {
      return NextResponse.json(
        { error: "tab, value, and label are required" },
        { status: 400 }
      );
    }

    const id = await createVisualStyleOption({
      tab,
      value,
      label,
      description: description ?? "",
      referenceImageUrl: referenceImageUrl ?? "",
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create visual style option" }, { status: 500 });
  }
}

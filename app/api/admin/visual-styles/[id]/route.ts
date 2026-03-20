import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../../lib/adminAuth";
import {
  getVisualStyleById,
  updateVisualStyle,
  deleteVisualStyle,
} from "../../../../../lib/models/adminStyles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const style = await getVisualStyleById(id);
  if (!style) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    style: {
      ...style,
      _id: style._id?.toString(),
      createdAt: style.createdAt instanceof Date ? style.createdAt.toISOString() : style.createdAt,
      updatedAt: style.updatedAt instanceof Date ? style.updatedAt.toISOString() : style.updatedAt,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateVisualStyle(id, body);
    if (!updated) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteVisualStyle(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

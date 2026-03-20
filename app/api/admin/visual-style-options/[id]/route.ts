import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../../lib/adminAuth";
import {
  getVisualStyleOptionById,
  updateVisualStyleOption,
  deleteVisualStyleOption,
} from "../../../../../lib/models/adminStyles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const option = await getVisualStyleOptionById(id);
  if (!option) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    option: {
      ...option,
      _id: option._id?.toString(),
      createdAt: option.createdAt instanceof Date ? option.createdAt.toISOString() : option.createdAt,
      updatedAt: option.updatedAt instanceof Date ? option.updatedAt.toISOString() : option.updatedAt,
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
    const updated = await updateVisualStyleOption(id, body);
    if (!updated) return NextResponse.json({ error: "Not found or no change" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update visual style option" }, { status: 500 });
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
    const deleted = await deleteVisualStyleOption(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete visual style option" }, { status: 500 });
  }
}

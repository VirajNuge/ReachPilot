import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../../lib/adminAuth";
import {
  getCaptionTemplateById,
  updateCaptionTemplate,
  deleteCaptionTemplate,
} from "../../../../../lib/models/captionTemplates";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const template = await getCaptionTemplateById(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    template: {
      ...template,
      _id: template._id?.toString(),
      createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
      updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
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
    const updated = await updateCaptionTemplate(id, body);
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
  const deleted = await deleteCaptionTemplate(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

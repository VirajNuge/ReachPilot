import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  getUserTemplateById,
  updateUserTemplate,
  deleteUserTemplate,
  incrementTemplateUsage,
} from "@/lib/models/userSavedPostTemplate";

// Dynamic route: /api/extension/template/[id]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await getUserTemplateById(auth.userId, id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: {
        _id: template._id?.toString(),
        name: template.template.name,
        description: template.template.description,
        category: template.template.category,
        structure: template.template.structure,
        hooks: template.template.hooks,
        cta: template.template.cta,
        tone: template.template.tone,
        psychologyTriggers: template.template.psychologyTriggers,
        platformVariants: template.platformVariants,
        sourcePost: template.sourcePost,
        aiAnalysis: template.aiAnalysis,
        metadata: template.metadata,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get template error:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await getUserTemplateById(auth.userId, id);
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Update template fields
    const updateData: Record<string, any> = {};
    
    if (body.template) {
      Object.keys(body.template).forEach(key => {
        updateData[`template.${key}`] = body.template[key];
      });
    }
    
    if (body.metadata) {
      Object.keys(body.metadata).forEach(key => {
        updateData[`metadata.${key}`] = body.metadata[key];
      });
    }

    const success = await updateUserTemplate(auth.userId, id, updateData);

    if (!success) {
      return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }

    const updated = await getUserTemplateById(auth.userId, id);

    return NextResponse.json({
      success: true,
      template: {
        _id: updated?._id?.toString(),
        name: updated?.template.name,
        description: updated?.template.description,
        category: updated?.template.category,
      },
    });
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getUserTemplateById(auth.userId, id);
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const success = await deleteUserTemplate(auth.userId, id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

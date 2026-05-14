import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  getUserTemplates,
  getUserTemplateById,
  updateUserTemplate,
  deleteUserTemplate,
  incrementTemplateUsage,
  archiveUserTemplate,
} from "@/lib/models/userSavedPostTemplate";
import type { TemplateCategory, Platform } from "@/lib/models/userSavedPostTemplate";

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as Platform | null;
    const category = searchParams.get("category") as TemplateCategory | null;
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Fetch templates with filters
    const { templates, total } = await getUserTemplates(
      auth.userId,
      {
        platform: platform || undefined,
        category: category || undefined,
        search: search || undefined,
        isArchived: includeArchived ? undefined : false,
      },
      { page, limit }
    );

    // Format response
    const formatted = templates.map((t) => ({
      _id: t._id?.toString(),
      name: t.template.name,
      description: t.template.description,
      category: t.template.category,
      platformVariants: t.platformVariants.map((v) => v.platform),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      viewCount: t.metadata.viewCount,
      usageCount: t.metadata.usageCount,
      aiAnalysis: {
        confidence: t.aiAnalysis.confidence,
      },
    }));

    return NextResponse.json({
      success: true,
      templates: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract template ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const templateId = pathSegments[pathSegments.length - 2]; // Before 'route.ts'

    if (!templateId || templateId === "saved-templates") {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, tags, isPublic, isArchived } = body;

    // Fetch existing template to verify ownership
    const existing = await getUserTemplateById(auth.userId, templateId);
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Update template
    const updateData: any = {};
    if (name !== undefined) updateData["template.name"] = name;
    if (description !== undefined) updateData["template.description"] = description;
    if (tags !== undefined) updateData["metadata.tags"] = tags;
    if (isPublic !== undefined) updateData["metadata.isPublic"] = isPublic;
    if (isArchived !== undefined) updateData["metadata.isArchived"] = isArchived;

    const success = await updateUserTemplate(auth.userId, templateId, updateData);

    if (!success) {
      return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }

    // Fetch updated template
    const updated = await getUserTemplateById(auth.userId, templateId);

    return NextResponse.json({
      success: true,
      template: {
        _id: updated?._id?.toString(),
        name: updated?.template.name,
        description: updated?.template.description,
        category: updated?.template.category,
        tags: updated?.metadata.tags,
        isPublic: updated?.metadata.isPublic,
      },
    });
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract template ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const templateId = pathSegments[pathSegments.length - 2];

    if (!templateId || templateId === "saved-templates") {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = await getUserTemplateById(auth.userId, templateId);
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Delete template
    const success = await deleteUserTemplate(auth.userId, templateId);

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

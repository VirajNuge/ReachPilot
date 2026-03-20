import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/adminAuth";
import {
  getAllCaptionTemplates,
  createCaptionTemplate,
} from "../../../../lib/models/captionTemplates";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const templates = await getAllCaptionTemplates();
    return NextResponse.json({
      templates: templates.map((t) => ({
        ...t,
        _id: t._id?.toString(),
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
        updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch caption templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      platforms,
      platformVariants,
      isBundle,
      matchKeywords,
      bestForObjectives,
      isActive,
      sortOrder,
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "name, description, and category are required" },
        { status: 400 }
      );
    }

    const id = await createCaptionTemplate({
      name,
      description,
      category,
      platforms: platforms ?? [],
      platformVariants: platformVariants ?? [],
      isBundle: isBundle ?? false,
      matchKeywords: matchKeywords ?? [],
      bestForObjectives: bestForObjectives ?? [],
      isActive: isActive !== false,
      sortOrder: sortOrder ?? 0,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create caption template" }, { status: 500 });
  }
}

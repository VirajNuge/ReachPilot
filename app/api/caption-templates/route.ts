import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getAllCaptionTemplates, createCaptionTemplate } from "@/lib/models/captionTemplates";
import type { TemplateCategory, TemplatePlatform, PlatformTemplateVariant } from "@/lib/models/captionTemplates";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const platformParam = searchParams.get("platform");
    const searchParam = searchParams.get("search");

    const templates = await getAllCaptionTemplates({
      isActive: true,
      category: categoryParam ? (categoryParam as TemplateCategory) : undefined,
      platform: platformParam ? (platformParam as TemplatePlatform) : undefined,
    });

    const filtered = searchParam
      ? templates.filter((t) => {
          const q = searchParam.toLowerCase();
          return (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
          );
        })
      : templates;

    return NextResponse.json({
      templates: filtered.map((t) => ({
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

// ── POST /api/caption-templates ───────────────────────────────────────────────
// User-facing endpoint to save a viral recipe as a caption template.
// Requires auth (non-admin). Creates an active template in the shared collection.

interface CreateTemplateBody {
  name: string;
  description: string;
  category: TemplateCategory;
  platforms: TemplatePlatform[];
  platformVariants: PlatformTemplateVariant[];
  isBundle: boolean;
  matchKeywords: string[];
  bestForObjectives: string[];
}

function isValidCategory(v: unknown): v is TemplateCategory {
  const valid: TemplateCategory[] = [
    "how_to", "listicle", "thought_leadership", "product_launch",
    "behind_the_scenes", "testimonial", "engagement_question",
    "personal_story", "announcement", "myth_busting", "motivational", "promotional",
  ];
  return typeof v === "string" && valid.includes(v as TemplateCategory);
}

function isValidPlatform(v: unknown): v is TemplatePlatform {
  return v === "linkedin" || v === "x" || v === "instagram_post" || v === "facebook";
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<CreateTemplateBody>;

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!isValidCategory(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!Array.isArray(body.platforms) || body.platforms.length === 0 || !body.platforms.every(isValidPlatform)) {
      return NextResponse.json({ error: "platforms must be a non-empty array of valid platform values" }, { status: 400 });
    }
    if (!Array.isArray(body.platformVariants)) {
      return NextResponse.json({ error: "platformVariants must be an array" }, { status: 400 });
    }

    const newId = await createCaptionTemplate({
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category,
      platforms: body.platforms,
      platformVariants: body.platformVariants,
      isBundle: body.isBundle ?? false,
      matchKeywords: Array.isArray(body.matchKeywords) ? body.matchKeywords : [],
      bestForObjectives: Array.isArray(body.bestForObjectives) ? body.bestForObjectives : [],
      isActive: true,
      sortOrder: 0,
    });

    return NextResponse.json({ id: newId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/adminAuth";
import {
  getAllVisualStyles,
  createVisualStyle,
} from "../../../../lib/models/adminStyles";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const styles = await getAllVisualStyles();
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

export async function POST(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name,
      description,
      colorPalette,
      primaryColor,
      fontFamily,
      fontHeadingWeight,
      imageStyle,
      lightingDirection,
      shadingStyle,
      compositionPreference,
      textStylePreference,
      colorThemePreset,
      layoutStyle,
      brandType,
      mood,
      tags,
      thumbnailBg,
      sortOrder,
      isActive,
    } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "name and description are required" }, { status: 400 });
    }

    const id = await createVisualStyle({
      name,
      description,
      colorPalette: colorPalette || [],
      primaryColor: primaryColor || "#7c3aed",
      fontFamily: fontFamily || "Inter",
      fontHeadingWeight: fontHeadingWeight || "700",
      imageStyle: imageStyle || "minimalist",
      lightingDirection: lightingDirection || "natural",
      shadingStyle: shadingStyle || "soft",
      compositionPreference: compositionPreference || "rule_of_thirds",
      textStylePreference: textStylePreference || "clean_sans",
      colorThemePreset: colorThemePreset || "brand_colors",
      layoutStyle: layoutStyle || "hero_center",
      brandType: brandType || "personal_brand",
      mood: mood || "professional",
      tags: tags || [],
      thumbnailBg: thumbnailBg || "#f9f8ff",
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create visual style" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  getBrandStylesByUser,
  saveBrandStyle,
} from "@/lib/models/postGeneration";
import type { SavedBrandStyle, BrandType, VisualStyle } from "@/lib/types/postGeneration";

/**
 * GET /api/brand-styles
 * Returns all saved brand styles for the authenticated user.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const styles = await getBrandStylesByUser(userId);
    return NextResponse.json({ styles });
  } catch (error) {
    console.error("GET /api/brand-styles error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

/**
 * POST /api/brand-styles
 * Saves a new brand style preset for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = (await req.json()) as Partial<SavedBrandStyle>;

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Brand style name is required" },
        { status: 400 }
      );
    }

    if (!body.brandType || !body.visualStyle) {
      return NextResponse.json(
        { error: "brandType and visualStyle are required" },
        { status: 400 }
      );
    }

    const id = await saveBrandStyle({
      userId,
      name: body.name.trim(),
      brandType: body.brandType as BrandType,
      visualStyle: body.visualStyle as VisualStyle,
      colorPalette: Array.isArray(body.colorPalette) ? body.colorPalette : [],
      fontFamily: body.fontFamily ?? "",
      logoUrl: body.logoUrl ?? "",
      watermark: body.watermark ?? false,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/brand-styles error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

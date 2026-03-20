import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/adminAuth";
import {
  getAllWritingStyles,
  createWritingStyle,
} from "../../../../lib/models/adminStyles";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAuth(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const styles = await getAllWritingStyles();
    return NextResponse.json({
      styles: styles.map((s) => ({
        ...s,
        _id: s._id?.toString(),
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch writing styles" }, { status: 500 });
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
      toneProfile,
      sentenceLength,
      emojiUsage,
      hashtagIntensity,
      ctas,
      examplePost,
      isActive,
    } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "name and description are required" }, { status: 400 });
    }

    const id = await createWritingStyle({
      name,
      description,
      toneProfile: toneProfile || { formalCasual: 50, seriousPlayful: 50, inspiringInformative: 50, dataDriven: 50 },
      sentenceLength: sentenceLength || ["medium"],
      emojiUsage: emojiUsage || "minimal",
      hashtagIntensity: hashtagIntensity || "low",
      ctas: ctas || [],
      examplePost: examplePost || "",
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create writing style" }, { status: 500 });
  }
}

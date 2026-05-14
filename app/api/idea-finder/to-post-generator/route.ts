import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import type { GeneratedIdea } from "@/lib/ideaFinder/types";
import { validatePostSeed } from "@/lib/ideaFinder/postSeedValidation";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await req.json()) as { idea?: GeneratedIdea };

    if (!body?.idea || !isObject(body.idea)) {
      return NextResponse.json({ error: "idea is required" }, { status: 400 });
    }

    const { idea } = body;

    // Use shared validator for consistent client/server validation
    const validation = validatePostSeed(idea.postSeed);
    if (!validation.valid) {
      const errorDetails = validation.errors
        .filter((e) => e.severity === "error")
        .map((e) => ({ field: e.field, message: e.message }));
      return NextResponse.json(
        {
          error: "idea.postSeed is missing required Post Generation fields",
          details: errorDetails,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        input: idea.postSeed,
        preview: idea.postPreview ?? null,
        platformStyles: idea.platformStyles ?? null,
      },
    });
  } catch (error) {
    console.error("[idea-finder/to-post-generator] error:", error);
    return NextResponse.json({ error: "Failed to prepare post generator handoff" }, { status: 500 });
  }
}

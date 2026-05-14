import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { saveIdea } from "@/lib/models/savedIdea";
import type { IdeaMode, GeneratedIdea } from "@/lib/ideaFinder/types";

const VALID_MODES: IdeaMode[] = [
  "voice-match",
  "trend-jacker",
  "repurpose",
  "gap-filler",
  "prism",
];

const VALID_STATUSES = ["idea-bank", "drafting", "published"] as const;

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await req.json();
    const { idea, mode, status = "idea-bank", accountId } = body as {
      idea?: GeneratedIdea;
      mode?: string;
      status?: string;
      accountId?: string;
    };

    if (!idea || !accountId) {
      return NextResponse.json(
        { error: "idea and accountId are required" },
        { status: 400 }
      );
    }

    if (mode && !VALID_MODES.includes(mode as IdeaMode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const id = await saveIdea(
      userId,
      accountId,
      idea,
      (mode as IdeaMode) || "voice-match",
      status as "idea-bank" | "drafting" | "published"
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[idea-finder/save] Error:", error);
    return NextResponse.json({ error: "Failed to save idea" }, { status: 500 });
  }
}

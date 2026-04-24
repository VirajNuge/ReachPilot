import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { updateIdeaFeedback } from "@/lib/models/savedIdea";
import type { IdeaFeedback } from "@/lib/models/savedIdea";

const VALID_FEEDBACK: IdeaFeedback[] = ["positive", "negative"];

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await req.json();
    const { ideaId, feedback } = body as {
      ideaId?: string;
      feedback?: string;
    };

    if (!ideaId || !feedback) {
      return NextResponse.json(
        { error: "ideaId and feedback are required" },
        { status: 400 }
      );
    }

    if (!VALID_FEEDBACK.includes(feedback as IdeaFeedback)) {
      return NextResponse.json(
        { error: "feedback must be 'positive' or 'negative'" },
        { status: 400 }
      );
    }

    const updated = await updateIdeaFeedback(
      userId,
      ideaId,
      feedback as IdeaFeedback
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Idea not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[idea-finder/feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

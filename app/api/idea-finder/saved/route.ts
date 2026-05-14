import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { getSavedIdeas } from "@/lib/models/savedIdea";
import type { IdeaStatus } from "@/lib/models/savedIdea";

const VALID_STATUSES: IdeaStatus[] = ["idea-bank", "drafting", "published"];

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const statusParam = searchParams.get("status");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query param is required" },
        { status: 400 }
      );
    }

    const status =
      statusParam && VALID_STATUSES.includes(statusParam as IdeaStatus)
        ? (statusParam as IdeaStatus)
        : undefined;

    const ideas = await getSavedIdeas(userId, accountId, status);

    return NextResponse.json({ success: true, data: ideas });
  } catch (error) {
    console.error("[idea-finder/saved] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved ideas" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { getDashboardActivities } from "@/lib/models/dashboardActivityLog";

const DEFAULT_LIMIT = 20;

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const limit = Number(req.nextUrl.searchParams.get("limit") || DEFAULT_LIMIT);

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const existing = await getDashboardActivities(userId, accountId, limit);
  if (existing.length) {
    return NextResponse.json({ success: true, activities: existing });
  }

  const { db } = await connectToDatabase();
  const [postGenerations, savedIdeas, templates] = await Promise.all([
    db
      .collection("postGenerations")
      .find(
        { userId, accountId },
        {
          projection: {
            status: 1,
            createdAt: 1,
            "input.platform": 1,
            "input.coreMessage": 1,
            "output.headline": 1,
            "output.caption": 1,
            "output.score": 1,
            "strategy.hookIdea": 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray(),
    db
      .collection("savedIdeas")
      .find(
        { userId, accountId },
        {
          projection: {
            createdAt: 1,
            mode: 1,
            "idea.title": 1,
            "idea.summary": 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .toArray(),
    db
      .collection("userSavedPostTemplates")
      .find(
        { userId, accountId },
        {
          projection: {
            createdAt: 1,
            "template.name": 1,
            "template.description": 1,
            "sourcePost.platform": 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .toArray(),
  ]);

  const activities = [
    ...postGenerations.map((post: any) => ({
      id: post._id?.toString() || crypto.randomUUID(),
      title: post.output?.headline || post.input?.coreMessage || "Post generation",
      preview: post.output?.caption || post.strategy?.hookIdea || "",
      status: post.status || "draft",
      platform: post.input?.platform || "web",
      time: post.createdAt,
      metric: post.output?.score ? `Score ${post.output?.score}` : undefined,
      source: "generator",
      type: "post_generated",
    })),
    ...savedIdeas.map((idea: any) => ({
      id: idea._id?.toString() || crypto.randomUUID(),
      title: idea.idea?.title || "Idea saved",
      preview: idea.idea?.summary || "",
      status: "draft",
      platform: "ideas",
      time: idea.createdAt,
      source: "idea-finder",
      type: "idea_created",
    })),
    ...templates.map((template: any) => ({
      id: template._id?.toString() || crypto.randomUUID(),
      title: template.template?.name || "Template saved",
      preview: template.template?.description || "",
      status: "analyzed",
      platform: template.sourcePost?.platform || "template",
      time: template.createdAt,
      source: "template",
      type: "template_saved",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);

  return NextResponse.json({ success: true, activities });
}

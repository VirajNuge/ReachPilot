import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { parseAIJson } from "@/lib/parseAIJson";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const CACHE_FILE_PATH = path.join(process.cwd(), "post_analysis_cache.json");

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReplyPost {
  title: string;
  hook: string;
  content: string;
  cta: string;
}

interface GeneratedReplyPostsRaw {
  posts: ReplyPost[];
}

// ─── Guard ────────────────────────────────────────────────────────────────────

function isGeneratedReplyPostsRaw(v: unknown): v is GeneratedReplyPostsRaw {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.posts) || o.posts.length === 0) return false;
  return o.posts.every(
    (p: unknown) =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as Record<string, unknown>).title === "string" &&
      typeof (p as Record<string, unknown>).hook === "string" &&
      typeof (p as Record<string, unknown>).content === "string" &&
      typeof (p as Record<string, unknown>).cta === "string",
  );
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildReplyPostPrompt(data: {
  platform: string;
  postContent: string;
  commentGap: {
    gapData: { gap: string; frequency: number; strategy: string }[];
    confusionPoint: { text: string; sentiment: string; insight: string };
  };
  hookCTA: {
    trigger: string;
    skeleton: string;
    ctaType: string;
    ctaTip: string;
  };
}): string {
  const platformName =
    data.platform === "x" || data.platform === "twitter"
      ? "X (Twitter)"
      : data.platform.charAt(0).toUpperCase() + data.platform.slice(1);

  const charLimit =
    data.platform === "x" || data.platform === "twitter" ? 280 : 1500;

  const hashtagRule =
    data.platform === "x" || data.platform === "twitter"
      ? "NO hashtags — they reduce reach on X. Avoid unnecessary emojis."
      : "Follow platform norms for hashtags and emojis.";

  const topGaps = data.commentGap.gapData
    .slice(0, 3)
    .map((g, i) => `${i + 1}. "${g.gap}" (${g.frequency} mentions) — Strategy: ${g.strategy}`)
    .join("\n");

  return `You are an expert social media content strategist. A ${platformName} post generated comments revealing unmet questions and content gaps. Your task is to write 3 fully post-ready "reply posts" — standalone follow-up posts that directly address these comment gaps.

---
ORIGINAL POST:
${data.postContent}
---
TOP COMMENT GAPS (what people wanted but didn't get):
${topGaps}
---
CONFUSION POINT:
"${data.commentGap.confusionPoint.text}"
Sentiment: ${data.commentGap.confusionPoint.sentiment}
Insight: ${data.commentGap.confusionPoint.insight}
---
TONE GUIDANCE (from the original post's psychological profile):
- Hook trigger: ${data.hookCTA.trigger}
- Post skeleton: ${data.hookCTA.skeleton}
- CTA type: ${data.hookCTA.ctaType}
- CTA tip: ${data.hookCTA.ctaTip}
---

YOUR TASK:
Write exactly 3 reply posts. Each post must:
1. Directly address one of the top comment gaps above (each post covers a different gap)
2. Mirror the tone and hook trigger of the original post
3. Be completely post-ready — no brackets, no placeholders, no "topic here" stubs
4. Respect the character limit: ${charLimit} characters max per post (content field only)
5. ${hashtagRule}

Return ONLY valid JSON in exactly this shape:

{
  "posts": [
    {
      "title": "Short 4-7 word label for this reply post angle",
      "hook": "The opening line of this post (1-2 sentences max, uses the hook trigger)",
      "content": "The complete, fully written post body including the hook — post-ready with no placeholders. ${charLimit} chars max.",
      "cta": "The call-to-action line for this post (1 sentence)"
    },
    { ... },
    { ... }
  ]
}

CRITICAL RULES:
1. "content" must include the hook line — it is the FULL post, not just the body
2. Every post must be complete and immediately usable — no editing required
3. Return ONLY the JSON object — no markdown, no code fences, no extra text
4. Produce exactly 3 posts in the array`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 1. Parse request body
    let body: { analysisId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body — expected JSON with analysisId" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { analysisId } = body;
    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // 2. Read the cache
    let cacheRaw: string;
    try {
      cacheRaw = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    } catch {
      return NextResponse.json(
        { error: "No post analysis cache found. Run the extension analyzer first." },
        { status: 404, headers: corsHeaders },
      );
    }

    let cacheArray: Array<{
      id: string;
      analysis: Record<string, unknown>;
      postData: Record<string, unknown>;
      timestamp: string;
    }>;
    try {
      const parsed = JSON.parse(cacheRaw);
      if (!Array.isArray(parsed)) throw new Error("Cache is not an array");
      cacheArray = parsed;
    } catch {
      return NextResponse.json(
        { error: "Post analysis cache is malformed." },
        { status: 500, headers: corsHeaders },
      );
    }

    const cacheEntry = cacheArray.find((item) => item.id === analysisId);
    if (!cacheEntry) {
      return NextResponse.json(
        { error: "Analysis not found in cache. The analysis may have expired." },
        { status: 404, headers: corsHeaders },
      );
    }

    const { analysis, postData } = cacheEntry;

    // 3. Extract required fields
    const platform =
      typeof postData.platform === "string" ? postData.platform : "x";
    const postContent =
      typeof postData.content === "string" ? postData.content : "";

    const commentGap = analysis.commentGap as {
      gapData: { gap: string; frequency: number; strategy: string }[];
      confusionPoint: { text: string; sentiment: string; insight: string };
    } | null;

    const hookCTA = analysis.hookCTA as {
      trigger: string;
      skeleton: string;
      ctaType: string;
      ctaTip: string;
    } | null;

    if (!commentGap || !hookCTA) {
      return NextResponse.json(
        { error: "Analysis data is incomplete. Ensure the analysis completed successfully." },
        { status: 422, headers: corsHeaders },
      );
    }

    if (!commentGap.gapData || commentGap.gapData.length === 0) {
      return NextResponse.json(
        { error: "No comment gap data found for this analysis." },
        { status: 422, headers: corsHeaders },
      );
    }

    // 4. Build prompt
    const prompt = buildReplyPostPrompt({
      platform,
      postContent,
      commentGap,
      hookCTA,
    });

    // 5. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText: string;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (aiErr) {
      console.error("[generate-reply-post] Gemini error:", aiErr);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 6. Parse and validate
    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (parseErr) {
      console.error("[generate-reply-post] JSON parse error:", parseErr);
      console.error("[generate-reply-post] Raw response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!isGeneratedReplyPostsRaw(parsed)) {
      console.error("[generate-reply-post] Invalid AI response shape:", parsed);
      return NextResponse.json(
        { error: "AI returned an unexpected response shape" },
        { status: 500, headers: corsHeaders },
      );
    }

    console.log(
      `[generate-reply-post] Generated ${parsed.posts.length} reply posts for analysis ${analysisId}`,
    );

    return NextResponse.json(
      {
        success: true,
        platform,
        posts: parsed.posts,
      },
      { headers: corsHeaders },
    );
  } catch (error: unknown) {
    console.error("[generate-reply-post] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate reply posts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

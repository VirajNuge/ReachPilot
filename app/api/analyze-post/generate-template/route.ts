import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { parseAIJson } from "@/lib/parseAIJson";
import {
  createCaptionTemplate,
  type TemplateCategory,
  type TemplatePlatform,
} from "@/lib/models/captionTemplates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const CACHE_FILE_PATH = path.join(process.cwd(), "post_analysis_cache.json");

// ─── Category normalisation ──────────────────────────────────────────────────

const VALID_CATEGORIES: TemplateCategory[] = [
  "how_to",
  "listicle",
  "thought_leadership",
  "product_launch",
  "behind_the_scenes",
  "testimonial",
  "engagement_question",
  "personal_story",
  "announcement",
  "myth_busting",
  "motivational",
  "promotional",
];

function normaliseCategory(raw: string): TemplateCategory {
  const cleaned = raw?.toLowerCase().replace(/[\s-]/g, "_") ?? "";
  if ((VALID_CATEGORIES as string[]).includes(cleaned)) {
    return cleaned as TemplateCategory;
  }
  const fallbackMap: Record<string, TemplateCategory> = {
    how_to_guide: "how_to",
    educational: "how_to",
    list: "listicle",
    numbered_list: "listicle",
    opinion: "thought_leadership",
    thought_leader: "thought_leadership",
    launch: "product_launch",
    product: "product_launch",
    bts: "behind_the_scenes",
    story: "personal_story",
    personal: "personal_story",
    question: "engagement_question",
    engagement: "engagement_question",
    myth: "myth_busting",
    contrarian: "thought_leadership",
    motivational_quote: "motivational",
    inspirational: "motivational",
    promo: "promotional",
    sales: "promotional",
  };
  for (const [key, val] of Object.entries(fallbackMap)) {
    if (cleaned.includes(key)) return val;
  }
  return "thought_leadership";
}

// ─── Platform normalisation ──────────────────────────────────────────────────

function normalisePlatform(raw: string): TemplatePlatform {
  const map: Record<string, TemplatePlatform> = {
    x: "x",
    twitter: "x",
    linkedin: "linkedin",
    instagram: "instagram_post",
    instagram_post: "instagram_post",
    facebook: "facebook",
  };
  return map[raw?.toLowerCase()] ?? "x";
}

const CHAR_LIMITS: Partial<Record<TemplatePlatform, number>> = {
  x: 280,
  instagram_post: 2200,
  facebook: 63206,
};

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildPostTemplatePrompt(data: {
  platform: string;
  postContent: string;
  hookCTA: {
    trigger: string;
    skeleton: string;
    pivotA: string;
    pivotB: string;
    pivotC: string;
    ctaType: string;
    ctaTip: string;
  };
  sentiment: {
    sentimentData: {
      dominantEmotion: string;
      positive: number;
      negative: number;
      trustScore: number;
      keywords: string[];
    };
  };
  viralVelocity: {
    velocityData: {
      trend: string;
      growthPrediction: string;
    };
  };
}): string {
  const platformName =
    data.platform === "x" || data.platform === "twitter"
      ? "X (Twitter)"
      : data.platform.charAt(0).toUpperCase() + data.platform.slice(1);

  const normPlatform = normalisePlatform(data.platform);
  const charLimit = CHAR_LIMITS[normPlatform] ?? 280;
  const hashtagRule =
    normPlatform === "x"
      ? "NO hashtags — they reduce reach on X. NO unnecessary emojis unless the voice demands it."
      : "Follow platform norms for hashtags and emojis.";

  return `You are an expert social media content strategist. You have been given a forensic AI analysis of a real ${platformName} post that performed well.

Your task: synthesise this data into a single reusable caption template that replicates the EXACT vibe, tone, and structural formula of this post — so an AI caption generator can reproduce it for any topic.

---
ORIGINAL POST TEXT:
${data.postContent}
---
HOOK & CTA ANALYSIS:
- Psychological Trigger: ${data.hookCTA.trigger}
- Post Skeleton: ${data.hookCTA.skeleton}
- Hook Pivot A (The Challenger): "${data.hookCTA.pivotA}"
- Hook Pivot B (The Result): "${data.hookCTA.pivotB}"
- Hook Pivot C (The Question): "${data.hookCTA.pivotC}"
- CTA Type: ${data.hookCTA.ctaType}
- CTA Tip: ${data.hookCTA.ctaTip}
---
SENTIMENT ANALYSIS:
- Dominant Emotion: ${data.sentiment.sentimentData.dominantEmotion}
- Positive Ratio: ${data.sentiment.sentimentData.positive}%
- Negative Ratio: ${data.sentiment.sentimentData.negative}%
- Trust Score: ${data.sentiment.sentimentData.trustScore}
- Resonance Keywords: ${data.sentiment.sentimentData.keywords?.join(", ") ?? "N/A"}
---
VIRAL VELOCITY:
- Trend: ${data.viralVelocity.velocityData.trend}
- Growth Prediction: ${data.viralVelocity.velocityData.growthPrediction}
---

YOUR TASK:
Create a reusable template that captures the essence of what makes this ${platformName} post compelling.

The "structure" field IS the prompt instruction block — it tells an AI caption generator HOW to write a new post in this exact style. Write it as direct, imperative instructions (like a system prompt section), NOT as a description.

Return ONLY valid JSON in exactly this shape:

{
  "name": "Short descriptive template name (4-8 words, no quotes), e.g. 'Curiosity Gap Challenge — X'",
  "description": "2-3 sentence description of what makes this template effective and when to use it",
  "category": "One of: how_to | listicle | thought_leadership | product_launch | behind_the_scenes | testimonial | engagement_question | personal_story | announcement | myth_busting | motivational | promotional",
  "matchKeywords": ["array", "of", "5-8", "keywords", "that", "describe", "this", "content", "style"],
  "bestForObjectives": ["array of 2-4 PostObjective values that best match: grow_audience | drive_traffic | generate_leads | build_authority | increase_engagement | promote_product | share_story | educate_audience"],
  "structure": "FULL PROMPT INSTRUCTION BLOCK — write this as a multi-line instruction string (use \\n for newlines) that tells an AI caption generator exactly how to write a post in this style. Include:\\n- The dominant hook formula derived from the skeleton and trigger\\n- Tone guidance derived from the dominant emotion and sentiment ratios\\n- Sentence length and formatting rules (match the pacing of the original post)\\n- Emoji and hashtag rules: ${hashtagRule}\\n- The psychological trigger to emphasise: '${data.hookCTA.trigger}' — explain how to activate it\\n- The structural template (e.g. 'HOOK: [challenge belief] → BODY: [evidence] → TWIST: [insight] → CTA: [${data.hookCTA.ctaType}]')\\n- Character limit: ${charLimit} characters max\\n- Any forbidden patterns that would break the voice",
  "examplePost": "Write a complete, fully-written example post that uses the structure above on a NEW topic (not copied from the original). This should be post-ready with no brackets or placeholders — ${charLimit} characters max."
}

CRITICAL RULES:
1. The "structure" field must be written as IMPERATIVE AI INSTRUCTIONS starting with: "Write a ${platformName} post using the following formula:"
2. The "examplePost" must be a complete written post — NO brackets, NO placeholders, NO template skeletons.
3. The category MUST be one of the 12 listed values exactly.
4. Return ONLY the JSON object — no markdown, no code fences, no extra text.`;
}

// ─── Response type guard ─────────────────────────────────────────────────────

interface GeneratedTemplateRaw {
  name: string;
  description: string;
  category: string;
  matchKeywords: string[];
  bestForObjectives: string[];
  structure: string;
  examplePost: string;
}

function isGeneratedTemplateRaw(v: unknown): v is GeneratedTemplateRaw {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    o.name.length > 0 &&
    typeof o.description === "string" &&
    o.description.length > 0 &&
    typeof o.category === "string" &&
    o.category.length > 0 &&
    Array.isArray(o.matchKeywords) &&
    Array.isArray(o.bestForObjectives) &&
    typeof o.structure === "string" &&
    o.structure.length > 0 &&
    typeof o.examplePost === "string" &&
    o.examplePost.length > 0
  );
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

    // 2. Read and find the cached analysis
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
    const hookCTA = analysis.hookCTA as {
      trigger: string;
      skeleton: string;
      pivotA: string;
      pivotB: string;
      pivotC: string;
      ctaType: string;
      ctaTip: string;
    } | null;
    const sentiment = analysis.sentiment as {
      sentimentData: {
        dominantEmotion: string;
        positive: number;
        negative: number;
        trustScore: number;
        keywords: string[];
      };
    } | null;
    const viralVelocity = analysis.viralVelocity as {
      velocityData: {
        trend: string;
        growthPrediction: string;
      };
    } | null;

    if (!hookCTA || !sentiment || !viralVelocity) {
      return NextResponse.json(
        { error: "Analysis data is incomplete. Ensure the analysis completed successfully." },
        { status: 422, headers: corsHeaders },
      );
    }

    // 4. Build the Gemini prompt
    const prompt = buildPostTemplatePrompt({
      platform,
      postContent,
      hookCTA,
      sentiment,
      viralVelocity,
    });

    // 5. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText: string;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (aiErr) {
      console.error("[post/generate-template] Gemini error:", aiErr);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 6. Parse and validate response
    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (parseErr) {
      console.error("[post/generate-template] JSON parse error:", parseErr);
      console.error("[post/generate-template] Raw response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!isGeneratedTemplateRaw(parsed)) {
      console.error("[post/generate-template] Invalid AI response shape:", parsed);
      return NextResponse.json(
        { error: "AI returned an unexpected response shape" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 7. Build CaptionTemplateDocument
    const normPlatform = normalisePlatform(platform);
    const templateData = {
      name: parsed.name,
      description: parsed.description,
      category: normaliseCategory(parsed.category),
      platforms: [normPlatform] as TemplatePlatform[],
      platformVariants: [
        {
          platform: normPlatform,
          structure: parsed.structure,
          examplePost: postContent || parsed.examplePost,
          ...(CHAR_LIMITS[normPlatform] !== undefined
            ? { characterLimit: CHAR_LIMITS[normPlatform] }
            : {}),
        },
      ],
      isBundle: false,
      matchKeywords: parsed.matchKeywords,
      bestForObjectives: parsed.bestForObjectives,
      isActive: true,
      sortOrder: 999,
    };

    // 8. Save to DB
    let insertedId: string;
    try {
      insertedId = await createCaptionTemplate(templateData);
    } catch (dbErr) {
      console.error("[post/generate-template] DB insert error:", dbErr);
      return NextResponse.json(
        { error: "Failed to save template to database" },
        { status: 500, headers: corsHeaders },
      );
    }

    console.log(
      `[post/generate-template] Saved template "${templateData.name}" (id: ${insertedId})`,
    );

    return NextResponse.json(
      {
        success: true,
        templateId: insertedId,
        templateName: templateData.name,
        description: templateData.description,
        category: templateData.category,
        platform: normPlatform,
        structure: templateData.platformVariants[0].structure,
        examplePost: templateData.platformVariants[0].examplePost,
      },
      { headers: corsHeaders },
    );
  } catch (error: unknown) {
    console.error("[post/generate-template] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate template",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

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

// CORS headers so the extension page can call this
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const CACHE_FILE_PATH = path.join(process.cwd(), "analysis_cache.json");

// Canonical category values the DB accepts
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

// Normalise a freeform string returned by Gemini to a valid TemplateCategory
function normaliseCategory(raw: string): TemplateCategory {
  const cleaned = raw?.toLowerCase().replace(/[\s-]/g, "_") ?? "";
  if ((VALID_CATEGORIES as string[]).includes(cleaned)) {
    return cleaned as TemplateCategory;
  }
  // Fuzzy fallback map for common Gemini aliases
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
  return "thought_leadership"; // safe default
}

// Normalise platform string to the DB enum
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

// Character limits per platform
const CHAR_LIMITS: Partial<Record<TemplatePlatform, number>> = {
  x: 280,
  instagram_post: 2200,
  facebook: 63206,
};

function buildGenerateTemplatePrompt(cacheData: {
  platform: string;
  viralRecipe: unknown[];
  psychTriggers: unknown;
  voiceSpectrum: unknown;
}): string {
  const platformName =
    cacheData.platform === "x" || cacheData.platform === "twitter"
      ? "X (Twitter)"
      : cacheData.platform.charAt(0).toUpperCase() + cacheData.platform.slice(1);

  return `You are an expert social media content strategist tasked with creating a reusable caption template.

You have been given an AI analysis of a real ${platformName} profile — specifically the viral recipe analysis, psychological trigger profile, and brand voice spectrum.

---
VIRAL RECIPE ANALYSIS (top-performing posts):
${JSON.stringify(cacheData.viralRecipe, null, 2)}
---
PSYCHOLOGICAL TRIGGER PROFILE:
${JSON.stringify(cacheData.psychTriggers, null, 2)}
---
BRAND VOICE SPECTRUM:
${JSON.stringify(cacheData.voiceSpectrum, null, 2)}
---

YOUR TASK:
Synthesise this data into a single reusable caption template that replicates the exact vibe, tone, and structural formula that makes this ${platformName} profile perform. 

The template must be immediately usable inside an AI caption generation pipeline. The "structure" field IS the prompt instruction block — it tells an AI HOW to write a post in this style. Write it as direct, imperative instructions (like a system prompt section), NOT as a description of the template.

Return ONLY valid JSON in exactly this shape:

{
  "name": "Short descriptive template name (4-8 words, no quotes), e.g. 'Contrarian Hot Take — X'",
  "description": "2-3 sentence description of what makes this template effective and when to use it",
  "category": "One of: how_to | listicle | thought_leadership | product_launch | behind_the_scenes | testimonial | engagement_question | personal_story | announcement | myth_busting | motivational | promotional",
  "matchKeywords": ["array", "of", "5-8", "keywords", "that", "describe", "this", "content", "style"],
  "bestForObjectives": ["array of 2-4 PostObjective values that best match: grow_audience | drive_traffic | generate_leads | build_authority | increase_engagement | promote_product | share_story | educate_audience"],
  "structure": "FULL PROMPT INSTRUCTION BLOCK — write this as a multi-line instruction string (use \\n for newlines) that tells an AI caption generator exactly how to write a post in this style. Include:\\n- The dominant hook formula (from the viral recipe)\\n- Tone guidance derived from the voice spectrum axes\\n- Sentence length and formatting rules\\n- Emoji and hashtag usage rules (match the platform: ${cacheData.platform === "x" ? "NO hashtags on X — they reduce reach; NO emojis unless style demands it" : "follow platform norms"})\\n- The psychological trigger to emphasise (from the winning trigger)\\n- The structural template (e.g. 'HOOK: [challenge belief] → BODY: [evidence] → TWIST: [insight] → CTA: [invite debate]')\\n- Character limit enforcement: ${CHAR_LIMITS[normalisePlatform(cacheData.platform)] ?? 280} characters max\\n- Any forbidden patterns (based on the platform and voice spectrum)",
  "examplePost": "Take the single best hookText from the viral recipe and expand it into a complete, fully-written example post that follows the structure above. This should be a real, post-ready example (not a template skeleton)."
}

CRITICAL RULES:
1. The "structure" field must be written as IMPERATIVE AI INSTRUCTIONS, not a description. Start with something like: "Write a ${platformName} post using the following formula:"
2. The "examplePost" must be a complete, written post — not brackets or placeholders.
3. The category MUST be one of the 12 listed values exactly.
4. Return ONLY the JSON object — no markdown, no code fences, no extra text.`;
}

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
    typeof o.name === "string" && o.name.length > 0 &&
    typeof o.description === "string" && o.description.length > 0 &&
    typeof o.category === "string" && o.category.length > 0 &&
    Array.isArray(o.matchKeywords) &&
    Array.isArray(o.bestForObjectives) &&
    typeof o.structure === "string" && o.structure.length > 0 &&
    typeof o.examplePost === "string" && o.examplePost.length > 0
  );
}

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 1. Read the analysis cache (written by the main analyze-extension POST route)
    let cacheRaw: string;
    try {
      cacheRaw = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    } catch {
      return NextResponse.json(
        { error: "No analysis cache found. Run the extension analyzer first." },
        { status: 404, headers: corsHeaders },
      );
    }

    let cacheData: {
      analysis: Record<string, unknown>;
      platform: string;
    };
    try {
      cacheData = JSON.parse(cacheRaw);
    } catch {
      return NextResponse.json(
        { error: "Analysis cache is malformed." },
        { status: 500, headers: corsHeaders },
      );
    }

    const { analysis, platform } = cacheData;

    if (!analysis || !platform) {
      return NextResponse.json(
        { error: "Analysis cache is missing required fields." },
        { status: 500, headers: corsHeaders },
      );
    }

    const viralRecipe = Array.isArray(analysis.viralRecipe)
      ? (analysis.viralRecipe as unknown[]).slice(0, 3) // top 3 recipes is enough
      : [];

    const psychTriggers = analysis.psychTriggers ?? null;
    const voiceSpectrum = analysis.voiceSpectrum ?? null;

    if (viralRecipe.length === 0) {
      return NextResponse.json(
        { error: "No viral recipe data found in cache. Ensure the analysis completed successfully." },
        { status: 422, headers: corsHeaders },
      );
    }

    // 2. Build the prompt
    const prompt = buildGenerateTemplatePrompt({
      platform,
      viralRecipe,
      psychTriggers,
      voiceSpectrum,
    });

    // 3. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText: string;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (aiErr) {
      console.error("[generate-template] Gemini error:", aiErr);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 4. Parse the response
    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (parseErr) {
      console.error("[generate-template] JSON parse error:", parseErr);
      console.error("[generate-template] Raw response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!isGeneratedTemplateRaw(parsed)) {
      console.error("[generate-template] Invalid AI response shape:", parsed);
      return NextResponse.json(
        { error: "AI returned an unexpected response shape" },
        { status: 500, headers: corsHeaders },
      );
    }

    // 5. Build the CaptionTemplateDocument
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
          examplePost: parsed.examplePost,
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

    // 6. Save to DB
    let insertedId: string;
    try {
      insertedId = await createCaptionTemplate(templateData);
    } catch (dbErr) {
      console.error("[generate-template] DB insert error:", dbErr);
      return NextResponse.json(
        { error: "Failed to save template to database" },
        { status: 500, headers: corsHeaders },
      );
    }

    console.log(`[generate-template] Saved template "${templateData.name}" (id: ${insertedId})`);

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
    console.error("[generate-template] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate template",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

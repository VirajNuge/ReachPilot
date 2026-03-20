import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseAIJson } from "@/lib/parseAIJson";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GapType = "Hook Strength" | "Post Frequency" | "Content Quality" | string;

// Hook Hijack (gap type: Hook Strength)
interface UpgradedHook {
  trigger: "Curiosity" | "FOMO" | "Authority" | "Urgency" | "Social Proof";
  hookText: string;
  why: string;
}

interface HookHijackPlan {
  attackAngle: string;
  competitorWeakness: string;
  upgradedHooks: UpgradedHook[];
}

// Blitz Schedule (gap type: Post Frequency)
interface BlitzDay {
  day: string;
  time: string;
  contentType: string;
  topic: string;
  hook: string;
  rationale: string;
}

interface BlitzSchedulePlan {
  attackAngle: string;
  competitorWeakness: string;
  blitzSchedule: BlitzDay[];
}

// Quality Bridge (gap type: Content Quality)
interface RewriteBrief {
  originalAngle: string;
  upgradedAngle: string;
  contentType: string;
  depthTactics: string[];
  suggestedHook: string;
  expectedImpact: string;
}

interface QualityBridgePlan {
  attackAngle: string;
  competitorWeakness: string;
  rewriteBriefs: RewriteBrief[];
}

export type HijackPlan = HookHijackPlan | BlitzSchedulePlan | QualityBridgePlan;

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isUpgradedHook(v: unknown): v is UpgradedHook {
  if (!isObject(v)) return false;
  return (
    typeof v.trigger === "string" &&
    typeof v.hookText === "string" &&
    typeof v.why === "string"
  );
}

function isHookHijackPlan(v: unknown): v is HookHijackPlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.upgradedHooks) &&
    (v.upgradedHooks as unknown[]).every(isUpgradedHook)
  );
}

function isBlitzDay(v: unknown): v is BlitzDay {
  if (!isObject(v)) return false;
  return (
    typeof v.day === "string" &&
    typeof v.time === "string" &&
    typeof v.contentType === "string" &&
    typeof v.topic === "string" &&
    typeof v.hook === "string" &&
    typeof v.rationale === "string"
  );
}

function isBlitzSchedulePlan(v: unknown): v is BlitzSchedulePlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.blitzSchedule) &&
    (v.blitzSchedule as unknown[]).every(isBlitzDay)
  );
}

function isRewriteBrief(v: unknown): v is RewriteBrief {
  if (!isObject(v)) return false;
  return (
    typeof v.originalAngle === "string" &&
    typeof v.upgradedAngle === "string" &&
    typeof v.contentType === "string" &&
    Array.isArray(v.depthTactics) &&
    typeof v.suggestedHook === "string" &&
    typeof v.expectedImpact === "string"
  );
}

function isQualityBridgePlan(v: unknown): v is QualityBridgePlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.rewriteBriefs) &&
    (v.rewriteBriefs as unknown[]).every(isRewriteBrief)
  );
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildHookHijackPrompt(
  topOpportunity: string,
  competitorValue: number,
  benchmarkValue: number,
  niche: string,
): string {
  return `You are an expert content strategist specialising in audience hijacking via superior hooks.

Context:
- Gap identified: Hook Strength
- Competitor hook strength: ${competitorValue}% vs Industry Average: ${benchmarkValue}%
- Content niche: "${niche}"
- The competitor's hooks are WEAK — this is a Primary Attack Vector.

Your task: Generate a tactical "Niche Hijack" brief with 5 upgraded hooks mathematically designed to beat the competitor's top posts.
Each hook must use a different proven emotional trigger.

Return ONLY valid JSON (no markdown, no backticks):
{
  "attackAngle": "One sentence describing the core attack strategy",
  "competitorWeakness": "One sentence on why the competitor's hooks fail",
  "upgradedHooks": [
    {
      "trigger": "Curiosity",
      "hookText": "The actual opening line / hook text",
      "why": "One sentence explaining why this beats the competitor"
    },
    {
      "trigger": "FOMO",
      "hookText": "...",
      "why": "..."
    },
    {
      "trigger": "Authority",
      "hookText": "...",
      "why": "..."
    },
    {
      "trigger": "Urgency",
      "hookText": "...",
      "why": "..."
    },
    {
      "trigger": "Social Proof",
      "hookText": "...",
      "why": "..."
    }
  ]
}`;
}

function buildBlitzSchedulePrompt(
  topOpportunity: string,
  competitorValue: number,
  benchmarkValue: number,
  niche: string,
): string {
  return `You are an expert content strategist specialising in share-of-voice domination.

Context:
- Gap identified: Post Frequency
- Competitor posts: ${competitorValue}x vs Industry Average: ${benchmarkValue}x
- The competitor posts RARELY — this is a window to dominate the niche.
- Content niche: "${niche}"

Your task: Create a 7-day "Blitz Schedule" designed to flood the niche and capture the audience void left by the competitor.
Each day should have a specific time, content type, hook, and rationale.

Return ONLY valid JSON (no markdown, no backticks):
{
  "attackAngle": "One sentence describing the blitz strategy",
  "competitorWeakness": "One sentence on why low frequency is their Achilles heel",
  "blitzSchedule": [
    {
      "day": "Monday",
      "time": "9:00 AM",
      "contentType": "Carousel / Reel / Thread / Static",
      "topic": "Specific topic that fills the competitor void",
      "hook": "The opening line for this post",
      "rationale": "One sentence why this specific post wins on this day"
    }
  ]
}
Generate exactly 7 days (Mon–Sun).`;
}

function buildQualityBridgePrompt(
  topOpportunity: string,
  competitorValue: number,
  benchmarkValue: number,
  niche: string,
): string {
  return `You are an expert content strategist specialising in quality gap exploitation.

Context:
- Gap identified: Content Quality
- Competitor quality score: ${competitorValue}% vs Industry Average: ${benchmarkValue}%
- The competitor wins on VOLUME but loses on depth — this is a quality arbitrage opportunity.
- Content niche: "${niche}"

Your task: Generate 3 "Quality Bridge" rewrite briefs. For each, take a shallow competitor topic and show how to produce a deeply superior version that steals their audience.

Return ONLY valid JSON (no markdown, no backticks):
{
  "attackAngle": "One sentence describing the quality hijack strategy",
  "competitorWeakness": "One sentence on why their shallow content creates opportunity",
  "rewriteBriefs": [
    {
      "originalAngle": "The competitor's shallow take on the topic",
      "upgradedAngle": "Your deeply superior angle on the same topic",
      "contentType": "Carousel / Long-form / Video Essay / Thread",
      "depthTactics": ["Tactic 1", "Tactic 2", "Tactic 3"],
      "suggestedHook": "The opening line for your upgraded version",
      "expectedImpact": "One sentence on the engagement uplift this creates"
    }
  ]
}
Generate exactly 3 rewrite briefs.`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      gapType?: GapType;
      topOpportunity?: string;
      competitorValue?: number;
      benchmarkValue?: number;
      niche?: string;
    };

    if (!body.gapType || body.competitorValue === undefined || body.benchmarkValue === undefined) {
      return NextResponse.json(
        { error: "gapType, competitorValue, and benchmarkValue are required" },
        { status: 400 },
      );
    }

    const niche = body.niche ?? "general social media content";
    const topOpportunity = body.topOpportunity ?? body.gapType;

    let prompt: string;
    if (body.gapType === "Hook Strength") {
      prompt = buildHookHijackPrompt(topOpportunity, body.competitorValue, body.benchmarkValue, niche);
    } else if (body.gapType === "Post Frequency") {
      prompt = buildBlitzSchedulePrompt(topOpportunity, body.competitorValue, body.benchmarkValue, niche);
    } else {
      // Content Quality (and any other gap type falls here)
      prompt = buildQualityBridgePrompt(topOpportunity, body.competitorValue, body.benchmarkValue, niche);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Hijack plan AI generation error:", error);
      return NextResponse.json({ error: "AI Generation failed" }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Hijack plan JSON parse error:", error);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Validate shape depending on gap type
    if (body.gapType === "Hook Strength") {
      if (!isHookHijackPlan(parsed)) {
        return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
      }
      return NextResponse.json({ plan: parsed, planType: "hooks" });
    }

    if (body.gapType === "Post Frequency") {
      if (!isBlitzSchedulePlan(parsed)) {
        return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
      }
      return NextResponse.json({ plan: parsed, planType: "blitz" });
    }

    // Content Quality
    if (!isQualityBridgePlan(parsed)) {
      return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
    }
    return NextResponse.json({ plan: parsed, planType: "quality" });
  } catch (error) {
    console.error("Hijack plan route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

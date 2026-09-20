import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/parseAIJson";

// --- Types ---

interface GeneratedAsset {
  type: string;
  description: string;
  template: string;
}

interface GenerateAssetsResult {
  assets: GeneratedAsset[];
}

// --- Type guards ---

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGeneratedAsset(v: unknown): v is GeneratedAsset {
  if (!isObject(v)) return false;
  return (
    typeof v.type === "string" &&
    typeof v.description === "string" &&
    typeof v.template === "string"
  );
}

function isGenerateAssetsResult(v: unknown): v is GenerateAssetsResult {
  if (!isObject(v)) return false;
  if (!Array.isArray(v.assets)) return false;
  return v.assets.every(isGeneratedAsset);
}

// --- Prompt ---

function buildGenerateAssetsPrompt(
  tacticTitle: string,
  tacticProblem: string,
  tacticSolution: string,
  tacticImpact: string
): string {
  return `You are an expert content strategist and copywriter helping a social media creator execute a specific funnel tactic.

TACTIC: ${tacticTitle}

PROBLEM IT SOLVES:
${tacticProblem}

RECOMMENDED SOLUTION:
${tacticSolution}

EXPECTED IMPACT: ${tacticImpact}

TASK: Generate 4 ready-to-use content assets that will help this creator immediately execute this tactic. Each asset should be practical, specific, and actionable — not generic advice.

Return ONLY valid JSON (no markdown, no backticks, no explanation outside JSON):
{
  "assets": [
    {
      "type": "Asset type (e.g. 'Caption Template', 'Email Script', 'DM Template', 'Post Hook', 'CTA Copy', 'Carousel Outline', 'Story Script')",
      "description": "One sentence explaining what this asset does and when to use it",
      "template": "The actual ready-to-use content template with [BRACKETS] for personalisation spots. Should be 2-6 sentences, directly usable as-is."
    }
  ]
}

Rules:
- Each asset must be a different format (no duplicating asset types)
- Templates must be immediately deployable — not placeholders or descriptions
- Use [YOUR NICHE], [YOUR OFFER], [SPECIFIC RESULT] as personalisation markers
- Keep each template concise but complete`;
}

// --- Route ---

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      tacticTitle?: string;
      tacticProblem?: string;
      tacticSolution?: string;
      tacticImpact?: string;
    };

    if (!body.tacticTitle || !body.tacticProblem || !body.tacticSolution) {
      return NextResponse.json(
        { error: "tacticTitle, tacticProblem, and tacticSolution are required" },
        { status: 400 }
      );
    }

    const prompt = buildGenerateAssetsPrompt(
      body.tacticTitle,
      body.tacticProblem,
      body.tacticSolution,
      body.tacticImpact ?? ""
    );

    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "openrouter/free" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Generate assets AI generation error:", error);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Generate assets JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (!isGenerateAssetsResult(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Generate assets route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

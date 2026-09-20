import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/parseAIJson";

interface RecipeIngredient {
  name: string;
  value: string;
  score: number;
}

interface ViralRecipeInput {
  hookType: string;
  hookText: string;
  engagementMultiplier: string;
  ingredients: RecipeIngredient[];
  whyItWorked: string;
  templateStructure: string[];
}

interface ReplicateResult {
  draft: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReplicateResult(v: unknown): v is ReplicateResult {
  return isObject(v) && typeof v.draft === "string" && v.draft.length > 0;
}

function isRecipeIngredient(v: unknown): v is RecipeIngredient {
  return (
    isObject(v) &&
    typeof v.name === "string" &&
    typeof v.value === "string" &&
    typeof v.score === "number"
  );
}

function isViralRecipeInput(v: unknown): v is ViralRecipeInput {
  if (!isObject(v)) return false;
  return (
    typeof v.hookType === "string" &&
    typeof v.hookText === "string" &&
    typeof v.engagementMultiplier === "string" &&
    Array.isArray(v.ingredients) &&
    (v.ingredients as unknown[]).every(isRecipeIngredient) &&
    typeof v.whyItWorked === "string" &&
    Array.isArray(v.templateStructure) &&
    (v.templateStructure as unknown[]).every((s) => typeof s === "string")
  );
}

function buildReplicatePrompt(recipe: ViralRecipeInput): string {
  const structureLines = recipe.templateStructure
    .map((line, i) => `  ${i + 1}. ${line}`)
    .join("\n");

  const ingredientLines = recipe.ingredients
    .map((ing) => `  - ${ing.name}: ${ing.value} (Impact: ${ing.score}/10)`)
    .join("\n");

  return `You are an expert social media ghostwriter who specializes in replicating viral content formats.

VIRAL RECIPE TO REPLICATE:
- Hook Style: ${recipe.hookType}
- Engagement Multiplier: ${recipe.engagementMultiplier} above average
- Original Hook: "${recipe.hookText}"

WHY THIS FORMAT WORKS:
${recipe.whyItWorked}

KEY INGREDIENTS TO USE:
${ingredientLines}

TEMPLATE STRUCTURE:
${structureLines}

YOUR TASK:
Generate a fully written post draft that faithfully applies this viral template structure. 
- Treat the [BRACKETED] placeholders as fill-in variables — replace each one with a realistic, concrete example for a general creator/entrepreneur/educator niche.
- The draft must feel like a real post, not a skeleton.
- Apply the key ingredients: ${recipe.ingredients.map((i) => i.name).join(", ")}.
- Match the hook style: ${recipe.hookType}.
- Keep the tone confident, direct, and engaging.

Return ONLY valid JSON (no markdown, no backticks):
{
  "draft": "YOUR COMPLETE WRITTEN POST DRAFT HERE (use \\n for line breaks)"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as unknown;

    if (!isViralRecipeInput(body)) {
      return NextResponse.json(
        { error: "Invalid recipe input — hookType, hookText, engagementMultiplier, ingredients, whyItWorked, and templateStructure are required" },
        { status: 400 },
      );
    }

    const prompt = buildReplicatePrompt(body);

    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "openrouter/free" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Replicate recipe AI generation error:", error);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Replicate recipe JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isReplicateResult(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json({ draft: parsed.draft });
  } catch (error) {
    console.error("Replicate recipe route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

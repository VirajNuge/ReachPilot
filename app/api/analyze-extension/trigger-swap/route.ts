import { NextRequest, NextResponse } from "next/server";
import { OpenRouterClient } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/parseAIJson";

interface TriggerSwapResult {
  originalTrigger: string;
  targetTrigger: string;
  originalPost: string;
  rewrittenPost: string;
  explanation: string;
  expectedImpact: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTriggerSwapResult(v: unknown): v is TriggerSwapResult {
  if (!isObject(v)) return false;
  return (
    typeof v.originalTrigger === "string" &&
    typeof v.targetTrigger === "string" &&
    typeof v.originalPost === "string" &&
    typeof v.rewrittenPost === "string" &&
    typeof v.explanation === "string" &&
    typeof v.expectedImpact === "string"
  );
}

function buildTriggerSwapPrompt(
  postContent: string | undefined,
  currentTrigger: string,
  targetTrigger: string,
  winningTrigger: string,
  insight: string,
): string {
  const triggerGuides: Record<string, string> = {
    Authority:
      "Lead with credentials, experience, or data. Use phrases like 'After X years...', 'Studies show...', 'As an expert in...'",
    FOMO: "Create fear of missing out. Use scarcity, exclusivity, and time pressure. 'Limited time', 'only X left', 'before it's gone'",
    "Social Proof":
      "Leverage numbers and community. 'X people already...', 'Join thousands who...', testimonials, results, case studies",
    Reciprocity:
      "Give massive free value first. Actionable tips, free resources, insider knowledge — make them feel indebted to engage",
    Urgency:
      "Create time-sensitive pressure. Deadlines, countdowns, 'Act now', 'Today only', 'This week only'",
    Curiosity:
      "Open a loop the reader must close. Provocative questions, 'The one thing nobody tells you about...', cliffhangers, surprising contrarian takes",
  };

  if (postContent) {
    return `You are an expert social media copywriter specializing in psychological persuasion.

CURRENT POST:
"${postContent}"

PROFILE CONTEXT:
- Current dominant trigger: ${currentTrigger}
- Profile's winning trigger: ${winningTrigger}
- AI Insight: ${insight}

TASK: Rewrite the post above to primarily use the "${targetTrigger}" psychological trigger instead of "${currentTrigger}".

TRIGGER GUIDE for ${targetTrigger}:
${triggerGuides[targetTrigger] || "Apply the core principles of this psychological trigger effectively."}

RULES:
- Keep the core message and topic identical
- Preserve the approximate length (within 20%)
- Make the ${targetTrigger} trigger unmistakably dominant
- The rewrite should feel natural, not forced

Return ONLY valid JSON (no markdown, no backticks):
{
  "originalTrigger": "${currentTrigger}",
  "targetTrigger": "${targetTrigger}",
  "originalPost": "${postContent.replace(/"/g, '\\"')}",
  "rewrittenPost": "YOUR REWRITTEN POST HERE",
  "explanation": "One sentence explaining what psychological shift you made and why it works",
  "expectedImpact": "One sentence predicting the engagement impact of this swap (e.g. '+15-25% comments from curious readers')"
}`;
  }

  return `You are an expert social media copywriter specializing in psychological persuasion.

PROFILE CONTEXT:
- Current dominant trigger: ${currentTrigger}
- Profile's winning trigger: ${winningTrigger}
- AI Insight: ${insight}

TASK: Create an example post that demonstrates the "${currentTrigger}" trigger, then rewrite it to use the "${targetTrigger}" trigger instead. Base the content topic and style on the AI insight above.

TRIGGER GUIDE for ${targetTrigger}:
${triggerGuides[targetTrigger] || "Apply the core principles of this psychological trigger effectively."}

RULES:
- Both posts should feel natural and realistic for this creator's voice
- Keep the core topic identical between original and rewrite
- Make the ${targetTrigger} trigger unmistakably dominant in the rewrite

Return ONLY valid JSON (no markdown, no backticks):
{
  "originalTrigger": "${currentTrigger}",
  "targetTrigger": "${targetTrigger}",
  "originalPost": "AN EXAMPLE POST USING ${currentTrigger} TRIGGER",
  "rewrittenPost": "THE SAME POST REWRITTEN WITH ${targetTrigger} TRIGGER",
  "explanation": "One sentence explaining what psychological shift was made and why it works",
  "expectedImpact": "One sentence predicting the engagement impact of this swap (e.g. '+15-25% comments from curious readers')"
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

    const body = (await req.json()) as {
      postContent?: string;
      currentTrigger?: string;
      targetTrigger?: string;
      winningTrigger?: string;
      insight?: string;
    };

    if (!body.currentTrigger || !body.targetTrigger) {
      return NextResponse.json(
        { error: "currentTrigger and targetTrigger are required" },
        { status: 400 },
      );
    }

    const prompt = buildTriggerSwapPrompt(
      body.postContent,
      body.currentTrigger,
      body.targetTrigger,
      body.winningTrigger ?? body.currentTrigger,
      body.insight ?? "",
    );

    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "openrouter/free" });

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (error) {
      console.error("Trigger swap AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch (error) {
      console.error("Trigger swap JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!isTriggerSwapResult(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Trigger swap route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

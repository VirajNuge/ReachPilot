import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from "@/lib/withAuth";
import { assembleIdeaFinderContext } from "@/lib/ideaFinder/contextOrchestrator";
import { buildIdeaFinderPrompt } from "@/lib/ideaFinder/promptBuilders";
import { parseAIJson } from "@/lib/parseAIJson";
import { AI_MODELS } from "@/lib/aiConfig";
import { mapIdeaToPostSeed } from "@/lib/ideaFinder/ideaToPostSeed";
import type {
  IdeaFinderRequest,
  IdeaFinderResponse,
  IdeaMode,
  IdeaPlatform,
  GeneratedIdea,
} from "@/lib/ideaFinder/types";
import { randomUUID } from "crypto";

// ---- Validation ----

const VALID_MODES: IdeaMode[] = [
  "voice-match",
  "trend-jacker",
  "repurpose",
  "gap-filler",
  "prism",
];

const VALID_PLATFORMS: IdeaPlatform[] = [
  "instagram",
  "linkedin",
  "x",
  "facebook",
  "all",
];

function isValidRequest(body: unknown): body is IdeaFinderRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.mode === "string" &&
    VALID_MODES.includes(b.mode as IdeaMode) &&
    typeof b.platform === "string" &&
    VALID_PLATFORMS.includes(b.platform as IdeaPlatform) &&
    typeof b.accountId === "string" &&
    b.accountId.length > 0
  );
}

// ---- Trend-Jacker: uses @google/genai with Google Search grounding ----

async function generateWithGrounding(
  apiKey: string,
  prompt: string
): Promise<{ text: string; sources: Array<{ title: string; url: string }>; searchQueries: string[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const candidate = response.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || "";
  const groundingMetadata = candidate?.groundingMetadata;

  const sources =
    groundingMetadata?.groundingChunks?.map((chunk) => ({
      title: chunk.web?.title || "",
      url: chunk.web?.uri || "",
    })) || [];

  const searchQueries = groundingMetadata?.webSearchQueries || [];

  return { text, sources, searchQueries };
}

// ---- Standard modes: uses @google/generative-ai ----

async function generateStandard(
  apiKey: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ---- Post-processing ----

function postProcessIdeas(
  raw: unknown,
  mode: IdeaMode,
  platform: string,
  audience?: string,
  sources?: Array<{ title: string; url: string }>,
  searchQueries?: string[]
): GeneratedIdea[] {
  if (typeof raw !== "object" || raw === null) return [];

  const obj = raw as Record<string, unknown>;
  const ideasArr = Array.isArray(obj.ideas) ? obj.ideas : [];

  return ideasArr.map((idea: unknown) => {
    const i = (typeof idea === "object" && idea !== null ? idea : {}) as Record<
      string,
      unknown
    >;
    const baseIdea = {
      id: randomUUID(),
      title: String(i.title || ""),
      hook: String(i.hook || ""),
      angle: String(i.angle || ""),
      format: (i.format as GeneratedIdea["format"]) || "post",
      platform: String(i.platform || platform),
      whyItFits: String(i.whyItFits || ""),
      suggestedCTA: String(i.suggestedCTA || ""),
      visualDirection: String(i.visualDirection || ""),
      confidenceScore:
        typeof i.confidenceScore === "number"
          ? Math.min(100, Math.max(0, i.confidenceScore))
          : 50,

      // Mode-specific
      ...(mode === "trend-jacker" && {
        trendTopic: i.trendTopic ? String(i.trendTopic) : undefined,
        trendContext: i.trendContext ? String(i.trendContext) : undefined,
        urgency: (i.urgency as GeneratedIdea["urgency"]) || "medium",
        sources: sources?.length ? sources : undefined,
        searchQueries: searchQueries?.length ? searchQueries : undefined,
        groundedAt: new Date().toISOString(),
      }),
      ...(mode === "repurpose" && {
        originalContentRef: i.originalContentRef
          ? String(i.originalContentRef)
          : undefined,
        remixStrategy: i.remixStrategy
          ? String(i.remixStrategy)
          : undefined,
      }),
      ...(mode === "gap-filler" && {
        gapTopic: i.gapTopic ? String(i.gapTopic) : undefined,
        audienceDemandSignal: i.audienceDemandSignal
          ? String(i.audienceDemandSignal)
          : undefined,
      }),
      ...(mode === "prism" && {
        angleFramework: i.angleFramework
          ? String(i.angleFramework)
          : undefined,
      }),
    } satisfies GeneratedIdea;

    const { postSeed, postPreview, platformStyles } = mapIdeaToPostSeed(baseIdea, mode, audience);

    return {
      ...baseIdea,
      postSeed,
      postPreview,
      platformStyles,
    } satisfies GeneratedIdea;
  });
}

// ---- Route Handler ----

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    if (!isValidRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request. Required: mode, platform, accountId" },
        { status: 400 }
      );
    }

    const {
      mode,
      platform,
      accountId,
      topic = "",
      audience = "",
      vibe = "",
      count = 8,
    } = body;

    const clampedCount = Math.min(12, Math.max(3, count));

    // 1. Assemble context
    const context = await assembleIdeaFinderContext(
      userId,
      accountId,
      mode,
      platform
    );

    // 2. Build prompt
    const prompt = buildIdeaFinderPrompt({
      context,
      mode,
      topic,
      audience,
      vibe,
      count: clampedCount,
    });

    // 3. Call Gemini
    let responseText: string;
    let groundingSources: Array<{ title: string; url: string }> = [];
    let groundingQueries: string[] = [];

    if (mode === "trend-jacker") {
      const result = await generateWithGrounding(apiKey, prompt);
      responseText = result.text;
      groundingSources = result.sources;
      groundingQueries = result.searchQueries;
    } else {
      responseText = await generateStandard(apiKey, prompt);
    }

    // 4. Parse
    let parsed: unknown;
    try {
      parsed = parseAIJson(responseText);
    } catch {
      console.error("[idea-finder] JSON parse failed, raw:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // 5. Post-process
    const ideas = postProcessIdeas(
      parsed,
      mode,
      platform,
      audience,
      groundingSources,
      groundingQueries
    );

    if (!ideas.length) {
      return NextResponse.json(
        { error: "AI returned no valid ideas" },
        { status: 500 }
      );
    }

    const response: IdeaFinderResponse = {
      ideas,
      mode,
      generatedAt: new Date().toISOString(),
      groundingAvailable: mode === "trend-jacker" && groundingSources.length > 0,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("[idea-finder/generate] Error:", error);
    return NextResponse.json(
      { error: "Idea generation failed" },
      { status: 500 }
    );
  }
}

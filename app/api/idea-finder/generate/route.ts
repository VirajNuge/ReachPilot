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
  IdeaTemplateId,
} from "@/lib/ideaFinder/types";
import { randomUUID } from "crypto";
import type { PostPlatform } from "@/lib/types/postGeneration";

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
  "pinterest",
  "all",
];

function isValidRequest(body: unknown): body is IdeaFinderRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  const hasValidCoreMessage =
    b.coreMessage === undefined || typeof b.coreMessage === "string";
  const hasValidPersonaToggle =
    b.importPersona === undefined || typeof b.importPersona === "boolean";
  return (
    typeof b.mode === "string" &&
    VALID_MODES.includes(b.mode as IdeaMode) &&
    typeof b.platform === "string" &&
    VALID_PLATFORMS.includes(b.platform as IdeaPlatform) &&
    typeof b.accountId === "string" &&
    b.accountId.length > 0 &&
    hasValidCoreMessage &&
    hasValidPersonaToggle
  );
}

function buildEmptyIdeaFinderContext(platform: IdeaPlatform) {
  return {
    persona: {
      summary: "",
      audience: "",
      voice: "",
      writingSamples: [],
      doNotTalk: [],
      contentThemes: [],
      contentPillars: [],
      uniquePOV: "",
    },
    analysis: {
      ideaBank: [],
      contentPillars: [],
      viralRecipe: [],
      questionCloud: [],
      postDNA: [],
      voiceSpectrum: { signatureWords: [], avoidWords: [] },
    },
    postHistory: {
      recentPosts: [],
    },
    platform: {
      target: platform === "all" ? "all platforms" : platform,
    },
  };
}

function joinCandidateText(
  candidate: { content?: { parts?: Array<{ text?: string | null }> } } | undefined,
): string {
  const parts = candidate?.content?.parts;
  if (!parts?.length) return "";

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
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
  const text =
    joinCandidateText(candidate) ||
    (typeof response.text === "string" ? response.text.trim() : "");
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

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return out.length ? out : undefined;
}

function normalizeTemplateId(value: unknown): IdeaTemplateId | undefined {
  const id = asString(value);
  if (!id) return undefined;
  const valid: IdeaTemplateId[] = [
    "problem_solution",
    "hook_value_cta",
    "story_format",
    "authority_format",
    "listicle_format",
    "engagement_question",
  ];
  return valid.includes(id as IdeaTemplateId) ? (id as IdeaTemplateId) : undefined;
}

function normalizePostPlatform(value: unknown): PostPlatform {
  const platform = (asString(value) || "").toLowerCase();
  if (platform === "instagram") return "instagram_post";
  if (platform === "instagram_post") return "instagram_post";
  if (platform === "linkedin") return "linkedin";
  if (platform === "x") return "x";
  if (platform === "facebook") return "facebook";
  if (platform === "pinterest") return "pinterest";
  if (platform === "threads") return "threads";
  return "linkedin";
}

function parseAiPlatformTemplate(i: Record<string, unknown>) {
  const tpl = asObject(i.platformTemplate);
  if (!tpl) return null;

  return {
    platform: normalizePostPlatform(tpl.platform),
    templateId: normalizeTemplateId(tpl.templateId),
    templateName: asString(tpl.templateName),
    hookAngle: asString(tpl.hookAngle),
    captionTone: asStringArray(tpl.captionTone),
    ctaPattern: asString(tpl.ctaPattern),
    formatRecommendation: asString(tpl.formatRecommendation),
    visualRecommendation: asString(tpl.visualRecommendation),
    imageRatio: asString(tpl.imageRatio),
    hashtagGuidance: asString(tpl.hashtagGuidance),
    lengthGuidance: asString(tpl.lengthGuidance),
    do: asStringArray(tpl.do),
    dont: asStringArray(tpl.dont),
    confidenceReason: asString(tpl.confidenceReason),
  };
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter((t) => t.length > 2));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function isPotentialDuplicate(
  idea: Pick<GeneratedIdea, "title" | "hook" | "angle">,
  recentPosts: Array<{ caption: string; hooks: string[]; contentScore: number; platform: string }>,
): { duplicate: boolean; similarity: number } {
  const ideaTokens = tokenSet(`${idea.title} ${idea.hook} ${idea.angle}`);
  let bestSimilarity = 0;

  for (const post of recentPosts) {
    const sample = `${post.caption} ${(post.hooks || []).join(" ")}`;
    const score = jaccardSimilarity(ideaTokens, tokenSet(sample));
    if (score > bestSimilarity) bestSimilarity = score;
  }

  return { duplicate: bestSimilarity >= 0.55, similarity: bestSimilarity };
}

function modeSpecificBackfill(idea: GeneratedIdea, mode: IdeaMode): GeneratedIdea {
  if (mode === "trend-jacker") {
    return {
      ...idea,
      trendTopic: idea.trendTopic || idea.title,
      trendContext: idea.trendContext || "Timely topic with active conversation momentum.",
      urgency: idea.urgency || "medium",
    };
  }

  if (mode === "repurpose") {
    return {
      ...idea,
      originalContentRef: idea.originalContentRef || "Recent high-performing post",
      remixStrategy: idea.remixStrategy || "Reframe the original insight for a new platform-native angle",
    };
  }

  if (mode === "gap-filler") {
    return {
      ...idea,
      gapTopic: idea.gapTopic || idea.title,
      audienceDemandSignal:
        idea.audienceDemandSignal ||
        "Audience demand inferred from recurring questions and missing topical coverage.",
    };
  }

  if (mode === "prism") {
    return {
      ...idea,
      angleFramework: idea.angleFramework || "Educational breakdown",
    };
  }

  return idea;
}

function evaluateQuality(
  idea: GeneratedIdea,
  requestedPlatform: string,
): GeneratedIdea["qualityChecks"] {
  const notes: string[] = [];

  const hookLength = (idea.hook || "").trim().length;
  const hookQuality = hookLength >= 18 ? "pass" : hookLength >= 10 ? "warn" : "fail";
  if (hookQuality !== "pass") {
    notes.push("Hook is short; consider adding a stronger conflict or outcome promise.");
  }

  const visualLength = (idea.visualDirection || "").trim().length;
  const visualClarity = visualLength >= 25 ? "pass" : visualLength >= 12 ? "warn" : "fail";
  if (visualClarity !== "pass") {
    notes.push("Visual direction is not specific enough for image execution.");
  }

  const platformFit =
    requestedPlatform === "all" || normalizeText(idea.platform) === normalizeText(requestedPlatform)
      ? "pass"
      : "warn";
  if (platformFit !== "pass") {
    notes.push("Returned platform differs from request; verify platform targeting.");
  }

  return { hookQuality, platformFit, visualClarity, notes };
}

function buildSourceAttribution(sources?: Array<{ title: string; url: string }>) {
  const safeSources = (sources || []).filter((src) => src?.url);
  const domains = Array.from(
    new Set(
      safeSources
        .map((src) => {
          try {
            return new URL(src.url).hostname.replace(/^www\./, "");
          } catch {
            return null;
          }
        })
        .filter((value): value is string => Boolean(value)),
    ),
  );

  return {
    totalSources: safeSources.length,
    domains,
  };
}

function normalizeSinglePostVisualDirection(input: string): string {
  return input
    .replace(/\b(carousel|carousels|slide|slides|multi-slide|multi frame|thread cards?|swipe)\b/gi, "single post")
    .replace(/\s+/g, " ")
    .trim();
}

function postProcessIdeas(
  raw: unknown,
  mode: IdeaMode,
  platform: string,
  audience?: string,
  sources?: Array<{ title: string; url: string }>,
  searchQueries?: string[],
  recentPosts: Array<{ caption: string; hooks: string[]; contentScore: number; platform: string }> = [],
  count: number = 6,
): GeneratedIdea[] {
  if (typeof raw !== "object" || raw === null) return [];

  const obj = raw as Record<string, unknown>;
  const ideasArr = Array.isArray(obj.ideas) ? obj.ideas.slice(0, count) : [];

  return ideasArr.map((idea: unknown) => {
    const i = (typeof idea === "object" && idea !== null ? idea : {}) as Record<
      string,
      unknown
    >;
    const preBaseIdea = {
      id: randomUUID(),
      title: String(i.title || ""),
      hook: String(i.hook || ""),
      angle: String(i.angle || ""),
      format: "post",
      platform: platform === "all" ? "all" : String(i.platform || platform),
      whyItFits: String(i.whyItFits || ""),
      suggestedCTA: String(i.suggestedCTA || ""),
      visualDirection: normalizeSinglePostVisualDirection(String(i.visualDirection || "")),
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
        sourceAttribution: buildSourceAttribution(sources),
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

    const duplicateCheck = isPotentialDuplicate(preBaseIdea, recentPosts);
    const baseIdea = modeSpecificBackfill(
      {
        ...preBaseIdea,
        ...(duplicateCheck.duplicate
          ? {
              title: `${preBaseIdea.title} (fresh angle)`,
              uniqueReason: `Adjusted to reduce overlap with recent outputs (similarity ${Math.round(
                duplicateCheck.similarity * 100,
              )}%).`,
              confidenceScore: Math.max(45, preBaseIdea.confidenceScore - 10),
            }
          : {
              uniqueReason:
                "Distinct from recent outputs based on hook/angle token overlap analysis.",
            }),
      },
      mode,
    );

    const {
      postSeed,
      postPreview,
      platformStyles,
      platformTemplate,
      draftFieldRequirements,
    } = mapIdeaToPostSeed(baseIdea, mode, audience);

    const aiTemplate = parseAiPlatformTemplate(i);
    const mergedTemplate = aiTemplate
      ? {
          ...platformTemplate,
          platform: aiTemplate.platform || platformTemplate.platform,
          templateId: aiTemplate.templateId || platformTemplate.templateId,
          templateName: aiTemplate.templateName || platformTemplate.templateName,
          hookAngle: aiTemplate.hookAngle || platformTemplate.hookAngle,
          captionTone: aiTemplate.captionTone || platformTemplate.captionTone,
          ctaPattern: aiTemplate.ctaPattern || platformTemplate.ctaPattern,
          formatRecommendation:
            aiTemplate.formatRecommendation || platformTemplate.formatRecommendation,
          visualRecommendation:
            aiTemplate.visualRecommendation || platformTemplate.visualRecommendation,
          imageRatio: aiTemplate.imageRatio || platformTemplate.imageRatio,
          hashtagGuidance: aiTemplate.hashtagGuidance || platformTemplate.hashtagGuidance,
          lengthGuidance: aiTemplate.lengthGuidance || platformTemplate.lengthGuidance,
          do: aiTemplate.do || platformTemplate.do,
          dont: aiTemplate.dont || platformTemplate.dont,
          confidenceReason:
            aiTemplate.confidenceReason || platformTemplate.confidenceReason,
        }
      : platformTemplate;

    const confidenceReason =
      mergedTemplate.confidenceReason ||
      baseIdea.whyItFits ||
      "Confidence is based on platform fit, strategy depth, and mode-specific signal quality.";

    const qualityChecks = evaluateQuality(baseIdea, platform);

    const sourceAttribution =
      baseIdea.sourceAttribution ||
      (baseIdea.sources?.length ? buildSourceAttribution(baseIdea.sources) : undefined);

    return {
      ...baseIdea,
      postSeed,
      postPreview,
      platformStyles,
      platformTemplate: mergedTemplate,
      draftFieldRequirements,
      confidenceReason,
      sourceAttribution,
      qualityChecks,
    } satisfies GeneratedIdea;
  });
}

// ---- Route Handler ----

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
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
      coreMessage = "",
      importPersona = true,
      vibe = "",
      count = 8,
    } = body;

    const requestedCount = Number(count);
    const clampedCount = Number.isFinite(requestedCount)
      ? Math.min(Math.max(Math.trunc(requestedCount), 1), 6)
      : 6;

    // 1. Assemble context
    let context;
    let contextDegraded = false;
    try {
      context = await assembleIdeaFinderContext(
        userId,
        accountId,
        mode,
        platform,
        { importPersona }
      );
    } catch (error) {
      contextDegraded = true;
      console.warn("[idea-finder] context assembly failed, falling back to empty context", {
        userId,
        accountId,
        mode,
        platform,
        error: error instanceof Error ? error.message : String(error),
      });
      context = buildEmptyIdeaFinderContext(platform);
    }

    // 2. Build prompt
    const prompt = buildIdeaFinderPrompt({
      context,
      mode,
      topic,
      audience,
      coreMessage,
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
      groundingQueries,
      context.postHistory.recentPosts,
      clampedCount,
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

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        contextDegraded,
      },
    });
  } catch (error) {
    console.error("[idea-finder/generate] Error:", error);
    return NextResponse.json(
      { error: "Idea generation failed" },
      { status: 500 }
    );
  }
}

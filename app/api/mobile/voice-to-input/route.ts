import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { AI_MODELS } from "@/lib/aiConfig";
import { getAuthFromRequest } from "@/lib/auth";
import { parseAIJson } from "@/lib/parseAIJson";
import type {
  BrandType,
  CTAType,
  ContentAngle,
  IntensityLevel,
  NicheCategory,
  PostGenerationInput,
  PostIntent,
  PostObjective,
  PostPlatform,
  TargetAudience,
  ToneType,
  VisualStyle,
  LinkedInPostType,
} from "@/lib/types/postGeneration";

type VoiceToInputRequest = {
  base64Audio?: string;
  mimeType?: "audio/m4a" | "audio/mp4" | "audio/wav";
  accountId?: string;
  platforms?: PostPlatform[];
};

type ParsedVoicePayload = {
  coreMessage?: string;
  objective?: PostObjective;
  platforms?: PostPlatform[];
  targetAudiences?: TargetAudience[];
  customAudience?: string;
  contentAngles?: ContentAngle[];
  niche?: NicheCategory;
  postIntent?: PostIntent;
  tones?: ToneType[];
  emojiLevel?: IntensityLevel;
  hashtagIntensity?: IntensityLevel;
  generateImage?: boolean;
  generationFocus?: "balanced" | "caption" | "image";
  imageConcept?: string;
  textBlocks?: Array<{ id: string; label: string; text: string }>;
  detectedPersons?: string[];
  brandType?: BrandType;
  visualStyles?: VisualStyle[];
  ctas?: CTAType[];
  confidence?: number;
  warnings?: string[];
  location?: string;
  linkedInPostType?: LinkedInPostType;
  postTextDraft?: {
    title?: string;
    subtitle?: string;
    body?: string;
    cta?: string;
    tagline?: string;
  };
};

const OBJECTIVES: PostObjective[] = [
  "educational",
  "promotional",
  "thought_leadership",
  "personal_story",
  "announcement",
  "lead_generation",
  "engagement",
  "case_study",
];

const PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram_post", "facebook", "threads"];
const TARGET_AUDIENCES: TargetAudience[] = [
  "startup_founders",
  "developers",
  "marketing_agencies",
  "general_audience",
  "custom",
];
const CONTENT_ANGLES: ContentAngle[] = [
  "story",
  "tip_list",
  "contrarian_opinion",
  "step_by_step_guide",
  "behind_the_scenes",
  "data_insight",
];
const NICHES: NicheCategory[] = [
  "real_estate",
  "fitness",
  "tech_saas",
  "food_restaurant",
  "fashion",
  "finance",
  "healthcare",
  "education",
  "travel",
  "beauty",
  "automotive",
  "legal",
  "ecommerce",
  "agency_marketing",
  "personal_brand",
  "other",
];
const POST_INTENTS: PostIntent[] = ["brand_awareness", "lead_generation", "engagement", "promotion", "education"];
const TONES: ToneType[] = ["professional", "witty", "bold", "friendly", "inspirational", "authority"];
const VISUAL_STYLES: VisualStyle[] = ["minimal", "bold", "tech", "luxury", "friendly", "dark_mode", "modern_gradient"];
const CTA_VALUES: CTAType[] = ["comment_cta", "visit_link", "follow_for_more", "none"];
const BRAND_TYPES: BrandType[] = ["personal_brand", "startup_saas", "agency", "ecommerce", "corporate", "creator"];
const INTENSITY_LEVELS: IntensityLevel[] = ["low", "medium", "high"];
const GENERATION_FOCUS_VALUES: Array<"balanced" | "caption" | "image"> = ["balanced", "caption", "image"];
const LINKEDIN_POST_TYPES: LinkedInPostType[] = ["insight", "story", "lesson", "framework", "list"];

function pickEnumValue<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

function pickEnumArray<T extends string>(value: unknown, allowed: T[], fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  const filtered = value.filter((item): item is T => typeof item === "string" && allowed.includes(item as T));
  return filtered.length > 0 ? filtered : fallback;
}

function buildDefaultInput(preselectedPlatforms?: PostPlatform[]): PostGenerationInput {
  const platforms: PostPlatform[] =
    preselectedPlatforms && preselectedPlatforms.length > 0
      ? preselectedPlatforms
      : ["linkedin"];

  return {
    objective: "thought_leadership",
    targetAudiences: ["general_audience"],
    coreMessage: "A practical insight from my real-world experience that helps people get better results.",
    platforms,
    contentAngles: ["story"],
    imageConcept:
      "A clean professional workspace at golden hour with subtle depth, modern textures, and open negative space in the upper third for text overlay.",
    generationFocus: "balanced",
    generateImage: true,
    brandType: "personal_brand",
    visualStyles: ["minimal"],
    imageGenType: "ai_background",
    brandAssets: {
      colorPalette: ["#0052FF"],
      watermark: false,
    },
    tones: ["professional"],
    ctas: ["comment_cta"],
    emojiLevel: "low",
    hashtagIntensity: "medium",
    postIntent: "engagement",
    niche: "other",
    textBlocks: [],
  };
}

function mergeParsedWithDefaults(
  parsed: ParsedVoicePayload,
  preselectedPlatforms?: PostPlatform[]
): { parsedInput: PostGenerationInput; confidence: number; detectedPersons: string[]; warnings: string[] } {
  const defaults = buildDefaultInput(preselectedPlatforms);

  const parsedInput: PostGenerationInput = {
    ...defaults,
    coreMessage:
      typeof parsed.coreMessage === "string" && parsed.coreMessage.trim().length > 0
        ? parsed.coreMessage.trim()
        : defaults.coreMessage,
    objective: pickEnumValue(parsed.objective, OBJECTIVES, defaults.objective),
    platforms: pickEnumArray(parsed.platforms, PLATFORMS, defaults.platforms),
    targetAudiences: pickEnumArray(parsed.targetAudiences, TARGET_AUDIENCES, defaults.targetAudiences),
    customAudience:
      typeof parsed.customAudience === "string" && parsed.customAudience.trim().length > 0
        ? parsed.customAudience.trim()
        : undefined,
    contentAngles: pickEnumArray(parsed.contentAngles, CONTENT_ANGLES, defaults.contentAngles ?? ["story"]),
    niche: pickEnumValue(parsed.niche, NICHES, defaults.niche ?? "other"),
    postIntent: pickEnumValue(parsed.postIntent, POST_INTENTS, defaults.postIntent ?? "engagement"),
    tones: pickEnumArray(parsed.tones, TONES, defaults.tones),
    emojiLevel: pickEnumValue(parsed.emojiLevel, INTENSITY_LEVELS, defaults.emojiLevel),
    hashtagIntensity: pickEnumValue(parsed.hashtagIntensity, INTENSITY_LEVELS, defaults.hashtagIntensity),
    generateImage: typeof parsed.generateImage === "boolean" ? parsed.generateImage : defaults.generateImage,
    generationFocus: pickEnumValue(
      parsed.generationFocus,
      GENERATION_FOCUS_VALUES,
      defaults.generationFocus ?? "balanced"
    ),
    imageConcept:
      typeof parsed.imageConcept === "string" && parsed.imageConcept.trim().length > 0
        ? parsed.imageConcept.trim()
        : defaults.imageConcept,
    textBlocks: (() => {
      const blocks: { id: string; label: string; text: string }[] = [];
      if (parsed.postTextDraft?.title)    blocks.push({ id: "title",    label: "Title",    text: parsed.postTextDraft.title });
      if (parsed.postTextDraft?.subtitle) blocks.push({ id: "subtitle", label: "Subtitle", text: parsed.postTextDraft.subtitle });
      if (parsed.postTextDraft?.body)     blocks.push({ id: "body",     label: "Body",     text: parsed.postTextDraft.body });
      if (parsed.postTextDraft?.cta)      blocks.push({ id: "cta",      label: "CTA Text", text: parsed.postTextDraft.cta });
      if (parsed.postTextDraft?.tagline)  blocks.push({ id: "tagline",  label: "Tagline",  text: parsed.postTextDraft.tagline });
      
      if (blocks.length > 0) return blocks;
      
      return Array.isArray(parsed.textBlocks)
        ? parsed.textBlocks.filter(
            (block): block is { id: string; label: string; text: string } =>
              typeof block?.id === "string" &&
              typeof block?.label === "string" &&
              typeof block?.text === "string"
          )
        : defaults.textBlocks;
    })(),
    brandType: pickEnumValue(parsed.brandType, BRAND_TYPES, defaults.brandType),
    visualStyles: pickEnumArray(parsed.visualStyles, VISUAL_STYLES, defaults.visualStyles),
    ctas: pickEnumArray(parsed.ctas, CTA_VALUES, defaults.ctas),
    location:
      typeof parsed.location === "string" && parsed.location.trim().length > 0
        ? parsed.location.trim()
        : undefined,
    linkedInPostType: parsed.linkedInPostType && LINKEDIN_POST_TYPES.includes(parsed.linkedInPostType) ? parsed.linkedInPostType : undefined,
  };

  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
      : 70;

  const detectedPersons = Array.isArray(parsed.detectedPersons)
    ? parsed.detectedPersons
        .filter((person): person is string => typeof person === "string" && person.trim().length > 0)
        .map((person) => person.trim())
    : [];

  const warnings = Array.isArray(parsed.warnings)
    ? parsed.warnings.filter((warning): warning is string => typeof warning === "string" && warning.trim().length > 0)
    : [];

  return { parsedInput, confidence, detectedPersons, warnings };
}

function buildParserPrompt(transcript: string, platforms?: PostPlatform[]): string {
  const preselected = platforms && platforms.length > 0 ? platforms.join(", ") : "none";

  return `You are an AI that converts a spoken post idea into a structured content brief for a social media post generation system.

The user has spoken their idea. Extract only what they said. If details are missing, use intelligent defaults.

Transcript: "${transcript}"

Pre-selected platforms (if any): ${preselected}

Return JSON only with this exact shape:
{
  "coreMessage": "Better articulate the core idea in 1-2 compelling sentences.",
  "objective": "educational | promotional | thought_leadership | personal_story | announcement | lead_generation | engagement | case_study",
  "platforms": ["linkedin", "x", "instagram_post", "facebook", "threads"],
  "targetAudiences": ["startup_founders", "developers", "marketing_agencies", "general_audience", "custom"],
  "customAudience": "Only when targetAudiences includes custom",
  "contentAngles": ["story", "tip_list", "contrarian_opinion", "step_by_step_guide", "behind_the_scenes", "data_insight"],
  "niche": "real_estate | fitness | tech_saas | food_restaurant | fashion | finance | healthcare | education | travel | beauty | automotive | legal | ecommerce | agency_marketing | personal_brand | other",
  "postIntent": "brand_awareness | lead_generation | engagement | promotion | education",
  "tones": ["professional", "witty", "bold", "friendly", "inspirational", "authority"],
  "emojiLevel": "low | medium | high",
  "hashtagIntensity": "low | medium | high",
  "generateImage": true,
  "generationFocus": "balanced | caption | image",
  "imageConcept": "Scene-first visual brief with environment, mood, and composition; include reserved negative space for text overlay. Do not describe text itself.",
  "postTextDraft": {
    "title": "3-6 word punchy headline (only if applicable)",
    "subtitle": "One-line supporting thought (optional)",
    "body": "The actual post body — 2-4 sentences from what they said. Write as if this IS the post.",
    "cta": "Short call-to-action text (optional — e.g. 'Comment below', 'DM me')",
    "tagline": "Brand tagline if brand is mentioned (optional)"
  },
  "textBlocks": [],
  "detectedPersons": ["Name 1", "Name 2"],
  "brandType": "personal_brand | startup_saas | agency | ecommerce | corporate | creator",
  "visualStyles": ["minimal", "bold", "tech", "luxury", "friendly", "dark_mode", "modern_gradient"],
  "ctas": ["comment_cta", "visit_link", "follow_for_more", "none"],
  "location": "e.g., Dubai, New York, or empty if not mentioned",
  "linkedInPostType": "insight | story | lesson | framework | list",
  "confidence": 85,
  "warnings": ["Platform not explicitly mentioned — defaulted to LinkedIn"]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const body = (await request.json()) as VoiceToInputRequest;
    if (!body.base64Audio || !body.mimeType || !body.accountId) {
      return NextResponse.json(
        { error: "base64Audio, mimeType, and accountId are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });

    const transcriptionResult = await model.generateContent([
      "Transcribe this audio exactly as spoken. Return only the raw transcription text, nothing else.",
      {
        inlineData: {
          data: body.base64Audio,
          mimeType: body.mimeType,
        },
      },
    ]);

    const transcript = transcriptionResult.response.text().trim();
    if (!transcript) {
      return NextResponse.json({ error: "Unable to transcribe audio" }, { status: 422 });
    }

    const parserPrompt = buildParserPrompt(transcript, body.platforms);
    const parsingResult = await model.generateContent(parserPrompt);
    const parsedJson = parseAIJson(parsingResult.response.text()) as ParsedVoicePayload;

    const { parsedInput, confidence, detectedPersons, warnings } = mergeParsedWithDefaults(
      parsedJson,
      body.platforms
    );

    return NextResponse.json(
      {
        transcript,
        parsedInput,
        confidence,
        detectedPersons,
        warnings,
        postTextDraft: parsedJson.postTextDraft,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Voice-to-input route error:", error);
    return NextResponse.json({ error: "Failed to parse voice input" }, { status: 500 });
  }
}

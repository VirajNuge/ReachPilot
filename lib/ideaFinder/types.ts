// ============================================================
// Idea Finder — Type Definitions
// ============================================================

import type {
  CaptionStylePreference,
  CTAType,
  IntensityLevel,
  LinkedInPostType,
  LinkedInStyleProfile,
  PostGenerationInput,
  PostPlatform,
} from "@/lib/types/postGeneration";

export type IdeaMode =
  | "voice-match"
  | "trend-jacker"
  | "repurpose"
  | "gap-filler"
  | "prism";

export type IdeaFormat =
  | "post"
  | "carousel"
  | "thread"
  | "reel"
  | "story"
  | "video";

export type IdeaPlatform =
  | "instagram"
  | "linkedin"
  | "x"
  | "facebook"
  | "all";

export type IdeaUrgency = "high" | "medium" | "low";

/** Unified idea type returned by all modes. */
export interface GeneratedIdea {
  id: string;
  title: string;
  hook: string;
  angle: string;
  format: IdeaFormat;
  platform: string;
  whyItFits: string;
  suggestedCTA: string;
  visualDirection: string;
  confidenceScore: number;

  // Trend-Jacker fields
  trendTopic?: string;
  trendContext?: string;
  urgency?: IdeaUrgency;

  // Repurpose fields
  originalContentRef?: string;
  remixStrategy?: string;

  // Gap Filler fields
  gapTopic?: string;
  audienceDemandSignal?: string;

  // Prism fields
  angleFramework?: string;

  // Grounding metadata (attached post-parse for Trend-Jacker)
  sources?: Array<{ title: string; url: string }>;
  searchQueries?: string[];
  groundedAt?: string;

  // Post Generation integration seed
  postSeed?: PostGenerationInput;
  postPreview?: {
    headline: string;
    subtext: string;
    cta: string;
    hooks: Array<{ id: string; text: string; style: string }>;
    suggestedHashtags: {
      highReach: string[];
      niche: string[];
      branded: string[];
    };
    suggestedSizes: Partial<Record<PostPlatform, string>>;
    imageBrief: string;
    confidence: {
      overall: number;
      rationale: string;
    };
  };
  platformStyles?: Partial<
    Record<
      PostPlatform,
      {
        styleProfileId: string;
        tone: string[];
        ctaPattern: string;
        hashtagPolicy: { min: number; max: number };
        emojiPolicy: { min: number; max: number };
        lengthPolicy: {
          recommendedMin: number;
          recommendedMax: number;
          hardMax?: number;
        };
        captionStyle?: CaptionStylePreference;
        linkedInPostType?: LinkedInPostType;
        linkedInStyleProfile?: LinkedInStyleProfile;
        ctaType?: CTAType;
        emojiLevel?: IntensityLevel;
        hashtagIntensity?: IntensityLevel;
      }
    >
  >;
}

/** API response shape. */
export interface IdeaFinderResponse {
  ideas: GeneratedIdea[];
  mode: IdeaMode;
  generatedAt: string;
  groundingAvailable: boolean;
}

/** API request body. */
export interface IdeaFinderRequest {
  mode: IdeaMode;
  topic?: string;
  platform: IdeaPlatform;
  audience?: string;
  vibe?: string;
  count?: number;
  accountId: string;
}

// ---- Context types used by the orchestrator ----

export interface PersonaContextSlice {
  summary: string;
  audience: string;
  voice: string;
  writingSamples: string[];
  doNotTalk: string[];
  contentThemes: string[];
  contentPillars: string[];
  uniquePOV: string;
}

export interface AnalysisContextSlice {
  ideaBank: Array<{ concept: string; impact: string }>;
  contentPillars: Array<{ name: string; score: number }>;
  viralRecipe: Array<{ hookType: string; whyItWorked: string }>;
  questionCloud: Array<{ keyword: string; weight?: number }>;
  postDNA: Array<{ hookType: string; format: string; topic: string; verdict: string }>;
  voiceSpectrum: { signatureWords: string[]; avoidWords: string[] };
  competitorGap?: string;
  missingKeywords?: string[];
}

export interface PostHistorySlice {
  recentPosts: Array<{
    caption: string;
    hooks: string[];
    contentScore: number;
    platform: string;
  }>;
}

export interface IdeaFinderContext {
  persona: PersonaContextSlice;
  analysis: AnalysisContextSlice;
  postHistory: PostHistorySlice;
  platform: {
    target: string;
  };
}

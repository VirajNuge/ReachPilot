// ============================================================
// ReachPilot — Advanced Post Generation System (Creative Engine)
// Core Types & Platform Intelligence
// ============================================================

import { ObjectId } from "mongodb";

// --- Platform Intelligence Layer ---

export type PostPlatform =
  | "instagram_post"
  | "linkedin"
  | "x"
  | "facebook";

export interface PlatformImageSize {
  label: string;
  width: number;
  height: number;
}

export interface PlatformCaptionRules {
  maxLength?: number;
  hashtagRange: [number, number];
  toneGuidelines: string[];
  structureRules: string[];
}

export interface PlatformIntelligence {
  id: PostPlatform;
  name: string;
  imageSizes: PlatformImageSize[];
  captionRules: PlatformCaptionRules;
}

export const PLATFORM_INTELLIGENCE: Record<PostPlatform, PlatformIntelligence> = {
  instagram_post: {
    id: "instagram_post",
    name: "Instagram Post",
    imageSizes: [
      { label: "Square", width: 1080, height: 1080 },
      { label: "Portrait", width: 1080, height: 1350 },
    ],
    captionRules: {
      maxLength: 2200,
      hashtagRange: [10, 20],
      toneGuidelines: ["Emoji friendly", "Relatable", "Visual-first"],
      structureRules: [
        "Hook first line (stop the scroll)",
        "Short paragraphs with line breaks",
        "CTA at end",
        "Hashtags at bottom or in first comment",
      ],
    },
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    imageSizes: [
      { label: "Landscape", width: 1200, height: 627 },
      { label: "Square", width: 1080, height: 1080 },
    ],
    captionRules: {
      maxLength: 3000,
      hashtagRange: [3, 5],
      toneGuidelines: ["Professional", "Storytelling", "Thought leadership"],
      structureRules: [
        "Strong hook (first 2 lines visible in feed)",
        "Whitespace paragraphs (1-2 sentences each)",
        "Storytelling format preferred",
        "End with question or CTA",
      ],
    },
  },
  x: {
    id: "x",
    name: "X (Twitter)",
    imageSizes: [
      { label: "Landscape", width: 1600, height: 900 },
      { label: "Square", width: 1080, height: 1080 },
    ],
    captionRules: {
      maxLength: 280,
      hashtagRange: [1, 2],
      toneGuidelines: ["Punchy", "Conversational", "Witty"],
      structureRules: [
        "Max 280 characters",
        "Front-load the hook",
        "Minimal hashtags",
        "Thread-friendly structure",
      ],
    },
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    imageSizes: [
      { label: "Landscape", width: 1200, height: 630 },
      { label: "Square", width: 1080, height: 1080 },
    ],
    captionRules: {
      maxLength: 63206,
      hashtagRange: [1, 3],
      toneGuidelines: ["Community", "Friendly", "Shareable"],
      structureRules: [
        "Community tone",
        "Clear CTA",
        "Question to spark comments",
        "Shareable value",
      ],
    },
  },
};

// --- Input System Types ---

export type PostObjective =
  | "educational"
  | "promotional"
  | "thought_leadership"
  | "personal_story"
  | "announcement"
  | "lead_generation"
  | "event"
  | "case_study"
  | "product_update"
  | "engagement";

export type TargetAudience =
  | "startup_founders"
  | "real_estate_buyers"
  | "developers"
  | "marketing_agencies"
  | "general_audience"
  | "custom";

export type ContentAngle =
  | "story"
  | "tip_list"
  | "contrarian_opinion"
  | "step_by_step_guide"
  | "behind_the_scenes"
  | "data_insight";

export type BrandType =
  | "personal_brand"
  | "startup_saas"
  | "agency"
  | "ecommerce"
  | "corporate"
  | "creator";

export type VisualStyle =
  | "minimal"
  | "corporate"
  | "bold"
  | "tech"
  | "luxury"
  | "friendly"
  | "dark_mode"
  | "modern_gradient";

export type ImageGenType =
  | "ai_background"
  | "stock_photo"
  | "brand_color_poster"
  | "illustration"
  | "upload_image";

export type LayoutStyle =
  | "hero_center"
  | "top_headline"
  | "split_layout"
  | "bottom_overlay"
  | "minimal_card";

export type GeminiImageModel =
  | "gemini-2.5-flash-image"
  | "gemini-3.1-flash-image-preview"
  | "gemini-3-pro-image-preview"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-fast-generate-001"
  | "imagen-4.0-ultra-generate-001";

export type ToneType =
  | "professional"
  | "witty"
  | "bold"
  | "friendly"
  | "inspirational"
  | "authority"
  | "minimalist";

export type CTAType =
  | "comment_cta"
  | "visit_link"
  | "dm_us"
  | "sign_up"
  | "follow_for_more"
  | "save_this_post"
  | "share_with_friend"
  | "none";

export type IntensityLevel = "low" | "medium" | "high";

// ── Image Size Presets ────────────────────────────────────────

export interface ImageSizePreset {
  id: string;           // e.g. "1080x1350"
  label: string;        // e.g. "Portrait 4:5"
  width: number;
  height: number;
  ratio: string;        // API ratio string for Imagen: "1:1" | "4:3" | "3:4" | "9:16" | "16:9"
  platforms: string[];  // suggested platforms
}

export const POST_IMAGE_SIZES: ImageSizePreset[] = [
  {
    id: "1080x1350",
    label: "Portrait 3:4",
    width: 1080,
    height: 1350,
    ratio: "3:4",
    platforms: ["instagram_post", "facebook"],
  },
  {
    id: "1080x1080",
    label: "Square 1:1",
    width: 1080,
    height: 1080,
    ratio: "1:1",
    platforms: ["instagram_post", "facebook"],
  },
  {
    id: "1080x1920",
    label: "Story 9:16",
    width: 1080,
    height: 1920,
    ratio: "9:16",
    platforms: ["instagram_story", "tiktok"],
  },
  {
    id: "1200x627",
    label: "LinkedIn Banner",
    width: 1200,
    height: 627,
    ratio: "16:9",
    platforms: ["linkedin"],
  },
  {
    id: "1200x675",
    label: "Landscape 16:9",
    width: 1200,
    height: 675,
    ratio: "16:9",
    platforms: ["x", "facebook", "linkedin"],
  },
  {
    id: "1280x720",
    label: "HD 16:9",
    width: 1280,
    height: 720,
    ratio: "16:9",
    platforms: ["youtube_community", "x"],
  },
];

// --- Dynamic Post Text Block ---

export interface PostTextBlock {
  id: string;
  label: string; // "Title" | "Subtitle" | "Caption" | "Body" | "Tagline" | "CTA Text" | custom
  text: string;
}

// --- Reference Image ---

export interface ReferenceImage {
  id: string;
  label: string;   // e.g. "CEO headshot", "Product photo", "Logo"
  dataUrl: string; // base64 from FileReader
}

// --- Wizard Input Shape ---

export interface PostGenerationInput {
  // Step 1 — Strategy & Context
  objective: PostObjective;
  targetAudiences: TargetAudience[];
  customAudience?: string;
  coreMessage: string;
  contentAngles?: ContentAngle[];
  platforms: PostPlatform[];

  // Step 1 — Dynamic Post Text Blocks
  textBlocks?: PostTextBlock[];

  // Step 1 — Reference Images
  referenceImages?: ReferenceImage[];

  // Step 1 — Image Brief
  imageConcept?: string;

  // Step 1 — Generation Focus
  generationFocus?: "caption" | "balanced" | "image";

  // Step 2 — Visual Identity
  brandType: BrandType;
  visualStyles: VisualStyle[];
  imageGenType: ImageGenType;
  imageModel?: GeminiImageModel;
  imageSize?: string;   // e.g. "1080x1350" — matches POST_IMAGE_SIZES[].id
  brandAssets: {
    logoUrl?: string;
    colorPalette: string[]; // hex colors
    fontFamily?: string;
    watermark: boolean;
  };

  // Step 3 — Tone & Messaging
  tones: ToneType[];
  ctas: CTAType[];
  emojiLevel: IntensityLevel;
  hashtagIntensity: IntensityLevel;
}

// --- AI Pipeline Output Types ---

export interface ContentStrategyOutput {
  postAngle: string;
  hookIdea: string;
  contentStructure: string;
  visualIdea: string;
  talkingPoints: string[];
}

export interface PlatformCaption {
  platform: PostPlatform;
  caption: string;
  characterCount: number;
}

export interface CaptionGeneratorOutput {
  captions: PlatformCaption[];
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
}

export interface ImagePromptOutput {
  prompt: string;
  headline: string;
  subtext: string;
  suggestedLayout: string;
}

export interface PosterPromptOutput {
  posterPrompt: string;       // The full prompt sent to the image model
  headline: string;           // 3-6 words
  subtext: string;            // 5-12 words
  cta: string;                // 2-4 words
  layout: LayoutStyle;
  typographyStyle: string;    // e.g. "modern_sans", "bold_serif"
  compositionNotes: string;   // AI composition guidance
}

export interface ImageVariation {
  id: number;           // 1, 2, or 3
  imageUrl: string;     // base64 data URL
  model: string;        // model ID used
  aspectRatio: string;  // e.g. "1:1"
}

export interface ContentScore {
  hookStrength: number;  // 0-100
  clarity: number;       // 0-100
  engagementPotential: number; // 0-100
  virality: number;      // 0-100
  overall: number;       // 0-100
  feedback: string;
}

export interface HookOption {
  id: string;
  text: string;
  style: string; // e.g., "Question", "Bold Statement", "Story Opener"
}

// --- Post Package (Complete Output) ---

export interface PostVariation {
  caption: string;
  imagePrompt: string;
  headline: string;
}

export interface PostPackage {
  imagePrompt: string;
  imageUrl?: string;
  captions: Record<string, string>;  // platform -> caption
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
  sizes: Record<string, string>;     // platform -> "WIDTHxHEIGHT"
  headline: string;
  subtext: string;
  designStyle: string;
  contentScore?: ContentScore;
  hooks?: HookOption[];
  cta?: string;
  imageVariations?: ImageVariation[];
}

// --- Remix Types ---

export type RemixStyle =
  | "funnier"
  | "more_professional"
  | "shorter"
  | "more_viral"
  | "more_controversial";

// --- Saved Brand Style ---

export interface SavedBrandStyle {
  _id?: ObjectId;
  userId: string;
  name: string;
  brandType: BrandType;
  visualStyle: VisualStyle;
  colorPalette: string[];
  fontFamily?: string;
  logoUrl?: string;
  watermark: boolean;
  createdAt: Date;
}

// --- Database Document ---

export type PostGenerationStatus = "draft" | "published" | "scheduled";

export interface PostGenerationDocument {
  _id?: ObjectId;
  userId: string;
  personaId?: string;
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;

  input: PostGenerationInput;

  design: {
    brandColors: string[];
    fontFamily: string;
    visualStyle: VisualStyle;
    logoUrl?: string;
  };

  strategy?: ContentStrategyOutput;

  output?: PostPackage;

  variations: PostVariation[];

  status: PostGenerationStatus;
}

// --- UI Display Helpers ---

export const POST_OBJECTIVE_LABELS: Record<PostObjective, { label: string; emoji: string }> = {
  educational: { label: "Educational", emoji: "📚" },
  promotional: { label: "Promotional", emoji: "📣" },
  thought_leadership: { label: "Thought Leadership", emoji: "💡" },
  personal_story: { label: "Personal Story", emoji: "📝" },
  announcement: { label: "Announcement", emoji: "📢" },
  lead_generation: { label: "Lead Generation", emoji: "🎯" },
  event: { label: "Event", emoji: "🎉" },
  case_study: { label: "Case Study", emoji: "📊" },
  product_update: { label: "Product Update", emoji: "🚀" },
  engagement: { label: "Engagement Post", emoji: "💬" },
};

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
  startup_founders: "Startup Founders",
  real_estate_buyers: "Real Estate Buyers",
  developers: "Developers",
  marketing_agencies: "Marketing Agencies",
  general_audience: "General Audience",
  custom: "Custom",
};

export const CONTENT_ANGLE_LABELS: Record<ContentAngle, { label: string; desc: string }> = {
  story: { label: "Story", desc: "Narrative-driven content" },
  tip_list: { label: "Tip List", desc: "Actionable tips or listicle" },
  contrarian_opinion: { label: "Contrarian Opinion", desc: "Challenge the status quo" },
  step_by_step_guide: { label: "Step-by-Step Guide", desc: "Tutorial format" },
  behind_the_scenes: { label: "Behind the Scenes", desc: "Show the process" },
  data_insight: { label: "Data / Insight", desc: "Stats and research-backed" },
};

export const BRAND_TYPE_LABELS: Record<BrandType, string> = {
  personal_brand: "Personal Brand",
  startup_saas: "Startup / SaaS",
  agency: "Agency",
  ecommerce: "Ecommerce",
  corporate: "Corporate",
  creator: "Creator",
};

export const VISUAL_STYLE_LABELS: Record<VisualStyle, { label: string; desc: string }> = {
  minimal: { label: "Minimal", desc: "Clean, whitespace-heavy" },
  corporate: { label: "Corporate", desc: "Professional, structured" },
  bold: { label: "Bold", desc: "High contrast, attention-grabbing" },
  tech: { label: "Tech", desc: "Modern, digital-first" },
  luxury: { label: "Luxury", desc: "Premium, elegant" },
  friendly: { label: "Friendly", desc: "Warm, approachable" },
  dark_mode: { label: "Dark Mode", desc: "Dark backgrounds, neon accents" },
  modern_gradient: { label: "Modern Gradient", desc: "Gradient backgrounds, trendy" },
};

export const IMAGE_GEN_TYPE_LABELS: Record<ImageGenType, { label: string; desc: string }> = {
  ai_background: { label: "AI Background", desc: "AI-generated visual" },
  stock_photo: { label: "Stock Photo", desc: "Professional stock imagery" },
  brand_color_poster: { label: "Brand Color Poster", desc: "Solid colors + typography" },
  illustration: { label: "Illustration", desc: "Hand-drawn or vector style" },
  upload_image: { label: "Upload Image", desc: "Use your own image" },
};

export const TONE_LABELS: Record<ToneType, { label: string; desc: string }> = {
  professional: { label: "Professional", desc: "Polished and credible" },
  witty: { label: "Witty", desc: "Clever and humorous" },
  bold: { label: "Bold", desc: "Unapologetic and direct" },
  friendly: { label: "Friendly", desc: "Warm and approachable" },
  inspirational: { label: "Inspirational", desc: "Motivating and uplifting" },
  authority: { label: "Authority", desc: "Expert and commanding" },
  minimalist: { label: "Minimalist", desc: "Less is more" },
};

export const CTA_LABELS: Record<CTAType, string> = {
  comment_cta: "Comment CTA",
  visit_link: "Visit Link",
  dm_us: "DM Us",
  sign_up: "Sign Up",
  follow_for_more: "Follow for More",
  save_this_post: "Save This Post",
  share_with_friend: "Share with Friend",
  none: "No CTA",
};

export const REMIX_STYLE_LABELS: Record<RemixStyle, { label: string; emoji: string }> = {
  funnier: { label: "Make it funnier", emoji: "😂" },
  more_professional: { label: "Make it more professional", emoji: "👔" },
  shorter: { label: "Make it shorter", emoji: "✂️" },
  more_viral: { label: "Make it more viral", emoji: "🔥" },
  more_controversial: { label: "Make it controversial", emoji: "⚡" },
};

// --- Platform Display Helpers ---

export const PLATFORM_DISPLAY: Record<PostPlatform, { label: string; color: string; shortLabel: string }> = {
  instagram_post: { label: "Instagram Post", color: "#E4405F", shortLabel: "IG" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", shortLabel: "LI" },
  x: { label: "X (Twitter)", color: "#000000", shortLabel: "X" },
  facebook: { label: "Facebook", color: "#1877F2", shortLabel: "FB" },
};

export const IMAGE_MODEL_LABELS: Record<GeminiImageModel, { label: string; desc: string; badge: string }> = {
  "gemini-2.5-flash-image": {
    label: "Nano Banana",
    desc: "Fast & versatile image generation",
    badge: "Free",
  },
  "gemini-3.1-flash-image-preview": {
    label: "Nano Banana 2",
    desc: "Enhanced quality, faster generation",
    badge: "Preview",
  },
  "gemini-3-pro-image-preview": {
    label: "Nano Banana Pro",
    desc: "Highest quality Gemini image model",
    badge: "Preview",
  },
  "imagen-4.0-generate-001": {
    label: "Imagen 4",
    desc: "Photorealistic image generation",
    badge: "Stable",
  },
  "imagen-4.0-fast-generate-001": {
    label: "Imagen 4 Fast",
    desc: "Fast photorealistic generation",
    badge: "Stable",
  },
  "imagen-4.0-ultra-generate-001": {
    label: "Imagen 4 Ultra",
    desc: "Highest quality photorealism",
    badge: "Pro",
  },
};

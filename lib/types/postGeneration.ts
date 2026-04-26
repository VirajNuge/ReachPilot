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
  | "facebook"
  | "threads";

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
  threads: {
    id: "threads",
    name: "Threads",
    imageSizes: [
      { label: "Square", width: 1080, height: 1080 },
      { label: "Portrait", width: 1080, height: 1350 },
    ],
    captionRules: {
      maxLength: 500,
      hashtagRange: [1, 3],
      toneGuidelines: ["Conversational", "Opinionated", "Community"],
      structureRules: [
        "Strong first line",
        "Short paragraphs",
        "Question or hot take ending",
        "Keep it authentic and human",
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

// --- Creative Engine: Image Generation Style Controls ---

export type LightingDirection =
  | "natural"
  | "studio"
  | "dramatic"
  | "golden_hour"
  | "neon_glow"
  | "backlit"
  | "soft_diffused"
  | "rim_light"
  | "low_key";

export type ShadingStyle =
  | "flat"
  | "soft_gradient"
  | "hard_shadow"
  | "ambient_occlusion"
  | "cel_shaded"
  | "volumetric"
  | "none";

export type ImageStyle =
  | "photorealistic"
  | "minimalist"
  | "3d_render"
  | "flat_illustration"
  | "watercolor"
  | "cyberpunk"
  | "retro_vintage"
  | "pop_art"
  | "abstract"
  | "line_art"
  | "collage";

export type CompositionPreference =
  | "rule_of_thirds"
  | "centered"
  | "asymmetric"
  | "diagonal"
  | "frame_within_frame"
  | "leading_lines"
  | "golden_ratio"
  | "negative_space";

export type TextStylePreference =
  | "bold_modern"
  | "elegant_serif"
  | "handwritten"
  | "tech_mono"
  | "playful_rounded"
  | "minimalist_sans"
  | "retro_display";

export type ColorThemePreset =
  | "vibrant"
  | "pastel"
  | "monochrome"
  | "earth_tones"
  | "neon"
  | "dark_luxury"
  | "brand_colors";

export type CaptionStylePreference =
  | "educational"
  | "storytelling"
  | "motivational"
  | "promotional"
  | "authority"
  | "conversational"
  | "auto";

export type PostIntent =
  | "brand_awareness"
  | "lead_generation"
  | "engagement"
  | "promotion"
  | "education";

export type NicheCategory =
  | "real_estate"
  | "fitness"
  | "tech_saas"
  | "food_restaurant"
  | "fashion"
  | "finance"
  | "healthcare"
  | "education"
  | "travel"
  | "beauty"
  | "automotive"
  | "legal"
  | "ecommerce"
  | "agency_marketing"
  | "personal_brand"
  | "other";

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
  imageReferences?: string; // names, objects, people to include in the image

  // Step 1 — Generation Focus
  generationFocus?: "caption" | "balanced" | "image";
  generateImage?: boolean;

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

  // Step 2 — Creative Engine: Image Style Controls (all optional — AI auto-selects if empty)
  lightingDirection?: LightingDirection;
  shadingStyle?: ShadingStyle;
  imageStyle?: ImageStyle;
  compositionPreference?: CompositionPreference;
  textStylePreference?: TextStylePreference;
  colorThemePreset?: ColorThemePreset;

  // Step 1 — Niche & Intent
  niche?: NicheCategory;
  postIntent?: PostIntent;
  location?: string; // e.g. "New York, NY" — for hashtag intelligence

  // Step 3 — Tone & Messaging
  tones: ToneType[];
  ctas: CTAType[];
  emojiLevel: IntensityLevel;
  hashtagIntensity: IntensityLevel;
  captionStyle?: CaptionStylePreference;

  // LinkedIn Optimization (optional — only when LinkedIn is selected)
  linkedInPostType?: LinkedInPostType;
  linkedInStyleProfile?: LinkedInStyleProfile;
  linkedInPersonalAngle?: string;
  linkedInKeyPoints?: string[];

  // Writing Style & Template Selection
  writingStyleId?: string;
  selectedTemplateId?: string;

  // Visual Style Preset Selection
  visualStylePresetId?: string;
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
  options?: string[];
}

export interface CaptionGeneratorOutput {
  captions: PlatformCaption[];
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
}

export interface CaptionGeneratorResponse {
  captions: CaptionGeneratorOutput;
  usedTemplateId?: string;
  usedTemplateName?: string;
  templateAutoSelected?: boolean;
  templateAICurated?: boolean;
}

export interface ImagePromptOutput {
  prompt: string;
  headline: string;
  subtext: string;
  suggestedLayout: string;
}

// --- Creative Handoff V2 (Phase 0) ---

export type CreativeHandoffSchemaVersion = "v2";

export type TemplateId =
  | "hero-bottom-overlay"
  | "split-editorial"
  | "minimal-card"
  | "quote-focus";

export type NegativeSpaceZone =
  | "top_left"
  | "top_center"
  | "top_right"
  | "center_left"
  | "center"
  | "center_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";

export type TextTheme = "light-on-dark" | "dark-on-light" | "brand-accent";

export type TemplateAlignment = "left" | "center" | "right";

export type OverlayStyle =
  | "none"
  | "black-gradient-80"
  | "black-gradient-60"
  | "dark-glass"
  | "brand-tint";

export interface VisualBrief {
  prompt: string;
  subject: string;
  environment: string;
  lighting: string;
  mood: string;
  composition: CompositionPreference;
  negativeSpaceZone: NegativeSpaceZone;
  renderStyle: ImageStyle;
  brandColorUsage: string[];
  avoid: string[];
}

export interface CopyBrief {
  headline: string;
  subtext: string;
  cta: string;
}

export interface LayoutBrief {
  templateId: TemplateId;
  alignment: TemplateAlignment;
  textTheme: TextTheme;
  safeArea: NegativeSpaceZone;
  overlay: OverlayStyle;
}

export interface CreativeHandoffV2 {
  schemaVersion: CreativeHandoffSchemaVersion;
  visualBrief: VisualBrief;
  copyBrief: CopyBrief;
  layoutBrief: LayoutBrief;
}

export interface PosterPromptOutput {
  /**
   * A rich, 100-200 word Midjourney/Imagen-style scene description synthesized
   * by the LLM from all design tokens, brand context, and visual metaphors.
   * This is the PRIMARY driver for image generation — not static bullet points.
   * Example: "A hyper-cinematic anamorphic wide shot of a lone entrepreneur standing
   * at the edge of a vast glass skyscraper terrace at golden hour, silhouetted
   * against a sky bleeding from deep crimson into electric violet..."
   *
   * Legacy note: this belongs to the v1 baked-text poster flow. New work should
   * prefer `CreativeHandoffV2`, which separates visual generation from copy/layout.
   */
  masterPrompt: string;
  /**
   * @deprecated Use masterPrompt for image generation. posterPrompt is kept for
   * backward compatibility only and may be empty in new responses.
   */
  posterPrompt: string;
  headline: string;           // 3-6 words
  subtext: string;            // 5-12 words
  cta: string;                // 2-4 words
  layout: LayoutStyle;
  typographyStyle: string;    // e.g. "modern_sans", "bold_serif"
  compositionNotes: string;   // Supporting composition/mood notes for reference
}

export interface ImageVariation {
  id: number;           // 1, 2, or 3
  imageUrl: string;     // base64 data URL
  model: string;        // model ID used
  aspectRatio: string;  // e.g. "1:1"
}

export interface ImagePromptRouteResponse {
  imagePrompt: PosterPromptOutput;
  creativeHandoff: CreativeHandoffV2;
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
  captionOptions?: Record<string, string[]>;
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
  creativeHandoff?: CreativeHandoffV2;
  selectedImageVariationId?: number;
  renderSettings?: {
    templateId: TemplateId;
    alignment: TemplateAlignment;
    textTheme: TextTheme;
    safeArea: NegativeSpaceZone;
    overlay: OverlayStyle;
    exportSizeId?: string;
    logoVisible: boolean;
  };
  linkedInRefined?: {
    viralityScore: number;       // 1-10
    qualityFlags: string[];      // e.g. ["Hook could be stronger", "Remove buzzwords"]
    styleProfile?: LinkedInStyleProfile;
    postType?: LinkedInPostType;
  };
  xRefined?: {
    engagementScore: number;     // 1-10
    qualityFlags: string[];      // e.g. ["Hook too generic", "Over 280 chars"]
  };
  instagramRefined?: {
    engagementScore: number;     // 1-10
    qualityFlags: string[];      // e.g. ["Hook too generic", "Missing engagement question"]
    postType?: InstagramPostType;
  };
  facebookRefined?: {
    engagementScore: number;     // 1-10
    qualityFlags: string[];      // e.g. ["Discussion question missing", "Too formal for Facebook"]
  };
}

// --- LinkedIn-Specific Types ---

export type LinkedInStyleProfile =
  | "hormozi"
  | "justin_welsh"
  | "naval"
  | "corporate"
  | "startup_founder";

export type LinkedInPostType =
  | "insight"
  | "story"
  | "lesson"
  | "framework"
  | "list";

export type InstagramPostType =
  | "carousel_tips"
  | "mini_story"
  | "myth_vs_fact"
  | "step_by_step_guide"
  | "mistake_list";

export const LINKEDIN_STYLE_PROFILE_LABELS: Record<LinkedInStyleProfile, { label: string; desc: string }> = {
  hormozi:         { label: "Alex Hormozi",      desc: "Bold, direct, value-dense. Short punchy lines. No fluff." },
  justin_welsh:    { label: "Justin Welsh",       desc: "Personal story-first. Relatable and humble. Lessons from real experience." },
  naval:           { label: "Naval",              desc: "Deep insight, philosophical. Concise wisdom. One idea per post." },
  corporate:       { label: "Corporate",          desc: "Professional, structured, data-backed. Credible tone." },
  startup_founder: { label: "Startup Founder",   desc: "Authentic, raw, behind-the-scenes. Show the journey, not just the win." },
};

export const LINKEDIN_POST_TYPE_LABELS: Record<LinkedInPostType, { label: string; desc: string; emoji: string }> = {
  insight:   { label: "Insight",    desc: "Share a sharp observation or key takeaway",   emoji: "💡" },
  story:     { label: "Story",      desc: "Situation → Struggle → Realization → Lesson", emoji: "📖" },
  lesson:    { label: "Lesson",     desc: "Something you learned the hard way",           emoji: "🎓" },
  framework: { label: "Framework",  desc: "A system or mental model you follow",          emoji: "🔧" },
  list:      { label: "List",       desc: "Numbered or bulleted high-value list",         emoji: "📋" },
};

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

export type PostGenerationStatus = "draft" | "published" | "scheduled" | "failed";

export interface PublishPlatformResult {
  platform: string;
  success: boolean;
  platformPostId?: string;
  error?: string;
  publishedAt?: Date;
}

export interface PostGenerationDocument {
  _id?: ObjectId;
  userId: string;
  personaId?: string;
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;

  /** True if created manually via the Publishing page, bypassing the AI generator */
  isCustom?: boolean;

  input?: PostGenerationInput;

  design?: {
    brandColors: string[];
    fontFamily: string;
    visualStyle: VisualStyle;
    logoUrl?: string;
  };

  strategy?: ContentStrategyOutput;

  output?: PostPackage;

  variations?: PostVariation[];

  status: PostGenerationStatus;
  scheduledDate?: Date;

  /** Set when the post is published — tracks per-platform results */
  publishResults?: PublishPlatformResult[];
  publishedAt?: Date;
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

// --- Creative Engine: Display Labels ---

export const LIGHTING_DIRECTION_LABELS: Record<LightingDirection, { label: string; desc: string }> = {
  natural: { label: "Natural", desc: "Daylight, soft and even" },
  studio: { label: "Studio", desc: "Three-point professional setup" },
  dramatic: { label: "Dramatic", desc: "High contrast, chiaroscuro" },
  golden_hour: { label: "Golden Hour", desc: "Warm sunset tones" },
  neon_glow: { label: "Neon Glow", desc: "Vibrant colored light sources" },
  backlit: { label: "Backlit", desc: "Silhouette and halo effects" },
  soft_diffused: { label: "Soft Diffused", desc: "Cloud-cover, gentle illumination" },
  rim_light: { label: "Rim Light", desc: "Edge-lit subject separation" },
  low_key: { label: "Low Key", desc: "Mostly dark with selective highlights" },
};

export const SHADING_STYLE_LABELS: Record<ShadingStyle, { label: string; desc: string }> = {
  flat: { label: "Flat", desc: "No depth, graphic poster look" },
  soft_gradient: { label: "Soft Gradient", desc: "Smooth tonal transitions" },
  hard_shadow: { label: "Hard Shadow", desc: "Crisp, defined shadows" },
  ambient_occlusion: { label: "Ambient Occlusion", desc: "Subtle contact shadows" },
  cel_shaded: { label: "Cel Shaded", desc: "Cartoon/anime style shading" },
  volumetric: { label: "Volumetric", desc: "Light rays through atmosphere" },
  none: { label: "None", desc: "AI auto-selects shading" },
};

export const IMAGE_STYLE_LABELS: Record<ImageStyle, { label: string; desc: string }> = {
  photorealistic: { label: "Photorealistic", desc: "Camera-quality realism" },
  minimalist: { label: "Minimalist", desc: "Clean, whitespace-heavy" },
  "3d_render": { label: "3D Render", desc: "Dimensional, rendered objects" },
  flat_illustration: { label: "Flat Illustration", desc: "Vector-style graphics" },
  watercolor: { label: "Watercolor", desc: "Soft, painted aesthetic" },
  cyberpunk: { label: "Cyberpunk", desc: "Neon, futuristic, dark" },
  retro_vintage: { label: "Retro/Vintage", desc: "Nostalgic, film-grain" },
  pop_art: { label: "Pop Art", desc: "Bold colors, Warhol-inspired" },
  abstract: { label: "Abstract", desc: "Non-representational forms" },
  line_art: { label: "Line Art", desc: "Hand-drawn outlines" },
  collage: { label: "Collage", desc: "Mixed media composition" },
};

export const COMPOSITION_PREFERENCE_LABELS: Record<CompositionPreference, { label: string; desc: string }> = {
  rule_of_thirds: { label: "Rule of Thirds", desc: "Classic grid-based balance" },
  centered: { label: "Centered", desc: "Symmetrical focal point" },
  asymmetric: { label: "Asymmetric", desc: "Deliberate visual tension" },
  diagonal: { label: "Diagonal", desc: "Dynamic angular energy" },
  frame_within_frame: { label: "Frame-in-Frame", desc: "Nested framing elements" },
  leading_lines: { label: "Leading Lines", desc: "Lines guiding the eye" },
  golden_ratio: { label: "Golden Ratio", desc: "Mathematically harmonious" },
  negative_space: { label: "Negative Space", desc: "Emptiness as design" },
};

export const TEXT_STYLE_PREFERENCE_LABELS: Record<TextStylePreference, { label: string; desc: string }> = {
  bold_modern: { label: "Bold Modern", desc: "Clean, heavy sans-serif" },
  elegant_serif: { label: "Elegant Serif", desc: "Editorial, authoritative" },
  handwritten: { label: "Handwritten", desc: "Personal, organic feel" },
  tech_mono: { label: "Tech Mono", desc: "Developer/code aesthetic" },
  playful_rounded: { label: "Playful Rounded", desc: "Friendly, approachable" },
  minimalist_sans: { label: "Minimalist Sans", desc: "Ultra-clean, light weight" },
  retro_display: { label: "Retro Display", desc: "Vintage, decorative type" },
};

export const COLOR_THEME_PRESET_LABELS: Record<ColorThemePreset, { label: string; desc: string }> = {
  vibrant: { label: "Vibrant", desc: "Saturated, energetic colors" },
  pastel: { label: "Pastel", desc: "Soft, muted tones" },
  monochrome: { label: "Monochrome", desc: "Single-hue variations" },
  earth_tones: { label: "Earth Tones", desc: "Natural, warm palette" },
  neon: { label: "Neon", desc: "Electric, glowing accents" },
  dark_luxury: { label: "Dark Luxury", desc: "Black and gold premium" },
  brand_colors: { label: "Brand Colors", desc: "Use your brand palette" },
};

export const CAPTION_STYLE_LABELS: Record<CaptionStylePreference, { label: string; desc: string }> = {
  educational: { label: "Educational", desc: "Teach and inform" },
  storytelling: { label: "Storytelling", desc: "Narrative-driven content" },
  motivational: { label: "Motivational", desc: "Inspire and uplift" },
  promotional: { label: "Promotional", desc: "Sell and convert" },
  authority: { label: "Authority", desc: "Expert positioning" },
  conversational: { label: "Conversational", desc: "Casual and relatable" },
  auto: { label: "Auto", desc: "AI selects best style" },
};

export const POST_INTENT_LABELS: Record<PostIntent, { label: string; desc: string; emoji: string }> = {
  brand_awareness: { label: "Brand Awareness", desc: "Increase visibility and recognition", emoji: "👁️" },
  lead_generation: { label: "Lead Generation", desc: "Capture leads and drive sign-ups", emoji: "🎯" },
  engagement: { label: "Engagement", desc: "Maximize comments, shares, saves", emoji: "💬" },
  promotion: { label: "Promotion", desc: "Promote product, service, or offer", emoji: "📣" },
  education: { label: "Education", desc: "Teach, inform, build authority", emoji: "📚" },
};

export const NICHE_CATEGORY_LABELS: Record<NicheCategory, { label: string; emoji: string }> = {
  real_estate: { label: "Real Estate", emoji: "🏠" },
  fitness: { label: "Fitness & Health", emoji: "💪" },
  tech_saas: { label: "Tech / SaaS", emoji: "💻" },
  food_restaurant: { label: "Food & Restaurant", emoji: "🍕" },
  fashion: { label: "Fashion", emoji: "👗" },
  finance: { label: "Finance", emoji: "💰" },
  healthcare: { label: "Healthcare", emoji: "🏥" },
  education: { label: "Education", emoji: "🎓" },
  travel: { label: "Travel", emoji: "✈️" },
  beauty: { label: "Beauty & Skincare", emoji: "💄" },
  automotive: { label: "Automotive", emoji: "🚗" },
  legal: { label: "Legal", emoji: "⚖️" },
  ecommerce: { label: "E-commerce", emoji: "🛒" },
  agency_marketing: { label: "Agency / Marketing", emoji: "📈" },
  personal_brand: { label: "Personal Brand", emoji: "🌟" },
  other: { label: "Other", emoji: "📌" },
};

// --- Platform Display Helpers ---

export const PLATFORM_DISPLAY: Record<PostPlatform, { label: string; color: string; shortLabel: string }> = {
  instagram_post: { label: "Instagram Post", color: "#E4405F", shortLabel: "IG" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", shortLabel: "LI" },
  x: { label: "X (Twitter)", color: "#000000", shortLabel: "X" },
  facebook: { label: "Facebook", color: "#1877F2", shortLabel: "FB" },
  threads: { label: "Threads", color: "#111827", shortLabel: "TH" },
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

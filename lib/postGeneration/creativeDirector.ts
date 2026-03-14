// ============================================================
// ReachPilot — AI Creative Director Engine
// Smart Auto Style Selection: niche → optimal creative defaults
// When user doesn't select specific styles, the Creative Director
// automatically determines the best visual strategy.
// ============================================================

import type {
  PostGenerationInput,
  NicheCategory,
  PostIntent,
  PostPlatform,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  CompositionPreference,
  TextStylePreference,
  ColorThemePreset,
  CaptionStylePreference,
  VisualStyle,
  ToneType,
} from "@/lib/types/postGeneration";

// ── Creative Profile ─────────────────────────────────────────

export interface CreativeProfile {
  visualStyle: VisualStyle;
  imageStyle: ImageStyle;
  lightingDirection: LightingDirection;
  shadingStyle: ShadingStyle;
  compositionPreference: CompositionPreference;
  textStylePreference: TextStylePreference;
  colorThemePreset: ColorThemePreset;
  captionStyle: CaptionStylePreference;
  suggestedTone: ToneType;
}

// ── Niche → Style Mapping ────────────────────────────────────
// Each niche has a default creative profile optimized for its audience.

const NICHE_PROFILES: Record<NicheCategory, CreativeProfile> = {
  real_estate: {
    visualStyle: "luxury",
    imageStyle: "photorealistic",
    lightingDirection: "golden_hour",
    shadingStyle: "soft_gradient",
    compositionPreference: "golden_ratio",
    textStylePreference: "elegant_serif",
    colorThemePreset: "earth_tones",
    captionStyle: "storytelling",
    suggestedTone: "professional",
  },
  fitness: {
    visualStyle: "bold",
    imageStyle: "photorealistic",
    lightingDirection: "dramatic",
    shadingStyle: "hard_shadow",
    compositionPreference: "diagonal",
    textStylePreference: "bold_modern",
    colorThemePreset: "vibrant",
    captionStyle: "motivational",
    suggestedTone: "bold",
  },
  tech_saas: {
    visualStyle: "tech",
    imageStyle: "3d_render",
    lightingDirection: "neon_glow",
    shadingStyle: "volumetric",
    compositionPreference: "centered",
    textStylePreference: "tech_mono",
    colorThemePreset: "neon",
    captionStyle: "educational",
    suggestedTone: "authority",
  },
  food_restaurant: {
    visualStyle: "friendly",
    imageStyle: "photorealistic",
    lightingDirection: "natural",
    shadingStyle: "soft_gradient",
    compositionPreference: "rule_of_thirds",
    textStylePreference: "playful_rounded",
    colorThemePreset: "vibrant",
    captionStyle: "conversational",
    suggestedTone: "friendly",
  },
  fashion: {
    visualStyle: "modern_gradient",
    imageStyle: "photorealistic",
    lightingDirection: "studio",
    shadingStyle: "soft_gradient",
    compositionPreference: "asymmetric",
    textStylePreference: "elegant_serif",
    colorThemePreset: "monochrome",
    captionStyle: "storytelling",
    suggestedTone: "bold",
  },
  finance: {
    visualStyle: "corporate",
    imageStyle: "minimalist",
    lightingDirection: "studio",
    shadingStyle: "soft_gradient",
    compositionPreference: "golden_ratio",
    textStylePreference: "minimalist_sans",
    colorThemePreset: "dark_luxury",
    captionStyle: "authority",
    suggestedTone: "authority",
  },
  healthcare: {
    visualStyle: "minimal",
    imageStyle: "flat_illustration",
    lightingDirection: "soft_diffused",
    shadingStyle: "flat",
    compositionPreference: "centered",
    textStylePreference: "minimalist_sans",
    colorThemePreset: "pastel",
    captionStyle: "educational",
    suggestedTone: "professional",
  },
  education: {
    visualStyle: "friendly",
    imageStyle: "flat_illustration",
    lightingDirection: "natural",
    shadingStyle: "flat",
    compositionPreference: "rule_of_thirds",
    textStylePreference: "playful_rounded",
    colorThemePreset: "vibrant",
    captionStyle: "educational",
    suggestedTone: "friendly",
  },
  travel: {
    visualStyle: "bold",
    imageStyle: "photorealistic",
    lightingDirection: "golden_hour",
    shadingStyle: "soft_gradient",
    compositionPreference: "leading_lines",
    textStylePreference: "bold_modern",
    colorThemePreset: "vibrant",
    captionStyle: "storytelling",
    suggestedTone: "inspirational",
  },
  beauty: {
    visualStyle: "luxury",
    imageStyle: "photorealistic",
    lightingDirection: "soft_diffused",
    shadingStyle: "soft_gradient",
    compositionPreference: "centered",
    textStylePreference: "elegant_serif",
    colorThemePreset: "pastel",
    captionStyle: "conversational",
    suggestedTone: "friendly",
  },
  automotive: {
    visualStyle: "dark_mode",
    imageStyle: "photorealistic",
    lightingDirection: "dramatic",
    shadingStyle: "hard_shadow",
    compositionPreference: "diagonal",
    textStylePreference: "bold_modern",
    colorThemePreset: "dark_luxury",
    captionStyle: "authority",
    suggestedTone: "bold",
  },
  legal: {
    visualStyle: "corporate",
    imageStyle: "minimalist",
    lightingDirection: "studio",
    shadingStyle: "soft_gradient",
    compositionPreference: "golden_ratio",
    textStylePreference: "elegant_serif",
    colorThemePreset: "monochrome",
    captionStyle: "authority",
    suggestedTone: "authority",
  },
  ecommerce: {
    visualStyle: "modern_gradient",
    imageStyle: "photorealistic",
    lightingDirection: "studio",
    shadingStyle: "soft_gradient",
    compositionPreference: "centered",
    textStylePreference: "bold_modern",
    colorThemePreset: "vibrant",
    captionStyle: "promotional",
    suggestedTone: "friendly",
  },
  agency_marketing: {
    visualStyle: "modern_gradient",
    imageStyle: "3d_render",
    lightingDirection: "neon_glow",
    shadingStyle: "volumetric",
    compositionPreference: "asymmetric",
    textStylePreference: "bold_modern",
    colorThemePreset: "neon",
    captionStyle: "authority",
    suggestedTone: "witty",
  },
  personal_brand: {
    visualStyle: "minimal",
    imageStyle: "photorealistic",
    lightingDirection: "natural",
    shadingStyle: "soft_gradient",
    compositionPreference: "rule_of_thirds",
    textStylePreference: "minimalist_sans",
    colorThemePreset: "brand_colors",
    captionStyle: "storytelling",
    suggestedTone: "inspirational",
  },
  other: {
    visualStyle: "minimal",
    imageStyle: "photorealistic",
    lightingDirection: "natural",
    shadingStyle: "soft_gradient",
    compositionPreference: "rule_of_thirds",
    textStylePreference: "bold_modern",
    colorThemePreset: "brand_colors",
    captionStyle: "auto",
    suggestedTone: "professional",
  },
};

// ── Intent Modifiers ─────────────────────────────────────────
// Post intent adjusts specific aspects of the creative profile.

interface IntentModifier {
  captionStyleOverride?: CaptionStylePreference;
  toneBoost?: ToneType;
  compositionHint?: CompositionPreference;
  lightingHint?: LightingDirection;
}

const INTENT_MODIFIERS: Record<PostIntent, IntentModifier> = {
  brand_awareness: {
    captionStyleOverride: "storytelling",
    compositionHint: "centered",
    lightingHint: "studio",
  },
  lead_generation: {
    captionStyleOverride: "promotional",
    toneBoost: "authority",
    compositionHint: "centered",
  },
  engagement: {
    captionStyleOverride: "conversational",
    toneBoost: "friendly",
    compositionHint: "rule_of_thirds",
  },
  promotion: {
    captionStyleOverride: "promotional",
    toneBoost: "bold",
    compositionHint: "centered",
    lightingHint: "dramatic",
  },
  education: {
    captionStyleOverride: "educational",
    toneBoost: "authority",
    compositionHint: "rule_of_thirds",
    lightingHint: "soft_diffused",
  },
};

// ── Platform Adjustments ─────────────────────────────────────
// Platform-specific overrides that fine-tune the creative profile.

interface PlatformAdjustment {
  preferredComposition?: CompositionPreference;
  captionStyleHint?: CaptionStylePreference;
}

const PLATFORM_ADJUSTMENTS: Partial<Record<PostPlatform, PlatformAdjustment>> = {
  linkedin: {
    preferredComposition: "golden_ratio",
    captionStyleHint: "authority",
  },
  x: {
    captionStyleHint: "conversational",
  },
  instagram_post: {
    preferredComposition: "centered",
    captionStyleHint: "storytelling",
  },
  facebook: {
    captionStyleHint: "conversational",
  },
};

// ── Main Creative Director Function ──────────────────────────

/**
 * Resolves the complete creative profile for a post.
 * Uses explicit user selections when provided, falls back to
 * niche-based intelligent defaults for anything left unspecified.
 *
 * Priority: User selection > Intent modifier > Platform adjustment > Niche default
 *
 * Pure function — no API calls, no side effects.
 */
export function resolveCreativeProfile(
  input: PostGenerationInput
): CreativeProfile {
  const niche = input.niche ?? "other";
  const baseProfile = { ...NICHE_PROFILES[niche] };
  const primaryPlatform = input.platforms?.[0];

  // Layer 1: Apply intent modifiers
  if (input.postIntent) {
    const intentMod = INTENT_MODIFIERS[input.postIntent];
    if (intentMod) {
      if (intentMod.captionStyleOverride) {
        baseProfile.captionStyle = intentMod.captionStyleOverride;
      }
      if (intentMod.toneBoost) {
        baseProfile.suggestedTone = intentMod.toneBoost;
      }
      if (intentMod.compositionHint) {
        baseProfile.compositionPreference = intentMod.compositionHint;
      }
      if (intentMod.lightingHint) {
        baseProfile.lightingDirection = intentMod.lightingHint;
      }
    }
  }

  // Layer 2: Apply platform adjustments
  if (primaryPlatform) {
    const platAdj = PLATFORM_ADJUSTMENTS[primaryPlatform];
    if (platAdj) {
      if (platAdj.preferredComposition) {
        baseProfile.compositionPreference = platAdj.preferredComposition;
      }
      if (platAdj.captionStyleHint) {
        baseProfile.captionStyle = platAdj.captionStyleHint;
      }
    }
  }

  // Layer 3: Override with explicit user selections (highest priority)
  if (input.lightingDirection) {
    baseProfile.lightingDirection = input.lightingDirection;
  }
  if (input.shadingStyle) {
    baseProfile.shadingStyle = input.shadingStyle;
  }
  if (input.imageStyle) {
    baseProfile.imageStyle = input.imageStyle;
  }
  if (input.compositionPreference) {
    baseProfile.compositionPreference = input.compositionPreference;
  }
  if (input.textStylePreference) {
    baseProfile.textStylePreference = input.textStylePreference;
  }
  if (input.colorThemePreset) {
    baseProfile.colorThemePreset = input.colorThemePreset;
  }
  if (input.captionStyle && input.captionStyle !== "auto") {
    baseProfile.captionStyle = input.captionStyle;
  }
  if (input.visualStyles?.length) {
    baseProfile.visualStyle = input.visualStyles[0];
  }
  if (input.tones?.length) {
    baseProfile.suggestedTone = input.tones[0];
  }

  return baseProfile;
}

// ── Niche-Specific Keywords ──────────────────────────────────
// Used by hashtag intelligence and caption customization.

export interface NicheKeywords {
  primary: string[];     // Core industry terms
  trending: string[];    // Current trending terms in the niche
  engagement: string[];  // Words that drive engagement in this niche
}

export const NICHE_KEYWORDS: Record<NicheCategory, NicheKeywords> = {
  real_estate: {
    primary: ["property", "home", "real estate", "listing", "housing", "mortgage"],
    trending: ["housing market", "interest rates", "first-time buyer", "investment property"],
    engagement: ["dream home", "sold", "just listed", "open house", "house tour"],
  },
  fitness: {
    primary: ["workout", "fitness", "gym", "health", "training", "nutrition"],
    trending: ["hybrid training", "protein", "body recomposition", "functional fitness"],
    engagement: ["transformation", "progress", "motivation", "gains", "results"],
  },
  tech_saas: {
    primary: ["software", "technology", "AI", "automation", "startup", "SaaS"],
    trending: ["artificial intelligence", "machine learning", "no-code", "generative AI"],
    engagement: ["launch", "shipped", "built this", "open source", "demo"],
  },
  food_restaurant: {
    primary: ["food", "restaurant", "chef", "cooking", "recipe", "dining"],
    trending: ["food trend", "sustainable dining", "local ingredients", "fusion cuisine"],
    engagement: ["yum", "food porn", "must try", "recipe", "homemade"],
  },
  fashion: {
    primary: ["fashion", "style", "outfit", "design", "clothing", "accessories"],
    trending: ["sustainable fashion", "capsule wardrobe", "streetwear", "quiet luxury"],
    engagement: ["OOTD", "style inspo", "get the look", "new collection", "drop"],
  },
  finance: {
    primary: ["finance", "investing", "wealth", "money", "banking", "market"],
    trending: ["passive income", "index funds", "crypto", "financial freedom"],
    engagement: ["money tip", "wealth building", "portfolio", "financial literacy"],
  },
  healthcare: {
    primary: ["health", "wellness", "medical", "patient care", "healthcare"],
    trending: ["telehealth", "mental health", "preventive care", "digital health"],
    engagement: ["health tip", "wellness", "self-care", "awareness"],
  },
  education: {
    primary: ["learning", "education", "students", "teaching", "courses"],
    trending: ["online learning", "edtech", "microlearning", "upskilling"],
    engagement: ["did you know", "learn this", "study tip", "knowledge"],
  },
  travel: {
    primary: ["travel", "destination", "adventure", "explore", "tourism"],
    trending: ["sustainable travel", "hidden gems", "digital nomad", "slow travel"],
    engagement: ["wanderlust", "bucket list", "travel hack", "must visit"],
  },
  beauty: {
    primary: ["beauty", "skincare", "makeup", "cosmetics", "self-care"],
    trending: ["clean beauty", "skin barrier", "glass skin", "minimalist skincare"],
    engagement: ["glow up", "beauty hack", "routine", "before after", "review"],
  },
  automotive: {
    primary: ["car", "automotive", "vehicle", "driving", "auto"],
    trending: ["EV", "electric vehicle", "autonomous", "hybrid"],
    engagement: ["new car", "car review", "test drive", "performance", "custom"],
  },
  legal: {
    primary: ["law", "legal", "attorney", "rights", "compliance"],
    trending: ["AI regulation", "data privacy", "employment law", "startup legal"],
    engagement: ["know your rights", "legal tip", "case study", "law explained"],
  },
  ecommerce: {
    primary: ["shop", "ecommerce", "product", "sale", "online store"],
    trending: ["DTC", "social commerce", "live shopping", "subscription box"],
    engagement: ["new arrival", "sale alert", "bestseller", "limited edition", "restock"],
  },
  agency_marketing: {
    primary: ["marketing", "agency", "brand", "campaign", "content strategy"],
    trending: ["AI marketing", "creator economy", "short-form video", "personal branding"],
    engagement: ["case study", "results", "growth hack", "behind the scenes"],
  },
  personal_brand: {
    primary: ["personal brand", "thought leader", "creator", "entrepreneur"],
    trending: ["build in public", "content creation", "personal growth", "side hustle"],
    engagement: ["my story", "lesson learned", "real talk", "unpopular opinion"],
  },
  other: {
    primary: [],
    trending: [],
    engagement: [],
  },
};

// ── Color Theme Palettes ─────────────────────────────────────
// Predefined color palettes for each color theme preset.
// Used as fallback when user doesn't provide custom brand colors.

export const COLOR_THEME_PALETTES: Record<ColorThemePreset, string[]> = {
  vibrant: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
  pastel: ["#FFB5BA", "#B5D8FF", "#C5E8B7", "#FFE4B5", "#D4B5FF"],
  monochrome: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#E94560"],
  earth_tones: ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F5DEB3"],
  neon: ["#00FF88", "#FF3366", "#3B82F6", "#FACC15", "#A855F7"],
  dark_luxury: ["#0A0A0A", "#1A1A1A", "#C9A84C", "#F5D77E", "#FFFFF0"],
  brand_colors: [], // Uses user's actual brand colors
};

import {
  PLATFORM_INTELLIGENCE,
  type BrandType,
  type CTAType,
  type PostGenerationInput,
  type PostPlatform,
  type TargetAudience,
  type VisualStyle,
  type ImageGenType,
  type PostObjective,
  type PostTextBlock,
} from "@/lib/types/postGeneration";
import type { GeneratedIdea, IdeaMode } from "@/lib/ideaFinder/types";
import {
  PLATFORM_STYLE_PROFILES,
  type PlatformStyleProfile,
} from "@/lib/ideaFinder/platformStyleProfiles";

function normalizePlatform(platform: string): PostPlatform[] {
  const normalized = platform.toLowerCase();
  if (normalized === "instagram") return ["instagram_post"];
  if (normalized === "all") return ["linkedin", "x", "instagram_post", "facebook", "threads"];
  if (normalized === "linkedin") return ["linkedin"];
  if (normalized === "x") return ["x"];
  if (normalized === "facebook") return ["facebook"];
  if (normalized === "threads") return ["threads"];
  return ["linkedin"];
}

function inferCTAType(text: string): CTAType {
  const lower = text.toLowerCase();
  if (lower.includes("comment") || lower.includes("reply") || lower.includes("what do you think")) return "comment_cta";
  if (lower.includes("link") || lower.includes("bio") || lower.includes("visit")) return "visit_link";
  if (lower.includes("dm") || lower.includes("message")) return "dm_us";
  if (lower.includes("sign") || lower.includes("join") || lower.includes("subscribe")) return "sign_up";
  if (lower.includes("follow")) return "follow_for_more";
  if (lower.includes("save")) return "save_this_post";
  if (lower.includes("share")) return "share_with_friend";
  return "none";
}

function inferObjective(mode: IdeaMode): PostObjective {
  if (mode === "trend-jacker") return "engagement";
  if (mode === "repurpose") return "educational";
  if (mode === "gap-filler") return "thought_leadership";
  if (mode === "prism") return "thought_leadership";
  return "educational";
}

function inferAudience(audience?: string): TargetAudience[] {
  const value = (audience ?? "").toLowerCase();
  if (value.includes("founder") || value.includes("startup")) return ["startup_founders"];
  if (value.includes("developer") || value.includes("engineer")) return ["developers"];
  if (value.includes("agency") || value.includes("marketer")) return ["marketing_agencies"];
  if (value.includes("buyer") || value.includes("real estate")) return ["real_estate_buyers"];
  return ["general_audience"];
}

function inferVisualStyle(idea: GeneratedIdea): VisualStyle[] {
  const visual = idea.visualDirection.toLowerCase();
  if (visual.includes("dark")) return ["dark_mode"];
  if (visual.includes("tech") || visual.includes("saas")) return ["tech", "minimal"];
  if (visual.includes("bold")) return ["bold"];
  return ["minimal"];
}

function inferBrandType(idea: GeneratedIdea): BrandType {
  const text = `${idea.title} ${idea.angle}`.toLowerCase();
  if (text.includes("agency")) return "agency";
  if (text.includes("ecom") || text.includes("shop")) return "ecommerce";
  if (text.includes("startup") || text.includes("saas")) return "startup_saas";
  if (text.includes("creator")) return "creator";
  return "personal_brand";
}

function inferImageGenType(idea: GeneratedIdea): ImageGenType {
  const visual = idea.visualDirection.toLowerCase();
  if (visual.includes("illustration") || visual.includes("cartoon")) return "illustration";
  if (visual.includes("brand") || visual.includes("palette")) return "brand_color_poster";
  return "ai_background";
}

function clampHeadline(title: string): string {
  const words = title.split(/\s+/).filter(Boolean).slice(0, 6);
  return words.join(" ");
}

function inferHookStyle(hook: string): string {
  const lower = hook.toLowerCase();
  if (lower.includes("?") || lower.startsWith("what") || lower.startsWith("why")) return "Question";
  if (lower.includes("story") || lower.includes("once") || lower.includes("when i")) return "Story";
  if (lower.includes("stat") || /\d+%/.test(lower)) return "Statistic";
  return "Bold Statement";
}

function buildHashtagSuggestion(platforms: PostPlatform[], topic: string) {
  const topicTag = topic
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  const safeTopicTag = topicTag ? `#${topicTag}` : "#ContentStrategy";

  return {
    highReach: ["#ContentMarketing", "#SocialMedia"],
    niche: [safeTopicTag, "#GrowthStrategy"],
    branded: ["#ReachPilot"],
  };
}

function buildSizeSuggestion(platforms: PostPlatform[]): Partial<Record<PostPlatform, string>> {
  const out: Partial<Record<PostPlatform, string>> = {};
  for (const platform of platforms) {
    const size = PLATFORM_INTELLIGENCE[platform].imageSizes[0];
    out[platform] = `${size.width}x${size.height}`;
  }
  return out;
}

// ---- Build detailed text blocks from idea ----

function buildTextBlocks(idea: GeneratedIdea, platforms: PostPlatform[]): PostTextBlock[] {
  const blocks: PostTextBlock[] = [];

  // Title Block
  blocks.push({
    id: `${idea.id}-title`,
    label: "Title",
    text: idea.title,
  });

  // Hook Block(s) - Primary hook from idea
  blocks.push({
    id: `${idea.id}-hook`,
    label: "Hook",
    text: idea.hook,
  });

  // Body/Angle Block - Strategic angle becomes the body content
  blocks.push({
    id: `${idea.id}-body`,
    label: "Body",
    text: idea.angle,
  });

  // Tagline Block - Short summary/elevator pitch derived from whyItFits
  if (idea.whyItFits) {
    blocks.push({
      id: `${idea.id}-tagline`,
      label: "Tagline",
      text: idea.whyItFits.slice(0, 140),
    });
  }

  // CTA Text Block
  if (idea.suggestedCTA) {
    blocks.push({
      id: `${idea.id}-cta`,
      label: "CTA Text",
      text: idea.suggestedCTA,
    });
  }

  // Visual Direction Block - Image concept for AI
  if (idea.visualDirection) {
    blocks.push({
      id: `${idea.id}-visual`,
      label: "Visual Direction",
      text: idea.visualDirection,
    });
  }

  return blocks;
}

// ---- Infer generation focus based on mode and platform ----

function inferGenerationFocus(mode: IdeaMode, platforms: PostPlatform[]): "caption" | "balanced" | "image" {
  // Trend-jacker: prioritize image to capitalize on trend
  if (mode === "trend-jacker") return "image";

  // Repurpose: content already exists, focus on caption adaptation
  if (mode === "repurpose") return "caption";

  // Gap-filler & prism: prioritize balanced for quality
  if (mode === "gap-filler" || mode === "prism") return "balanced";

  // Voice-match: balanced by default
  return "balanced";
}

// ---- Infer content angles based on idea characteristics ----

function inferContentAngle(idea: GeneratedIdea): string[] {
  const angle = idea.angle.toLowerCase();
  const title = idea.title.toLowerCase();

  // Detect contrarian/opinion angle
  if (angle.includes("wrong") || angle.includes("myth") || angle.includes("actually") || title.includes("stop")) {
    return ["contrarian_opinion"];
  }

  // Detect how-to/guide angle
  if (angle.includes("how to") || angle.includes("step") || angle.includes("ways to") || angle.includes("tips")) {
    return ["step_by_step_guide"];
  }

  // Detect story angle
  if (angle.includes("i ") || angle.includes("when i") || angle.includes("story") || idea.format === "story") {
    return ["story"];
  }

  // Detect data/insight angle
  if (/\d+%/.test(angle) || angle.includes("data") || angle.includes("research") || angle.includes("study")) {
    return ["data_insight"];
  }

  // Default to educational
  return ["educational"];
}

// ---- Generate additional hook variations ----

function generateHookVariations(idea: GeneratedIdea): PostTextBlock[] {
  const variations: PostTextBlock[] = [];
  const baseHook = idea.hook;

  // Question variant
  if (!baseHook.includes("?")) {
    variations.push({
      id: `${idea.id}-hook-question`,
      label: "Hook",
      text: baseHook.replace(/\.$/, "?") + "?",
    });
  }

  // Bold statement variant
  if (!baseHook.startsWith("stop") && !baseHook.startsWith("don't")) {
    variations.push({
      id: `${idea.id}-hook-bold`,
      label: "Hook",
      text: `Stop ${baseHook.charAt(0).toLowerCase() + baseHook.slice(1)}`,
    });
  }

  // Stat variant (if angle has numbers)
  const statMatch = idea.angle.match(/\d+/);
  if (statMatch) {
    variations.push({
      id: `${idea.id}-hook-stat`,
      label: "Hook",
      text: `${statMatch[0]}% of people get this wrong. Here's the truth:`,
    });
  }

  return variations;
}

export function mapIdeaToPostSeed(
  idea: GeneratedIdea,
  mode: IdeaMode,
  audience?: string,
): {
  postSeed: PostGenerationInput;
  postPreview: NonNullable<GeneratedIdea["postPreview"]>;
  platformStyles: NonNullable<GeneratedIdea["platformStyles"]>;
} {
  const platforms = normalizePlatform(idea.platform);
  const primaryProfile: PlatformStyleProfile = PLATFORM_STYLE_PROFILES[platforms[0]];
  const ctaType = inferCTAType(idea.suggestedCTA);

  // Build comprehensive text blocks
  const textBlocks = buildTextBlocks(idea, platforms);

  // Generate hook variations
  const hookVariations = generateHookVariations(idea);

  // INCLUDE textBlocks in seed (this is what was missing!)
  const postSeed: PostGenerationInput = {
    objective: inferObjective(mode),
    targetAudiences: inferAudience(audience),
    coreMessage: idea.angle || idea.title,
    contentAngles: inferContentAngle(idea) as any,
    platforms,
    textBlocks: [...textBlocks, ...hookVariations],
    brandType: inferBrandType(idea),
    visualStyles: inferVisualStyle(idea),
    imageGenType: inferImageGenType(idea),
    generationFocus: inferGenerationFocus(mode, platforms),
    brandAssets: {
      colorPalette: ["#0052FF", "#1A1D23", "#CAEE55"],
      watermark: false,
      fontFamily: "Inter", // font is now explicitly set
    },
    tones: primaryProfile.toneTypes,
    ctas: [ctaType],
    emojiLevel: primaryProfile.emojiLevel,
    hashtagIntensity: primaryProfile.hashtagIntensity,
    imageConcept: idea.visualDirection,
    captionStyle: primaryProfile.captionStyle,
    linkedInPostType: platforms.includes("linkedin") ? primaryProfile.linkedInPostType : undefined,
    linkedInStyleProfile: platforms.includes("linkedin") ? primaryProfile.linkedInStyleProfile : undefined,
  };

  const postPreview: NonNullable<GeneratedIdea["postPreview"]> = {
    headline: clampHeadline(idea.title),
    subtext: idea.whyItFits?.slice(0, 90) || "Built from your audience context.",
    cta: idea.suggestedCTA || "What’s your take?",
    hooks: [
      {
        id: `${idea.id}-hook-1`,
        text: idea.hook,
        style: inferHookStyle(idea.hook),
      },
    ],
    suggestedHashtags: buildHashtagSuggestion(platforms, idea.title),
    suggestedSizes: buildSizeSuggestion(platforms),
    imageBrief: idea.visualDirection,
    confidence: {
      overall: idea.confidenceScore,
      rationale: idea.whyItFits || "Derived from fit signals and mode-specific context.",
    },
  };

  const platformStyles: NonNullable<GeneratedIdea["platformStyles"]> = Object.fromEntries(
    platforms.map((platform) => {
      const profile = PLATFORM_STYLE_PROFILES[platform];
      return [
        platform,
        {
          styleProfileId: profile.styleProfileId,
          tone: profile.tone,
          ctaPattern: profile.ctaPattern,
          hashtagPolicy: profile.hashtagPolicy,
          emojiPolicy: profile.emojiPolicy,
          lengthPolicy: profile.lengthPolicy,
          captionStyle: profile.captionStyle,
          linkedInPostType: profile.linkedInPostType,
          linkedInStyleProfile: profile.linkedInStyleProfile,
          ctaType: profile.ctaType,
          emojiLevel: profile.emojiLevel,
          hashtagIntensity: profile.hashtagIntensity,
        },
      ];
    }),
  ) as NonNullable<GeneratedIdea["platformStyles"]>;

  return { postSeed, postPreview, platformStyles };
}

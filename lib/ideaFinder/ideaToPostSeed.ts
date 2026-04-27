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
import {
  IDEA_DRAFT_FIELD_REQUIREMENTS,
  type GeneratedIdea,
  type IdeaMode,
  type IdeaPlatformTemplate,
  type IdeaTemplateId,
} from "@/lib/ideaFinder/types";
import {
  PLATFORM_STYLE_PROFILES,
  type PlatformStyleProfile,
} from "@/lib/ideaFinder/platformStyleProfiles";

const FULL_POST_PLATFORMS: PostPlatform[] = [
  "linkedin",
  "x",
  "instagram_post",
  "facebook",
  "pinterest",
  "threads",
];

const ALLOWED_TEXT_BLOCK_LABELS = new Set(["Title", "Subtitle", "Body", "CTA", "Tagline"]);

function normalizePlatform(platform: string): PostPlatform[] {
  const normalized = platform.toLowerCase();
  if (normalized === "instagram") return ["instagram_post"];
  if (normalized === "all") return [...FULL_POST_PLATFORMS];
  if (normalized === "linkedin") return ["linkedin"];
  if (normalized === "x") return ["x"];
  if (normalized === "facebook") return ["facebook"];
  if (normalized === "pinterest") return ["pinterest"];
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
  if (visual.includes("dark")) return ["dark_mode", "minimal"];
  if (visual.includes("tech") || visual.includes("saas")) return ["tech", "minimal"];
  if (visual.includes("bold")) return ["bold", "modern_gradient"];
  if (visual.includes("luxury") || visual.includes("premium")) return ["luxury", "minimal"];
  if (visual.includes("friendly") || visual.includes("community")) return ["friendly", "minimal"];
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

function buildDetailedCoreMessage(idea: GeneratedIdea): string {
  const parts = [
    `Primary Insight: ${idea.angle || idea.title}`,
    `Hook Promise: ${idea.hook}`,
    `Audience Fit: ${idea.whyItFits || "Aligned with audience intent and platform context."}`,
  ];

  if (idea.suggestedCTA) {
    parts.push(`Desired Action: ${idea.suggestedCTA}`);
  }

  if (idea.trendTopic) {
    parts.push(`Trend Anchor: ${idea.trendTopic}${idea.trendContext ? ` - ${idea.trendContext}` : ""}`);
  }

  if (idea.gapTopic) {
    parts.push(`Gap Covered: ${idea.gapTopic}`);
  }

  if (idea.remixStrategy) {
    parts.push(`Repurpose Strategy: ${idea.remixStrategy}`);
  }

  return parts.join("\n");
}

function buildDetailedImageConcept(
  idea: GeneratedIdea,
  platformTemplate: IdeaPlatformTemplate,
): string {
  const lines = [
    `Single-post concept: ${idea.visualDirection || platformTemplate.visualRecommendation}`,
    `Composition: One focused scene with a clear subject and minimal clutter; avoid multi-frame or carousel layouts.`,
    `Template alignment: ${platformTemplate.templateName} structure with a ${platformTemplate.imageRatio} visual framing target.`,
  ];

  if (idea.suggestedCTA) {
    lines.push(`CTA support visual: Include visual hierarchy that supports this action -> ${idea.suggestedCTA}`);
  }

  return lines.join("\n");
}

function inferColorPalette(platform: PostPlatform, visualStyles: VisualStyle[]): string[] {
  if (platform === "linkedin") return ["#0A66C2", "#1F2937", "#FFFFFF"];
  if (platform === "instagram_post") return ["#E1306C", "#F77737", "#FFFFFF"];
  if (platform === "x") return ["#0F1419", "#1D9BF0", "#FFFFFF"];
  if (platform === "facebook") return ["#1877F2", "#1C1E21", "#FFFFFF"];
  if (platform === "pinterest") return ["#BD081C", "#111827", "#FFFFFF"];
  if (platform === "threads") return ["#101010", "#4B5563", "#FFFFFF"];

  if (visualStyles.includes("luxury")) return ["#1B1B1B", "#C8A96A", "#F8F5EF"];
  if (visualStyles.includes("bold")) return ["#0052FF", "#CAEE55", "#0B1020"];
  return ["#0052FF", "#1A1D23", "#CAEE55"];
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

function displayPlatform(platform: PostPlatform): string {
  if (platform === "instagram_post") return "Instagram";
  if (platform === "x") return "X";
  if (platform === "linkedin") return "LinkedIn";
  if (platform === "facebook") return "Facebook";
  if (platform === "pinterest") return "Pinterest";
  if (platform === "threads") return "Threads";
  return platform;
}

function getPlatformDosAndDonts(platform: PostPlatform): { do: string[]; dont: string[] } {
  if (platform === "linkedin") {
    return {
      do: [
        "Lead with a strong professional insight in the first 2 lines.",
        "Use short whitespace-separated paragraphs for readability.",
        "End with a discussion-starting question.",
      ],
      dont: [
        "Avoid overusing emojis or meme-style slang.",
        "Avoid walls of text without breaks.",
      ],
    };
  }

  if (platform === "instagram_post") {
    return {
      do: [
        "Open with a scroll-stopping hook.",
        "Use a visual-first caption structure with clear breaks.",
        "Include save/share intent in the CTA.",
      ],
      dont: [
        "Avoid long dense blocks with no spacing.",
        "Avoid weak CTA phrasing at the end.",
      ],
    };
  }

  if (platform === "x") {
    return {
      do: [
        "Keep one sharp idea per post.",
        "Front-load the hook in the first line.",
        "Use direct, reply-oriented CTA language.",
      ],
      dont: [
        "Avoid multi-idea rambling in one post.",
        "Avoid hashtag stuffing.",
      ],
    };
  }

  if (platform === "facebook") {
    return {
      do: [
        "Use a conversational, community-friendly tone.",
        "Close with a genuine question to encourage comments.",
        "Use relatable examples or mini-story framing.",
      ],
      dont: [
        "Avoid overly corporate or sterile language.",
        "Avoid hard-sell CTA phrasing.",
      ],
    };
  }

  if (platform === "pinterest") {
    return {
      do: [
        "Use keyword-led phrasing in title and caption.",
        "Prefer evergreen, saveable value framing.",
        "Give direct visual layout direction for a pin.",
      ],
      dont: [
        "Avoid vague non-searchable hooks.",
        "Avoid missing image intent or visual clarity.",
      ],
    };
  }

  return {
    do: ["Keep the post concise and audience-aware."],
    dont: ["Avoid generic copy that is not platform-specific."],
  };
}

function pickTemplateForPlatform(
  platform: PostPlatform,
  mode: IdeaMode,
  idea: GeneratedIdea,
): { templateId: IdeaTemplateId; templateName: string } {
  if (platform === "linkedin") {
    if (mode === "trend-jacker") return { templateId: "hook_value_cta", templateName: "Hook-Value-CTA" };
    return { templateId: "authority_format", templateName: "Authority Insight" };
  }

  if (platform === "instagram_post") {
    if (idea.format === "carousel") return { templateId: "listicle_format", templateName: "Listicle Carousel" };
    if (mode === "repurpose") return { templateId: "story_format", templateName: "Story Remix" };
    return { templateId: "hook_value_cta", templateName: "Hook-Value-CTA" };
  }

  if (platform === "x") {
    if (mode === "prism") return { templateId: "authority_format", templateName: "Compact Authority" };
    return { templateId: "hook_value_cta", templateName: "Sharp Hook-Value-CTA" };
  }

  if (platform === "facebook") {
    if (mode === "voice-match") return { templateId: "story_format", templateName: "Story Conversation" };
    return { templateId: "engagement_question", templateName: "Engagement Question" };
  }

  if (platform === "pinterest") {
    if (idea.format === "carousel") return { templateId: "listicle_format", templateName: "Pinterest List Save" };
    return { templateId: "hook_value_cta", templateName: "Pinterest Search Save" };
  }

  return { templateId: "hook_value_cta", templateName: "Hook-Value-CTA" };
}

function buildPlatformTemplate(
  idea: GeneratedIdea,
  mode: IdeaMode,
  platform: PostPlatform,
  profile: PlatformStyleProfile,
): IdeaPlatformTemplate {
  const template = pickTemplateForPlatform(platform, mode, idea);
  const intelligence = PLATFORM_INTELLIGENCE[platform];
  const preferredSize = intelligence.imageSizes[0];
  const ratio = preferredSize.width && preferredSize.height
    ? `${preferredSize.width}:${preferredSize.height}`
    : "n/a";
  const { do: doRules, dont: dontRules } = getPlatformDosAndDonts(platform);

  return {
    platform,
    templateId: template.templateId,
    templateName: template.templateName,
    hookAngle: idea.hook,
    captionTone: profile.tone,
    captionStyle: profile.captionStyle,
    ctaPattern: profile.ctaPattern,
    formatRecommendation: `${idea.format} optimized for ${intelligence.name}`,
    visualRecommendation: idea.visualDirection,
    imageRatio: ratio,
    hashtagGuidance: `${profile.hashtagPolicy.min}-${profile.hashtagPolicy.max} hashtags recommended`,
    lengthGuidance: `${profile.lengthPolicy.recommendedMin}-${profile.lengthPolicy.recommendedMax} chars recommended`,
    do: doRules,
    dont: dontRules,
    confidenceReason: idea.whyItFits || `Mapped to ${intelligence.name} style profile and mode intent.`,
  };
}

function inferWritingStyleId(mode: IdeaMode, platform: PostPlatform, templateId: IdeaTemplateId): string | undefined {
  if (mode === "voice-match") return "builtin-writing-voice-match";
  if (platform === "linkedin" && templateId === "authority_format") return "builtin-writing-authority";
  if (platform === "x") return "builtin-writing-punchy";
  if (platform === "pinterest") return "builtin-writing-search-friendly";
  if (mode === "repurpose") return "builtin-writing-repurpose";
  return undefined;
}

function inferVisualStylePresetId(platform: PostPlatform, imageGenType: ImageGenType): string | undefined {
  if (platform === "pinterest") return "builtin-visual-pinterest-pin";
  if (platform === "instagram_post") return "builtin-visual-instagram-feed";
  if (platform === "linkedin") return "builtin-visual-linkedin-clean";
  if (platform === "x") return "builtin-visual-x-minimal";
  if (imageGenType === "illustration") return "builtin-visual-illustration";
  return undefined;
}

function inferImageReferences(idea: GeneratedIdea, platformTemplate: IdeaPlatformTemplate): string | undefined {
  const refs = [
    idea.trendTopic,
    idea.gapTopic,
    idea.originalContentRef,
    platformTemplate.visualRecommendation,
    idea.visualDirection,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());

  const deduped = Array.from(new Set(refs));
  return deduped.length ? deduped.slice(0, 3).join(" | ") : undefined;
}

// ---- Build detailed text blocks from idea ----

function buildTextBlocks(idea: GeneratedIdea): PostTextBlock[] {
  const blocks: PostTextBlock[] = [];

  // Title
  blocks.push({
    id: `${idea.id}-title`,
    label: "Title",
    text: idea.title,
  });

  // Subtitle from hook
  blocks.push({
    id: `${idea.id}-subtitle`,
    label: "Subtitle",
    text: idea.hook,
  });

  // Body
  blocks.push({
    id: `${idea.id}-body`,
    label: "Body",
    text: idea.angle,
  });

  // Tagline
  if (idea.whyItFits) {
    blocks.push({
      id: `${idea.id}-tagline`,
      label: "Tagline",
      text: idea.whyItFits.slice(0, 140),
    });
  }

  // CTA
  if (idea.suggestedCTA) {
    blocks.push({
      id: `${idea.id}-cta`,
      label: "CTA",
      text: idea.suggestedCTA,
    });
  }

  return blocks;
}

function normalizeTextBlocks(blocks: PostTextBlock[]): PostTextBlock[] {
  const normalizeLabel = (label: string): PostTextBlock["label"] => {
    const lower = label.trim().toLowerCase();
    if (lower.includes("title")) return "Title";
    if (lower.includes("subtitle") || lower.includes("hook")) return "Subtitle";
    if (lower.includes("cta")) return "CTA";
    if (lower.includes("tagline")) return "Tagline";
    return "Body";
  };

  return blocks
    .map((block, index) => {
      const text = block.text.trim();
      if (!text) return null;

      const label = normalizeLabel(block.label);
      if (!ALLOWED_TEXT_BLOCK_LABELS.has(label)) return null;

      return {
        ...block,
        id: `${block.id || `block-${index}`}`,
        label,
        text,
      } satisfies PostTextBlock;
    })
    .filter((block): block is PostTextBlock => block !== null);
}

function buildPlatformSpecificTextBlocks(
  idea: GeneratedIdea,
  platforms: PostPlatform[],
  mode: IdeaMode,
  platformTemplate: IdeaPlatformTemplate,
): PostTextBlock[] {
  const blocks: PostTextBlock[] = [];

  for (const platform of platforms) {
    const platformName = displayPlatform(platform);
    blocks.push({
      id: `${idea.id}-${platform}-subtitle`,
      label: "Subtitle",
      text: `${idea.hook}`,
    });

    blocks.push({
      id: `${idea.id}-${platform}-body`,
      label: "Body",
      text: `${idea.angle} (${platformTemplate.formatRecommendation})`,
    });

    if (idea.suggestedCTA) {
      blocks.push({
        id: `${idea.id}-${platform}-cta`,
        label: "CTA",
        text: `${idea.suggestedCTA} (${platformTemplate.ctaPattern})`,
      });
    }

    blocks.push({
      id: `${idea.id}-${platform}-tagline`,
      label: "Tagline",
      text: `${platformName}: ${platformTemplate.templateName}`,
    });
  }

  if (mode === "trend-jacker" && idea.trendTopic) {
    blocks.push({
      id: `${idea.id}-trend-context`,
      label: "Body",
      text: `${idea.trendTopic}${idea.trendContext ? ` - ${idea.trendContext}` : ""}`,
    });
  }

  if (mode === "repurpose" && idea.originalContentRef) {
    blocks.push({
      id: `${idea.id}-repurpose-source`,
      label: "Body",
      text: `${idea.originalContentRef}${idea.remixStrategy ? ` - ${idea.remixStrategy}` : ""}`,
    });
  }

  if (mode === "gap-filler" && idea.gapTopic) {
    blocks.push({
      id: `${idea.id}-gap-signal`,
      label: "Body",
      text: `${idea.gapTopic}${idea.audienceDemandSignal ? ` - ${idea.audienceDemandSignal}` : ""}`,
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
      label: "Subtitle",
      text: baseHook.replace(/\.$/, "?") + "?",
    });
  }

  // Bold statement variant
  if (!baseHook.startsWith("stop") && !baseHook.startsWith("don't")) {
    variations.push({
      id: `${idea.id}-hook-bold`,
      label: "Subtitle",
      text: `Stop ${baseHook.charAt(0).toLowerCase() + baseHook.slice(1)}`,
    });
  }

  // Stat variant (if angle has numbers)
  const statMatch = idea.angle.match(/\d+/);
  if (statMatch) {
    variations.push({
      id: `${idea.id}-hook-stat`,
        label: "Subtitle",
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
  platformTemplate: IdeaPlatformTemplate;
  draftFieldRequirements: NonNullable<GeneratedIdea["draftFieldRequirements"]>;
} {
  const platforms = normalizePlatform(idea.platform);
  const primaryProfile: PlatformStyleProfile = PLATFORM_STYLE_PROFILES[platforms[0]];
  const primaryPlatform = platforms[0];
  const platformTemplate = buildPlatformTemplate(idea, mode, primaryPlatform, primaryProfile);
  const draftFieldRequirements = IDEA_DRAFT_FIELD_REQUIREMENTS[primaryPlatform];
  const ctaType = inferCTAType(idea.suggestedCTA);
  const inferredImageGenType = inferImageGenType(idea);

  // Build comprehensive text blocks
  const baseTextBlocks = buildTextBlocks(idea);
  const platformTextBlocks = buildPlatformSpecificTextBlocks(idea, platforms, mode, platformTemplate);

  // Generate hook variations
  const hookVariations = generateHookVariations(idea);

  // Provide image reference entities for stronger image-generation handoff
  const imageReferences = inferImageReferences(idea, platformTemplate);

  const primarySize = PLATFORM_INTELLIGENCE[primaryPlatform].imageSizes[0];
  const imageSize = `${primarySize.width}x${primarySize.height}`;

  const writingStyleId = inferWritingStyleId(mode, primaryPlatform, platformTemplate.templateId);
  const visualStylePresetId = inferVisualStylePresetId(primaryPlatform, inferredImageGenType);
  const inferredVisualStyles = inferVisualStyle(idea);
  const detailedCoreMessage = buildDetailedCoreMessage(idea);
  const detailedImageConcept = buildDetailedImageConcept(idea, platformTemplate);
  const colorPalette = inferColorPalette(primaryPlatform, inferredVisualStyles);

  const normalizedTextBlocks = normalizeTextBlocks([
    ...baseTextBlocks,
    ...platformTextBlocks,
    ...hookVariations,
  ]);

  const platformTemplateIds: Partial<Record<PostPlatform, string>> = Object.fromEntries(
    platforms.map((platform) => {
      const pickedTemplate = pickTemplateForPlatform(platform, mode, idea);
      return [platform, pickedTemplate.templateId];
    }),
  ) as Partial<Record<PostPlatform, string>>;

  const postSeed: PostGenerationInput = {
    objective: inferObjective(mode),
    targetAudiences: inferAudience(audience),
    coreMessage: detailedCoreMessage,
    contentAngles: inferContentAngle(idea) as any,
    platforms,
    textBlocks: normalizedTextBlocks,
    brandType: inferBrandType(idea),
    visualStyles: inferredVisualStyles,
    imageGenType: inferredImageGenType,
    imageSize,
    generationFocus: inferGenerationFocus(mode, platforms),
    brandAssets: {
      colorPalette,
      watermark: false,
      fontFamily: "Inter", // font is now explicitly set
    },
    tones: primaryProfile.toneTypes,
    ctas: [ctaType],
    emojiLevel: primaryProfile.emojiLevel,
    hashtagIntensity: primaryProfile.hashtagIntensity,
    imageConcept: detailedImageConcept,
    imageReferences,
    captionStyle: primaryProfile.captionStyle,
    selectedTemplateId: platformTemplate.templateId,
    platformTemplateIds,
    writingStyleId,
    visualStylePresetId,
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

  return {
    postSeed,
    postPreview,
    platformStyles,
    platformTemplate,
    draftFieldRequirements,
  };
}

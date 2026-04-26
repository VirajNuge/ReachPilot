import type {
  ContentStrategyOutput,
  CreativeHandoffV2,
  ImageStyle,
  LayoutStyle,
  NegativeSpaceZone,
  OverlayStyle,
  PostGenerationInput,
  PosterPromptOutput,
  TemplateAlignment,
  TemplateId,
  TextTheme,
} from "@/lib/types/postGeneration";

import {
  NEGATIVE_SPACE_ZONES,
  OVERLAY_STYLES,
  TEMPLATE_ALIGNMENTS,
  TEMPLATE_IDS,
  TEXT_THEMES,
} from "./creativeHandoffSchema";

const TEXT_IN_IMAGE_BANNED_PATTERNS = [
  /visible text/i,
  /headline/i,
  /subheadline/i,
  /subtext/i,
  /cta/i,
  /call to action/i,
  /typography/i,
  /logo/i,
  /watermark/i,
  /text overlay/i,
  /words on the image/i,
];

const DEFAULT_AVOID = [
  "visible text",
  "logos",
  "watermarks",
  "UI screenshots",
  "generic stock-photo scenes",
];

type ValidationResult =
  | { ok: true; data: CreativeHandoffV2 }
  | { ok: false; errors: string[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function trimToWordLimit(value: string, maxWords: number): string {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value.trim();
  return words.slice(0, maxWords).join(" ");
}

function dedupeStrings(values: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(values)) return fallback;
  const normalized = values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(normalized));
}

function pickEnumValue<T extends string>(value: unknown, valid: readonly T[], fallback: T): T {
  return typeof value === "string" && valid.includes(value as T) ? (value as T) : fallback;
}

function firstTextBlock(input: PostGenerationInput, labels: string[]): string | undefined {
  return input.textBlocks
    ?.find((block) => labels.includes(block.label.toLowerCase().trim()))
    ?.text?.trim();
}

function defaultTemplateId(input: PostGenerationInput): TemplateId {
  const platform = input.platforms[0] ?? "linkedin";
  if (platform === "linkedin" || platform === "x") return "split-editorial";
  return "hero-bottom-overlay";
}

function defaultSafeArea(templateId: TemplateId): NegativeSpaceZone {
  switch (templateId) {
    case "split-editorial":
      return "center_left";
    case "minimal-card":
      return "center";
    case "quote-focus":
      return "center";
    default:
      return "bottom_left";
  }
}

function defaultOverlay(templateId: TemplateId): OverlayStyle {
  switch (templateId) {
    case "minimal-card":
      return "dark-glass";
    case "quote-focus":
      return "black-gradient-60";
    default:
      return "black-gradient-80";
  }
}

function defaultAlignment(templateId: TemplateId): TemplateAlignment {
  return templateId === "quote-focus" ? "center" : "left";
}

function defaultTextTheme(input: PostGenerationInput): TextTheme {
  return input.visualStyles.includes("dark_mode") ? "light-on-dark" : "light-on-dark";
}

export function buildFallbackCreativeHandoff(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
): CreativeHandoffV2 {
  const templateId = defaultTemplateId(input);
  const title = firstTextBlock(input, ["title", "headline"]);
  const subtitle = firstTextBlock(input, ["subtitle", "subtext"]);
  const ctaText = firstTextBlock(input, ["cta", "cta text"]);
  const tone = (input.tones[0] ?? "professional").replace(/_/g, " ");
  const visualStyle = (input.visualStyles[0] ?? "minimal").replace(/_/g, " ");
  const primaryPlatform = input.platforms[0] ?? "linkedin";
  const colorUsage = input.brandAssets.colorPalette.slice(0, 4);
  const renderStyle = (input.imageStyle ?? "photorealistic") as ImageStyle;

  return {
    schemaVersion: "v2",
    visualBrief: {
      prompt: [
        `Create a text-free ${visualStyle} campaign background for ${primaryPlatform}.`,
        `Center the emotional world around ${strategy.postAngle || input.coreMessage}.`,
        `Use ${tone} energy, strong visual hierarchy, and deliberate negative space reserved for later text overlay in the ${defaultSafeArea(templateId).replace(/_/g, " ")} area.`,
        `Weave brand colors ${colorUsage.join(", ") || "subtly selected brand accents"} into lighting, reflections, atmosphere, or materials — never as visible text, logos, or watermarks.`,
      ].join(" "),
      subject: strategy.postAngle || input.coreMessage,
      environment: strategy.visualIdea || "editorial campaign setting",
      lighting: tone,
      mood: tone,
      composition: input.compositionPreference ?? "rule_of_thirds",
      negativeSpaceZone: defaultSafeArea(templateId),
      renderStyle,
      brandColorUsage: colorUsage,
      avoid: DEFAULT_AVOID,
    },
    copyBrief: {
      headline: trimToWordLimit(title ?? strategy.postAngle ?? input.coreMessage ?? "Generated post", 8),
      subtext: trimToWordLimit(subtitle ?? strategy.visualIdea ?? strategy.contentStructure ?? input.coreMessage, 16),
      cta: trimToWordLimit(ctaText ?? (input.ctas[0] === "none" ? "Learn more" : "Read more"), 4),
    },
    layoutBrief: {
      templateId,
      alignment: defaultAlignment(templateId),
      textTheme: defaultTextTheme(input),
      safeArea: defaultSafeArea(templateId),
      overlay: defaultOverlay(templateId),
    },
  };
}

export function validateCreativeHandoff(
  value: unknown,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
): ValidationResult {
  const errors: string[] = [];
  const fallback = buildFallbackCreativeHandoff(input, strategy);

  if (!isObject(value)) {
    return { ok: false, errors: ["Creative handoff payload is not an object"] };
  }

  const visual = isObject(value.visualBrief) ? value.visualBrief : {};
  const copy = isObject(value.copyBrief) ? value.copyBrief : {};
  const layout = isObject(value.layoutBrief) ? value.layoutBrief : {};

  const templateId = pickEnumValue(layout.templateId, TEMPLATE_IDS, fallback.layoutBrief.templateId);
  const safeArea = pickEnumValue(layout.safeArea, NEGATIVE_SPACE_ZONES, fallback.layoutBrief.safeArea);
  const alignment = pickEnumValue(layout.alignment, TEMPLATE_ALIGNMENTS, fallback.layoutBrief.alignment);
  const textTheme = pickEnumValue(layout.textTheme, TEXT_THEMES, fallback.layoutBrief.textTheme);
  const overlay = pickEnumValue(layout.overlay, OVERLAY_STYLES, fallback.layoutBrief.overlay);
  const prompt = asNonEmptyString(visual.prompt, fallback.visualBrief.prompt);
  const avoid = dedupeStrings(visual.avoid, fallback.visualBrief.avoid);

  if (!prompt) errors.push("visualBrief.prompt is empty");
  if (TEXT_IN_IMAGE_BANNED_PATTERNS.some((pattern) => pattern.test(prompt))) {
    errors.push("visualBrief.prompt contains text-rendering instructions or composition-layer content");
  }

  const headline = trimToWordLimit(
    asNonEmptyString(copy.headline, fallback.copyBrief.headline),
    firstTextBlock(input, ["title", "headline"]) ? 20 : 8,
  );
  const subtext = trimToWordLimit(
    asNonEmptyString(copy.subtext, fallback.copyBrief.subtext),
    firstTextBlock(input, ["subtitle", "subtext"]) ? 24 : 16,
  );
  const cta = trimToWordLimit(
    asNonEmptyString(copy.cta, fallback.copyBrief.cta),
    firstTextBlock(input, ["cta", "cta text"]) ? 8 : 4,
  );

  if (!headline) errors.push("copyBrief.headline is empty");
  if (!subtext) errors.push("copyBrief.subtext is empty");
  if (!cta) errors.push("copyBrief.cta is empty");
  if (safeArea !== pickEnumValue(visual.negativeSpaceZone, NEGATIVE_SPACE_ZONES, safeArea)) {
    errors.push("layoutBrief.safeArea and visualBrief.negativeSpaceZone disagree");
  }

  const data: CreativeHandoffV2 = {
    schemaVersion: "v2",
    visualBrief: {
      prompt,
      subject: asNonEmptyString(visual.subject, fallback.visualBrief.subject),
      environment: asNonEmptyString(visual.environment, fallback.visualBrief.environment),
      lighting: asNonEmptyString(visual.lighting, fallback.visualBrief.lighting),
      mood: asNonEmptyString(visual.mood, fallback.visualBrief.mood),
      composition: fallback.visualBrief.composition,
      negativeSpaceZone: safeArea,
      renderStyle: fallback.visualBrief.renderStyle,
      brandColorUsage: dedupeStrings(visual.brandColorUsage, fallback.visualBrief.brandColorUsage),
      avoid: avoid.length > 0 ? avoid : DEFAULT_AVOID,
    },
    copyBrief: { headline, subtext, cta },
    layoutBrief: {
      templateId,
      alignment,
      textTheme,
      safeArea,
      overlay,
    },
  };

  return errors.length > 0 ? { ok: false, errors } : { ok: true, data };
}

export function creativeHandoffToPosterPrompt(
  creativeHandoff: CreativeHandoffV2,
): PosterPromptOutput {
  const templateToLegacyLayout: Record<TemplateId, LayoutStyle> = {
    "hero-bottom-overlay": "bottom_overlay",
    "split-editorial": "split_layout",
    "minimal-card": "minimal_card",
    "quote-focus": "hero_center",
  };

  const textThemeToTypography: Record<TextTheme, string> = {
    "light-on-dark": "modern_sans",
    "dark-on-light": "modern_sans",
    "brand-accent": "bold_serif",
  };

  return {
    masterPrompt: creativeHandoff.visualBrief.prompt,
    posterPrompt: creativeHandoff.visualBrief.prompt,
    headline: creativeHandoff.copyBrief.headline,
    subtext: creativeHandoff.copyBrief.subtext,
    cta: creativeHandoff.copyBrief.cta,
    layout: templateToLegacyLayout[creativeHandoff.layoutBrief.templateId],
    typographyStyle: textThemeToTypography[creativeHandoff.layoutBrief.textTheme],
    compositionNotes: `Use the ${creativeHandoff.layoutBrief.templateId} template with ${creativeHandoff.layoutBrief.alignment} alignment, safe area in ${creativeHandoff.layoutBrief.safeArea.replace(/_/g, " ")}, and ${creativeHandoff.layoutBrief.overlay} overlay.`,
  };
}

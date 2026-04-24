// ============================================================
// ReachPilot — Prompt Orchestration Layer
// Core engine: structured user selections → professional design tokens → high-quality prompts
// Sits between user input and image generation API
// ============================================================

import type {
  PostGenerationInput,
  ContentStrategyOutput,
  VisualStyle,
  LayoutStyle,
  PostPlatform,
  PosterPromptOutput,
  CompositionPreference,
} from "@/lib/types/postGeneration";

import { POST_IMAGE_SIZES } from "@/lib/types/postGeneration";

import {
  STYLE_PRESETS,
  COMPOSITION_RULES,
  VISUAL_METAPHOR_TEMPLATES,
  CAMERA_PRESETS,
  IMAGE_SYSTEM_PROMPT,
  LIGHTING_PRESETS,
  SHADING_PRESETS,
  IMAGE_STYLE_PRESETS,
  TEXT_STYLE_PRESETS,
  COMPOSITION_PREFERENCE_TO_RULE,
  COLOR_THEME_DESCRIPTIONS,
} from "./designTokens";

import {
  resolveCreativeProfile,
  COLOR_THEME_PALETTES,
} from "./creativeDirector";
import type { CreativeProfile } from "./creativeDirector";

// ── Platform Aspect Ratios ────────────────────────────────────

export const PLATFORM_ASPECT_RATIO: Record<string, string> = {
  instagram_post: "1:1",
  instagram_story: "9:16",
  linkedin: "16:9",  // 1200×627 landscape — thought leadership format
  x: "16:9",
  facebook: "16:9",
  tiktok: "9:16",
  pinterest: "2:3",
  youtube_community: "16:9",
};

// ── Size Resolution Helper ────────────────────────────────────

/**
 * Resolves aspectRatio and a human-readable size description from input.
 * Prefers explicit imageSize selection over platform default.
 */
function resolveAspectRatio(input: PostGenerationInput): {
  aspectRatio: string;
  sizeDescription: string;
} {
  const selectedSize = POST_IMAGE_SIZES.find((s) => s.id === input.imageSize);
  if (selectedSize) {
    return {
      aspectRatio: selectedSize.ratio,
      sizeDescription: `${selectedSize.width}×${selectedSize.height} pixels (${selectedSize.label}, ${selectedSize.ratio} aspect ratio)`,
    };
  }
  const primaryPlatform: string = input.platforms?.[0] ?? "instagram_post";
  const aspectRatio = PLATFORM_ASPECT_RATIO[primaryPlatform] ?? "1:1";
  return {
    aspectRatio,
    sizeDescription: `${aspectRatio} aspect ratio`,
  };
}

// ── Style → Camera Preset Mapping ────────────────────────────

const STYLE_TO_CAMERA: Record<VisualStyle, string> = {
  minimal: "editorial",
  corporate: "editorial",
  bold: "lifestyle",
  tech: "cinematic",
  luxury: "cinematic",
  friendly: "lifestyle",
  dark_mode: "cinematic",
  modern_gradient: "lifestyle",
};

// ── Style → Composition Rule Mapping ─────────────────────────

const STYLE_TO_COMPOSITION: Record<VisualStyle, string> = {
  minimal: "rule_of_thirds",
  corporate: "golden_ratio",
  bold: "dynamic_diagonal",
  tech: "center_dominant",
  luxury: "golden_ratio",
  friendly: "rule_of_thirds",
  dark_mode: "center_dominant",
  modern_gradient: "dynamic_diagonal",
};

// ── Layout Override → Composition Mapping ────────────────────

const LAYOUT_TO_COMPOSITION: Partial<Record<LayoutStyle, string>> = {
  hero_center: "center_dominant",
  split_layout: "rule_of_thirds",
  minimal_card: "golden_ratio",
};

// ── Common Color Name Mapping ────────────────────────────────

const HEX_COLOR_NAMES: Record<string, string> = {
  "#FF6B6B": "coral red",
  "#4ECDC4": "teal",
  "#45B7D1": "sky blue",
  "#96CEB4": "sage green",
  "#FFEAA7": "warm yellow",
  "#DDA0DD": "soft plum",
  "#98D8C8": "mint",
  "#F7DC6F": "golden yellow",
  "#BB8FCE": "lavender",
  "#85C1E9": "powder blue",
  "#F8C471": "apricot",
  "#82E0AA": "emerald",
  "#F1948A": "salmon pink",
  "#AED6F1": "light cerulean",
  "#D7BDE2": "wisteria",
  "#A3E4D7": "aqua mint",
  "#FAD7A0": "peach",
  "#000000": "black",
  "#FFFFFF": "white",
  "#333333": "charcoal",
  "#FF0000": "red",
  "#00FF00": "green",
  "#0000FF": "blue",
  "#FFD700": "gold",
  "#C0C0C0": "silver",
  "#1A1A2E": "deep navy",
  "#16213E": "midnight blue",
  "#0F3460": "royal blue",
  "#E94560": "crimson",
};

// ── Interfaces ───────────────────────────────────────────────

export interface OrchestratorConfig {
  input: PostGenerationInput;
  strategy: ContentStrategyOutput;
  personaContext?: string;
}

export interface OrchestratedPrompt {
  /** The system prompt to set the AI's role (Creative Director persona) */
  systemPrompt: string;
  /** The fully assembled user prompt for the LLM that generates PosterPromptOutput */
  generatorPrompt: string;
  /** The fully assembled prompt for the image model (used by buildPosterPrompt replacement) */
  imageModelPrompt: string;
  /** Resolved design tokens for reference/debugging */
  resolvedTokens: {
    style: string;
    composition: string;
    camera: string;
    metaphor?: string;
    aspectRatio: string;
    creativeProfile: CreativeProfile;
  };
}

// ── Helper Functions ─────────────────────────────────────────

/**
 * Maps a visual style + optional layout to the best composition rule key.
 * Layout preference overrides the default style mapping when applicable.
 * If a Creative Director compositionPreference is provided, it takes priority over style mapping.
 */
export function resolveComposition(
  style: VisualStyle,
  layout?: LayoutStyle,
  compositionPreference?: CompositionPreference
): string {
  // Creative Director preference takes priority over style-based mapping
  if (compositionPreference) {
    const mapped = COMPOSITION_PREFERENCE_TO_RULE[compositionPreference];
    if (mapped && COMPOSITION_RULES[mapped]) return mapped;
  }
  if (layout && LAYOUT_TO_COMPOSITION[layout]) {
    return LAYOUT_TO_COMPOSITION[layout] as string;
  }
  return STYLE_TO_COMPOSITION[style] ?? "rule_of_thirds";
}

/**
 * Maps a visual style to its ideal camera preset key.
 */
export function resolveCameraPreset(style: VisualStyle): string {
  return STYLE_TO_CAMERA[style] ?? "editorial";
}

/**
 * Searches imageConcept text for keywords matching visual metaphor templates.
 * Returns the first matching template key, or undefined if no match.
 */
export function resolveVisualMetaphor(
  imageConcept?: string
): string | undefined {
  if (!imageConcept) return undefined;

  const conceptLower = imageConcept.toLowerCase();
  const templateKeys = Object.keys(VISUAL_METAPHOR_TEMPLATES);

  for (const key of templateKeys) {
    const template = VISUAL_METAPHOR_TEMPLATES[key];
    if (!template) continue;

    // Check if any keyword from the template key or associated keywords match
    const keywords = key
      .split("_")
      .concat(template.keywords ?? [])
      .map((k: string) => k.toLowerCase());

    for (const keyword of keywords) {
      if (keyword.length >= 3 && conceptLower.includes(keyword)) {
        return key;
      }
    }
  }

  return undefined;
}

/**
 * Formats hex color values into descriptive prompt text.
 * E.g. "#FF6B6B" → "coral red (#FF6B6B)"
 */
export function formatBrandColors(colors: string[]): string {
  if (colors.length === 0) return "professional modern colors (auto-selected)";

  return colors
    .map((hex) => {
      const upper = hex.toUpperCase();
      const name = HEX_COLOR_NAMES[upper];
      return name ? `${name} (${upper})` : upper;
    })
    .join(", ");
}

// ── Internal Builders ────────────────────────────────────────

function buildSystemPrompt(): string {
  return IMAGE_SYSTEM_PROMPT;
}

function buildGeneratorPrompt(
  config: OrchestratorConfig,
  resolvedTokens: OrchestratedPrompt["resolvedTokens"]
): string {
  const { input, strategy, personaContext } = config;
  const profile = resolvedTokens.creativeProfile;

  const styleKey = (resolvedTokens.style ?? "minimal") as VisualStyle;
  const stylePreset = STYLE_PRESETS[styleKey] ?? STYLE_PRESETS["minimal"];
  const compositionKey = resolvedTokens.composition;
  const compositionRule =
    COMPOSITION_RULES[compositionKey] ?? COMPOSITION_RULES["rule_of_thirds"];
  const cameraKey = resolvedTokens.camera;
  const cameraPreset = CAMERA_PRESETS[cameraKey] ?? CAMERA_PRESETS["editorial"];
  const metaphorKey = resolvedTokens.metaphor;

  // Resolve Creative Director design tokens
  const lightingPreset = LIGHTING_PRESETS[profile.lightingDirection];
  const shadingPreset = SHADING_PRESETS[profile.shadingStyle];
  const imageStylePreset = IMAGE_STYLE_PRESETS[profile.imageStyle];
  const textStyleToken = TEXT_STYLE_PRESETS[profile.textStylePreference];
  const colorThemeDesc = COLOR_THEME_DESCRIPTIONS[profile.colorThemePreset];

  const primaryPlatform = input.platforms?.[0] ?? "instagram_post";
  const aspectRatio = resolvedTokens.aspectRatio;
  const ctaLabel = (input.ctas?.[0] ?? "none").replace(/_/g, " ");
  const toneLabel = (input.tones?.[0] ?? "professional").replace(/_/g, " ");

  // Resolve brand colors: user's palette > color theme palette > auto
  const userColors = input.brandAssets.colorPalette ?? [];
  const effectiveColors =
    userColors.length > 0
      ? userColors
      : profile.colorThemePreset !== "brand_colors"
        ? COLOR_THEME_PALETTES[profile.colorThemePreset] ?? []
        : [];
  const brandColors = formatBrandColors(effectiveColors);
  const fontFamily = input.brandAssets.fontFamily ?? "Montserrat";

  const sections: string[] = [];

  // ── BRAND CONTEXT ──
  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  // ── VISUAL IDENTITY ──
  sections.push(`## VISUAL IDENTITY
- Design System: ${stylePreset.base}
- Image Rendering Style: ${imageStylePreset.description}
- Lighting Direction: ${lightingPreset.description}
- Lighting Rig: ${lightingPreset.rig}
- Lighting Mood: ${lightingPreset.mood}
- Shading Style: ${shadingPreset.description}${shadingPreset.materialQuality ? `\n- Material Quality: ${shadingPreset.materialQuality}` : ""}
- Camera Treatment: ${stylePreset.camera}
- Mood & Atmosphere: ${stylePreset.mood}
- Color Theme: ${colorThemeDesc}
- Brand Colors: ${brandColors} — apply with ${stylePreset.colorDirection ?? "balanced prominence"}
- Typography: ${textStyleToken.description}
- Font Guidance: ${textStyleToken.fontGuidance}
- Platform: ${primaryPlatform} (${aspectRatio} aspect ratio)${primaryPlatform === "linkedin" ? "\n- LinkedIn Image Style: Thought leadership aesthetic. Clean, professional, minimal. No generic stock photo clichés. Prefer subtle gradients, abstract data visualization, or professional scene with clear typography space." : ""}`);

  // ── COMPOSITION DIRECTIVE ──
  sections.push(`## COMPOSITION DIRECTIVE
- Layout System: ${compositionRule.description}
- Subject Placement: ${compositionRule.subjectPlacement}
- Text Safe Zone: ${compositionRule.textSafeZone}
- Negative Space: ${stylePreset.negativeSpace ?? "Maintain generous breathing room around key elements"}`);

  // ── CONTENT CONTEXT ──
  const contentLines: string[] = [
    `## CONTENT CONTEXT`,
    `- Core Message: ${input.coreMessage}`,
    `- Post Angle: ${strategy.postAngle}`,
    `- Hook Idea: ${strategy.hookIdea}`,
    `- Visual Idea: ${strategy.visualIdea}`,
    `- CTA Type: ${ctaLabel}`,
    `- Tone: ${toneLabel}`,
  ];

  if (input.imageConcept) {
    contentLines.push(`\nUser's Visual Brief (FOLLOW THIS CLOSELY — this is the user's exact visual vision):\n"${input.imageConcept}"`);
  }

  if (metaphorKey) {
    const metaphorTemplate = VISUAL_METAPHOR_TEMPLATES[metaphorKey];
    if (metaphorTemplate) {
      contentLines.push(
        `\nVisual Metaphor Direction:\n${metaphorTemplate.description}`
      );
    }
  }

  sections.push(contentLines.join("\n"));

  // ── USER'S EXACT TEXT BLOCKS ──
  const textBlocks = input.textBlocks ?? [];
  if (textBlocks.length > 0) {
    const textBlockLines: string[] = [
      `## MANDATORY TEXT CONTENT`,
      `The user has provided EXACT text that MUST appear verbatim in the poster. Do NOT rewrite, rephrase, or replace these with alternatives.`,
      `Use these as the values for the corresponding JSON fields:`,
    ];
    for (const block of textBlocks) {
      if (!block.text.trim()) continue;
      const labelLower = block.label.toLowerCase();
      if (labelLower === "title") {
        textBlockLines.push(`- headline (EXACT): "${block.text}"`);
      } else if (labelLower === "subtitle") {
        textBlockLines.push(`- subtext (EXACT): "${block.text}"`);
      } else if (labelLower === "cta text" || labelLower === "cta") {
        textBlockLines.push(`- cta (EXACT): "${block.text}"`);
      } else {
        textBlockLines.push(`- ${block.label}: "${block.text}"`);
      }
    }
    textBlockLines.push(`\nIMPORTANT: The word count rules (3-6 words for headline, etc.) are WAIVED for user-provided text. Output these strings exactly as shown above.`);
    sections.push(textBlockLines.join("\n"));
  }

  // ── VISUAL INSPIRATION ──
  sections.push(`## VISUAL INSPIRATION
Camera & Technical:
- Focal Length: ${cameraPreset.focalLength}
- Aperture: ${cameraPreset.aperture}
- Lighting Rig: ${cameraPreset.lightingRig}
- Angle: ${cameraPreset.angle}

Image Style Quality:
${imageStylePreset.qualityModifiers.map((q: string) => `- ${q}`).join("\n")}

Design System Quality:
${(stylePreset.qualityModifiers ?? []).map((q: string) => `- ${q}`).join("\n")}

Texture Direction:
- ${stylePreset.texture ?? "Clean, professional surface treatment"}`);

  // ── YOUR TASK ──
  sections.push(`## YOUR TASK
You are a Poster Design AI and Creative Director. Create a complete poster concept for a social media post that will be generated by an AI image model.

The image model generates the ENTIRE poster — all text is baked directly into the image, not overlaid. Every design choice must support readability and visual impact.

TEXT LENGTH RULES (apply ONLY if user has NOT provided exact text in MANDATORY TEXT CONTENT above):
- Headline: exactly 3-6 words (short, punchy, memorable — count them)
- Subtext: exactly 5-12 words (supporting message — count them)
- CTA: exactly 2-4 words (action-oriented — count them)
If user provided MANDATORY TEXT CONTENT, use those EXACT strings and ignore word count limits.

Respond in EXACTLY this JSON format (no markdown, no extra text):
{
  "posterPrompt": "Brief visual concept description (2-3 sentences max, focus on mood, colors, composition)",
  "headline": "Use user's exact Title if provided, otherwise 3-6 word punchy headline",
  "subtext": "Use user's exact Subtitle if provided, otherwise 5-12 word supporting message",
  "cta": "Use user's exact CTA Text if provided, otherwise 2-4 word call to action",
  "layout": "hero_center",
  "typographyStyle": "modern_sans",
  "compositionNotes": "Specific visual composition instructions referencing camera angles, lighting, and design terms"
}

Layout options (pick the best for this content):
- hero_center: centered layout, dramatic impact, strong symmetry
- top_headline: headline at top with visual weight, content flows downward
- split_layout: text left + visual right, clean vertical division
- bottom_overlay: full visual background with gradient text overlay at bottom
- minimal_card: clean card-style with subtle shadow, minimal decoration

Typography style options:
- modern_sans: clean sans-serif, contemporary
- bold_serif: editorial, authoritative
- display_script: elegant, creative
- tech_mono: technical, developer-focused
- friendly_rounded: approachable, consumer

Design Rules:
- Match the resolved style: ${stylePreset.base}
- Render in ${imageStylePreset.description} style
- Use ${lightingPreset.description} lighting
- Apply ${shadingPreset.description} shading
- Follow ${textStyleToken.fontGuidance} typography
- If a User's Visual Brief is provided, build the compositionNotes around it — treat it as the primary visual direction
- Reference camera and lighting terms from the visual inspiration in your compositionNotes (e.g., "${cameraPreset.focalLength} perspective", "${lightingPreset.rig}")
- Maintain negative space: ${stylePreset.negativeSpace ?? "generous breathing room"}
- compositionNotes must describe colors, mood, imagery style, and spatial arrangement concretely
- Match the tone: ${toneLabel}
- ONLY return valid JSON`);

  return sections.join("\n\n");
}

function buildImageModelPromptTemplate(
  config: OrchestratorConfig,
  resolvedTokens: OrchestratedPrompt["resolvedTokens"]
): string {
  const { input } = config;
  const profile = resolvedTokens.creativeProfile;

  const styleKey = (resolvedTokens.style ?? "minimal") as VisualStyle;
  const stylePreset = STYLE_PRESETS[styleKey] ?? STYLE_PRESETS["minimal"];
  const cameraKey = resolvedTokens.camera;
  const cameraPreset = CAMERA_PRESETS[cameraKey] ?? CAMERA_PRESETS["editorial"];
  const compositionKey = resolvedTokens.composition;
  const compositionRule =
    COMPOSITION_RULES[compositionKey] ?? COMPOSITION_RULES["rule_of_thirds"];

  const userColors = input.brandAssets.colorPalette ?? [];
  const effectiveColors =
    userColors.length > 0
      ? userColors
      : profile.colorThemePreset !== "brand_colors"
        ? COLOR_THEME_PALETTES[profile.colorThemePreset] ?? []
        : [];
  const brandColors = formatBrandColors(effectiveColors);
  const fontInstruction = input.brandAssets.fontFamily
    ? `Use ${input.brandAssets.fontFamily} as the primary typeface.`
    : "Use a modern clean sans-serif typeface.";
  const aspectRatio = resolvedTokens.aspectRatio;
  const metaphorKey = resolvedTokens.metaphor;

  const lightingPreset = LIGHTING_PRESETS[profile.lightingDirection];
  const shadingPreset = SHADING_PRESETS[profile.shadingStyle];
  const imageStylePreset = IMAGE_STYLE_PRESETS[profile.imageStyle];
  const textStyleToken = TEXT_STYLE_PRESETS[profile.textStylePreference];
  const colorThemeDesc = COLOR_THEME_DESCRIPTIONS[profile.colorThemePreset];

  // This is a template — the real image prompt is built by buildFinalImagePrompt
  // which has the posterOutput available. Return a structural preview for debugging.
  return `[Template — call buildFinalImagePrompt(config, posterOutput) for the final prompt]

OUTPUT FORMAT: ${aspectRatio} aspect ratio social media graphic.
DESIGN STYLE: ${stylePreset.base}
IMAGE STYLE: ${imageStylePreset.description}
LIGHTING: ${lightingPreset.description}
LIGHTING RIG: ${lightingPreset.rig}
SHADING: ${shadingPreset.description}
CAMERA: ${cameraPreset.focalLength}, ${cameraPreset.aperture}, ${cameraPreset.lightingRig}
COLOR THEME: ${colorThemeDesc}
BRAND COLORS: ${brandColors} — ${stylePreset.colorDirection ?? "balanced"}
TYPOGRAPHY: ${textStyleToken.fontGuidance}
COMPOSITION: ${compositionRule.description}
NEGATIVE SPACE: ${stylePreset.negativeSpace ?? "generous"}
${metaphorKey ? `VISUAL METAPHOR: ${VISUAL_METAPHOR_TEMPLATES[metaphorKey]?.description ?? ""}` : ""}
QUALITY: ${imageStylePreset.qualityModifiers.join(", ")}
TEXTURE: ${stylePreset.texture ?? "clean professional"}`;
}

// ── Main Orchestrator ────────────────────────────────────────

/**
 * The main orchestration function. Takes structured user selections and maps them
 * through professional design tokens to produce high-quality, structured prompts.
 *
 * Pure function — no API calls, no side effects.
 */
export function orchestrateImagePrompt(
  config: OrchestratorConfig
): OrchestratedPrompt {
  const { input } = config;

  // ── Step 0: Resolve Creative Profile ──
  const creativeProfile = resolveCreativeProfile(input);

  // ── Step 1: Resolve Design Tokens ──
  // Use creative profile's visualStyle (which already respects priority layers)
  const styleKey = creativeProfile.visualStyle;

  // Ensure the style key exists in presets, fall back to "minimal"
  const resolvedStyle = STYLE_PRESETS[styleKey]
    ? styleKey
    : "minimal";

  const compositionKey = resolveComposition(
    resolvedStyle as VisualStyle,
    undefined,
    creativeProfile.compositionPreference
  );
  const cameraKey = resolveCameraPreset(resolvedStyle as VisualStyle);
  const metaphorKey = resolveVisualMetaphor(input.imageConcept);
  const { aspectRatio } = resolveAspectRatio(input);

  const resolvedTokens: OrchestratedPrompt["resolvedTokens"] = {
    style: resolvedStyle,
    composition: compositionKey,
    camera: cameraKey,
    metaphor: metaphorKey,
    aspectRatio,
    creativeProfile,
  };

  // ── Step 2: Build System Prompt ──
  const systemPrompt = buildSystemPrompt();

  // ── Step 3: Build Generator Prompt ──
  const generatorPrompt = buildGeneratorPrompt(config, resolvedTokens);

  // ── Step 4: Build Image Model Prompt (template) ──
  const imageModelPrompt = buildImageModelPromptTemplate(
    config,
    resolvedTokens
  );

  return {
    systemPrompt,
    generatorPrompt,
    imageModelPrompt,
    resolvedTokens,
  };
}

// ── Final Image Prompt Builder ───────────────────────────────

/**
 * Builds the final, complete prompt for the image generation model.
 * Called after the LLM has produced a PosterPromptOutput.
 *
 * Replaces the old `buildPosterPrompt` from posterPromptBuilder.ts.
 * Uses resolved design tokens for professional, consistent output.
 */
export function buildFinalImagePrompt(
  config: OrchestratorConfig,
  posterOutput: PosterPromptOutput
): string {
  const { input } = config;

  // Resolve creative profile for the final prompt (same as orchestrateImagePrompt)
  const creativeProfile = resolveCreativeProfile(input);

  // Resolve tokens inline
  const styleKey = creativeProfile.visualStyle;
  const resolvedStyle = STYLE_PRESETS[styleKey] ? styleKey : "minimal";
  const stylePreset =
    STYLE_PRESETS[resolvedStyle as VisualStyle] ?? STYLE_PRESETS["minimal"];

  const compositionKey = resolveComposition(
    resolvedStyle as VisualStyle,
    posterOutput.layout,
    creativeProfile.compositionPreference
  );
  const compositionRule =
    COMPOSITION_RULES[compositionKey] ?? COMPOSITION_RULES["rule_of_thirds"];

  const cameraKey = resolveCameraPreset(resolvedStyle as VisualStyle);
  const cameraPreset = CAMERA_PRESETS[cameraKey] ?? CAMERA_PRESETS["editorial"];

  const metaphorKey = resolveVisualMetaphor(input.imageConcept);

  const { aspectRatio, sizeDescription } = resolveAspectRatio(input);

  // Resolve Creative Director design tokens
  const lightingPreset = LIGHTING_PRESETS[creativeProfile.lightingDirection];
  const shadingPreset = SHADING_PRESETS[creativeProfile.shadingStyle];
  const imageStylePreset = IMAGE_STYLE_PRESETS[creativeProfile.imageStyle];
  const textStyleToken = TEXT_STYLE_PRESETS[creativeProfile.textStylePreference];
  const colorThemeDesc = COLOR_THEME_DESCRIPTIONS[creativeProfile.colorThemePreset];

  // Resolve brand colors: user's palette > color theme palette > auto
  const userColors = input.brandAssets.colorPalette ?? [];
  const effectiveColors =
    userColors.length > 0
      ? userColors
      : creativeProfile.colorThemePreset !== "brand_colors"
        ? COLOR_THEME_PALETTES[creativeProfile.colorThemePreset] ?? []
        : [];
  const brandColors = formatBrandColors(effectiveColors);
  const fontInstruction = input.brandAssets.fontFamily
    ? `Use ${input.brandAssets.fontFamily} as the primary typeface.`
    : textStyleToken.fontGuidance;

  // ── Resolve exact text from user's text blocks (if provided) ──
  const textBlocks = input.textBlocks ?? [];
  const userTitle = textBlocks.find((b) => b.label.toLowerCase() === "title")?.text?.trim();
  const userSubtitle = textBlocks.find((b) => b.label.toLowerCase() === "subtitle")?.text?.trim();
  const userCta = textBlocks.find(
    (b) => b.label.toLowerCase() === "cta text" || b.label.toLowerCase() === "cta"
  )?.text?.trim();

  // Use user's exact text if provided, otherwise fall back to LLM-generated output
  const headlineText = userTitle ?? posterOutput.headline;
  const subtextText = userSubtitle ?? posterOutput.subtext;
  const ctaText = userCta ?? posterOutput.cta;

  const logoSection = input.brandAssets.logoUrl
    ? `LOGO:\nPlace the provided brand logo in a clean professional position (bottom-right corner preferred).\nDo not distort or alter the logo. Incorporate it naturally into the poster design.`
    : `LOGO AREA:\nReserve the bottom-right corner for a brand logo placeholder.`;

  // Merge quality modifiers from both style preset and image style preset
  const allQualityModifiers = [
    ...new Set([
      ...(imageStylePreset.qualityModifiers ?? []),
      ...(stylePreset.qualityModifiers ?? []),
    ]),
  ];
  const qualityModifiers = allQualityModifiers
    .map((q: string) => `- ${q}`)
    .join("\n");

  const metaphorSection = metaphorKey
    ? `\nVISUAL METAPHOR:\n${VISUAL_METAPHOR_TEMPLATES[metaphorKey]?.description ?? ""}\nIntegrate this metaphorical direction into the overall visual concept.`
    : "";

  const imageConceptSection = input.imageConcept
    ? `\nUSER'S VISUAL BRIEF (PRIMARY DIRECTION — follow this closely):\n"${input.imageConcept}"\n`
    : "";

  // Build shading section (skip if "none")
  const shadingSection = creativeProfile.shadingStyle !== "none"
    ? `\nSHADING & MATERIAL:\n${shadingPreset.description}\nMaterial Quality: ${shadingPreset.materialQuality}`
    : "";

  return `Create a high-quality, professional social media poster. This is a COMPLETE FINISHED POSTER — all text must be clearly readable and embedded in the image.

OUTPUT FORMAT — CRITICAL SIZE REQUIREMENT:
Generate this image at EXACTLY ${sizeDescription}.
Aspect ratio MUST be ${aspectRatio} — do not crop, pad, letterbox, or alter this ratio under any circumstances.
${imageConceptSection}
IMAGE RENDERING STYLE:
${imageStylePreset.description}

DESIGN STYLE:
${stylePreset.base}

LIGHTING:
${lightingPreset.description}
Lighting Rig: ${lightingPreset.rig}
Lighting Mood: ${lightingPreset.mood}
${shadingSection}

COLOR THEME:
${colorThemeDesc}

BRAND COLORS:
Use these brand colors prominently: ${brandColors}
Color application: ${stylePreset.colorDirection ?? "balanced prominence across the design"}

TYPOGRAPHY:
${textStyleToken.description}
${fontInstruction}
Strong contrast between text and background.
Large, readable headline. All text must be crisp and legible.

TEXT ELEMENTS (render exactly as written — spelling and capitalization must be perfect):

HEADLINE (large, dominant text):
"${headlineText}"

SUBHEADLINE (smaller supporting text):
"${subtextText}"

CALL TO ACTION (button or emphasized text):
"${ctaText}"

${logoSection}

LAYOUT:
${compositionRule.description}
Subject placement: ${compositionRule.subjectPlacement}
Text safe zone: ${compositionRule.textSafeZone}
Poster layout style: ${posterOutput.layout.replace(/_/g, " ")}

VISUAL CONCEPT:
${posterOutput.compositionNotes}

TYPOGRAPHY STYLE:
${posterOutput.typographyStyle === "bold_serif" ? "Bold serif headline with editorial authority. Clean body text." : posterOutput.typographyStyle === "display_script" ? "Elegant script display headline. Clean supporting text." : posterOutput.typographyStyle === "tech_mono" ? "Technical monospace headline. Precise, developer-focused aesthetic." : posterOutput.typographyStyle === "friendly_rounded" ? "Rounded, approachable headline typography. Warm and consumer-friendly." : "Modern clean sans-serif. Strong weight hierarchy."}

TECHNICAL SPECS:
- Focal length feel: ${cameraPreset.focalLength}
- Depth of field: ${cameraPreset.aperture}
- Lighting setup: ${lightingPreset.rig}
- Viewing angle: ${cameraPreset.angle}
${metaphorSection}

QUALITY DIRECTION:
${qualityModifiers || "- Professional production quality\n- Print-ready resolution feel"}

TEXTURE:
${stylePreset.texture ?? "Clean, professional surface treatment"}

NEGATIVE SPACE:
${stylePreset.negativeSpace ?? "Maintain generous breathing room around key elements for visual balance"}

COMPOSITION RULES:
- Professional marketing poster layout with intentional visual hierarchy
- ${compositionRule.description}
- Text must be the primary focal point with clear reading order
- Background supports the message without competing for attention
- High production value — ready to post immediately

CRITICAL REQUIREMENTS:
- IMAGE DIMENSIONS: Output MUST be ${sizeDescription}. Aspect ratio MUST be ${aspectRatio}. This is non-negotiable.
- ALL text must be spelled correctly and exactly as written above
- Headline must be the largest text element with dominant visual weight
- Strong contrast between text color and background (minimum WCAG AA)
- Do not add any other text beyond what is specified above
- The poster must look professionally designed by a senior creative director
- Maintain negative space discipline — do not fill every inch of the canvas

OUTPUT:
A polished, complete social media graphic ready to post. No placeholder elements. No watermarks. No artifacts.`;
}

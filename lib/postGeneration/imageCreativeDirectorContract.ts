import type {
  ContentStrategyOutput,
  ImageCreativeDirectorOutput,
  PosterPromptOutput,
  PostGenerationInput,
} from "../types/postGeneration";

function sanitizeText(value: string | undefined, fallback = "None"): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function normalizeCreativeDirectorOutput(value: unknown): ImageCreativeDirectorOutput | null {
  if (typeof value !== "object" || value === null) return null;
  const asRecord = value as Record<string, unknown>;

  const creativeDirectionSummary =
    typeof asRecord.creativeDirectionSummary === "string"
      ? asRecord.creativeDirectionSummary.trim()
      : "";
  const renderPrompt =
    typeof asRecord.renderPrompt === "string" ? asRecord.renderPrompt.trim() : "";
  const copyPlacementPlan =
    typeof asRecord.copyPlacementPlan === "string"
      ? asRecord.copyPlacementPlan.trim()
      : "";
  const visualConstraints = normalizeArray(asRecord.visualConstraints);
  const riskWarnings = normalizeArray(asRecord.riskWarnings);

  if (!creativeDirectionSummary || !renderPrompt || !copyPlacementPlan) {
    return null;
  }

  return {
    creativeDirectionSummary,
    renderPrompt,
    copyPlacementPlan,
    visualConstraints,
    riskWarnings,
  };
}

export function buildCreativeDirectorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  imagePrompt?: PosterPromptOutput,
): string {
  const textBlocks = (input.textBlocks ?? [])
    .map((block) => `- ${block.label}: ${sanitizeText(block.text, "")}`)
    .filter((line) => !line.endsWith(": "))
    .join("\n");

  const referenceImages = (input.referenceImages ?? [])
    .map((img) => `- ${sanitizeText(img.label, "Reference")}`)
    .join("\n");

  const palette = (input.brandAssets.colorPalette ?? []).join(", ") || "No explicit palette";
  const visualStyles = (input.visualStyles ?? []).join(", ") || "Auto";
  const tones = (input.tones ?? []).join(", ") || "Auto";
  const platforms = (input.platforms ?? []).join(", ") || "linkedin";
  const selectedVisualStyleStack = (input.visualStyles ?? [])
    .map((style) => style.replace(/_/g, " "))
    .join(", ") || "Auto";
  const styleControls = [
    input.imageStyle ? `imageStyle=${input.imageStyle}` : "",
    input.lightingDirection ? `lightingDirection=${input.lightingDirection}` : "",
    input.shadingStyle ? `shadingStyle=${input.shadingStyle}` : "",
    input.compositionPreference ? `compositionPreference=${input.compositionPreference}` : "",
    input.textStylePreference ? `textStylePreference=${input.textStylePreference}` : "",
    input.colorThemePreset ? `colorThemePreset=${input.colorThemePreset}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `You are a senior creative director AI that upgrades image-generation prompts for social campaign posters.

You will receive a complete post context. Produce a stronger final render prompt that incorporates every available detail.

POST CONTEXT
- Core message: ${sanitizeText(input.coreMessage)}
- Objective: ${sanitizeText(input.objective)}
- Platforms: ${platforms}
- Strategy post angle: ${sanitizeText(strategy.postAngle)}
- Strategy hook idea: ${sanitizeText(strategy.hookIdea)}
- Strategy content structure: ${sanitizeText(strategy.contentStructure)}
- Strategy visual idea: ${sanitizeText(strategy.visualIdea)}
- Talking points: ${strategy.talkingPoints.join(" | ")}
- Existing image prompt headline: ${sanitizeText(imagePrompt?.headline)}
- Existing image prompt subtext: ${sanitizeText(imagePrompt?.subtext)}
- Existing image prompt cta: ${sanitizeText(imagePrompt?.cta)}
- Existing master visual prompt: ${sanitizeText(imagePrompt?.masterPrompt)}
- Existing composition notes: ${sanitizeText(imagePrompt?.compositionNotes)}

COPY DETAILS (include all where useful)
${textBlocks || "- None provided"}

VISUAL DIRECTION
- Visual styles: ${visualStyles}
- Selected visual style stack: ${selectedVisualStyleStack}
- Tone: ${tones}
- Style controls: ${styleControls || "Auto"}
- Image concept: ${sanitizeText(input.imageConcept)}
- Image references text: ${sanitizeText(input.imageReferences)}
- Color palette hex: ${palette}
- Font family: ${sanitizeText(input.brandAssets.fontFamily, "Auto")}
- Logo selected: ${input.brandAssets.logoUrl ? "yes" : "no"}
- Reference images:
${referenceImages || "- None provided"}

OUTPUT RULES
- Return only valid JSON.
- Do not wrap in markdown.
- renderPrompt must be rich, concrete, and include composition, lighting, materials, mood, and brand color use.
- If multiple visual styles are present, synthesize them into one premium visual language instead of listing them separately.
- Make the renderPrompt detailed enough that the final poster prompt can be executed without guesswork.
- Include guidance to preserve readability for overlaid copy and logo.

Return exactly this shape:
{
  "creativeDirectionSummary": "2-4 sentences",
  "renderPrompt": "high fidelity final prompt",
  "copyPlacementPlan": "short plan for headline/subtext/cta/logo positioning",
  "visualConstraints": ["constraint 1", "constraint 2"],
  "riskWarnings": ["risk 1", "risk 2"]
}`;
}


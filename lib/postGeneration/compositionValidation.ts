import type { CreativeHandoffV2, ImageVariation, PostGenerationInput, PostPackage } from "@/lib/types/postGeneration";

export function buildRenderSettingsFromCreativeHandoff(
  creativeHandoff: CreativeHandoffV2 | undefined,
  input?: PostGenerationInput,
): PostPackage["renderSettings"] | undefined {
  if (!creativeHandoff) return undefined;

  return {
    templateId: creativeHandoff.layoutBrief.templateId,
    alignment: creativeHandoff.layoutBrief.alignment,
    textTheme: creativeHandoff.layoutBrief.textTheme,
    safeArea: creativeHandoff.layoutBrief.safeArea,
    overlay: creativeHandoff.layoutBrief.overlay,
    exportSizeId: input?.imageSize,
    logoVisible: Boolean(input?.brandAssets.logoUrl),
  };
}

export function resolveSelectedVariation(
  imageVariations: ImageVariation[] | undefined,
  selectedImageVariationId: number | undefined,
): ImageVariation | null {
  if (!imageVariations || imageVariations.length === 0) return null;
  return imageVariations.find((item) => item.id === selectedImageVariationId) ?? imageVariations[0] ?? null;
}

export function validateComposedPostPackage(args: {
  creativeHandoff?: CreativeHandoffV2;
  imageUrl?: string;
  imageVariations?: ImageVariation[];
  selectedImageVariationId?: number;
}): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!args.creativeHandoff) errors.push("Missing creative handoff");
  if (!args.imageUrl && (!args.imageVariations || args.imageVariations.length === 0)) {
    errors.push("Missing generated background image");
  }

  if (args.imageVariations?.length && args.selectedImageVariationId !== undefined) {
    const exists = args.imageVariations.some((item) => item.id === args.selectedImageVariationId);
    if (!exists) errors.push("Selected image variation does not exist");
  }

  const headline = args.creativeHandoff?.copyBrief.headline?.trim() ?? "";
  const subtext = args.creativeHandoff?.copyBrief.subtext?.trim() ?? "";
  const cta = args.creativeHandoff?.copyBrief.cta?.trim() ?? "";

  if (!headline) errors.push("Missing headline for composition");
  if (!subtext) errors.push("Missing subtext for composition");
  if (!cta) errors.push("Missing CTA for composition");
  if (headline.length > 120) errors.push("Headline is too long for composition");
  if (subtext.length > 220) errors.push("Subtext is too long for composition");
  if (cta.length > 40) errors.push("CTA is too long for composition");

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

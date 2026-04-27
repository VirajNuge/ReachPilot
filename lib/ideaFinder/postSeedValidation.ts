// ============================================================
// Idea Finder — Shared Post-Seed Validation
// Single source of truth used by both client modal and API route.
// ============================================================

import type { PostGenerationInput } from "@/lib/types/postGeneration";

const FULL_POST_PLATFORMS = [
  "linkedin",
  "x",
  "instagram_post",
  "facebook",
  "pinterest",
  "threads",
] as const;

const ALLOWED_TEXT_BLOCK_LABELS = new Set(["Title", "Subtitle", "Body", "CTA", "Tagline"]);

export type ValidationSeverity = "error" | "warning";

export interface PostSeedValidationError {
  field: string;
  message: string;
  severity: ValidationSeverity;
}

export interface PostSeedValidationResult {
  valid: boolean;
  errors: PostSeedValidationError[];
}

// ---- Helpers ----

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9A-Fa-f]{6})$/.test(value.trim());
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

// ---- Core validator ----

export function validatePostSeed(
  seed: unknown,
): PostSeedValidationResult {
  const errors: PostSeedValidationError[] = [];

  if (typeof seed !== "object" || seed === null) {
    errors.push({ field: "postSeed", message: "Post seed is missing or not an object", severity: "error" });
    return { valid: false, errors };
  }

  const s = seed as Partial<PostGenerationInput>;

  // --- Required: Strategy Core ---
  if (!isNonEmptyString(s.objective)) {
    errors.push({ field: "objective", message: "Objective is required", severity: "error" });
  }
  if (!isNonEmptyArray(s.targetAudiences)) {
    errors.push({ field: "targetAudiences", message: "At least one target audience is required", severity: "error" });
  }
  if (!isNonEmptyString(s.coreMessage)) {
    errors.push({ field: "coreMessage", message: "Core message is required", severity: "error" });
  } else if (s.coreMessage.trim().length < 60) {
    errors.push({ field: "coreMessage", message: "Core message should be detailed (at least 60 characters)", severity: "warning" });
  }
  if (!isNonEmptyArray(s.platforms)) {
    errors.push({ field: "platforms", message: "At least one platform is required", severity: "error" });
  }

  // --- Required: Creative Base ---
  if (!isNonEmptyString(s.brandType)) {
    errors.push({ field: "brandType", message: "Brand type is required", severity: "error" });
  }
  if (!isNonEmptyArray(s.visualStyles)) {
    errors.push({ field: "visualStyles", message: "At least one visual style is required", severity: "error" });
  }
  if (!isNonEmptyString(s.imageGenType)) {
    errors.push({ field: "imageGenType", message: "Image generation type is required", severity: "error" });
  }

  // --- Required: Brand Assets ---
  if (!s.brandAssets || typeof s.brandAssets !== "object") {
    errors.push({ field: "brandAssets", message: "Brand assets are required", severity: "error" });
  } else {
    if (!isNonEmptyArray(s.brandAssets.colorPalette)) {
      errors.push({ field: "brandAssets.colorPalette", message: "At least one brand color is required", severity: "error" });
    } else {
      const invalidColor = s.brandAssets.colorPalette.find((c) => !isHexColor(c));
      if (invalidColor) {
        errors.push({ field: "brandAssets.colorPalette", message: "Color palette must use valid hex colors (e.g. #0052FF)", severity: "error" });
      }
      if (s.brandAssets.colorPalette.length < 3) {
        errors.push({ field: "brandAssets.colorPalette", message: "Use at least 3 colors for stronger visual guidance", severity: "warning" });
      }
    }
    if (typeof s.brandAssets.watermark !== "boolean") {
      errors.push({ field: "brandAssets.watermark", message: "Watermark setting is required", severity: "error" });
    }
  }

  // --- Required: Writing Controls ---
  if (!isNonEmptyArray(s.tones)) {
    errors.push({ field: "tones", message: "At least one tone is required", severity: "error" });
  }
  if (!isNonEmptyArray(s.ctas)) {
    errors.push({ field: "ctas", message: "At least one CTA type is required", severity: "error" });
  }
  if (!isNonEmptyString(s.emojiLevel)) {
    errors.push({ field: "emojiLevel", message: "Emoji level is required", severity: "error" });
  }
  if (!isNonEmptyString(s.hashtagIntensity)) {
    errors.push({ field: "hashtagIntensity", message: "Hashtag intensity is required", severity: "error" });
  }
  if (!isNonEmptyString(s.selectedTemplateId)) {
    errors.push({ field: "selectedTemplateId", message: "Template selection is required for handoff", severity: "error" });
  }

  // Inputs-tab constraints: if all platforms are represented, every platform must have a template id.
  const platforms = Array.isArray(s.platforms) ? s.platforms : [];
  const isAllPlatformSet = FULL_POST_PLATFORMS.every((platform) => platforms.includes(platform));
  if (isAllPlatformSet) {
    const map = s.platformTemplateIds;
    if (!map || typeof map !== "object") {
      errors.push({
        field: "platformTemplateIds",
        message: "Template mapping is required for all-platform mode",
        severity: "error",
      });
    } else {
      const missing = FULL_POST_PLATFORMS.filter((platform) => {
        const value = map[platform];
        return typeof value !== "string" || value.trim().length === 0;
      });

      if (missing.length > 0) {
        errors.push({
          field: "platformTemplateIds",
          message: `Template mapping is missing for: ${missing.join(", ")}`,
          severity: "error",
        });
      }
    }
  }

  // Inputs-tab constraints: allowed text block labels only.
  if (Array.isArray(s.textBlocks)) {
    const invalidLabels = s.textBlocks
      .map((block) => block?.label)
      .filter((label): label is string => typeof label === "string")
      .filter((label) => !ALLOWED_TEXT_BLOCK_LABELS.has(label));

    if (invalidLabels.length > 0) {
      errors.push({
        field: "textBlocks",
        message: `Only these text block labels are allowed: Title, Subtitle, Body, CTA, Tagline. Found invalid labels: ${Array.from(new Set(invalidLabels)).join(", ")}`,
        severity: "error",
      });
    }
  }

  // --- Warnings: Platform-conditional ---
  if (isNonEmptyArray(s.platforms) && s.platforms.includes("linkedin")) {
    if (!isNonEmptyString(s.linkedInPostType)) {
      errors.push({ field: "linkedInPostType", message: "LinkedIn post type recommended when LinkedIn is selected", severity: "warning" });
    }
    if (!isNonEmptyString(s.linkedInStyleProfile)) {
      errors.push({ field: "linkedInStyleProfile", message: "LinkedIn style profile recommended when LinkedIn is selected", severity: "warning" });
    }
  }

  // --- Warnings: High-value optional ---
  if (!isNonEmptyString(s.imageConcept)) {
    errors.push({ field: "imageConcept", message: "Image concept is required", severity: "error" });
  } else if (s.imageConcept.trim().length < 60) {
    errors.push({ field: "imageConcept", message: "Image concept should be detailed (at least 60 characters)", severity: "warning" });
  }
  if (!isNonEmptyString(s.captionStyle)) {
    errors.push({ field: "captionStyle", message: "Caption style helps fine-tune writing output", severity: "warning" });
  }

  const hasErrors = errors.some((e) => e.severity === "error");
  return { valid: !hasErrors, errors };
}

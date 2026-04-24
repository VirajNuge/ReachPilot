// ============================================================
// Idea Finder — Shared Post-Seed Validation
// Single source of truth used by both client modal and API route.
// ============================================================

import type { PostGenerationInput } from "@/lib/types/postGeneration";

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
    errors.push({ field: "imageConcept", message: "Image concept improves visual output quality", severity: "warning" });
  }
  if (!isNonEmptyString(s.captionStyle)) {
    errors.push({ field: "captionStyle", message: "Caption style helps fine-tune writing output", severity: "warning" });
  }

  const hasErrors = errors.some((e) => e.severity === "error");
  return { valid: !hasErrors, errors };
}

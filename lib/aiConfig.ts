// ============================================================
// ReachPilot — Central AI Configuration
// Change model IDs here to apply across all routes
// ============================================================

export const AI_MODELS = {
  /** Default text generation model used by all post-gen routes */
  TEXT: "gemini-2.5-flash",
  /** Image generation model (used in generate-image route) */
  IMAGE_DEFAULT: process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image",
} as const;

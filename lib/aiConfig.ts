// ============================================================
// ReachPilot — Central provider-neutral AI configuration.
// Values may be overridden through server-only environment variables.
// ============================================================

export const AI_MODELS = {
  /** Cheapest text model/router. Override with OPENROUTER_TEXT_MODEL. */
  TEXT: process.env.OPENROUTER_TEXT_MODEL ?? "openrouter/free",
  /** Vision-capable model/router. Override with OPENROUTER_VISION_MODEL. */
  VISION: process.env.OPENROUTER_VISION_MODEL ?? "openrouter/free",
  /** Dedicated image model. Override with OPENROUTER_IMAGE_MODEL. */
  IMAGE_DEFAULT: process.env.OPENROUTER_IMAGE_MODEL ?? "openai/gpt-image-2",
} as const;

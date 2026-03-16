// ============================================================
// ReachPilot — AI-Native Poster Prompt Builder
// Converts structured input → strict visual prompt for image models
// The AI generates the COMPLETE poster (text baked in, no overlay)
//
// Now delegates to the Prompt Orchestration Layer (promptOrchestrator.ts)
// for professional-grade design tokens and structured prompt assembly.
// ============================================================

import type {
  PostGenerationInput,
  ContentStrategyOutput,
  PosterPromptOutput,
} from "@/lib/types/postGeneration";

import {
  orchestrateImagePrompt,
  buildFinalImagePrompt,
} from "./promptOrchestrator";

import type { OrchestratorConfig } from "./promptOrchestrator";

// ── Re-export PLATFORM_ASPECT_RATIO for any external consumers ──

export const PLATFORM_ASPECT_RATIO: Record<string, string> = {
  instagram_post: "1:1",
  instagram_story: "9:16",
  linkedin: "16:9",
  x: "16:9",
  facebook: "16:9",
  tiktok: "9:16",
  pinterest: "2:3",
  youtube_community: "16:9",
};

// ── Orchestrated Prompt Builder (Generator Stage) ────────────

/**
 * Builds the LLM prompt that asks the AI to produce a PosterPromptOutput JSON.
 * This is called in the image-prompt API route before image generation.
 *
 * Now delegates to the Prompt Orchestration Layer for professional-grade
 * design tokens, composition rules, visual metaphors, and camera specs.
 *
 * @returns An object with `systemPrompt` and `generatorPrompt` for richer LLM instruction.
 */
export function buildPosterPromptGeneratorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): { systemPrompt: string; generatorPrompt: string } {
  const config: OrchestratorConfig = { input, strategy, personaContext };
  const orchestrated = orchestrateImagePrompt(config);

  return {
    systemPrompt: orchestrated.systemPrompt,
    generatorPrompt: orchestrated.generatorPrompt,
  };
}

// ── Orchestrated Prompt Builder (Image Model Stage) ──────────

/**
 * Builds the AI image generation prompt for a complete social media poster.
 * The AI model generates the entire poster — text is BAKED IN, not overlaid.
 *
 * Now delegates to the Prompt Orchestration Layer for rich design tokens,
 * camera presets, composition rules, and visual metaphor injection.
 *
 * @param input - The user's generation input (visual styles, brand assets, etc.)
 * @param posterOutput - The LLM-generated poster spec (headline, subtext, layout, etc.)
 * @param _aspectRatio - Deprecated parameter kept for backward compatibility; aspect ratio
 *                       is now resolved internally from input.platforms[0].
 */
export function buildPosterPrompt(
  input: PostGenerationInput,
  posterOutput: PosterPromptOutput,
  _aspectRatio?: string
): string {
  // Strategy is not available at this stage, but buildFinalImagePrompt
  // only uses it for token resolution which doesn't require strategy fields.
  // Provide a minimal strategy object so the orchestrator config is valid.
  const minimalStrategy: ContentStrategyOutput = {
    postAngle: "",
    hookIdea: "",
    contentStructure: "",
    visualIdea: "",
    talkingPoints: [],
  };

  const config: OrchestratorConfig = {
    input,
    strategy: minimalStrategy,
  };

  return buildFinalImagePrompt(config, posterOutput);
}

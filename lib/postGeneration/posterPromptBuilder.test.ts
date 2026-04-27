import { describe, expect, it } from "vitest";
import { buildPosterPrompt, buildPosterPromptGeneratorPrompt } from "./posterPromptBuilder";
import type {
  ContentStrategyOutput,
  ImageCreativeDirectorOutput,
  PostGenerationInput,
  PosterPromptOutput,
} from "./types/postGeneration";

const INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "Make the visual system feel premium.",
  platforms: ["linkedin"],
  brandType: "personal_brand",
  visualStyles: ["minimal", "modern_gradient"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: ["#0052FF"], watermark: false, fontFamily: "Inter" },
  tones: ["professional"],
  ctas: ["visit_link"],
  emojiLevel: "low",
  hashtagIntensity: "medium",
  textBlocks: [{ id: "title-1", label: "Title", text: "A cleaner creative system" }],
};

const STRATEGY: ContentStrategyOutput = {
  postAngle: "Creative clarity",
  hookIdea: "Great design should feel inevitable.",
  contentStructure: "Hook -> Insight -> CTA",
  visualIdea: "Editorial poster with gradient depth",
  talkingPoints: ["Clarity", "Mood", "Hierarchy"],
};

const POSTER_OUTPUT: PosterPromptOutput = {
  masterPrompt: "Base master prompt",
  posterPrompt: "Base poster prompt",
  headline: "Creative systems",
  subtext: "Design that feels intentional",
  cta: "Explore more",
  layout: "hero_center",
  typographyStyle: "modern_sans",
  compositionNotes: "Keep the center visually calm.",
};

const CREATIVE_DIRECTOR: ImageCreativeDirectorOutput = {
  creativeDirectionSummary: "Refine the visual language.",
  renderPrompt: "A premium editorial poster with luminous gradients and precise spacing.",
  copyPlacementPlan: "Headline top-left, CTA bottom-right.",
  visualConstraints: ["Preserve readability"],
  riskWarnings: ["Avoid crowding"],
};

describe("poster prompt builder", () => {
  it("passes selected visual styles into the generator master prompt instructions", () => {
    const { generatorPrompt } = buildPosterPromptGeneratorPrompt(INPUT, STRATEGY);

    expect(generatorPrompt).toContain("Selected Visual Styles: minimal, modern gradient");
    expect(generatorPrompt).toContain("Translate the chosen visual styles into a coherent art direction");
    expect(generatorPrompt).toContain("Minimum 400 words. Target 400–500 words.");
  });

  it("carries the chosen visual styles into the final poster prompt", () => {
    const prompt = buildPosterPrompt(INPUT, POSTER_OUTPUT, undefined, CREATIVE_DIRECTOR);

    expect(prompt).toContain("SELECTED VISUAL STYLE STACK:");
    expect(prompt).toContain("Visual style stack to preserve: minimal, modern gradient");
    expect(prompt).toContain("A premium editorial poster with luminous gradients and precise spacing.");
  });
});

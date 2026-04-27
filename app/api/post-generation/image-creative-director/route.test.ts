import { describe, expect, it } from "vitest";
import {
  buildCreativeDirectorPrompt,
  normalizeCreativeDirectorOutput,
} from "../../../../lib/postGeneration/imageCreativeDirectorContract";
import type {
  ContentStrategyOutput,
  PostGenerationInput,
  PosterPromptOutput,
} from "../../../../lib/types/postGeneration";

const INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "Teach a better social workflow.",
  platforms: ["linkedin"],
  brandType: "personal_brand",
  visualStyles: ["minimal"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: ["#0052FF"], watermark: false, fontFamily: "Inter" },
  tones: ["professional"],
  ctas: ["visit_link"],
  emojiLevel: "low",
  hashtagIntensity: "medium",
  textBlocks: [{ id: "title-1", label: "Title", text: "One brief, many channels" }],
  referenceImages: [{ id: "ref-1", dataUrl: "data:image/png;base64,AAA", label: "Team collaboration" }],
};

const STRATEGY: ContentStrategyOutput = {
  postAngle: "Workflow first",
  hookIdea: "Your process matters more than your ideas.",
  contentStructure: "Problem -> Workflow -> Result",
  visualIdea: "Clean operations dashboard",
  talkingPoints: ["Consistency", "Speed", "Quality"],
};

const IMAGE_PROMPT: PosterPromptOutput = {
  masterPrompt: "Base prompt",
  posterPrompt: "Poster prompt",
  headline: "Workflow wins",
  subtext: "System beats chaos",
  cta: "Start now",
  layout: "hero_center",
  typographyStyle: "modern_sans",
  compositionNotes: "Keep clear hierarchy",
};

describe("image creative director route helpers", () => {
  it("normalizes valid creative director output shape", () => {
    const normalized = normalizeCreativeDirectorOutput({
      creativeDirectionSummary: "Summary",
      renderPrompt: "Render prompt",
      copyPlacementPlan: "Placement",
      visualConstraints: ["Keep readable"],
      riskWarnings: ["Crowding risk"],
    });

    expect(normalized).toEqual({
      creativeDirectionSummary: "Summary",
      renderPrompt: "Render prompt",
      copyPlacementPlan: "Placement",
      visualConstraints: ["Keep readable"],
      riskWarnings: ["Crowding risk"],
    });
  });

  it("includes image prompt context in generated creative-director prompt", () => {
    const prompt = buildCreativeDirectorPrompt(INPUT, STRATEGY, IMAGE_PROMPT);

    expect(prompt).toContain("Existing image prompt headline: Workflow wins");
    expect(prompt).toContain("Existing composition notes: Keep clear hierarchy");
    expect(prompt).toContain("Style controls:");
  });
});


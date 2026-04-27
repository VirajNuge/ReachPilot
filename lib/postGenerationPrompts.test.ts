import { describe, expect, it } from "vitest";
import type { WritingStyleDocument } from "./models/adminStyles";
import type { CaptionTemplateDocument } from "./models/captionTemplates";
import { buildCaptionGeneratorPrompt } from "./postGenerationPrompts";
import type { ContentStrategyOutput, PostGenerationInput } from "./types/postGeneration";

const BASE_INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "Build a stronger content system.",
  platforms: ["linkedin", "x"],
  brandType: "personal_brand",
  visualStyles: ["minimal"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: [], watermark: false },
  tones: ["professional"],
  ctas: ["none"],
  emojiLevel: "medium",
  hashtagIntensity: "medium",
};

const BASE_STRATEGY: ContentStrategyOutput = {
  postAngle: "System over chaos",
  hookIdea: "Most teams don't need more ideas.",
  contentStructure: "Problem -> System -> CTA",
  visualIdea: "Simple workflow visual",
  talkingPoints: ["Consistency", "Velocity", "Quality"],
};

const GLOBAL_STYLE: WritingStyleDocument = {
  name: "Global style",
  description: "Global tone guidance.",
  toneProfile: { formalCasual: 50, seriousPlayful: 40, inspiringInformative: 50, dataDriven: 55 },
  sentenceLength: ["short"],
  emojiUsage: "minimal",
  hashtagIntensity: "medium",
  ctas: ["Ask question"],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const LINKEDIN_STYLE: WritingStyleDocument = {
  ...GLOBAL_STYLE,
  name: "LinkedIn style",
  description: "Platform-specific LinkedIn tone.",
};

const LINKEDIN_TEMPLATE: CaptionTemplateDocument = {
  name: "LinkedIn structure",
  description: "Template for LinkedIn",
  category: "thought_leadership",
  platforms: ["linkedin"],
  platformVariants: [{ platform: "linkedin", structure: "Hook\nInsight\nCTA" }],
  isBundle: false,
  matchKeywords: [],
  bestForObjectives: [],
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("buildCaptionGeneratorPrompt platform mapping", () => {
  it("injects platform-specific writing style overrides and template blocks", () => {
    const prompt = buildCaptionGeneratorPrompt(
      BASE_INPUT,
      BASE_STRATEGY,
      "",
      GLOBAL_STYLE,
      undefined,
      { linkedin: LINKEDIN_STYLE },
      { linkedin: LINKEDIN_TEMPLATE },
    );

    expect(prompt).toContain("WRITING STYLE: GLOBAL STYLE");
    expect(prompt).toContain("LINKEDIN WRITING STYLE OVERRIDE: LINKEDIN STYLE");
    expect(prompt).toContain("Template: LinkedIn structure");
  });
});


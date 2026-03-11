import { describe, expect, it } from "vitest";
import {
  buildChatbotContext,
  buildContentGenerationContext,
} from "./personaPromptBuilder";
import { PersonaDocument } from "./models/persona";

function makePersona(overrides: Partial<PersonaDocument> = {}): Partial<PersonaDocument> {
  return {
    personaName: "Alex Rivera",
    userRole: "Founder",
    industry: "B2B SaaS",
    tagline: "Make growth predictable",
    businessStage: "Scaling",
    scrapedWebsiteData: "Helps teams automate outbound prospecting",
    uniquePOV: "Outbound should feel human, not robotic",
    productsServices: "AI-powered outreach platform",
    credibilitySignals: "Built two startups, 100k followers",
    writingSamples: "I used to think volume won. It doesn't. Relevance does.",
    audienceRole: "Revenue leaders",
    audienceSegments: ["SaaS founders", "Sales managers"],
    painPoints: "low reply rates",
    audienceDesiredOutcome: "book more qualified demos",
    audienceGoals: ["increase pipeline", "shorten sales cycles"],
    primaryObjective: ["authority", "lead generation"],
    conversionGoal: "Book a strategy call",
    contentMix: ["educational", "case study"],
    toneSliders: {
      formalCasual: 50,
      seriousPlayful: 45,
      inspiringInformative: 60,
      dataDriven: 25,
    },
    writingStyle: "clear and tactical",
    emojiUsage: "light",
    influencerStyle: "Hormozi",
    contentThemes: ["cold outreach", "positioning"],
    coreValues: ["honesty", "consistency"],
    postingFrequency: "3x/week",
    doNotTalk: "politics",
    ...overrides,
  };
}

describe("buildContentGenerationContext", () => {
  it("returns empty string for empty persona object", () => {
    expect(buildContentGenerationContext({})).toBe("");
  });

  it("returns empty string for undefined/null", () => {
    expect(buildContentGenerationContext(undefined as unknown as Partial<PersonaDocument>)).toBe("");
    expect(buildContentGenerationContext(null as unknown as Partial<PersonaDocument>)).toBe("");
  });

  it("includes personaName and userRole in output", () => {
    const output = buildContentGenerationContext(makePersona());
    expect(output).toContain("Alex Rivera");
    expect(output).toContain("Founder");
  });

  it("includes uniquePOV when present and omits line when absent", () => {
    const withPov = buildContentGenerationContext(makePersona({ uniquePOV: "Bold POV" }));
    expect(withPov).toContain("Their unique take: Bold POV");

    const withoutPov = buildContentGenerationContext(makePersona({ uniquePOV: "" }));
    expect(withoutPov).not.toContain("Their unique take:");
  });

  it("converts tone slider 25 to very Formal", () => {
    const output = buildContentGenerationContext(
      makePersona({
        toneSliders: {
          formalCasual: 25,
          seriousPlayful: 50,
          inspiringInformative: 50,
          dataDriven: 50,
        },
      })
    );

    expect(output).toContain("very Formal");
  });

  it("converts tone slider 75 to slightly Casual", () => {
    const output = buildContentGenerationContext(
      makePersona({
        toneSliders: {
          formalCasual: 75,
          seriousPlayful: 50,
          inspiringInformative: 50,
          dataDriven: 50,
        },
      })
    );

    expect(output).toContain("slightly Casual");
  });

  it("converts tone slider 50 to balanced Formal/Casual", () => {
    const output = buildContentGenerationContext(
      makePersona({
        toneSliders: {
          formalCasual: 50,
          seriousPlayful: 50,
          inspiringInformative: 50,
          dataDriven: 50,
        },
      })
    );

    expect(output).toContain("balanced Formal/Casual");
  });

  it("includes writing samples section when present", () => {
    const output = buildContentGenerationContext(
      makePersona({ writingSamples: "Example writing sample" })
    );
    expect(output).toContain("## WRITING EXAMPLES (match this voice exactly)");
    expect(output).toContain("Example writing sample");
  });

  it("omits doNotTalk line when doNotTalk is empty", () => {
    const output = buildContentGenerationContext(makePersona({ doNotTalk: "   " }));
    expect(output).not.toContain("NEVER discuss:");
  });

  it("handles missing toneSliders gracefully", () => {
    const output = buildContentGenerationContext(makePersona({ toneSliders: undefined }));
    expect(output).toContain("## VOICE & TONE");
    expect(output).not.toContain("- Tone:");
  });

  it("joins array fields like contentThemes with commas", () => {
    const output = buildContentGenerationContext(
      makePersona({ contentThemes: ["theme one", "theme two", "theme three"] })
    );
    expect(output).toContain("Themes: theme one, theme two, theme three");
  });
});

describe("buildChatbotContext", () => {
  it("returns shorter output than content generation context", () => {
    const persona = makePersona();
    const full = buildContentGenerationContext(persona);
    const short = buildChatbotContext(persona);

    expect(short.length).toBeLessThan(full.length);
    expect(short).toContain("You are assisting Alex Rivera");
  });
});

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { AI_MODELS } from "@/lib/aiConfig";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { parseAIJson } from "@/lib/parseAIJson";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import type {
  ContentStrategyOutput,
  LayoutStyle,
  PosterPromptOutput,
  PostGenerationInput,
} from "@/lib/types/postGeneration";
import { requireAuth } from "@/lib/withAuth";

function firstTextBlock(input: PostGenerationInput, labels: string[]): string | undefined {
  return input.textBlocks
    ?.find((block) => labels.includes(block.label.toLowerCase().trim()))
    ?.text?.trim();
}

function buildPosterPromptPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext: string,
): string {
  const platform = input.platforms[0] ?? "linkedin";
  const tone = (input.tones[0] ?? "professional").replace(/_/g, " ");
  const visualStyle = (input.visualStyles[0] ?? "minimal").replace(/_/g, " ");
  const title = firstTextBlock(input, ["title", "headline"]);
  const subtitle = firstTextBlock(input, ["subtitle", "subtext"]);
  const ctaText = firstTextBlock(input, ["cta", "cta text"]);
  const colors = input.brandAssets.colorPalette.length > 0
    ? input.brandAssets.colorPalette.join(", ")
    : "brand-aligned accent colors";

  return [
    "You are ReachPilot's AI poster director.",
    "Generate a finished social media poster plan for one-shot image generation.",
    "Return only JSON.",
    "",
    "NON-NEGOTIABLE RULES:",
    "- The final image model will generate the complete poster in one shot.",
    "- The poster must include the actual headline, subtext, CTA, and logo placement if provided.",
    "- Do not include any extra text beyond the requested copy.",
    "- Keep spelling and capitalization precise.",
    "",
    "TASK:",
    "Design a high-quality final poster spec for a social media campaign asset.",
    "The poster should feel cinematic, premium, and campaign-ready.",
    "",
    `PRIMARY PLATFORM: ${platform}`,
    `CORE MESSAGE: ${input.coreMessage}`,
    `POST ANGLE: ${strategy.postAngle}`,
    `HOOK IDEA: ${strategy.hookIdea}`,
    `CONTENT STRUCTURE: ${strategy.contentStructure}`,
    `VISUAL IDEA: ${strategy.visualIdea}`,
    `TONE: ${tone}`,
    `VISUAL STYLE: ${visualStyle}`,
    `BRAND COLORS: ${colors}`,
    `IMAGE CONCEPT: ${input.imageConcept?.trim() || "Generate the strongest concept from the context."}`,
    `IMAGE REFERENCES: ${input.imageReferences?.trim() || "None provided"}`,
    input.brandAssets.fontFamily ? `FONT FAMILY: ${input.brandAssets.fontFamily}` : "FONT FAMILY: Auto",
    title ? `USER TITLE (use exactly): ${title}` : "USER TITLE: none",
    subtitle ? `USER SUBTITLE (use exactly): ${subtitle}` : "USER SUBTITLE: none",
    ctaText ? `USER CTA (use exactly): ${ctaText}` : "USER CTA: none",
    personaContext ? `PERSONA CONTEXT:\n${personaContext}` : "PERSONA CONTEXT: none",
    "",
    "QUALITY BAR:",
    "- The full poster should feel specific, not generic.",
    "- Use the brand colors in both scene mood and graphic treatment.",
    "- Prefer a clear focal subject and a believable environment.",
    "- Make the poster look deliberately designed, not like a raw photo.",
    "- Avoid cliché scenes like handshakes, light bulbs, generic laptops, stock-office poses, and cheesy growth arrows.",
    "",
    "COPY RULES:",
    title ? "- Use the exact user title as the headline." : "- Headline should be short and punchy.",
    subtitle ? "- Use the exact user subtitle as the subtext." : "- Subtext should be concise and supportive.",
    ctaText ? "- Use the exact user CTA." : "- CTA should be short and action-oriented.",
    "",
    "JSON FORMAT:",
    '{"masterPrompt":"100-200 word cinematic full-poster brief","posterPrompt":"","headline":"3-8 words or exact provided text","subtext":"5-16 words or exact provided text","cta":"2-6 words or exact provided text","layout":"hero_center","typographyStyle":"modern_sans","compositionNotes":"1-2 sentences on text placement, logo integration, and readability"}',
  ].join("\n");
}

/**
 * Load persona context text and return persona document for brand asset merging.
 */
async function loadPersonaData(userId: string, accountId?: string): Promise<{
  personaContext: string;
  colorPalette: string[];
  fontFamily: string;
  logoUrl: string;
}> {
  try {
    const persona = await getPersonaByUserAndAccount(userId, accountId);
    if (!persona) return { personaContext: "", colorPalette: [], fontFamily: "", logoUrl: "" };

    const personaContext = buildContentGenerationContext(persona);
    const colorPalette =
      persona.colorPalette?.length
        ? persona.colorPalette
        : persona.brandColorHex
          ? [persona.brandColorHex]
          : [];

    return {
      personaContext,
      colorPalette,
      fontFamily: persona.fontFamily ?? "",
      logoUrl: persona.logoUrl ?? "",
    };
  } catch {
    return { personaContext: "", colorPalette: [], fontFamily: "", logoUrl: "" };
  }
}

/**
 * Auto-generate a visual image concept from post inputs using a fast LLM call.
 * Called when the user leaves the "Image Concept" field blank.
 */
async function autoGenerateImageConcept(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  genAI: GoogleGenerativeAI,
): Promise<string> {
  const platform = input.platforms?.[0] ?? "linkedin";
  const tone = (input.tones?.[0] ?? "professional").replace(/_/g, " ");
  const style = (input.visualStyles?.[0] ?? "minimal").replace(/_/g, " ");
  const colors = input.brandAssets.colorPalette.length
    ? input.brandAssets.colorPalette.join(", ")
    : "the brand's signature colors";

  const textBlocks = input.textBlocks ?? [];
  const titleBlock = textBlocks.find((b) => b.label.toLowerCase() === "title")?.text?.trim();
  const subtitleBlock = textBlocks.find((b) => b.label.toLowerCase() === "subtitle")?.text?.trim();

  const conceptPrompt = `You are a world-class creative director and AI image prompt engineer specializing in social media marketing.

The user left the "Image Concept" field blank. Your job is to invent a visually stunning, unexpected, and highly specific scene concept for their post. Do NOT be generic. Think deeply before writing.

CREATIVE REASONING — do this mentally before writing:
1. What is the core FEELING of this post? (not the words — the emotion)
2. What unexpected visual metaphor, scale contrast, or slightly surreal scene could convey that feeling?
3. What specific world does this brand live in? Make it cinematic and specific.
4. How do the brand colors live in this scene as light, material, or atmosphere — NOT as flat fills?

POST DETAILS:
- Core Message: ${input.coreMessage}
- Platform: ${platform}
- Post Angle: ${strategy.postAngle}
- Visual Strategy from AI: ${strategy.visualIdea}
- Tone: ${tone}
- Visual Style: ${style}
- Brand Colors: ${colors}
${titleBlock ? `- Post Title: ${titleBlock}` : ""}
${subtitleBlock ? `- Post Subtitle: ${subtitleBlock}` : ""}

OUTPUT REQUIREMENTS:
- Write 3-4 sentences of flowing cinematic scene description (NOT a bullet list)
- Include: [Subject] in [specific environment] under [specific lighting] — make it feel like a film still
- Weave the brand colors (${colors}) into the scene as light gels, reflections, glowing elements, or atmospheric haze — never as flat color blocks
- Use unexpected visual metaphors — avoid the literal (no laptops, handshakes, light bulbs, or generic offices)
- Include at least one specific material or texture detail (e.g., "matte obsidian concrete", "brushed titanium", "rain-slicked glass")
- Include a specific lens/lighting feel (e.g., "shot at f/1.4 on an 85mm lens", "backlit by a neon glow")
- Suitable for professional social media marketing but visually arresting
- Output the scene description ONLY — no preamble, no explanation, no quotation marks`;

  const model = genAI.getGenerativeModel({
    model: AI_MODELS.TEXT,
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 512,
    },
  } as Parameters<typeof genAI.getGenerativeModel>[0]);
  try {
    const result = await model.generateContent(conceptPrompt);
    return result.response.text().trim();
  } catch {
    return "";
  }
}

const VALID_LAYOUTS = ["hero_center", "top_headline", "split_layout", "bottom_overlay", "minimal_card"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceNonEmptyString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function trimToWordLimit(value: string, maxWords: number): string {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

function buildFallbackPosterPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
): PosterPromptOutput {
  const primaryPlatform = input.platforms[0] ?? "linkedin";
  const primaryColor = input.brandAssets.colorPalette[0] ?? "#111827";
  const visualStyle = (input.visualStyles[0] ?? "minimal").replace(/_/g, " ");
  const tone = (input.tones[0] ?? "professional").replace(/_/g, " ");

  const masterPrompt = [
    `Create a polished ${visualStyle} social media poster for ${primaryPlatform}.`,
    `Center the visual around "${strategy.postAngle || input.coreMessage}" with a ${tone} tone.`,
    `Use ${primaryColor} as the lead brand accent, clean composition, premium lighting, and strong editorial hierarchy.`,
    `The final artwork should feel campaign-ready and readable in-feed with visible text and any provided logo integrated into the design.`,
  ].join(" ");

  return {
    masterPrompt,
    posterPrompt: masterPrompt,
    headline: coerceNonEmptyString(strategy.postAngle, input.coreMessage.slice(0, 72) || "Generated post"),
    subtext: coerceNonEmptyString(strategy.visualIdea, strategy.contentStructure || input.coreMessage.slice(0, 96)),
    cta: input.ctas[0] === "none" ? "Learn more" : "Read more",
    layout: "hero_center",
    typographyStyle: "modern_sans",
    compositionNotes: "Keep the hierarchy clean with one focal element and readable text placement. Integrate the logo cleanly if it exists.",
  };
}

function normalizePosterPromptOutput(
  value: unknown,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
): PosterPromptOutput | null {
  if (!isObject(value)) return null;

  const masterPrompt = coerceNonEmptyString(value.masterPrompt, coerceNonEmptyString(value.posterPrompt));
  const posterPrompt = coerceNonEmptyString(value.posterPrompt, masterPrompt);
  const headline = trimToWordLimit(
    coerceNonEmptyString(value.headline, strategy.postAngle || input.coreMessage.slice(0, 72) || "Generated post"),
    8,
  );
  const subtext = coerceNonEmptyString(
    value.subtext,
    strategy.visualIdea || strategy.contentStructure || input.coreMessage.slice(0, 96),
  );
  const cta = trimToWordLimit(
    coerceNonEmptyString(value.cta, input.ctas[0] === "none" ? "Learn more" : "Read more"),
    6,
  );
  const layout: LayoutStyle = typeof value.layout === "string" && VALID_LAYOUTS.includes(value.layout as typeof VALID_LAYOUTS[number])
    ? (value.layout as LayoutStyle)
    : "hero_center";
  const typographyStyle = coerceNonEmptyString(value.typographyStyle, "modern_sans");
  const compositionNotes = coerceNonEmptyString(
    value.compositionNotes,
    "Keep the hierarchy clean with one focal element and readable text placement. Integrate the logo cleanly if it exists.",
  );

  if (!masterPrompt) return null;

  return {
    masterPrompt,
    posterPrompt,
    headline,
    subtext: trimToWordLimit(subtext, 16),
    cta,
    layout,
    typographyStyle,
    compositionNotes,
  };
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const body = (await req.json()) as {
      input?: PostGenerationInput;
      strategy?: ContentStrategyOutput;
      accountId?: string;
      includePersona?: boolean;
    };

    if (!body.input || !body.strategy) {
      return NextResponse.json({ error: "input and strategy are required" }, { status: 400 });
    }

    const personaData = await loadPersonaData(userId, body.accountId);

    const mergedBrandAssets = { ...body.input.brandAssets };
    if (mergedBrandAssets.colorPalette.length === 0 && personaData.colorPalette.length > 0) {
      mergedBrandAssets.colorPalette = personaData.colorPalette;
    }
    if (!mergedBrandAssets.fontFamily && personaData.fontFamily) {
      mergedBrandAssets.fontFamily = personaData.fontFamily;
    }
    if (!mergedBrandAssets.logoUrl && personaData.logoUrl) {
      mergedBrandAssets.logoUrl = personaData.logoUrl;
    }

    const personaContext = body.includePersona ? personaData.personaContext : "";
    let mergedInput: PostGenerationInput = { ...body.input, brandAssets: mergedBrandAssets };

    const genAI = new GoogleGenerativeAI(apiKey);
    if (!mergedInput.imageConcept?.trim()) {
      const autoConcept = await autoGenerateImageConcept(mergedInput, body.strategy, genAI);
      if (autoConcept) {
        mergedInput = { ...mergedInput, imageConcept: autoConcept };
      }
    }

    const prompt = buildPosterPromptPrompt(mergedInput, body.strategy, personaContext);

    let imagePrompt: PosterPromptOutput;
    try {
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.TEXT,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
      } as Parameters<typeof genAI.getGenerativeModel>[0]);
      const result = await model.generateContent(prompt);
      const parsed = parseAIJson(result.response.text());
      imagePrompt = normalizePosterPromptOutput(parsed, mergedInput, body.strategy) ?? buildFallbackPosterPrompt(mergedInput, body.strategy);
    } catch (error) {
      console.error("Poster prompt generation error:", error);
      imagePrompt = buildFallbackPosterPrompt(mergedInput, body.strategy);
    }

    return NextResponse.json({ imagePrompt });
  } catch (error) {
    console.error("Image prompt route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

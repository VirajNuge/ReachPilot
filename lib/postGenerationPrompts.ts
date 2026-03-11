// ============================================================
// ReachPilot — AI Prompt Builders for Post Generation Pipeline
// 3 Stages: Content Strategist → Caption Generator → Image Prompt
// ============================================================

import type {
  PostGenerationInput,
  ContentStrategyOutput,
  PostPlatform,
  RemixStyle,
  PLATFORM_INTELLIGENCE,
} from "../types/postGeneration";
import {
  PLATFORM_INTELLIGENCE as PLATFORMS,
  POST_OBJECTIVE_LABELS,
  TARGET_AUDIENCE_LABELS,
  CONTENT_ANGLE_LABELS,
  TONE_LABELS,
  CTA_LABELS,
  VISUAL_STYLE_LABELS,
  BRAND_TYPE_LABELS,
} from "../types/postGeneration";

/**
 * Stage 1 — Content Strategist Prompt
 * Takes raw user input → produces post angle, hook, structure, visual idea, talking points
 */
export function buildContentStrategistPrompt(
  input: PostGenerationInput,
  personaContext?: string
): string {
  const objectiveLabel = POST_OBJECTIVE_LABELS[input.objective]?.label || input.objective;
  const primaryAudience = input.targetAudiences?.[0] ?? "general_audience";
  const audienceLabel =
    primaryAudience === "custom"
      ? input.customAudience || "Custom audience"
      : TARGET_AUDIENCE_LABELS[primaryAudience] || primaryAudience;
  const primaryAngle = input.contentAngles?.[0];
  const angleLabel = primaryAngle
    ? CONTENT_ANGLE_LABELS[primaryAngle]?.label
    : "Auto (best fit)";
  const toneLabel = TONE_LABELS[input.tones?.[0]]?.label || input.tones?.[0] || "";
  const platformNames = input.platforms
    .map((p) => PLATFORMS[p]?.name || p)
    .join(", ");

  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## CONTENT BRIEF
- Objective: ${objectiveLabel}
- Target Audience: ${audienceLabel}
- Core Message: ${input.coreMessage}
- Content Angle: ${angleLabel}
- Tone: ${toneLabel}
- Platforms: ${platformNames}`);

  sections.push(`## YOUR TASK
You are a Content Strategist AI. Analyze the brief above and produce a strategic content plan.

Respond in EXACTLY this JSON format:
{
  "postAngle": "The strategic angle for this post (e.g., 'Problem → Solution', 'Myth Busting', 'Social Proof')",
  "hookIdea": "A compelling hook idea that stops the scroll (1 sentence)",
  "contentStructure": "Brief description of the content flow (e.g., 'Hook → Problem → 3 Tips → CTA')",
  "visualIdea": "Description of the ideal visual to accompany this post",
  "talkingPoints": ["Point 1", "Point 2", "Point 3", "Point 4"]
}

Rules:
- The hook must be scroll-stopping and match the tone
- Talking points should be specific, not generic
- Visual idea should be concrete enough to generate an image
- Content structure must fit the platforms: ${platformNames}
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * Stage 2 — Caption Generator Prompt
 * Takes strategy output + input → produces platform-specific captions + hashtags
 */
export function buildCaptionGeneratorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## CONTENT STRATEGY
- Post Angle: ${strategy.postAngle}
- Hook: ${strategy.hookIdea}
- Structure: ${strategy.contentStructure}
- Talking Points:
${strategy.talkingPoints.map((p) => `  • ${p}`).join("\n")}`);

  const toneLabel = TONE_LABELS[input.tones?.[0]]?.label || input.tones?.[0] || "";
  const ctaLabel = CTA_LABELS[input.ctas?.[0]] || "None";

  sections.push(`## WRITING GUIDELINES
- Tone: ${toneLabel}
- CTA: ${ctaLabel}
- Emoji Level: ${input.emojiLevel}
- Hashtag Intensity: ${input.hashtagIntensity}`);

  // Build platform-specific instructions
  const platformInstructions = input.platforms.map((p) => {
    const intel = PLATFORMS[p];
    if (!intel) return "";
    return `### ${intel.name}
- Max Length: ${intel.captionRules.maxLength || "No limit"} characters
- Hashtags: ${intel.captionRules.hashtagRange[0]}-${intel.captionRules.hashtagRange[1]}
- Tone: ${intel.captionRules.toneGuidelines.join(", ")}
- Structure: ${intel.captionRules.structureRules.join("; ")}`;
  }).filter(Boolean);

  sections.push(`## PLATFORM RULES\n${platformInstructions.join("\n\n")}`);

  // Build expected JSON shape dynamically
  const captionFields = input.platforms
    .map((p) => `    "${p}": "Full caption for ${PLATFORMS[p]?.name || p}"`)
    .join(",\n");

  sections.push(`## YOUR TASK
You are a Caption Generator AI. Write platform-specific captions following the strategy and rules above.

Respond in EXACTLY this JSON format:
{
  "captions": {
${captionFields}
  },
  "hashtags": {
    "highReach": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "niche": ["#tag1", "#tag2", "#tag3"],
    "branded": ["#tag1", "#tag2"]
  }
}

Rules:
- Each caption MUST follow its platform's specific rules (length, tone, structure)
- Hashtags should be relevant, not generic
- High reach hashtags = broad audience (100K+ posts)
- Niche hashtags = targeted community (10K-100K posts)
- Branded hashtags = unique to the brand
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * Stage 3 — Image Prompt Generator
 * Takes strategy + visual identity → produces image generation prompt
 */
export function buildImagePromptGeneratorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  const styleLabel = VISUAL_STYLE_LABELS[input.visualStyles?.[0]]?.label || input.visualStyles?.[0] || "";
  const brandLabel = BRAND_TYPE_LABELS[input.brandType] || input.brandType;

  sections.push(`## VISUAL IDENTITY
- Brand Type: ${brandLabel}
- Visual Style: ${styleLabel}
- Image Type: ${input.imageGenType}
- Brand Colors: ${input.brandAssets.colorPalette.join(", ") || "Auto"}
- Font: ${input.brandAssets.fontFamily || "Auto"}`);

  sections.push(`## CONTENT CONTEXT
- Post Angle: ${strategy.postAngle}
- Hook: ${strategy.hookIdea}
- Visual Idea from Strategist: ${strategy.visualIdea}
- Core Message: ${input.coreMessage}`);

  sections.push(`## YOUR TASK
You are an Image Prompt Generator AI. Create a detailed image generation prompt and overlay text elements.

Respond in EXACTLY this JSON format:
{
  "prompt": "Detailed image generation prompt (describe the background, colors, style, mood, composition — DO NOT include text in the image prompt)",
  "headline": "3-6 word headline for text overlay (high-impact, scroll-stopping)",
  "subtext": "Short supporting text (1 line, optional)",
  "suggestedLayout": "Description of where elements should be placed (e.g., 'headline center, logo bottom-right, gradient from top')"
}

Rules:
- The image prompt should describe ONLY the visual background (no text in the AI-generated image)
- Text (headline, subtext, logo) will be overlaid by a canvas engine — not generated by AI
- Match the visual style: ${styleLabel}
- Use brand colors in the prompt: ${input.brandAssets.colorPalette.join(", ") || "modern, professional colors"}
- Headline must be 3-6 words, high contrast, memorable
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * Hook Generator Prompt — Generates 5 hook options
 */
export function buildHookGeneratorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const toneLabel = TONE_LABELS[input.tones?.[0]]?.label || input.tones?.[0] || "";

  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  const primaryAudience = input.targetAudiences?.[0] ?? "general_audience";
  sections.push(`## CONTENT CONTEXT
- Core Message: ${input.coreMessage}
- Post Angle: ${strategy.postAngle}
- Original Hook: ${strategy.hookIdea}
- Tone: ${toneLabel}
- Audience: ${primaryAudience === "custom" ? input.customAudience : TARGET_AUDIENCE_LABELS[primaryAudience]}`);

  sections.push(`## YOUR TASK
Generate 5 different hook options for this post. Each hook should use a different style.

Respond in EXACTLY this JSON format:
{
  "hooks": [
    { "id": "1", "text": "The hook text", "style": "Question" },
    { "id": "2", "text": "The hook text", "style": "Bold Statement" },
    { "id": "3", "text": "The hook text", "style": "Story Opener" },
    { "id": "4", "text": "The hook text", "style": "Statistic" },
    { "id": "5", "text": "The hook text", "style": "Contrarian" }
  ]
}

Rules:
- Each hook must be a different style (Question, Bold Statement, Story Opener, Statistic, Contrarian)
- Each hook should be 1-2 sentences max
- Hooks must match the tone: ${toneLabel}
- Hooks must be scroll-stopping
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * Content Score Prompt — Scores the post
 */
export function buildContentScorePrompt(
  caption: string,
  platform: string,
  headline: string
): string {
  return `## YOUR TASK
Score the following social media post content on a scale of 0-100 for each criterion.

## CONTENT TO SCORE
Platform: ${platform}
Caption: ${caption}
Headline: ${headline}

## SCORING CRITERIA
1. Hook Strength: How compelling is the first line? Does it stop the scroll?
2. Clarity: Is the message clear and easy to understand?
3. Engagement Potential: Will this generate comments, shares, saves?
4. Virality: Does this have elements that make people want to share?

Respond in EXACTLY this JSON format:
{
  "hookStrength": 85,
  "clarity": 90,
  "engagementPotential": 75,
  "virality": 70,
  "overall": 80,
  "feedback": "Brief 1-2 sentence feedback on how to improve"
}

Rules:
- Be honest and critical — don't inflate scores
- Overall should be a weighted average (hook 30%, clarity 25%, engagement 25%, virality 20%)
- Feedback should be actionable
- ONLY return valid JSON, no markdown or extra text`;
}

/**
 * Remix Prompt — Modifies existing caption
 */
export function buildRemixPrompt(
  originalCaption: string,
  platform: string,
  remixStyle: RemixStyle,
  personaContext?: string
): string {
  const styleInstructions: Record<RemixStyle, string> = {
    funnier: "Make it funnier. Add humor, wit, and playfulness. Use clever wordplay or unexpected twists. Keep the core message.",
    more_professional: "Make it more professional. Remove slang, tighten the language, add credibility signals. Keep the core message.",
    shorter: "Make it shorter. Cut to the essential message. Remove filler words. Make every word count. Keep the core message.",
    more_viral: "Make it more viral. Add controversy, strong opinions, or surprising takes. Make people want to share. Keep the core message.",
    more_controversial: "Make it more controversial. Take a bolder stance. Challenge conventional wisdom. Be thought-provoking, not offensive. Keep the core message.",
  };

  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## ORIGINAL CAPTION (Platform: ${platform})
${originalCaption}`);

  sections.push(`## REMIX INSTRUCTION
${styleInstructions[remixStyle]}

Respond with ONLY the remixed caption text. No JSON, no markdown, no explanation — just the new caption.`);

  return sections.join("\n\n");
}

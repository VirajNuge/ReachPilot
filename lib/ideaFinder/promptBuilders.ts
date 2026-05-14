// ============================================================
// Idea Finder — Prompt Builders
// One function per mode, plus a router that dispatches by mode.
// ============================================================

import type { IdeaFinderContext, IdeaMode } from "./types";

// ---- Shared fragments ----

const JSON_ENFORCEMENT = `
IMPORTANT RULES:
- ONLY return valid JSON. No markdown fences. No explanations before or after.
- Do NOT wrap in \`\`\`json ... \`\`\`.
- Return the exact shape shown in OUTPUT FORMAT.
`;

const PLATFORM_REASONING_EXTRAS = `"platformTemplate": {
        "templateId": "problem_solution | hook_value_cta | story_format | authority_format | listicle_format | engagement_question",
        "templateName": "human-readable template label",
        "hookAngle": "why this hook style fits the platform",
        "captionTone": ["tone 1", "tone 2"],
        "ctaPattern": "platform-native CTA pattern",
        "formatRecommendation": "why this format fits this platform",
        "visualRecommendation": "specific visual direction for this platform",
        "imageRatio": "recommended ratio such as 1:1, 4:5, 2:3",
        "hashtagGuidance": "platform hashtag guidance",
        "lengthGuidance": "recommended character/section guidance",
        "confidenceReason": "why this template and angle are a high-fit match"
      }`;

function ideaJsonShape(extras: string = ""): string {
  return `{
  "ideas": [
    {
      "title": "short idea title (5-8 words)",
      "hook": "the opening hook written in their voice",
      "angle": "the strategic angle (educational/controversial/story/etc)",
      "format": "post",
      "platform": "<target platform>",
      "whyItFits": "1 sentence on why this matches their brand",
      "suggestedCTA": "call to action suggestion",
      "visualDirection": "single-post visual direction with clear layout detail; never mention carousels/slides",
      "confidenceScore": 0-100,
      ${PLATFORM_REASONING_EXTRAS}${extras ? ",\n      " + extras : ""}
    }
  ]
}`;
}

function personaBlock(ctx: IdeaFinderContext): string {
  if (!ctx.persona.summary) return "";
  return `## BRAND CONTEXT\n${ctx.persona.summary}`;
}

function compactPersonaBlock(ctx: IdeaFinderContext): string {
  const p = ctx.persona;
  const lines: string[] = [];
  if (p.summary) {
    // Extract just the first line (name/role) from the full summary
    const firstLine = p.summary.split("\n")[0];
    lines.push(firstLine);
  }
  if (p.contentThemes.length)
    lines.push(`Content Themes: ${p.contentThemes.join(", ")}`);
  if (p.contentPillars.length)
    lines.push(`Content Pillars: ${p.contentPillars.join(", ")}`);
  if (p.audience) lines.push(`Audience: ${p.audience}`);
  if (p.uniquePOV) lines.push(`Unique POV: ${p.uniquePOV}`);
  return lines.length ? `## BRAND CONTEXT (abbreviated)\n${lines.join("\n")}` : "";
}

/**
 * Full voice + persona block used in all non-voice-match modes.
 * Injects brand context, audience, voice profile, and writing samples
 * so every mode generates persona-aware, on-brand content.
 */
function voiceEnhancedBlock(ctx: IdeaFinderContext): string {
  const p = ctx.persona;
  const sections: string[] = [];

  // Full persona summary (includes role, industry, mission, etc.)
  if (p.summary) {
    sections.push(`## BRAND PERSONA\n${p.summary}`);
  } else {
    // Fallback compact block
    const compact = compactPersonaBlock(ctx);
    if (compact) sections.push(compact);
  }

  // Voice profile lines
  const voiceLines: string[] = [];
  if (p.voice) voiceLines.push(p.voice);
  const vs = ctx.analysis.voiceSpectrum;
  if (vs.signatureWords.length)
    voiceLines.push(`Signature words/phrases: ${vs.signatureWords.join(", ")}`);
  if (vs.avoidWords.length)
    voiceLines.push(`Avoid these words: ${vs.avoidWords.join(", ")}`);
  const topHookTypes = ctx.analysis.postDNA
    .slice(0, 4)
    .map((d) => d.hookType)
    .filter(Boolean);
  if (topHookTypes.length)
    voiceLines.push(`Preferred hook styles: ${topHookTypes.join(", ")}`);
  if (p.uniquePOV)
    voiceLines.push(`Unique POV to weave in: ${p.uniquePOV}`);
  if (voiceLines.length)
    sections.push(`## VOICE & TONE PROFILE\n${voiceLines.join("\n")}`);

  // Writing samples for style calibration
  if (p.writingSamples.length) {
    const samples = p.writingSamples
      .slice(0, 2)
      .map((s, i) => `Sample ${i + 1}: "${s}"`)
      .join("\n");
    sections.push(
      `## WRITING SAMPLES (calibrate hooks and angles to this exact voice)\n${samples}`
    );
  }

  return sections.filter(Boolean).join("\n\n");
}

function doNotTalkBlock(ctx: IdeaFinderContext): string {
  if (!ctx.persona.doNotTalk.length) return "";
  return `DO NOT generate ideas about: ${ctx.persona.doNotTalk.join(", ")}`;
}

function platformLine(ctx: IdeaFinderContext): string {
  return `Target platform: ${ctx.platform.target}`;
}

function coreMessageBlock(coreMessage: string): string {
  const trimmed = coreMessage.trim();
  if (!trimmed) return "";
  return `## USER CORE MESSAGE (HIGHEST PRIORITY)\n${trimmed}\n\nTreat this as a strict intent anchor when generating hooks, angles, and CTA framing.`;
}

function recentPostsAvoidanceBlock(ctx: IdeaFinderContext): string {
  if (!ctx.postHistory.recentPosts.length) return "";

  const recent = ctx.postHistory.recentPosts
    .slice(0, 6)
    .map((post, index) => {
      const caption = post.caption.replace(/\s+/g, " ").trim().slice(0, 120);
      return `${index + 1}. [${post.platform}] ${caption}`;
    })
    .join("\n");

  return `## RECENT OUTPUTS (AVOID REPETITION)\n${recent}\n\nDo NOT repeat the same hook framing or angle used above. Generate a meaningfully different angle.`;
}

function modeQualityChecklist(mode: IdeaMode): string {
  const shared = [
    "Every idea must include a confidenceReason inside platformTemplate.",
    "Hook must be specific and scroll-stopping, not generic.",
    "Visual direction must include concrete production detail for one single post.",
    "Never mention carousel, slides, multi-frame, swipe, or thread cards.",
  ];

  if (mode === "trend-jacker") {
    return `## QUALITY CHECKLIST\n- ${shared.join("\n- ")}\n- Include trendTopic and trendContext that clearly explain timeliness.`;
  }

  if (mode === "repurpose") {
    return `## QUALITY CHECKLIST\n- ${shared.join("\n- ")}\n- Include originalContentRef and remixStrategy that clearly identify the source and transformation.`;
  }

  if (mode === "gap-filler") {
    return `## QUALITY CHECKLIST\n- ${shared.join("\n- ")}\n- Include gapTopic and audienceDemandSignal with explicit evidence language.`;
  }

  if (mode === "prism") {
    return `## QUALITY CHECKLIST\n- ${shared.join("\n- ")}\n- Each angleFramework must be distinct and non-overlapping.`;
  }

  return `## QUALITY CHECKLIST\n- ${shared.join("\n- ")}`;
}

// ---- Mode Builders ----

function buildVoiceMatchPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  audience: string,
  vibe: string,
  count: number,
  coreMessage: string
): string {
  const sections: string[] = [];

  sections.push(
    "You are a social media content strategist who deeply understands brand voice replication."
  );

  sections.push(personaBlock(ctx));
  const userCoreMessage = coreMessageBlock(coreMessage);
  if (userCoreMessage) sections.push(userCoreMessage);

  // Voice analysis
  const voiceLines: string[] = [];
  const vs = ctx.analysis.voiceSpectrum;
  if (vs.signatureWords.length)
    voiceLines.push(`Signature words: ${vs.signatureWords.join(", ")}`);
  if (vs.avoidWords.length)
    voiceLines.push(`Avoid words: ${vs.avoidWords.join(", ")}`);

  const topHookTypes = ctx.analysis.postDNA
    .slice(0, 5)
    .map((d) => d.hookType)
    .filter(Boolean);
  if (topHookTypes.length)
    voiceLines.push(`Hook styles most used: ${topHookTypes.join(", ")}`);

  if (ctx.persona.voice) voiceLines.push(`Voice profile: ${ctx.persona.voice}`);

  if (voiceLines.length)
    sections.push(`## VOICE ANALYSIS\n${voiceLines.join("\n")}`);

  // Writing samples
  if (ctx.persona.writingSamples.length) {
    const samples = ctx.persona.writingSamples
      .map((s, i) => `Sample ${i + 1}: "${s}"`)
      .join("\n");
    sections.push(
      `## WRITING SAMPLES (study these carefully — match this voice exactly)\n${samples}`
    );
  }

  // Task
  const topicStr = topic ? ` about "${topic}"` : "";
  const audienceStr = audience ? ` targeting ${audience}` : "";
  const vibeStr = vibe ? `\nDesired vibe/energy: ${vibe}` : "";

  sections.push(
    `## YOUR TASK
Generate ${count} social media post ideas for ${ctx.platform.target}${topicStr}${audienceStr}.${vibeStr}
Each idea MUST sound like it was written by this exact person — match their hook style, sentence patterns, emoji usage, and signature phrases.
For each idea, include platform-specific template reasoning in platformTemplate.
Visual direction must be concrete enough to hand off directly to image generation.

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

  const recentPostsBlock = recentPostsAvoidanceBlock(ctx);
  if (recentPostsBlock) sections.push(recentPostsBlock);
  sections.push(modeQualityChecklist("voice-match"));

  sections.push(`## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\n${ideaJsonShape()}`);

  return sections.filter(Boolean).join("\n\n");
}

function buildTrendJackerPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  audience: string,
  vibe: string,
  count: number,
  coreMessage: string
): string {
  const sections: string[] = [];

  sections.push(
    "You are a trend-spotting social media strategist. You identify trending topics and craft brand-relevant angles that authentically fit the brand's voice and audience. You MUST use real-time data from Google Search."
  );

  // Full persona + voice context for on-brand trend angles
  const voiceBlock = voiceEnhancedBlock(ctx);
  if (voiceBlock) sections.push(voiceBlock);

  const userCoreMessage = coreMessageBlock(coreMessage);
  if (userCoreMessage) sections.push(userCoreMessage);

  // Viral recipe context (what works for this brand)
  if (ctx.analysis.viralRecipe.length) {
    const recipes = ctx.analysis.viralRecipe
      .slice(0, 3)
      .map((r) => `- ${r.hookType}: ${r.whyItWorked}`)
      .join("\n");
    sections.push(`## WHAT WORKS FOR THIS BRAND\n${recipes}`);
  }

  const topicStr = topic || "their industry/niche";
  const audienceStr = audience ? `\nTarget audience: ${audience}` : "";
  const vibeStr = vibe ? `\nDesired vibe: ${vibe}` : "";

  sections.push(
    `## YOUR TASK
1. Search for currently trending topics related to: ${topicStr}
2. Filter trends by relevance to this brand's content pillars and audience
3. For each relevant trend, generate a unique post idea angle that this brand can credibly own
4. Include ONLY trends from the last 7 days
5. Prioritize trends with high virality potential for ${ctx.platform.target}
${audienceStr}${vibeStr}

For each idea, include platformTemplate with a template recommendation and confidence reason.
Write stronger visualDirection details for image execution (composition, focal subject, and content framing).

DO NOT suggest trends outside this brand's expertise areas.
DO NOT suggest generic ideas that any brand could post.
${ctx.persona.uniquePOV ? `Each idea MUST connect the trend to this brand's unique POV: "${ctx.persona.uniquePOV}"` : ""}

${doNotTalkBlock(ctx)}`
  );

  const recentPostsBlock = recentPostsAvoidanceBlock(ctx);
  if (recentPostsBlock) sections.push(recentPostsBlock);
  sections.push(modeQualityChecklist("trend-jacker"));

  const extras = `"trendTopic": "the trending topic being leveraged",
      "trendContext": "why this topic is trending right now (1 sentence)",
      "urgency": "high | medium | low"`;

  sections.push(
    `## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\nReturn exactly ${count} ideas.\n${ideaJsonShape(extras)}`
  );

  return sections.filter(Boolean).join("\n\n");
}

function buildRepurposePrompt(
  ctx: IdeaFinderContext,
  _topic: string,
  _audience: string,
  _vibe: string,
  count: number,
  coreMessage: string
): string {
  const sections: string[] = [];

  sections.push(
    "You are a content repurposing expert. You analyze existing high-performing content and suggest creative ways to remix it into new formats and platforms — always preserving the brand's authentic voice and style."
  );

  // Full persona + voice so remixed ideas stay on-brand
  const voiceBlock = voiceEnhancedBlock(ctx);
  if (voiceBlock) sections.push(voiceBlock);

  const userCoreMessage = coreMessageBlock(coreMessage);
  if (userCoreMessage) sections.push(userCoreMessage);

  // Post history
  if (ctx.postHistory.recentPosts.length) {
    const posts = ctx.postHistory.recentPosts
      .map(
        (p, i) =>
          `Post ${i + 1} [score: ${p.contentScore}, platform: ${p.platform}]: "${p.caption.slice(0, 300)}"`
      )
      .join("\n");
    sections.push(`## EXISTING CONTENT LIBRARY\n${posts}`);
  } else {
    sections.push(
      "## EXISTING CONTENT LIBRARY\nNo post history available. Generate repurpose ideas based on the brand's content pillars and themes instead."
    );
  }

  // Post DNA
  if (ctx.analysis.postDNA.length) {
    const dna = ctx.analysis.postDNA
      .slice(0, 8)
      .map((d) => `- ${d.hookType} ${d.format} on "${d.topic}" → ${d.verdict}`)
      .join("\n");
    sections.push(`## POST DNA ANALYSIS\n${dna}`);
  }

  sections.push(
    `## YOUR TASK
Analyze the EXISTING CONTENT LIBRARY above and suggest ${count} repurpose ideas:
1. Identify the highest-performing content (by contentScore)
2. Suggest format transformations (e.g., text post -> carousel, caption -> thread)
3. Suggest platform migrations (e.g., LinkedIn post -> Twitter thread)
4. Suggest "sequel" ideas (follow-up content to high performers)
5. Suggest "compilation" ideas (combine multiple related posts)

For each idea, include platformTemplate with template choice and rationale.
visualDirection must explain what should be visible in the first frame/asset.

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

  const recentPostsBlock = recentPostsAvoidanceBlock(ctx);
  if (recentPostsBlock) sections.push(recentPostsBlock);
  sections.push(modeQualityChecklist("repurpose"));

  const extras = `"originalContentRef": "brief reference to the original content being remixed",
      "remixStrategy": "how to remix (format change / platform change / sequel / compilation)"`;

  sections.push(`## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\n${ideaJsonShape(extras)}`);

  return sections.filter(Boolean).join("\n\n");
}

function buildGapFillerPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  _audience: string,
  _vibe: string,
  count: number,
  coreMessage: string
): string {
  const sections: string[] = [];

  sections.push(
    "You are a content gap analyst. You identify topics a brand should be covering but hasn't — ensuring every gap idea is shaped to match the brand's authentic voice, audience, and strategic positioning."
  );

  // Full persona + voice so gap ideas match brand context
  const voiceBlock = voiceEnhancedBlock(ctx);
  if (voiceBlock) sections.push(voiceBlock);

  const userCoreMessage = coreMessageBlock(coreMessage);
  if (userCoreMessage) sections.push(userCoreMessage);

  // Content pillar analysis
  if (ctx.analysis.contentPillars.length) {
    const pillars = ctx.analysis.contentPillars
      .map((p) => `- ${p.name}: ${p.score}%`)
      .join("\n");
    sections.push(
      `## CONTENT PILLAR ANALYSIS (identify underperforming pillars)\n${pillars}`
    );
  }

  // Question cloud
  if (ctx.analysis.questionCloud.length) {
    const questions = ctx.analysis.questionCloud
      .slice(0, 15)
      .map((q) => `- "${q.keyword}"${q.weight ? ` (weight: ${q.weight})` : ""}`)
      .join("\n");
    sections.push(`## AUDIENCE QUESTIONS (unanswered)\n${questions}`);
  }

  // Missing keywords
  if (ctx.analysis.missingKeywords?.length) {
    sections.push(
      `## MISSING KEYWORDS\n${ctx.analysis.missingKeywords.join(", ")}`
    );
  }

  // Competitor gaps
  if (ctx.analysis.competitorGap) {
    sections.push(`## COMPETITOR GAP\n${ctx.analysis.competitorGap}`);
  }

  const topicStr = topic ? `\nFocus area hint: ${topic}` : "";

  sections.push(
    `## YOUR TASK
Identify ${count} content gaps — topics this brand's audience needs but the brand hasn't covered.
Prioritize by: audience demand (question weight) x brand relevance (pillar alignment).${topicStr}

For each idea, include platformTemplate with a concrete platform-fit rationale and do/don't rules.
visualDirection must include practical production guidance rather than generic style words.

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

  const recentPostsBlock = recentPostsAvoidanceBlock(ctx);
  if (recentPostsBlock) sections.push(recentPostsBlock);
  sections.push(modeQualityChecklist("gap-filler"));

  const extras = `"gapTopic": "the topic gap identified",
      "audienceDemandSignal": "evidence of audience demand for this topic"`;

  sections.push(`## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\n${ideaJsonShape(extras)}`);

  return sections.filter(Boolean).join("\n\n");
}

function buildPrismPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  audience: string,
  vibe: string,
  count: number,
  coreMessage: string
): string {
  const sections: string[] = [];

  sections.push(
    "You are a creative content strategist specializing in multi-angle content explosions. Given a single topic, you generate diverse ideas across different strategic frameworks — every angle must sound like it came from this specific brand, not a generic creator."
  );

  // Full voice + persona for all prism angles
  const voiceBlock = voiceEnhancedBlock(ctx);
  if (voiceBlock) sections.push(voiceBlock);

  const userCoreMessage = coreMessageBlock(coreMessage);
  if (userCoreMessage) sections.push(userCoreMessage);

  // Supplement with viral recipe for angle inspiration
  if (ctx.analysis.viralRecipe.length) {
    const recipes = ctx.analysis.viralRecipe
      .slice(0, 3)
      .map((r) => `- ${r.hookType}: ${r.whyItWorked}`)
      .join("\n");
    sections.push(`## WHAT WORKS FOR THIS BRAND\n${recipes}`);
  }

  const topicStr = topic || "their core niche";
  const audienceStr = audience ? `\nTarget audience: ${audience}` : "";
  const vibeStr = vibe ? `\nDesired vibe: ${vibe}` : "";

  const frameworks = [
    "Controversial/hot take",
    "Educational breakdown",
    "Personal story angle",
    "Data/statistic-driven",
    "Listicle format",
    "Behind-the-scenes",
    "Myth-busting",
    "Case study",
    "Prediction/forecast",
    "Question/poll",
    "Comparison (X vs Y)",
    "Step-by-step how-to",
  ];

  sections.push(
    `## YOUR TASK
Take the topic "${topicStr}" and generate ${count} ideas, each using a DIFFERENT angle framework.${audienceStr}${vibeStr}

Available frameworks (use at least ${Math.min(count, frameworks.length)} different ones):
${frameworks.map((f) => `- ${f}`).join("\n")}

Each idea must be distinct in angle while staying true to the brand voice.
For each idea, include platformTemplate with recommended template, confidenceReason, and do/don't guidance.
visualDirection should be concrete and platform-appropriate.
${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

  const recentPostsBlock = recentPostsAvoidanceBlock(ctx);
  if (recentPostsBlock) sections.push(recentPostsBlock);
  sections.push(modeQualityChecklist("prism"));

  const extras = `"angleFramework": "which framework was used (e.g. 'Controversial/hot take', 'Educational breakdown')"`;

  sections.push(`## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\n${ideaJsonShape(extras)}`);

  return sections.filter(Boolean).join("\n\n");
}

// ---- Router ----

export interface PromptBuilderInput {
  context: IdeaFinderContext;
  mode: IdeaMode;
  topic: string;
  audience: string;
  coreMessage: string;
  vibe: string;
  count: number;
}

/**
 * Build the appropriate prompt for the given mode.
 * Returns the prompt string ready for Gemini.
 */
export function buildIdeaFinderPrompt(input: PromptBuilderInput): string {
  const { context, mode, topic, audience, coreMessage, vibe, count } = input;

  switch (mode) {
    case "voice-match":
      return buildVoiceMatchPrompt(context, topic, audience, vibe, count, coreMessage);
    case "trend-jacker":
      return buildTrendJackerPrompt(context, topic, audience, vibe, count, coreMessage);
    case "repurpose":
      return buildRepurposePrompt(context, topic, audience, vibe, count, coreMessage);
    case "gap-filler":
      return buildGapFillerPrompt(context, topic, audience, vibe, count, coreMessage);
    case "prism":
      return buildPrismPrompt(context, topic, audience, vibe, count, coreMessage);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown idea mode: ${_exhaustive}`);
    }
  }
}

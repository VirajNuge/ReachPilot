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

function ideaJsonShape(extras: string = ""): string {
  return `{
  "ideas": [
    {
      "title": "short idea title (5-8 words)",
      "hook": "the opening hook written in their voice",
      "angle": "the strategic angle (educational/controversial/story/etc)",
      "format": "post | carousel | thread | reel | story | video",
      "platform": "<target platform>",
      "whyItFits": "1 sentence on why this matches their brand",
      "suggestedCTA": "call to action suggestion",
      "visualDirection": "brief visual/image suggestion",
      "confidenceScore": 0-100${extras ? ",\n      " + extras : ""}
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

function doNotTalkBlock(ctx: IdeaFinderContext): string {
  if (!ctx.persona.doNotTalk.length) return "";
  return `DO NOT generate ideas about: ${ctx.persona.doNotTalk.join(", ")}`;
}

function platformLine(ctx: IdeaFinderContext): string {
  return `Target platform: ${ctx.platform.target}`;
}

// ---- Mode Builders ----

function buildVoiceMatchPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  audience: string,
  vibe: string,
  count: number
): string {
  const sections: string[] = [];

  sections.push(
    "You are a social media content strategist who deeply understands brand voice replication."
  );

  sections.push(personaBlock(ctx));

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

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

  sections.push(`## OUTPUT FORMAT\n${JSON_ENFORCEMENT}\n${ideaJsonShape()}`);

  return sections.filter(Boolean).join("\n\n");
}

function buildTrendJackerPrompt(
  ctx: IdeaFinderContext,
  topic: string,
  audience: string,
  vibe: string,
  count: number
): string {
  const sections: string[] = [];

  sections.push(
    "You are a trend-spotting social media strategist. You identify trending topics and craft brand-relevant angles. You MUST use real-time data from Google Search."
  );

  sections.push(compactPersonaBlock(ctx));

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

DO NOT suggest trends outside this brand's expertise areas.
DO NOT suggest generic ideas that any brand could post.
${ctx.persona.uniquePOV ? `Each idea MUST connect the trend to this brand's unique POV: "${ctx.persona.uniquePOV}"` : ""}

${doNotTalkBlock(ctx)}`
  );

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
  count: number
): string {
  const sections: string[] = [];

  sections.push(
    "You are a content repurposing expert. You analyze existing high-performing content and suggest creative ways to remix it into new formats and platforms."
  );

  // Compact persona
  sections.push(compactPersonaBlock(ctx));

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

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

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
  count: number
): string {
  const sections: string[] = [];

  sections.push(
    "You are a content gap analyst. You identify topics a brand should be covering but hasn't, based on audience demand and competitive analysis."
  );

  sections.push(compactPersonaBlock(ctx));

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

${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

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
  count: number
): string {
  const sections: string[] = [];

  sections.push(
    "You are a creative content strategist specializing in multi-angle content explosions. Given a single topic, you generate diverse ideas across different strategic frameworks."
  );

  sections.push(personaBlock(ctx));

  // Voice analysis (lighter)
  const vs = ctx.analysis.voiceSpectrum;
  if (vs.signatureWords.length) {
    sections.push(
      `## VOICE NOTES\nSignature words: ${vs.signatureWords.join(", ")}`
    );
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
${doNotTalkBlock(ctx)}
${platformLine(ctx)}`
  );

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
  vibe: string;
  count: number;
}

/**
 * Build the appropriate prompt for the given mode.
 * Returns the prompt string ready for Gemini.
 */
export function buildIdeaFinderPrompt(input: PromptBuilderInput): string {
  const { context, mode, topic, audience, vibe, count } = input;

  switch (mode) {
    case "voice-match":
      return buildVoiceMatchPrompt(context, topic, audience, vibe, count);
    case "trend-jacker":
      return buildTrendJackerPrompt(context, topic, audience, vibe, count);
    case "repurpose":
      return buildRepurposePrompt(context, topic, audience, vibe, count);
    case "gap-filler":
      return buildGapFillerPrompt(context, topic, audience, vibe, count);
    case "prism":
      return buildPrismPrompt(context, topic, audience, vibe, count);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown idea mode: ${_exhaustive}`);
    }
  }
}

// ============================================================
// ReachPilot — AI Prompt Builders for Post Generation Pipeline
// 3 Stages: Content Strategist → Caption Generator → Image Prompt
// ============================================================

import type {
  PostGenerationInput,
  ContentStrategyOutput,
  PostPlatform,
  RemixStyle,
  InstagramPostType,
} from "../types/postGeneration";
import type { WritingStyleDocument } from "./models/adminStyles";
import type { CaptionTemplateDocument } from "./models/captionTemplates";
import {
  PLATFORM_INTELLIGENCE as PLATFORMS,
  POST_OBJECTIVE_LABELS,
  TARGET_AUDIENCE_LABELS,
  CONTENT_ANGLE_LABELS,
  TONE_LABELS,
  CTA_LABELS,
  VISUAL_STYLE_LABELS,
  BRAND_TYPE_LABELS,
  LINKEDIN_STYLE_PROFILE_LABELS,
  LINKEDIN_POST_TYPE_LABELS,
  NICHE_CATEGORY_LABELS,
  POST_INTENT_LABELS,
} from "../types/postGeneration";

import { resolveCreativeProfile, NICHE_KEYWORDS } from "./postGeneration/creativeDirector";
import {
  buildCaptionTemplateInstructions,
  resolveCaptionTemplateId,
  getBuiltInCaptionTemplate,
} from "./postGeneration/captionTemplates";

// ── LinkedIn Style Profile Personas ──────────────────────────────────────────

const LINKEDIN_STYLE_PERSONAS: Record<string, string> = {
  hormozi: `Write like Alex Hormozi:
- Bold, direct, value-dense
- Short punchy lines (1 idea per line)
- No filler words. No "I'm excited to share..."
- Every line EARNS its place
- Use numbers and specifics aggressively
- Structure: Hook → Brutal Insight → Breakdown → Mic Drop CTA`,

  justin_welsh: `Write like Justin Welsh:
- Personal story first — always starts with "I"
- Relatable and humble, NOT humblebrag
- Show the struggle before the win
- Lessons framed as personal realizations
- Conversational, like talking to a friend
- Structure: Personal moment → What I learned → How it applies to you`,

  naval: `Write like Naval Ravikant:
- One deep idea per post — don't dilute it
- Philosophical, aphorism-like
- Extreme clarity and precision
- No corporate fluff whatsoever
- Short and dense — every word carries weight
- Structure: Bold statement → Unpacking → First principles conclusion`,

  corporate: `Write in a professional corporate voice:
- Data-backed, credible, structured
- Formal but approachable
- Reference industry trends or research
- Clear takeaways for business decision-makers
- Structure: Context → Data/Insight → Implication → CTA`,

  startup_founder: `Write like an authentic startup founder:
- Raw, behind-the-scenes, honest
- Show the messy reality, not just the highlight reel
- "Here's what I wish someone told me" energy
- Vulnerability builds trust
- Structure: Honest moment → The real lesson → What I'm doing about it`,
};

function buildStructureOnlyTemplateBlock(
  captionStyle: PostGenerationInput["captionStyle"],
  platform: PostPlatform,
  objective: PostGenerationInput["objective"],
  niche?: PostGenerationInput["niche"],
  forcedTemplateId?: string,
): string {
  const templateId = resolveCaptionTemplateId(
    captionStyle ?? "auto",
    platform,
    objective,
    niche,
    forcedTemplateId,
  );
  const template = getBuiltInCaptionTemplate(templateId);
  if (!template) return "";

  const platformVariation = template.platformVariations[platform] ?? "";
  const structureOnly = template.structure
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 18)
    .join("\n");

  const lines = [
    `## ${platform.toUpperCase()} TEMPLATE STRUCTURE`,
    `Template: ${template.name}`,
    `Structure:`,
    structureOnly,
  ];

  if (platformVariation) {
    const conciseVariation = platformVariation
      .replace(/\s+/g, " ")
      .trim();
    lines.push(`Platform note: ${conciseVariation}`);
  }

  lines.push(`Keep the response concise. Do not include do/don't lists or long explanations.`);
  return lines.join("\n");
}

function buildWritingStyleBlock(
  writingStyle: WritingStyleDocument,
  heading: string,
  applyInstruction: string,
): string {
  const tp = writingStyle.toneProfile;
  const toneParts: string[] = [];
  if (tp.formalCasual > 60) toneParts.push("casual and conversational");
  else if (tp.formalCasual < 40) toneParts.push("formal and professional");
  else toneParts.push("balanced register");
  if (tp.seriousPlayful > 60) toneParts.push("playful and fun");
  else if (tp.seriousPlayful < 40) toneParts.push("serious and focused");
  if (tp.inspiringInformative > 60) toneParts.push("informative and data-driven");
  else if (tp.inspiringInformative < 40) toneParts.push("inspiring and emotional");
  if (tp.dataDriven > 60) toneParts.push("data-driven with stats and proof");
  const toneDesc = toneParts.filter(Boolean).join(", ");

  const styleLines: string[] = [
    heading,
    writingStyle.description,
    ``,
    `Tone Profile: ${toneDesc || "balanced"}`,
    `Sentence Length: ${writingStyle.sentenceLength.join(", ")} sentences`,
    `Emoji Usage: ${writingStyle.emojiUsage}`,
    `Hashtag Intensity: ${writingStyle.hashtagIntensity}`,
  ];
  if (writingStyle.ctas?.length) {
    styleLines.push(`Preferred CTAs: ${writingStyle.ctas.join(", ")}`);
  }
  if (writingStyle.examplePost) {
    styleLines.push(``, `Example post in this style:`, `"""`, writingStyle.examplePost, `"""`);
  }
  styleLines.push(``, applyInstruction);
  return styleLines.join("\n");
}

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
- Platforms: ${platformNames}${input.niche ? `\n- Industry/Niche: ${NICHE_CATEGORY_LABELS[input.niche]?.label ?? input.niche}` : ""}${input.postIntent ? `\n- Post Intent: ${POST_INTENT_LABELS[input.postIntent]?.label ?? input.postIntent}` : ""}${input.location ? `\n- Location Context: ${input.location}` : ""}`);

  // Add niche context if available
  if (input.niche && input.niche !== "other") {
    const nicheKw = NICHE_KEYWORDS[input.niche];
    if (nicheKw) {
      sections.push(`## NICHE INTELLIGENCE
- Industry: ${NICHE_CATEGORY_LABELS[input.niche]?.label ?? input.niche}
- Core Industry Terms: ${nicheKw.primary.join(", ")}
- Trending Topics: ${nicheKw.trending.join(", ")}
- High-Engagement Words: ${nicheKw.engagement.join(", ")}

Use these niche-specific terms and topics to make the content strategy deeply relevant to the industry. Reference trending topics when applicable. Incorporate high-engagement trigger words naturally.`);
    }
  }

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
 * LinkedIn gets massively enhanced instructions
 */
export function buildCaptionGeneratorPrompt(
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string,
  writingStyle?: WritingStyleDocument,
  dbTemplate?: CaptionTemplateDocument,
  platformWritingStyles?: Partial<Record<PostPlatform, WritingStyleDocument>>,
  platformTemplates?: Partial<Record<PostPlatform, CaptionTemplateDocument>>,
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

  // Inject global writing style fallback
  if (writingStyle) {
    sections.push(
      buildWritingStyleBlock(
        writingStyle,
        `## WRITING STYLE: ${writingStyle.name.toUpperCase()}`,
        `IMPORTANT: Apply this writing style to ALL platform captions unless a platform-specific style override is provided below.`,
      ),
    );
  }

  // Inject per-platform writing style overrides
  const perPlatformStyleBlocks = input.platforms
    .map((platform) => {
      const platformStyle = platformWritingStyles?.[platform];
      if (!platformStyle) return "";
      return buildWritingStyleBlock(
        platformStyle,
        `## ${platform.toUpperCase()} WRITING STYLE OVERRIDE: ${platformStyle.name.toUpperCase()}`,
        `IMPORTANT: Apply this style ONLY for ${platform}. It overrides global writing style for this platform.`,
      );
    })
    .filter(Boolean);
  if (perPlatformStyleBlocks.length > 0) {
    sections.push(perPlatformStyleBlocks.join("\n\n"));
  }

  // Inject caption template blocks per platform
  const creativeProfile = resolveCreativeProfile(input);
  const templateBlocks = input.platforms
    .map((platform) => {
      const platformTemplate = platformTemplates?.[platform] ?? dbTemplate;
      if (platformTemplate) {
        const variant =
            platformTemplate.platformVariants.find((v) => v.platform === platform) ??
            platformTemplate.platformVariants[0];
        if (!variant) return "";

        const structureOnly = variant.structure
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .slice(0, 16)
          .join("\n");

        return [
          `## ${platform.toUpperCase()} CAPTION STRUCTURE`,
          `Template: ${platformTemplate.name}`,
          structureOnly,
          `Keep it concise and return only the structure plan for ${platform}.`,
        ].join("\n");
      }

      const forcedTemplateId =
        input.platformTemplateIds?.[platform] ?? input.selectedTemplateId;
      return (
        buildStructureOnlyTemplateBlock(
          creativeProfile.captionStyle,
          platform,
          input.objective,
          input.niche,
          forcedTemplateId,
        )
      );
    })
    .filter(Boolean);

  if (templateBlocks.length) {
    sections.push(templateBlocks.join("\n\n"));
  }

  // Build platform-specific instructions
  const platformInstructions = input.platforms.map((p) => {
    const intel = PLATFORMS[p];
    if (!intel) return "";

    if (p === "linkedin") {
      return buildLinkedInCaptionInstructions(input);
    }

    if (p === "x") {
      return buildXCaptionInstructions(input);
    }

    if (p === "instagram_post") {
      return buildInstagramCaptionInstructions(input);
    }

    if (p === "facebook") {
      return buildFacebookCaptionInstructions(input);
    }

    if (p === "pinterest") {
      return buildPinterestCaptionInstructions(input);
    }

    return `### ${intel.name}
- Max Length: ${intel.captionRules.maxLength || "No limit"} characters
- Hashtags: ${intel.captionRules.hashtagRange[0]}-${intel.captionRules.hashtagRange[1]}
- Tone: ${intel.captionRules.toneGuidelines.join(", ")}
- Structure: ${intel.captionRules.structureRules.join("; ")}`;
  }).filter(Boolean);

  sections.push(`## PLATFORM RULES\n${platformInstructions.join("\n\n")}`);

  // Inject niche-based hashtag intelligence
  if (input.niche && input.niche !== "other") {
    const nicheKw = NICHE_KEYWORDS[input.niche];
    if (nicheKw) {
      const nicheLabel = NICHE_CATEGORY_LABELS[input.niche] || input.niche;
      const hashtagIntelLines: string[] = [
        `## HASHTAG INTELLIGENCE`,
        `Niche: ${nicheLabel}`,
        ``,
        `Use these niche-specific seed keywords to generate highly relevant hashtags:`,
        `- Primary industry terms: ${nicheKw.primary.join(", ")}`,
        `- Trending in this niche: ${nicheKw.trending.join(", ")}`,
        `- High-engagement words: ${nicheKw.engagement.join(", ")}`,
        ``,
        `Build hashtags BY COMBINING these seed keywords with the specific topic of this post.`,
        `Do NOT just hashtag the seed words directly — derive relevant, specific hashtags from them.`,
      ];

      if (input.location) {
        hashtagIntelLines.push(
          ``,
          `Location: ${input.location}`,
          `Include 1-2 location-specific hashtags (e.g., #${input.location.replace(/[^a-zA-Z0-9]/g, "")}RealEstate, #${input.location.replace(/[^a-zA-Z0-9]/g, "")}Eats).`,
          `Blend location into niche hashtags where natural.`,
        );
      }

      sections.push(hashtagIntelLines.join("\n"));
    }
  } else if (input.location) {
    // No niche but location provided — still inject location hashtag guidance
    sections.push(`## HASHTAG INTELLIGENCE
Location: ${input.location}
Include 1-2 location-specific hashtags derived from this location.
Blend location into topic-relevant hashtags where natural.`);
  }

  // Build expected JSON shape dynamically
  const captionFields = input.platforms
    .map(
      (p) =>
        `    "${p}": ["Caption option 1 for ${PLATFORMS[p]?.name || p}", "Caption option 2 for ${PLATFORMS[p]?.name || p}", "Caption option 3 for ${PLATFORMS[p]?.name || p}"]`
    )
    .join(",\n");

  sections.push(`## YOUR TASK
You are a Caption Generator AI. Write platform-specific captions following the strategy and rules above.

Important: if multiple platforms are selected, return captions for every selected platform. Do not omit any platform.
Use the matching structure block for each platform and keep each platform caption aligned to its own structure.

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
- Generate EXACTLY 3 distinct caption options per selected platform
- Each caption MUST follow its platform's specific rules (length, tone, structure)
- Hashtags MUST be relevant to the post topic, niche, and audience — never generic
- High reach hashtags = broad audience appeal (100K+ posts), derived from primary niche terms
- Niche hashtags = targeted community (10K-100K posts), derived from trending & engagement seed keywords
- Branded hashtags = unique to the brand identity
- If HASHTAG INTELLIGENCE section is provided above, USE the seed keywords as the basis for hashtag generation
- For LinkedIn: hashtags go AT THE END separated by a blank line (3-5 max)
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * X (Twitter)-specific caption instruction block
 * Called from buildCaptionGeneratorPrompt when X is in platforms
 */
function buildXCaptionInstructions(input: PostGenerationInput): string {
  const lines: string[] = ["### X (Twitter) — HIGH-ENGAGEMENT REQUIRED"];

  // Map content angle → post type structure
  const contentAngle = input.contentAngles?.[0];
  const toneKey = input.tones?.[0];

  const postTypeMap: Partial<Record<string, string>> = {
    contrarian_opinion: "contrarian",
    tip_list: "list",
    story: "story",
    data_insight: "statistical",
    step_by_step_guide: "list",
    behind_the_scenes: "story",
  };
  const postType = contentAngle ? (postTypeMap[contentAngle] ?? "insight") : "insight";

  // Step 0: Controversial rewrite instruction (biggest quality lever)
  lines.push(`
**STEP 0 — REWRITE THE CORE IDEA (MANDATORY FIRST STEP):**
Before writing the post, internally rewrite the core message to be MORE surprising or contrarian.
- Don't use the plain message — find the unexpected angle within it
- Ask: "What would make someone stop scrolling and think 'wait, what?'"
- Example transform: "AI helps agencies schedule content faster" → "Most agencies are wasting 10+ hours a week on something AI can handle in 3 minutes"
- Use this rewritten idea as the foundation for the post`);

  // Character count rules
  lines.push(`
**CHARACTER COUNT RULES (NON-NEGOTIABLE):**
- OPTIMAL: 100–250 characters (highest engagement zone — this is your target)
- MAXIMUM: 280 characters hard limit
- Count every character including spaces, punctuation, line breaks
- If the post exceeds 250 chars, cut until it doesn't — no exceptions
- Short, punchy, high-impact. Every word must earn its place`);

  // Hook formula based on tone
  const hookFormulas: Record<string, string> = {
    witty: `Pick ONE of these hook formulas (match the witty tone):
- "Everyone says [X]. Here's why they're wrong:"
- "Unpopular opinion: [contrarian take]"
- "The [adjective] truth about [topic] nobody talks about:"`,
    bold: `Pick ONE of these hook formulas (match the bold tone):
- "[Specific number/stat]. That's [what it means]."
- "Stop [common behavior]. Do [alternative] instead."
- "Real talk: [blunt observation]"`,
    professional: `Pick ONE of these hook formulas (match the professional tone):
- "I analyzed [X]. Here's what actually works:"
- "[Number]% of [audience] don't know this about [topic]."
- "The data is clear: [insight]"`,
    inspirational: `Pick ONE of these hook formulas:
- "Last [time period], I [action]. Today, [result]."
- "The moment I stopped [X] and started [Y], everything changed."
- "[Simple truth that hits differently]"`,
    authority: `Pick ONE of these hook formulas:
- "After [X years/clients/posts], here's what I know for certain:"
- "[Counterintuitive claim]. Here's the proof."
- "Most [audience] get this wrong:"`,
    friendly: `Pick ONE of these hook formulas:
- "Quick question: [polarizing scenario]?"
- "If you've ever [relatable situation], read this."
- "Want to [outcome]? Here's the only thing that matters:"`,
    minimalist: `Pick ONE of these hook formulas:
- "[Short, sharp observation.] (no explanation needed)"
- "[Action] = [unexpected result]"
- "The [topic] secret: [one sentence]"`,
  };

  lines.push(`
**HOOK FORMULA — USE ONE OF THESE:**
${hookFormulas[toneKey ?? "professional"] ?? hookFormulas.professional}`);

  // Post type structure
  const postStructures: Record<string, string> = {
    contrarian: `**POST TYPE: CONTRARIAN** — Challenge the conventional view
Structure:
[Hook: Challenge common belief] (1 line)

[Why the common belief is wrong] (1-2 lines)

[The better alternative/truth] (1 line)

[Optional: invite debate with a question] (1 line)`,
    list: `**POST TYPE: LIST** — Numbered value delivery
Structure:
[Hook promise: "X things/reasons/signs..."] (1 line)

[Item 1] (1 line)
[Item 2] (1 line)
[Item 3] (1 line, max)

[Closing insight or CTA question] (1 line)`,
    story: `**POST TYPE: STORY** — Situation → Insight
Structure:
[Hook: the outcome or surprising moment] (1 line)

[What happened — brief context] (1-2 lines)

[The lesson/realization] (1 line)

[How it applies to the reader] (1 line)`,
    statistical: `**POST TYPE: INSIGHT** — Data-driven conviction
Structure:
[Hook: the number or surprising fact] (1 line)

[What it means / why it matters] (1-2 lines)

[The implication for the reader] (1 line)`,
    insight: `**POST TYPE: INSIGHT** — Observation → Takeaway
Structure:
[Hook: bold observation or claim] (1 line)

[Supporting context or contrast] (1-2 lines)

[The concrete takeaway] (1 line)

[Optional: question to invite replies] (1 line)`,
  };

  lines.push(`\n${postStructures[postType] ?? postStructures.insight}`);

  // X-specific forbidden patterns (algorithm-backed)
  lines.push(`
**X ALGORITHM RULES — FOLLOW EXACTLY:**
- NO hashtags (they reduce reach on X in 2024-2025 — omit entirely or max 1 at end if objective is brand-building)
- NO external links in the post body (30-50% reach penalty — never include URLs)
- NO emojis unless emoji level is "high" (clutters the post, looks like spam)
- NO "Follow me for more" or "Link in bio" (signals spam to algorithm)
- Use double line breaks between sections (white space = higher dwell time = better reach)
- Short sentences: 10-15 words max per line
- Avoid: "game-changing", "leverage", "excited to share", "I'm thrilled", generic AI phrases
- DO: specific numbers, named examples, concrete situations — vague → skip-worthy`);

  // Engagement maximizers
  lines.push(`
**ENGAGEMENT MAXIMIZERS:**
- End with a question if objective is engagement (replies = 150x more valuable than likes per X algorithm)
- Make it polarizing enough that people either strongly agree OR strongly disagree
- Include a specific number or named example — specificity is credibility
- The post should work as a standalone unit — no context needed
- "Does this sound like something a real person would say to a friend?" — if no, rewrite`);

  return lines.join("\n");
}

/**
 * LinkedIn-specific caption instruction block
 * Called from buildCaptionGeneratorPrompt when LinkedIn is in platforms
 */
function buildLinkedInCaptionInstructions(input: PostGenerationInput): string {
  const lines: string[] = ["### LinkedIn — PREMIUM QUALITY REQUIRED"];

  // Core formatting rules (non-negotiable)
  lines.push(`
**FORMATTING RULES (MANDATORY):**
- ONE sentence per line. Hard rule — no run-ons.
- Blank line between every paragraph (empty line = breathing room)
- First 2-3 lines are visible BEFORE "see more" — your hook lives here
- Target length: 300-600 characters (sweet spot ~450 chars for max engagement)
- Max 5 hashtags, placed at the END after a blank line
- No "I'm excited to share..." or "Thrilled to announce..." — these kill engagement
- No generic AI phrases: "game-changing", "leverage", "synergy", "paradigm shift"
- No walls of text
- Use ✅ or → for list items, not bullet points (they render poorly on mobile)`);

  // Hook framework
  lines.push(`
**HOOK FORMULA (First line must use one of these):**
- Question that makes them think: "Why do 90% of founders get this wrong?"
- Shocking/counter-intuitive fact: "I made $0 in my first 6 months. Here's what changed."
- Bold promise: "3 things I'd tell my younger self about building in public."
- Problem they feel: "You're writing LinkedIn posts the wrong way."
- Story opener: "Last Tuesday I almost quit."

The hook must be standalone — it works even if nothing comes after it.`);

  // Post type structure
  if (input.linkedInPostType) {
    const postTypeLabel = LINKEDIN_POST_TYPE_LABELS[input.linkedInPostType]?.label;
    lines.push(`
**POST TYPE: ${postTypeLabel?.toUpperCase()} — USE THIS STRUCTURE:**`);

    const structures: Record<string, string> = {
      story: `Situation (1-2 lines) →
Struggle/conflict (2-3 lines) →
The turning point (1-2 lines) →
Realization/lesson (2-3 lines) →
Takeaway for the reader (1-2 lines) →
CTA question (1 line)`,
      insight: `Bold insight statement (hook) →
Context — why this matters (2-3 lines) →
The evidence or example (2-3 lines) →
The implication (1-2 lines) →
CTA or reflection question (1 line)`,
      lesson: `The lesson headline (hook) →
The situation that taught me this (2-3 lines) →
What I got wrong before (1-2 lines) →
What the lesson actually is (2-3 lines) →
How to apply it (1-2 lines) →
CTA`,
      framework: `Name the framework (hook) →
Problem it solves (1-2 lines) →
The steps/components (3-5 lines, each on own line) →
Example or proof (2-3 lines) →
CTA`,
      list: `Headline promise (hook — "X things you..." or "X reasons why...") →
Brief intro line →
Numbered list (each on own line with number + period) →
Closing insight (1-2 lines) →
CTA`,
    };

    lines.push(structures[input.linkedInPostType] || "");
  } else {
    lines.push(`
**STRUCTURE:**
Hook (1 line, see hook formula above) →
Setup / context (2-3 lines) →
Core value / insight / story (3-5 lines) →
Takeaway (1-2 lines) →
CTA — a question that invites comments (1 line)`);
  }

  // Style profile
  if (input.linkedInStyleProfile && LINKEDIN_STYLE_PERSONAS[input.linkedInStyleProfile]) {
    lines.push(`
**WRITING STYLE — FOLLOW THIS PERSONA:**
${LINKEDIN_STYLE_PERSONAS[input.linkedInStyleProfile]}`);
  }

  // Personal angle
  if (input.linkedInPersonalAngle) {
    lines.push(`
**PERSONAL ANGLE TO INJECT:**
${input.linkedInPersonalAngle}`);
  }

  // Key points
  if (input.linkedInKeyPoints?.length) {
    lines.push(`
**KEY POINTS TO INCLUDE:**
${input.linkedInKeyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")}`);
  }

  // Engagement maximizers
  lines.push(`
**ENGAGEMENT MAXIMIZERS:**
- End with a question that's easy to answer (not "what do you think?")
- Make the reader feel seen: "If you've ever felt..."
- Specificity beats vagueness: "17 clients" not "many clients"
- Whitespace is your friend — use it generously
- The last line before hashtags should be a strong CTA or emotional close

**WHAT TO AVOID:**
- Starting with "I'm thrilled/excited/pleased to share"
- Buzzwords: synergy, leverage, game-changing, paradigm, robust, ecosystem
- Passive voice
- Hashtags in the body (only at the end)
- Generic closings like "Drop a comment below!" — be specific`);

  return lines.join("\n");
}

/**
 * LinkedIn Refine Prompt — 2nd pass improvement
 * Takes initial caption → produces refined version with virality score and quality flags
 */
export function buildLinkedInRefinePrompt(
  originalCaption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## ORIGINAL LINKEDIN CAPTION
${originalCaption}`);

  sections.push(`## CONTENT CONTEXT
- Core Message: ${input.coreMessage}
- Post Angle: ${strategy.postAngle}
- Original Hook Idea: ${strategy.hookIdea}
- Tone: ${TONE_LABELS[input.tones?.[0]]?.label || "Professional"}
${input.linkedInPostType ? `- Post Type: ${LINKEDIN_POST_TYPE_LABELS[input.linkedInPostType]?.label}` : ""}
${input.linkedInStyleProfile ? `- Style Profile: ${LINKEDIN_STYLE_PROFILE_LABELS[input.linkedInStyleProfile]?.label}` : ""}
${input.linkedInPersonalAngle ? `- Personal Angle: ${input.linkedInPersonalAngle}` : ""}
${input.linkedInKeyPoints?.length ? `- Key Points: ${input.linkedInKeyPoints.join(", ")}` : ""}`);

  sections.push(`## YOUR TASK
You are a LinkedIn Content Optimizer. Your job is to take the caption above and make it significantly better.

**WHAT TO IMPROVE:**
1. Hook strength — the first line must DEMAND attention. Rewrite it if needed.
2. Formatting — ensure 1 sentence per line, blank lines between paragraphs
3. Specificity — replace generic phrases with concrete details, numbers, examples
4. Remove ALL buzzwords: "game-changing", "leverage", "synergy", "paradigm", "ecosystem", "robust", "seamless"
5. Remove "I'm excited/thrilled to share" type openers
6. Ensure the ending is a compelling question or strong CTA — not just "thoughts?"
7. Enforce 300-600 character sweet spot (can go to 800 if the story demands it)
8. Max 5 hashtags at the END only
9. Apply the style profile if specified
10. Inject the personal angle if provided

**QUALITY SCORING (1-10):**
Rate the REFINED version you produce on virality potential:
- 9-10: Explosive hook, perfect formatting, strong CTA, unique POV, no fluff
- 7-8: Good hook, solid structure, minor improvements possible
- 5-6: Decent but generic in places
- Below 5: Major issues remain

**QUALITY FLAGS — identify any issues that remain:**
Examples: "Hook could be stronger", "Still contains buzzword: leverage", "CTA too generic", "Paragraph 2 is too long", "Missing personal angle", "Hashtags not optimized"

Respond in EXACTLY this JSON format:
{
  "refinedCaption": "The improved LinkedIn caption (full text, properly formatted with \\n for line breaks)",
  "viralityScore": 8,
  "qualityFlags": ["Flag 1", "Flag 2"]
}

Rules:
- refinedCaption must use \\n for line breaks (JSON escaped newlines)
- viralityScore must be 1-10 integer
- qualityFlags is an array of strings — empty array [] if the post is excellent
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * X (Twitter) Refine Prompt — 2nd pass improvement
 * Takes initial caption → produces refined version with engagement score and quality flags
 */
export function buildXRefinePrompt(
  originalCaption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## ORIGINAL X (TWITTER) POST
${originalCaption}`);

  sections.push(`## CONTENT CONTEXT
- Core Message: ${input.coreMessage}
- Post Angle: ${strategy.postAngle}
- Original Hook Idea: ${strategy.hookIdea}
- Tone: ${TONE_LABELS[input.tones?.[0]]?.label || "Professional"}
- Objective: ${POST_OBJECTIVE_LABELS[input.objective]?.label || input.objective}`);

  sections.push(`## YOUR TASK
You are an X (Twitter) Content Optimizer. Take the post above and make it significantly more engaging.

**STEP 1 — REWRITE THE CORE IDEA FIRST:**
Before editing, internally ask: "What's the most surprising or contrarian way to express this idea?"
Use that rewritten angle as the foundation.

**WHAT TO IMPROVE:**
1. Hook strength — the first line must make someone stop scrolling. Rewrite it if needed.
2. Character count — OPTIMAL is 100-250 chars. Cut mercilessly if over 250. Hard max: 280.
3. Remove ALL hashtags (they reduce organic reach on X)
4. Remove any external links or "link in bio" references
5. Replace vague language with specific numbers, named examples, concrete situations
6. Remove AI buzzwords: "game-changing", "leverage", "excited to share", "paradigm"
7. Add a conversation-inviting question at the end IF objective is engagement
8. Apply double line breaks between sections for white space
9. Make it sound like a real person talking, not a brand announcement
10. Ensure the hook uses one of these proven formats:
    - "[Specific number/stat]. That's [implication]."
    - "Everyone says [X]. Here's why they're wrong:"
    - "I spent [time/money] on [thing]. Here's what happened:"
    - "Unpopular opinion: [contrarian take]"
    - "Most [audience] get this wrong:"
    - "[Simple observation.] [Unexpected consequence.]"

**ENGAGEMENT SCORING (1-10):**
Rate the REFINED version you produce:
- 9-10: Explosive hook, 100-250 chars, no hashtags/links, specific examples, invites replies
- 7-8: Strong hook, good character count, mostly concrete, minor issues
- 5-6: Decent but somewhat generic or slightly too long
- Below 5: Major issues remain (too long, generic hook, forbidden patterns present)

**QUALITY FLAGS — identify any remaining issues:**
Examples: "Hook still generic", "Post is 312 chars — should be under 250", "Contains hashtag — remove for better reach", "Add a question to invite replies", "Replace 'many people' with a specific number", "Sounds like AI — make more human"

Respond in EXACTLY this JSON format:
{
  "refinedPost": "The improved X post (full text, use \\n for line breaks)",
  "engagementScore": 8,
  "qualityFlags": ["Flag 1", "Flag 2"]
}

Rules:
- refinedPost must use \\n for line breaks (JSON escaped newlines)
- engagementScore must be 1-10 integer
- qualityFlags is an array of strings — empty array [] if the post is excellent
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

  const isLinkedIn = input.platforms.includes("linkedin");
  const linkedInImageNote = isLinkedIn
    ? `\n- LinkedIn Image: Prefer 1200×627 landscape (16:9). Use thought leadership aesthetics: clean, professional, minimal. No stock photo clichés. Subtle gradients, clean typography space, or abstract professional scenes.`
    : "";

  sections.push(`## VISUAL IDENTITY
- Brand Type: ${brandLabel}
- Visual Style: ${styleLabel}
- Image Type: ${input.imageGenType}
- Brand Colors: ${input.brandAssets.colorPalette.join(", ") || "Auto"}
- Font: ${input.brandAssets.fontFamily || "Auto"}${linkedInImageNote}`);

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
${isLinkedIn ? "- For LinkedIn: avoid generic stock-photo aesthetics. Prefer clean, modern, professional compositions with clear space for text overlay." : ""}
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
 * Instagram-specific caption instruction block
 * Called from buildCaptionGeneratorPrompt when instagram_post is in platforms
 */
function buildInstagramCaptionInstructions(input: PostGenerationInput): string {
  const lines: string[] = ["### Instagram Post — HIGH-ENGAGEMENT REQUIRED"];

  // Map contentAngles[0] → post type
  const contentAngle = input.contentAngles?.[0];
  const postTypeMap: Partial<Record<string, InstagramPostType>> = {
    tip_list: "carousel_tips",
    story: "mini_story",
    step_by_step_guide: "step_by_step_guide",
    contrarian_opinion: "myth_vs_fact",
    data_insight: "mistake_list",
    behind_the_scenes: "mini_story",
  };
  const postType: InstagramPostType = contentAngle
    ? (postTypeMap[contentAngle] ?? "carousel_tips")
    : "carousel_tips";

  // Map tones[0] → hook formula
  const toneKey = input.tones?.[0];
  const hookFormulas: Record<string, string> = {
    witty:
      `Pick ONE of these scroll-stopping hooks (witty tone):
- "Most [audience] are doing this the hard way."
- "Stop [X]. Do [Y] instead."
- "Everyone's talking about [X]. Here's what they're missing:"`,
    bold:
      `Pick ONE of these scroll-stopping hooks (bold tone):
- "The biggest mistake in [topic]."
- "[Number] [audience] don't know this about [topic]."
- "Real talk: [blunt observation about topic]."`,
    professional:
      `Pick ONE of these scroll-stopping hooks (professional tone):
- "I used to [X]. Then I realized [Y]."
- "[Number] [audience] don't know this about [topic]."
- "The data is clear: [surprising insight about topic]."`,
    inspirational:
      `Pick ONE of these scroll-stopping hooks (inspirational tone):
- "I used to [X]. Then I realized [Y]."
- "Last [time period], I [action]. Today, [result]."
- "The moment everything changed: [brief description]."`,
    authority:
      `Pick ONE of these scroll-stopping hooks (authority tone):
- "After [X years/clients], here's the truth about [topic]:"
- "[Number] [audience] don't know this about [topic]."
- "Most [audience] are doing this the hard way."`,
    friendly:
      `Pick ONE of these scroll-stopping hooks (friendly tone):
- "If you struggle with [topic], this is for you."
- "Quick question: are you making this [topic] mistake?"
- "I used to [X]. Then I realized [Y]."`,
    minimalist:
      `Pick ONE of these scroll-stopping hooks (minimalist tone):
- "Stop [X]. Do [Y] instead."
- "[Short, sharp observation about topic]."
- "[Number] words on [topic]: [concise insight]."`,
  };

  lines.push(`
**STEP 0 — IDENTIFY POST TYPE: ${postType.toUpperCase().replace(/_/g, " ")}**
Use this post type structure throughout the caption.`);

  // Post type structures
  const postStructures: Record<InstagramPostType, string> = {
    carousel_tips: `**POST TYPE: CAROUSEL TIPS**
Caption structure:
- Hook (first line): tease the list — "5 [things about topic]..."
- Brief intro (1-2 lines): why this matters
- Hint at slides: "Swipe to learn each one →"
- Engagement question at end
- Goal: Make them swipe through ALL slides`,
    mini_story: `**POST TYPE: MINI STORY**
Caption structure:
- Hook: the outcome or turning point first ("I was [situation]...")
- Situation → Problem (2-3 lines)
- Realization / lesson (1-2 lines)
- Takeaway for reader (1-2 lines)
- Engagement question at end`,
    myth_vs_fact: `**POST TYPE: MYTH VS FACT**
Caption structure:
- Hook: "Everyone says [X]. Here's the truth:"
- Myth: [common belief] (1 line)
- Fact: [real truth] (1-2 lines)
- Why this matters for the reader (1-2 lines)
- Engagement question at end`,
    step_by_step_guide: `**POST TYPE: STEP BY STEP GUIDE**
Caption structure:
- Hook: "Here's exactly how to [achieve outcome]:"
- Brief context (1 line)
- Steps: numbered, each max 8 words
- Save prompt: "Save this for later →"
- Engagement question at end`,
    mistake_list: `**POST TYPE: MISTAKE LIST**
Caption structure:
- Hook: "[X] mistakes [audience] make with [topic]:"
- Brief intro (1 line)
- List mistakes (numbered, punchy)
- The fix or insight (1-2 lines)
- Engagement question at end`,
  };

  lines.push(`\n${postStructures[postType]}`);

  // Hook formula
  lines.push(`
**HOOK FORMULA — USE ONE OF THESE:**
${hookFormulas[toneKey ?? "professional"] ?? hookFormulas.professional}`);

  // Caption rules
  const emojiGuide =
    input.emojiLevel === "high"
      ? "Use emojis liberally — 1-2 per paragraph. Align with content mood."
      : input.emojiLevel === "medium"
      ? "Use emojis sparingly — 1-2 total in caption. Only for emphasis."
      : "No emojis. Keep it clean and text-only.";

  lines.push(`
**CAPTION RULES (NON-NEGOTIABLE):**
- First line = hook (~125 characters max — this is what shows before "...more")
- Short paragraphs: 1-3 sentences max, blank line between each
- Conversational tone — like talking to a friend, not a press release
- Optimal length: 100-200 words (sweet spot for engagement + saves)
- Max length: 2200 characters
- End ALWAYS with an engagement question requiring a typed answer
  Good: "What's your biggest challenge with [topic]? Drop it below 👇"
  Bad: "What do you think?" (too vague)
- ${emojiGuide}
- NO generic AI phrases: "game-changing", "leverage", "synergy", "paradigm"
- NO "I'm excited to share" or "Thrilled to announce" openers`);

  // Graphic/text block rules
  if (input.textBlocks?.length) {
    const blockSummary = input.textBlocks.map((b) => `${b.label}: "${b.text}"`).join("; ");
    lines.push(`
**GRAPHIC TEXT BLOCKS (for carousel slides/overlay):**
These will appear on the image — keep them SHORT and punchy:
${blockSummary}
- Max 6 words per text block
- Bold phrases work best for high-contrast
- Complement the caption, don't repeat it`);
  }

  // Hashtag rules
  const hashtagCount =
    input.hashtagIntensity === "high" ? "8-12" : input.hashtagIntensity === "medium" ? "5-8" : "3-5";

  lines.push(`
**HASHTAG RULES:**
- Use exactly ${hashtagCount} hashtags
- Mix: 60% niche/specific (low competition) + 30% medium-reach + 10% broad
- Place hashtags at END of caption after a blank line
- Avoid banned or generic spam tags (#love, #instagood, #follow4follow)
- Tags should directly relate to: ${input.coreMessage.slice(0, 80)}`);

  // Image concept
  if (input.imageConcept) {
    lines.push(`
**IMAGE CONCEPT TO REFERENCE:**
${input.imageConcept}
- Graphic style: Clean, modern, high contrast — optimized for Instagram feed
- Brand colors: ${input.brandAssets.colorPalette.join(", ") || "auto"}
- Logo placement: Subtle, bottom corner if present`);
  }

  // Engagement maximizers
  lines.push(`
**ENGAGEMENT MAXIMIZERS (2026 Instagram algorithm):**
- Saves = #1 signal — make content "worth saving" (educational, lists, guides)
- Engagement question at end = second strongest signal (typed replies beat likes)
- "Save this" / "Bookmark this" language for educational posts
- "Tag a friend who needs this" for relatable/shareable posts
- Short paragraphs + line breaks = higher dwell time = better reach
- Shares to Stories/DMs = strongest reach signal — write shareworthy content`);

  return lines.join("\n");
}

/**
 * Instagram Refine Prompt — 2nd pass improvement
 * Takes initial caption → produces refined version with engagement score, quality flags, post type
 */
export function buildInstagramRefinePrompt(
  originalCaption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## ORIGINAL INSTAGRAM CAPTION
${originalCaption}`);

  // Determine expected post type for context
  const contentAngle = input.contentAngles?.[0];
  const postTypeMap: Partial<Record<string, InstagramPostType>> = {
    tip_list: "carousel_tips",
    story: "mini_story",
    step_by_step_guide: "step_by_step_guide",
    contrarian_opinion: "myth_vs_fact",
    data_insight: "mistake_list",
    behind_the_scenes: "mini_story",
  };
  const expectedPostType: InstagramPostType = contentAngle
    ? (postTypeMap[contentAngle] ?? "carousel_tips")
    : "carousel_tips";

  sections.push(`## CONTENT CONTEXT
- Core Message: ${input.coreMessage}
- Post Angle: ${strategy.postAngle}
- Original Hook Idea: ${strategy.hookIdea}
- Tone: ${TONE_LABELS[input.tones?.[0]]?.label || "Friendly"}
- Post Type: ${expectedPostType.replace(/_/g, " ")}
- Emoji Level: ${input.emojiLevel}`);

  sections.push(`## YOUR TASK
You are an Instagram Content Optimizer. Take the caption above and make it significantly more engaging.

**WHAT TO IMPROVE:**
1. Hook strength — the FIRST LINE (before "...more", ~125 chars) must stop the scroll. Rewrite it if needed using:
   - "Most [audience] are doing this the hard way."
   - "Stop [X]. Do [Y] instead."
   - "I used to [X]. Then I realized [Y]."
   - "[Number] [audience] don't know this about [topic]."
   - "The biggest mistake in [topic]."
2. Storytelling — ensure structure follows Hook → Story/Value → CTA
3. Short paragraphs — max 1-3 sentences per paragraph, blank lines between
4. Remove ALL generic AI phrases: "game-changing", "leverage", "synergy", "excited to share"
5. Break up any paragraphs longer than 3 sentences
6. End with an engagement question requiring a typed answer:
   - Bad: "What do you think?"
   - Good: "What's the hardest part of [topic] for you? Drop it below 👇"
7. Confirm post type is: ${expectedPostType.replace(/_/g, " ")} — adjust structure if needed
8. Length: target 100-200 words (can go to 300 if story demands it)
9. Hashtags: ${input.hashtagIntensity === "high" ? "8-12" : input.hashtagIntensity === "medium" ? "5-8" : "3-5"} relevant tags at end, niche + medium mix

**ENGAGEMENT SCORING (1-10):**
Rate the REFINED version:
- 9-10: Explosive hook (first ~125 chars), perfect paragraph breaks, strong engagement question, save-worthy, no AI clichés
- 7-8: Good hook, solid structure, minor improvements possible
- 5-6: Hook is weak OR CTA is generic
- Below 5: Major issues (no hook, wall of text, no engagement question)

**QUALITY FLAGS — identify any remaining issues:**
Examples: "Hook too weak — first line won't stop scroll", "No engagement question at end", "Paragraphs too long", "Contains AI buzzwords", "Caption too short", "Missing hashtags"

Respond in EXACTLY this JSON format:
{
  "refinedCaption": "The improved Instagram caption (full text, use \\n for line breaks)",
  "engagementScore": 8,
  "qualityFlags": ["Flag 1", "Flag 2"],
  "postType": "${expectedPostType}"
}

Rules:
- refinedCaption must use \\n for line breaks (JSON escaped newlines)
- engagementScore must be 1-10 integer
- qualityFlags is an array of strings — empty array [] if the post is excellent
- postType must be one of: carousel_tips, mini_story, myth_vs_fact, step_by_step_guide, mistake_list
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
}

/**
 * Facebook-specific caption instruction block
 * Called from buildCaptionGeneratorPrompt when facebook is in platforms
 */
function buildFacebookCaptionInstructions(input: PostGenerationInput): string {
  const lines: string[] = ["### Facebook — RELATABLE + DISCUSSION-DRIVEN REQUIRED"];

  const toneKey = input.tones?.[0];
  const contentAngle = input.contentAngles?.[0];

  // Step 0: Relatability rewrite (biggest quality lever for Facebook)
  lines.push(`
**STEP 0 — RELATABILITY REWRITE (MANDATORY FIRST STEP):**
Before writing the post, internally rewrite the core idea to feel human and conversational — NOT AI-written.
- Ask: "How would a real person share this with their friends or community?"
- Strip corporate/AI language — make it feel like a real conversation starter
- Example transform: "AI tools improve content workflow efficiency" → "I started using AI for my content and honestly? It changed everything. Here's what happened..."
- Use this rewritten, human-feeling angle as the foundation for the post`);

  // Step 1: Expand the idea
  lines.push(`
**STEP 1 — EXPAND THE IDEA:**
Before writing, think through:
- Main insight: the core takeaway in one simple sentence
- Supporting points: 2-3 relatable details that back it up
- Relatable angle: why this resonates with everyday people
- Takeaway: what the reader should feel, think, or do after reading`);

  // Step 2: Post structure
  lines.push(`
**POST STRUCTURE (follow this order):**
1. Relatable opening — a hook that feels personal, real, or familiar (1-2 lines)
2. Short explanation — context or story that makes it tangible (2-3 lines)
3. Key insight — the valuable takeaway stated clearly (1-2 lines)
4. Discussion question — end with a question that invites replies and comments (1 line)

Example flow: "I used to [struggle]. Then I realized [insight]. It changed [outcome]. Have you ever felt this way?"
`);

  // Hook formulas by tone
  const hookFormulas: Record<string, string> = {
    witty: `Pick ONE of these relatable hooks (witty tone):
- "Can we talk about [topic]? Because nobody talks about this enough."
- "Raise your hand if you've ever [relatable situation]."
- "Hot take: [unexpected but friendly observation]"`,
    bold: `Pick ONE of these relatable hooks (bold tone):
- "I used to think [wrong belief]. I was completely wrong."
- "Nobody talks about [topic] honestly. So I will."
- "[Blunt observation]. And that's okay."`,
    professional: `Pick ONE of these relatable hooks (professional tone):
- "I've seen this pattern with [audience] and wanted to share it."
- "Something I wish I knew earlier about [topic]:"
- "[Situation] taught me something important."`,
    inspirational: `Pick ONE of these relatable hooks (inspirational tone):
- "Last [time period], I was [situation]. Today, [result]."
- "The moment I stopped [X], everything shifted."
- "This is for anyone who's ever felt [relatable emotion]."`,
    authority: `Pick ONE of these relatable hooks (authority tone):
- "After [X years/clients], I keep seeing the same mistake with [topic]."
- "Here's something most people don't realize about [topic]:"
- "[Counter-intuitive truth]. Here's why it matters."`,
    friendly: `Pick ONE of these relatable hooks (friendly tone):
- "Okay, real talk — has anyone else dealt with [situation]?"
- "If you've ever struggled with [topic], this one's for you."
- "Quick thing I want to share about [topic] that changed my perspective."`,
    minimalist: `Pick ONE of these relatable hooks (minimalist tone):
- "[Simple, honest observation about topic]."
- "One thing about [topic]: [brief insight]."
- "[Situation]. [Surprising result]. That's it."`,
  };

  lines.push(`
**HOOK FORMULA — USE ONE OF THESE:**
${hookFormulas[toneKey ?? "friendly"] ?? hookFormulas.friendly}`);

  if (contentAngle) {
    lines.push(`
**CONTENT ANGLE: ${contentAngle.toUpperCase().replace(/_/g, " ")}**
Adapt the post structure to naturally reflect this angle while keeping the friendly, relatable tone.`);
  }

  // Caption rules
  lines.push(`
**CAPTION RULES (NON-NEGOTIABLE):**
- Length: 80–150 words (Facebook sweet spot — long enough to be valuable, short enough to read fully)
- Tone: friendly, warm, conversational — like talking to someone you know
- Paragraphs: short, 1-3 sentences each, with line breaks between paragraphs
- Language: simple, natural, no jargon — write at a 7th-grade reading level
- NO corporate buzzwords: "synergy", "leverage", "game-changing", "paradigm shift"
- NO "I'm excited to share" or "thrilled to announce" openers
- DO use "you" and "we" to create connection
- Engagement question at the END is MANDATORY — make it easy and inviting to answer`);

  // Image text blocks
  if (input.textBlocks?.length) {
    const blockSummary = input.textBlocks.map((b) => `${b.label}: "${b.text}"`).join("; ");
    lines.push(`
**GRAPHIC TEXT BLOCKS (for image overlay):**
These will appear on the image — keep them SHORT and punchy:
${blockSummary}
- Max 6 words per block (4-7 words is ideal)
- Bold, readable, educational tone
- Should complement the post, not repeat it`);
  }

  // Hashtag rules
  const hashtagCount =
    input.hashtagIntensity === "high" ? "4-5" : input.hashtagIntensity === "medium" ? "3-4" : "2-3";

  lines.push(`
**HASHTAG RULES (Facebook — lighter than Instagram):**
- Use ${hashtagCount} hashtags maximum — Facebook favors fewer, more relevant tags
- 3-5 max total — do NOT over-tag (it looks spammy on Facebook)
- Place hashtags at the END of the post after the discussion question
- Choose relevant, professional, non-spammy tags
- Avoid trending/generic tags — use specific, topic-relevant ones
- Tags should relate directly to: ${input.coreMessage.slice(0, 80)}`);

  // Image concept
  if (input.imageConcept) {
    lines.push(`
**IMAGE CONCEPT TO REFERENCE:**
${input.imageConcept}
- Graphic style: Clean, friendly, easy to read — optimized for Facebook feed
- Brand colors: ${input.brandAssets.colorPalette.join(", ") || "auto"}
- Logo placement: Bottom corner if present`);
  }

  // Engagement maximizers
  lines.push(`
**ENGAGEMENT MAXIMIZERS (Facebook algorithm 2025-2026):**
- Discussion questions drive comments — comments = highest engagement signal on Facebook
- Personal/relatable stories get shared — write content people want to show their network
- "Tag a friend who needs this" works well for advice/tips posts
- Short paragraphs + white space = higher read-through rate
- Avoid pure promotional content — Facebook suppresses it; value-first always
- The mandatory discussion question at the end should be easy to answer in 1-3 words or a short sentence`);

  return lines.join("\n");
}

/**
 * Pinterest-specific caption instruction block
 * Called from buildCaptionGeneratorPrompt when Pinterest is in platforms
 */
function buildPinterestCaptionInstructions(_input: PostGenerationInput): string {
  return `### Pinterest — SEARCH-FIRST + SAVE-FIRST REQUIRED

**CORE OBJECTIVE:**
- Write Pinterest descriptions that rank for search and drive saves/clicks.

**STRUCTURE RULES (MANDATORY):**
1. Open with a keyword-led value promise.
2. Include practical takeaway steps or outcomes.
3. Keep the language evergreen and actionable.
4. End with a save/click CTA.

**LENGTH + HASHTAGS:**
- Target description length: 250-500 characters
- Hashtags: 3-6 relevant tags only
- Prioritize niche and intent-based hashtags over broad vanity tags

**STYLE RULES:**
- Clear, helpful, and direct wording.
- Avoid vague hype copy or abstract motivational filler.
- Make the description useful enough that the reader wants to save the pin.`;
}

/**
 * Facebook Refine Prompt — 2nd pass improvement
 * Takes initial caption → produces refined version with engagement score and quality flags
 */
export function buildFacebookRefinePrompt(
  originalCaption: string,
  input: PostGenerationInput,
  strategy: ContentStrategyOutput,
  personaContext?: string
): string {
  const sections: string[] = [];

  if (personaContext) {
    sections.push(`## BRAND CONTEXT\n${personaContext}`);
  }

  sections.push(`## ORIGINAL FACEBOOK POST
${originalCaption}`);

  sections.push(`## CONTENT CONTEXT
- Core Message: ${input.coreMessage}
- Post Angle: ${strategy.postAngle}
- Original Hook Idea: ${strategy.hookIdea}
- Tone: ${TONE_LABELS[input.tones?.[0]]?.label || "Friendly"}
- Objective: ${POST_OBJECTIVE_LABELS[input.objective]?.label || input.objective}`);

  sections.push(`## YOUR TASK
You are a Facebook Content Optimizer. Take the post above and make it significantly more engaging and relatable.

**STEP 1 — RELATABILITY REWRITE FIRST:**
Before editing, ask: "Does this sound like a real person talking to their community, or does it sound like AI/corporate content?"
If it sounds AI-written, rewrite from a human perspective first, then optimize.

**WHAT TO IMPROVE:**
1. Opening hook — must feel real, relatable, personal. Rewrite if needed using:
   - "I used to [X]. Then I realized [Y]."
   - "Can we talk about [topic]?"
   - "Raise your hand if you've ever [situation]."
   - "Something I wish I knew earlier about [topic]:"
2. Natural tone — friendly, warm, conversational. Remove ANY formal/corporate/AI language
3. Structure — relatable opening → short explanation → key insight → discussion question
4. Length — target 80–150 words. Cut if over 150, expand if under 80
5. Short paragraphs — max 1-3 sentences per paragraph, blank lines between
6. Remove ALL generic AI phrases: "game-changing", "leverage", "synergy", "excited to share", "thrilled to announce"
7. Ensure MANDATORY discussion question at end that invites comments:
   - Bad: "What do you think?" (too vague)
   - Good: "Has this ever happened to you?" or "What's been your experience with [topic]?"
8. Hashtags: 3-5 max at end, relevant and non-spammy
9. Make content "shareable" — would someone want to show this to a friend?
10. Use "you" and "we" language to create community connection

**ENGAGEMENT SCORING (1-10):**
Rate the REFINED version:
- 9-10: Genuinely relatable opening, 80-150 words, friendly tone, strong discussion question, no AI clichés, shareable
- 7-8: Good opening, mostly natural tone, decent discussion question, minor issues
- 5-6: Opening is weak OR tone still feels corporate/AI OR no discussion question
- Below 5: Major issues (no discussion question, too long/short, clearly AI-written tone)

**QUALITY FLAGS — identify any remaining issues:**
Examples: "Opening still sounds AI-written", "No discussion question at end", "Too formal for Facebook", "Over 150 words — too long", "Under 80 words — needs more value", "Hashtags too many/generic", "Lacks relatable personal touch", "Sounds like a press release"

Respond in EXACTLY this JSON format:
{
  "refinedPost": "The improved Facebook post (full text, use \\n for line breaks)",
  "engagementScore": 8,
  "qualityFlags": ["Flag 1", "Flag 2"]
}

Rules:
- refinedPost must use \\n for line breaks (JSON escaped newlines)
- engagementScore must be 1-10 integer
- qualityFlags is an array of strings — empty array [] if the post is excellent
- ONLY return valid JSON, no markdown or extra text`);

  return sections.join("\n\n");
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

// ============================================================
// ReachPilot — Caption Template Library
// Structured caption frameworks: Problem→Solution, Hook→Value→CTA,
// Story Format, Authority Format + intelligent auto-selection
// ============================================================

import type {
  CaptionStylePreference,
  PostPlatform,
  PostObjective,
  NicheCategory,
} from "@/lib/types/postGeneration";

// ── Caption Template Definition ──────────────────────────────

export interface CaptionTemplate {
  id: string;
  name: string;
  description: string;
  /** The structural framework injected into the caption prompt */
  structure: string;
  /** Platform-specific variations */
  platformVariations: Partial<Record<PostPlatform, string>>;
  /** Best for these caption styles */
  bestFor: CaptionStylePreference[];
}

export type BuiltInCaptionTemplateId =
  | "problem_solution"
  | "hook_value_cta"
  | "story_format"
  | "authority_format"
  | "listicle_format"
  | "engagement_question";

// ── Template Library ─────────────────────────────────────────

export const CAPTION_TEMPLATES: Record<string, CaptionTemplate> = {
  problem_solution: {
    id: "problem_solution",
    name: "Problem → Solution",
    description: "Identify pain point, agitate, then present the solution",
    structure: `**CAPTION FRAMEWORK: PROBLEM → SOLUTION**
Follow this exact structure:

1. HOOK — State the problem the audience feels (1 line, emotionally resonant)
   Example: "You're spending 3 hours writing one LinkedIn post. That's insane."

2. AGITATE — Make them feel the pain deeper (2-3 lines)
   Describe consequences, what they're missing, or how it holds them back.
   Be specific — use numbers, scenarios, relatable situations.

3. SOLUTION — Present the answer (2-3 lines)
   Introduce your solution naturally (not salesy). Show the transformation.
   "Here's what changed..." / "The fix is simpler than you think:"

4. PROOF — Social proof or result (1-2 lines)
   A number, testimonial, or specific outcome.
   "We went from X to Y in Z time."

5. CTA — Clear next step (1 line)
   Tell them exactly what to do. Make it specific, not "check us out."`,
    platformVariations: {
      linkedin: `LinkedIn variation: Lead with a bold observation about the problem. Use whitespace. End with a thought-provoking question rather than a hard sell.`,
      x: `X variation: Compress to hook (problem) + punchline (solution) format. Max 250 chars. No hashtags.`,
      instagram_post: `Instagram variation: Hook in first line (before "more"). Use emojis to mark sections. Save-worthy formatting with tips.`,
      facebook: `Facebook variation: Start conversational — "Anyone else dealing with...?" Make it relatable. End with discussion question.`,
      pinterest: `Pinterest variation: Lead with a keyword-driven hook, then practical value steps. Optimize for save intent and evergreen usefulness.`,
    },
    bestFor: ["promotional", "educational", "authority"],
  },

  hook_value_cta: {
    id: "hook_value_cta",
    name: "Hook → Value → CTA",
    description: "Grab attention, deliver value, drive action",
    structure: `**CAPTION FRAMEWORK: HOOK → VALUE → CTA**
Follow this exact structure:

1. HOOK — Stop the scroll (1 line, first thing they read)
   Use one of these proven patterns:
   - Surprising statistic: "[Number]% of [audience] don't know this..."
   - Bold claim: "The biggest myth about [topic] is..."
   - Question: "What if I told you [unexpected claim]?"
   - Contrarian: "Everyone says [X]. They're wrong."

2. VALUE — Deliver the goods (3-5 lines)
   Provide actionable tips, insights, or information.
   Use numbered points, short sentences, or quick-fire bullets.
   Every line should teach or reveal something.
   Be specific: replace "many" with exact numbers, "often" with "3x a week."

3. BRIDGE — Connect value to action (1 line)
   Transition from giving value to asking for action.
   "Want the full breakdown?" / "Ready to try this?"

4. CTA — Drive specific action (1 line)
   Be explicit: "Comment 'GUIDE' and I'll DM you the template."
   Not vague: "Let me know what you think!"`,
    platformVariations: {
      linkedin: `LinkedIn variation: Value section uses → or ✅ for list items. End with a discussion question, not a hard CTA.`,
      x: `X variation: Compress hook + 1 key value point + question CTA. Under 250 chars.`,
      instagram_post: `Instagram variation: Use "Save this for later 📌" as CTA. Value section formatted for carousel-friendly reading.`,
      facebook: `Facebook variation: Value delivered as a mini-story or analogy. CTA is a community question.`,
      pinterest: `Pinterest variation: Use a keyword-led title line, then concise actionable value bullets. End with save/click CTA.`,
    },
    bestFor: ["educational", "authority", "promotional"],
  },

  story_format: {
    id: "story_format",
    name: "Story Format",
    description: "Narrative arc: situation, struggle, realization, lesson",
    structure: `**CAPTION FRAMEWORK: STORY FORMAT**
Follow this exact narrative arc:

1. HOOK — Start in the middle of the action (1 line)
   Drop the reader into the story. No preamble.
   "Last Tuesday I almost deleted everything."
   "3 months ago I was broke and clueless."
   "The email said: 'We're going in a different direction.'"

2. SITUATION — Set the scene (2-3 lines)
   Brief context. Who, where, what was happening.
   Make it vivid but concise — specific details create believability.

3. STRUGGLE — The conflict or challenge (2-3 lines)
   What went wrong? What was hard? What did you almost give up on?
   Vulnerability builds trust. Be honest.

4. TURNING POINT — The realization (1-2 lines)
   "Then I realized..." / "That's when it clicked..."
   One clear insight that changed everything.

5. LESSON — The takeaway for the reader (1-2 lines)
   Make it about THEM, not you.
   "If you're in the same place, here's what I'd tell you:"

6. ENGAGEMENT — Invite connection (1 line)
   "Have you ever felt this way?" / "What's your version of this story?"`,
    platformVariations: {
      linkedin: `LinkedIn variation: Perfect for personal_story or thought_leadership objectives. Use the "I → We → You" progression. Start personal, end universal.`,
      x: `X variation: Micro-story format — situation in 1 line, punchline lesson in 1 line. Max 250 chars.`,
      instagram_post: `Instagram variation: Story in caption drives saves. Include a "moral of the story" that's screenshot-worthy.`,
      facebook: `Facebook variation: Stories drive shares on Facebook. Make it feel like talking to a friend.`,
      pinterest: `Pinterest variation: Story should teach a repeatable method readers can save and revisit later.`,
    },
    bestFor: ["storytelling", "motivational", "conversational"],
  },

  authority_format: {
    id: "authority_format",
    name: "Authority Format",
    description: "Expert positioning with frameworks and proof",
    structure: `**CAPTION FRAMEWORK: AUTHORITY FORMAT**
Follow this exact structure:

1. CREDIBILITY HOOK — Establish why they should listen (1 line)
   Lead with experience, results, or a bold expert claim.
   "After working with 200+ [audience], I've seen this pattern:"
   "Here's what most [audience] get wrong about [topic]:"
   "[X years] in [field]. This is the #1 mistake I see."

2. FRAMEWORK — Present your expert model (3-5 lines)
   Name it if possible ("The 3-Step [X] Method").
   Present as numbered steps, principles, or pillars.
   Each point should be actionable and specific.

3. PROOF — Back it up (1-2 lines)
   Specific results: "This helped [client] go from X to Y."
   Or data: "Companies using this approach see Z% improvement."

4. CONTRARIAN INSIGHT — Set yourself apart (1-2 lines)
   Challenge a common belief in your industry.
   "Most people think [X]. The data shows [Y]."

5. CTA — Position for authority (1 line)
   "Follow for more [topic] frameworks."
   "Save this — you'll need it."
   Or a question: "Which of these surprised you most?"`,
    platformVariations: {
      linkedin: `LinkedIn variation: Framework posts perform extremely well. Use ✅ or → for steps. End with "Agree or disagree?" for debate.`,
      x: `X variation: Lead with the contrarian insight as the hook. Framework in thread if needed. Under 250 chars for main post.`,
      instagram_post: `Instagram variation: Perfect for carousel posts. Each framework step = 1 slide. Caption teases the framework.`,
      facebook: `Facebook variation: Position as helpful advice from an expert friend, not a lecture. Use relatable examples.`,
      pinterest: `Pinterest variation: Convert framework into saveable checklist language with keyword-rich phrasing.`,
    },
    bestFor: ["authority", "educational", "promotional"],
  },

  listicle_format: {
    id: "listicle_format",
    name: "Listicle Format",
    description: "Numbered list of tips, mistakes, or insights",
    structure: `**CAPTION FRAMEWORK: LISTICLE FORMAT**
Follow this exact structure:

1. HOOK — Promise specific value (1 line)
   Always include a NUMBER in the hook.
   "[X] things I wish I knew about [topic] sooner:"
   "[X] mistakes that are killing your [metric]:"
   "[X] [topic] hacks that actually work in 2026:"

2. LIST — Deliver the goods (1 line per item)
   Each item on its own line with a number.
   Each item is self-contained and actionable.
   Mix formats: tip, mistake, hack, myth, tool.
   Be specific — "Use Notion" not "Use a project management tool."

3. BONUS — Extra value (optional, 1 line)
   "Bonus: The one tool that makes all of this easier..."

4. SAVE CTA — Drive saves (1 line)
   "Save this for when you need it."
   "Bookmark this — you'll thank me later."

5. ENGAGEMENT — Discussion opener (1 line)
   "Which one surprised you the most?"
   "What would you add to this list?"`,
    platformVariations: {
      linkedin: `LinkedIn variation: Use ✅ or numbered lists. Keep to 5-7 items. End with "What would you add?" to drive comments.`,
      x: `X variation: Pick the strongest 3 items. Hook + mini-list format. Under 250 chars.`,
      instagram_post: `Instagram variation: Perfect for saves. "Save this for later 📌" CTA. Each item on its own line with emoji markers.`,
      facebook: `Facebook variation: Keep to 3-5 items. Make each one conversational. End with "Which one resonates most?"`,
      pinterest: `Pinterest variation: Best-fit Pinterest structure. Use numbered list with search keywords and explicit save CTA.`,
    },
    bestFor: ["educational", "authority", "conversational"],
  },

  engagement_question: {
    id: "engagement_question",
    name: "Engagement Question",
    description: "Short post designed to maximize comments and discussion",
    structure: `**CAPTION FRAMEWORK: ENGAGEMENT QUESTION**
Follow this exact structure:

1. CONTEXT — Brief setup (1-2 lines)
   Set up the question with a relatable scenario or observation.
   "I've been thinking about [topic] a lot lately."
   "Saw something interesting today..."
   "[Situation] and it got me wondering..."

2. THE QUESTION — The main engagement driver (1 line)
   Make it:
   - Easy to answer (low friction)
   - Polarizing enough to have multiple valid answers
   - Personal enough that people want to share their take
   Good: "What's the ONE tool you couldn't live without?"
   Bad: "What do you think about technology?"

3. OPTIONAL SEED — Give your answer first (1-2 lines)
   Sharing your own answer encourages others to share theirs.
   "For me, it's [answer]. Here's why: [brief reason]."

4. AMPLIFIER — Encourage sharing (1 line)
   "Tag someone who'd have an interesting answer."
   "Drop yours below 👇 — I read every reply."`,
    platformVariations: {
      linkedin: `LinkedIn variation: Professional question that sparks industry discussion. "What's the most underrated skill in [industry]?"`,
      x: `X variation: Just the question + optional personal take. Max 250 chars. Questions drive replies on X.`,
      instagram_post: `Instagram variation: Use this/that format or "Would you rather..." Encourage comments for algorithm boost.`,
      facebook: `Facebook variation: Conversational, community-focused. "Quick poll for my friends:" or "Curious what you all think:"`,
      pinterest: `Pinterest variation: Use engagement prompts sparingly; keep emphasis on practical saveable value.`,
    },
    bestFor: ["conversational", "storytelling", "motivational"],
  },
};

// ── Template Auto-Selection ──────────────────────────────────

/**
 * Selects the best caption template based on caption style, platform, and objective.
 * Returns the template ID.
 *
 * Priority: captionStyle match → objective match → platform default
 */
export function selectCaptionTemplate(
  captionStyle: CaptionStylePreference,
  platform: PostPlatform,
  objective: PostObjective,
  _niche?: NicheCategory,
): BuiltInCaptionTemplateId {
  // Direct style → template mapping
  const styleToTemplate: Record<CaptionStylePreference, BuiltInCaptionTemplateId | ""> = {
    educational: "hook_value_cta",
    storytelling: "story_format",
    motivational: "story_format",
    promotional: "problem_solution",
    authority: "authority_format",
    conversational: "engagement_question",
    auto: "", // Will be resolved below
  };

  // If user explicitly chose a style, use its preferred template
  if (captionStyle !== "auto") {
    const directMatch = styleToTemplate[captionStyle];
    if (directMatch && CAPTION_TEMPLATES[directMatch]) {
      return directMatch;
    }
  }

  // For "auto" — resolve based on objective + platform
  const objectiveToTemplate: Partial<Record<PostObjective, BuiltInCaptionTemplateId>> = {
    educational: "hook_value_cta",
    promotional: "problem_solution",
    thought_leadership: "authority_format",
    personal_story: "story_format",
    lead_generation: "problem_solution",
    engagement: "engagement_question",
    case_study: "authority_format",
    announcement: "hook_value_cta",
    event: "hook_value_cta",
    product_update: "problem_solution",
  };

  const fromObjective = objectiveToTemplate[objective];
  if (fromObjective && CAPTION_TEMPLATES[fromObjective]) {
    return fromObjective;
  }

  // Platform-based fallback
  const platformFallback: Record<PostPlatform, BuiltInCaptionTemplateId> = {
    linkedin: "authority_format",
    x: "hook_value_cta",
    instagram_post: "hook_value_cta",
    facebook: "story_format",
    pinterest: "listicle_format",
    threads: "hook_value_cta",
  };

  return platformFallback[platform] ?? "hook_value_cta";
}

export function isBuiltInCaptionTemplateId(value: string | undefined): value is BuiltInCaptionTemplateId {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(CAPTION_TEMPLATES, value);
}

export function getBuiltInCaptionTemplate(
  templateId: BuiltInCaptionTemplateId,
): CaptionTemplate | undefined {
  return CAPTION_TEMPLATES[templateId];
}

export function resolveCaptionTemplateId(
  captionStyle: CaptionStylePreference,
  platform: PostPlatform,
  objective: PostObjective,
  niche?: NicheCategory,
  forcedTemplateId?: string,
): BuiltInCaptionTemplateId {
  if (isBuiltInCaptionTemplateId(forcedTemplateId)) {
    return forcedTemplateId;
  }

  return selectCaptionTemplate(captionStyle, platform, objective, niche);
}

/**
 * Builds the caption template instruction block to inject into the caption prompt.
 * Returns empty string if no template is applicable.
 */
export function buildCaptionTemplateInstructions(
  captionStyle: CaptionStylePreference,
  platform: PostPlatform,
  objective: PostObjective,
  niche?: NicheCategory,
  forcedTemplateId?: string,
): string {
  const templateId = resolveCaptionTemplateId(
    captionStyle,
    platform,
    objective,
    niche,
    forcedTemplateId,
  );
  const template = CAPTION_TEMPLATES[templateId];

  if (!template) return "";

  const platformVariation = template.platformVariations[platform] ?? "";

  const sections: string[] = [
    `## CAPTION TEMPLATE: ${template.name.toUpperCase()}`,
    template.structure,
  ];

  if (platformVariation) {
    sections.push(`\n**PLATFORM-SPECIFIC ADAPTATION (${platform}):**\n${platformVariation}`);
  }

  return sections.join("\n\n");
}

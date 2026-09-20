import { OpenRouterClient } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/parseAIJson";
import type {
  Platform,
  TemplateCategory,
  PlatformVariant,
} from "@/lib/models/userSavedPostTemplate";

const client = new OpenRouterClient();

export interface ExtractedTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
  structure: string;
  hooks: string[];
  cta: string;
  tone: string;
  psychologyTriggers?: string[];
  requiredElements?: string[];
}

export interface TemplateExtractionResult {
  template: ExtractedTemplate;
  confidence: number;
  method: "ai_extraction" | "fallback_heuristic";
  platformSuggestions: Platform[];
}

/**
 * Extract a reusable template from a social media post using the configured AI provider.
 */
export async function extractTemplateFromPost(postData: {
  platform: Platform;
  caption: string;
  mediaUrls?: string[];
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  authorUsername?: string;
}): Promise<TemplateExtractionResult> {
  try {
    // Build extraction prompt
    const prompt = buildExtractionPrompt(postData);

    const model = client.getGenerativeModel({ model: "openrouter/free" });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    // Handle response - Gemini returns response as the result directly
    let text: string | undefined;
    
    // @ts-ignore - Response structure varies depending on API version
    if (response && typeof response === 'object') {
      // Try multiple possible response structures
      if ('response' in response && response.response) {
        // @ts-ignore
        text = response.response.text?.() || response.response.text;
      } else if ('text' in response) {
        // @ts-ignore
        text = typeof response.text === 'function' ? response.text() : response.text;
      } else if ('candidates' in response) {
        // @ts-ignore
        const candidates = response.candidates as any[];
        if (candidates && candidates.length > 0) {
          const content = candidates[0]?.content;
          if (content && content.parts && content.parts[0]) {
            text = content.parts[0].text;
          }
        }
      }
    }
    
    if (!text) {
      console.error("No valid response text from AI. Response structure:", { response: response ? Object.keys(response) : null });
      throw new Error("Invalid response structure from AI");
    }

    // Parse JSON with error handling
    const templateJson = parseAIJson(text);

    if (!templateJson || typeof templateJson !== "object") {
      throw new Error("Invalid JSON from AI");
    }

    // Validate required fields
    const template = validateTemplate(templateJson);

    // Calculate confidence score
    const confidence = calculateConfidence(template);

    // Suggest applicable platforms
    const platformSuggestions = suggestPlatforms(template, postData.platform);

    return {
      template,
      confidence,
      method: "ai_extraction",
      platformSuggestions,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Template extraction failed:", errorMsg);
    console.warn("[extractTemplateFromPost] Falling back to heuristic extraction");
    return buildFallbackExtraction(postData);
  }
}

/**
 * Generate platform-specific variants of a template
 */
export async function generatePlatformVariants(
  template: ExtractedTemplate,
  originalPlatform: Platform,
  suggestedPlatforms: Platform[]
): Promise<PlatformVariant[]> {
  const platforms = ["linkedin", "x", "facebook", "instagram", "pinterest", "threads"] as const;

  // Filter to suggested + original platforms
  const targetPlatforms = platforms.filter(
    (p) => p === originalPlatform || suggestedPlatforms.includes(p as Platform)
  );

  const variants = await Promise.all(
    targetPlatforms.map((platform) =>
      adaptTemplateForPlatform(template, platform as Platform)
    )
  );

  return variants.filter((v) => v !== null) as PlatformVariant[];
}

/**
 * Adapt template for a specific platform.
 *
 * The save-template flow only needs a stable per-platform preview, so we
 * generate that locally instead of making a second Gemini call that can fail
 * independently of the main extraction.
 */
async function adaptTemplateForPlatform(
  template: ExtractedTemplate,
  platform: Platform
): Promise<PlatformVariant | null> {
  return buildFallbackPlatformVariant(template, platform);
}

function buildFallbackPlatformVariant(
  template: ExtractedTemplate,
  platform: Platform
): PlatformVariant {
  const constraints = platformConstraints[platform];
  const hook = template.hooks[0] || template.structure.slice(0, 120).trim();

  return {
    platform,
    structure: `Adapt the template for ${platform} by keeping the same hook -> insight -> CTA flow. Rephrase the opening around ${hook || "the core angle"}, preserve the main takeaway, and adjust the close so it feels native to ${platform}.`,
    characterLimit: constraints.characterLimit ?? undefined,
    exampleAdaptation: `Open with ${hook || "the strongest original angle"}, keep the central insight intact, then end with a concise ${platform}-native CTA.`,
    confidence: 68,
  };
}

/**
 * Build extraction prompt for Gemini
 */
function buildExtractionPrompt(postData: {
  platform: Platform;
  caption: string;
  metrics?: any;
  authorUsername?: string;
}): string {
  if (postData.platform === "x") {
    return buildXExtractionPrompt(postData);
  }

  const metricsContext = postData.metrics
    ? `
Engagement Metrics:
- Likes: ${postData.metrics.likes}
- Comments: ${postData.metrics.comments}
- Shares: ${postData.metrics.shares}
- Views: ${postData.metrics.views || "N/A"}`
    : "";

  return `
Analyze this ${postData.platform.toUpperCase()} post and extract a reusable template.

POST CONTENT:
"${postData.caption}"
${metricsContext}

Your task: Extract the underlying structure/pattern that makes this post effective, making it reusable for other topics/industries.

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "name": "Template name (max 50 chars, e.g. 'Customer Success Story')",
  "description": "1-2 sentence summary of what this template does",
  "category": "one of: how_to, listicle, testimonial, thought_leadership, engagement_question, personal_story, announcement, myth_busting, motivational, product_launch, behind_the_scenes, promotional",
  "structure": "Reusable 3-4 sentence framework that explains how to build a post like this. Be specific about the narrative arc, hook style, and CTA approach.",
  "hooks": ["hook1 extracted from post", "hook2 extracted from post"],
  "cta": "The call-to-action or engagement mechanism (e.g. 'Ask for opinions', 'Direct link to product', 'Encourage comments')",
  "tone": "Voice/style (e.g. 'professional yet approachable', 'energetic and motivational', 'educational and authoritative')",
  "psychologyTriggers": ["FOMO", "Social proof", "Reciprocity", "Scarcity", etc],
  "requiredElements": ["What makes this post work: the essential components"]
}

Guidelines:
- The structure should be general enough to apply to different topics
- Hooks must be specific to what makes THIS post engaging
- Include 2-3 psychology triggers that drive the post's effectiveness
- Category should match the post's primary strategy
- Confidence will be assessed after: low if missing hooks/CTA/structure, high if all elements clearly present
`;
}

function buildXExtractionPrompt(postData: {
  platform: Platform;
  caption: string;
  metrics?: any;
  authorUsername?: string;
}): string {
  const metricsContext = postData.metrics
    ? `
Engagement Metrics:
- Likes: ${postData.metrics.likes ?? 0}
- Replies: ${postData.metrics.replies ?? postData.metrics.comments ?? 0}
- Reposts: ${postData.metrics.retweets ?? postData.metrics.shares ?? 0}
- Views: ${postData.metrics.views || "N/A"}`
    : "";

  return `
You are a senior X (Twitter) growth strategist. Read the post and extract the reusable writing blueprint, not a summary.

POST CONTENT:
"${postData.caption}"
${metricsContext}

Your task: deconstruct the post into a reusable template that can be used to write a new post in the same style.

X-specific rules:
- Focus on hook, tension, pacing, line breaks, and CTA
- Detect if the post is a single post or a thread
- Capture contrarian framing, micro-story beats, list formatting, or opinion pattern when present
- Use short, direct, X-native language in the structure
- Do not mention platform names in the final template unless needed

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "name": "Short X template name",
  "description": "1-2 sentence summary of the pattern",
  "category": "one of: how_to, listicle, testimonial, thought_leadership, engagement_question, personal_story, announcement, myth_busting, motivational, product_launch, behind_the_scenes, promotional",
  "structure": "Reusable 3-4 sentence blueprint for writing a post in this style. Explain the hook, body flow, and CTA.",
  "hooks": ["Hook patterns extracted from the post"],
  "cta": "The engagement action or conversion ask",
  "tone": "Voice/style in plain English",
  "psychologyTriggers": ["curiosity", "social proof", "contrarian framing"],
  "requiredElements": ["hook", "body", "cta"]
}

Guidelines:
- Hooks should be specific to what makes THIS X post work
- The structure should be reusable across new topics while preserving the style
- Include at least 2 psychology triggers when the post is clearly structured
- Keep the output concise, practical, and reusable for future X post generation
`;
}

function buildFallbackExtraction(postData: {
  platform: Platform;
  caption: string;
  metrics?: any;
  authorUsername?: string;
}): TemplateExtractionResult {
  const lines = postData.caption
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const topLine = lines[0] || postData.caption.slice(0, 120).trim();
  const bulletLines = lines.filter((line) => /^([*-]|\d+[.)])\s+/.test(line));
  const isQuestion = /\?$/.test(postData.caption.trim()) || /\bwhat do you think\b|\bthoughts\b|\bagree\b/i.test(postData.caption);
  const isHowTo = /\bhow to\b|\bstep\b|\bsteps\b|\bguide\b|\bframework\b/i.test(postData.caption);
  const isContrarian = /\bhot take\b|\bunpopular opinion\b|\bwrong\b|\bstop\b/i.test(postData.caption);
  const isStory = /\bI\b|\bmy\b|\bwe\b|\byesterday\b|\btoday\b|\bwhen I\b/i.test(postData.caption);

  const category = isHowTo
    ? "how_to"
    : isQuestion
      ? "engagement_question"
      : isContrarian
        ? "thought_leadership"
        : isStory
          ? "personal_story"
          : bulletLines.length >= 3
            ? "listicle"
            : "thought_leadership";

  const hooks = [
    topLine.slice(0, 140),
    bulletLines[0] || topLine.slice(0, 90),
  ].filter(Boolean);

  const cta = isQuestion
    ? "Invite replies with a direct question"
    : /\bsave\b/i.test(postData.caption)
      ? "Ask readers to save the post"
      : /\bcomment\b|\breply\b/i.test(postData.caption)
        ? "Ask readers to share their opinion in the comments"
        : "End with a short engagement prompt";

  const tone = isContrarian
    ? "contrarian and opinionated"
    : isHowTo
      ? "educational and practical"
      : isStory
        ? "personal and reflective"
        : "clear and concise";

  const psychologyTriggers = [
    isQuestion ? "curiosity" : "clarity",
    isStory ? "relatability" : "social proof",
    isContrarian ? "contrarian framing" : "simplicity",
  ];

  const template: ExtractedTemplate = {
    name: isHowTo
      ? "X How-To Blueprint"
      : isQuestion
        ? "X Question Hook"
        : isContrarian
          ? "X Contrarian Post"
          : "X Thought Leadership Blueprint",
    description: `Heuristic fallback extracted from the post when Gemini is unavailable. Built from the opening hook, structure, and CTA cues in the X post.`,
    category: category as TemplateCategory,
    structure: `Start with the strongest opening line: ${topLine.slice(0, 120)}. Build the body using the same pacing and line-break pattern as the original post, then close with a direct CTA that matches the post's engagement style.`,
    hooks,
    cta,
    tone,
    psychologyTriggers,
    requiredElements: ["hook", "body", "cta"],
  };

  return {
    template,
    confidence: 62,
    method: "fallback_heuristic",
    platformSuggestions: postData.platform === "x" ? ["x"] : [postData.platform],
  };
}

function isGeminiApiKeyIssue(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /API key not valid|API_KEY_INVALID|invalid api key/i.test(message);
}

/**
 * Validate and sanitize extracted template
 */
function validateTemplate(data: any): ExtractedTemplate {
  const validCategories: TemplateCategory[] = [
    "how_to",
    "listicle",
    "thought_leadership",
    "product_launch",
    "behind_the_scenes",
    "testimonial",
    "engagement_question",
    "personal_story",
    "announcement",
    "myth_busting",
    "motivational",
    "promotional",
  ];

  const category = validCategories.includes(data.category)
    ? data.category
    : ("thought_leadership" as TemplateCategory);

  return {
    name: String(data.name || "Untitled Template").slice(0, 50),
    description: String(data.description || ""),
    category,
    structure: String(data.structure || ""),
    hooks: Array.isArray(data.hooks) ? data.hooks.map(String).filter(Boolean) : [],
    cta: String(data.cta || ""),
    tone: String(data.tone || "professional"),
    psychologyTriggers: Array.isArray(data.psychologyTriggers)
      ? data.psychologyTriggers.map(String).filter(Boolean)
      : [],
    requiredElements: Array.isArray(data.requiredElements)
      ? data.requiredElements.map(String).filter(Boolean)
      : [],
  };
}

/**
 * Calculate confidence score (0-100)
 */
function calculateConfidence(template: ExtractedTemplate): number {
  let confidence = 100;

  // Deduct points for missing elements
  if (!template.hooks || template.hooks.length === 0) confidence -= 20;
  if (!template.cta || template.cta.length < 10) confidence -= 25;
  if (!template.structure || template.structure.length < 30) confidence -= 25;
  if (!template.tone || template.tone.length < 5) confidence -= 10;
  if (template.name && template.name.toLowerCase().includes("x")) confidence += 2;

  // Bonus for rich psychology triggers
  if (template.psychologyTriggers && template.psychologyTriggers.length >= 2) confidence += 5;

  // Bonus for required elements
  if (template.requiredElements && template.requiredElements.length >= 2) confidence += 5;

  // Floor at 45, ceiling at 100
  return Math.max(45, Math.min(100, confidence));
}

/**
 * Suggest which platforms this template is applicable to
 */
function suggestPlatforms(
  template: ExtractedTemplate,
  sourcePlatform: Platform
): Platform[] {
  const suggestions: Platform[] = [sourcePlatform];

  // Short structure = likely suitable for X
  if (template.structure.length < 200) {
    if (!suggestions.includes("x")) suggestions.push("x");
  }

  // Professional tone = LinkedIn
  if (template.tone.toLowerCase().includes("professional")) {
    if (!suggestions.includes("linkedin")) suggestions.push("linkedin");
  }

  // Casual/engagement = Facebook
  if (
    template.tone.toLowerCase().includes("casual") ||
    template.category === "engagement_question"
  ) {
    if (!suggestions.includes("facebook")) suggestions.push("facebook");
  }

  // If has motivational/personal = broader appeal
  if (
    template.category === "personal_story" ||
    template.category === "motivational"
  ) {
    const allPlatforms: Platform[] = [
      "linkedin",
      "x",
      "facebook",
      "instagram",
      "threads",
    ];
    allPlatforms.forEach((p) => {
      if (!suggestions.includes(p)) suggestions.push(p);
    });
  }

  // Pinterest = visual focus (mention of images/pins)
  if (template.structure.toLowerCase().includes("visual")) {
    if (!suggestions.includes("pinterest")) suggestions.push("pinterest");
  }

  return suggestions;
}

/**
 * Platform constraints for adaptation
 */
const platformConstraints = {
  x: {
    characterLimit: 280,
    description: "X (formerly Twitter) - Fast-paced, real-time, viral potential",
    bestPractices: "Strong hook in first sentence, high engagement rate, threading for length",
    contentFormat: "Text (sometimes with links/images), threads, short-form",
  },
  linkedin: {
    characterLimit: null,
    description: "LinkedIn - Professional, B2B/personal brand, credibility-focused",
    bestPractices: "Thought leadership angle, authentic voice, industry insights",
    contentFormat: "Text, articles, carousel posts, video",
  },
  facebook: {
    characterLimit: null,
    description: "Facebook - Community-oriented, conversational, engagement-driven",
    bestPractices: "Conversational tone, asks for comments, community building",
    contentFormat: "Text, images, videos, stories, events",
  },
  instagram: {
    characterLimit: null,
    description: "Instagram - Visual-first, aesthetic, hashtag-heavy, trends",
    bestPractices: "Hook in first line (before ...), relevant hashtags (10-30), calls for saves/shares",
    contentFormat: "Images, Reels (video), Carousels, Stories",
  },
  pinterest: {
    characterLimit: 500,
    description: "Pinterest - Visual discovery, pins, boards, SEO-friendly descriptions",
    bestPractices: "Keyword-optimized description, vertical images 1000x1500px, clear visuals",
    contentFormat: "Pins, Idea Pins (video), collections",
  },
  threads: {
    characterLimit: 500,
    description: "Threads - Thread-based conversation, long-form accessible",
    bestPractices: "Multi-part threads, each post 500 chars, conversational flow",
    contentFormat: "Text threads, can include images in thread parts",
  },
};

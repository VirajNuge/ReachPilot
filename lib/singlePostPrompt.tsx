// ===============================================
//  SINGLE POST PROMPT BUILDER (FINAL FULL VERSION)
// ===============================================

import {
  GeneratorFormState,
  PlatformFormat,
} from "@/app/pages/appPages/[id]/postGenerator/page";

// --------------------------------------------------
// PLATFORM META
// --------------------------------------------------

type PlatformMeta = {
  label: string;
  description: string;
  aspectRatio: string;
  recommendedWidth: number;
  recommendedHeight: number;
  usageNotes: string;
  textSafeZone: string;
  focalGuidance: string;
};

const getPlatformMeta = (platform: PlatformFormat): PlatformMeta => {
  const base: Partial<Record<PlatformFormat, PlatformMeta>> = {
    IG_SQUARE: {
      label: "Instagram Square Post",
      description: "Feed-friendly square format.",
      aspectRatio: "1:1",
      recommendedWidth: 1080,
      recommendedHeight: 1080,
      usageNotes: "Avoid edges; prioritize center layout.",
      textSafeZone: "Central 70%",
      focalGuidance: "Strong centered focal point.",
    },

    IG_PORTRAIT: {
      label: "Instagram Portrait Post",
      description: "High-impact 4:5 portrait feed post.",
      aspectRatio: "4:5",
      recommendedWidth: 1080,
      recommendedHeight: 1350,
      usageNotes: "Keep critical text above bottom UI.",
      textSafeZone: "Top 60%",
      focalGuidance: "Headline in the upper third.",
    },

    IG_STORY: {
      label: "Instagram Story",
      description: "Fullscreen immersive vertical format.",
      aspectRatio: "9:16",
      recommendedWidth: 1080,
      recommendedHeight: 1920,
      usageNotes: "Avoid top & bottom 15% UI overlays.",
      textSafeZone: "Central vertical band.",
      focalGuidance: "Centered composition.",
    },

    YOUTUBE_THUMBNAIL: {
      label: "YouTube Thumbnail",
      description: "CTR-optimized visual for YouTube.",
      aspectRatio: "16:9",
      recommendedWidth: 1280,
      recommendedHeight: 720,
      usageNotes: "Avoid timestamp area at bottom-right.",
      textSafeZone: "Left and upper regions preferred.",
      focalGuidance: "Text left, expressive subject right.",
    },
  };

  return (
    base[platform] || {
      label: "Generic Social Post",
      description: "Standard 4:5 high-engagement post.",
      aspectRatio: "4:5",
      recommendedWidth: 1080,
      recommendedHeight: 1350,
      usageNotes: "Balanced composition ideal.",
      textSafeZone: "Central 70%",
      focalGuidance: "Clear center focal point.",
    }
  );
};

// --------------------------------------------------
// CAPTION RULES
// --------------------------------------------------

const getPlatformCaptionRules = (platform: PlatformFormat) => {
  switch (platform) {
    case "IG_SQUARE":
    case "IG_PORTRAIT":
    case "IG_REEL_COVER":
      return `
INSTAGRAM CAPTION RULES:
- Emotional, human tone.
- Hook in first 2 lines.
- Max 2,200 characters.
- Use 3–12 niche, relevant hashtags.
`;

    case "LINKEDIN_LANDSCAPE":
    case "LINKEDIN_PORTRAIT":
    case "LINKEDIN_SQUARE":
      return `
LINKEDIN CAPTION RULES:
- Professional tone only.
- Max 700 characters.
- NO emojis unless user provided.
- Max 3 hashtags.
`;

    case "TWITTER_POST":
      return `
TWITTER/X CAPTION RULES:
- Max 280 characters.
- Short, sharp, scroll-stopping.
- Max 2 hashtags.
`;

    default:
      return `
DEFAULT CAPTION RULES:
- Clear, skimmable structure.
`;
  }
};

// --------------------------------------------------
// SEO RULES
// --------------------------------------------------

const getSEOInstructions = (postIdea: string) => `
SEO RULES:
- Extract 3–5 SEO keywords from: "${postIdea}".
- Use each keyword 1–2 times naturally.
- NO keyword stuffing.
- Place keywords early in the caption.
`;

// --------------------------------------------------
// CONTENT RULES
// --------------------------------------------------

const getContentInstructions = (textElements: any[], postIdea: string) => {
  let out = "CONTENT RULES:";

  const get = (t: string) =>
    textElements.find((x: any) => x.type === t)?.content;

  const headline = get("HEADLINE");
  const subhead = get("SUBHEAD");
  const body = get("BODY");
  const quote = get("QUOTE");
  const cta = get("CTA");

  // HEADLINE
  if (headline) out += `\n- "headline" MUST BE EXACT: "${headline}".`;
  else out += `\n- Generate a compelling headline referencing "${postIdea}".`;

  // MERGED CONTENT
  let merged = "";
  if (subhead) merged += subhead + " ";
  if (body) merged += body + " ";
  if (quote) merged += `"${quote}"`;

  if (merged.trim()) {
    out += `
- "content" MUST expand on user-provided text WITHOUT changing meaning.
- Preserve ALL phrases EXACTLY as given.
- Provided text: "${merged.trim()}".`;
  } else {
    out += `\n- "content": Write a clear explanation appropriate for the audience.`;
  }

  // CTA
  if (cta) out += `\n- "caption" MUST end with the CTA EXACTLY: "${cta}".`;

  // Combine
  out += `

${getPlatformCaptionRules((globalThis as any).platformContext)}
${getSEOInstructions(postIdea)}

CAPTION STRUCTURE TEMPLATE:
1. Hook
2. Main message
3. Value or insight
4. CTA (must match CTA rule)
5. Hashtags

EMOJI RULES:
- LinkedIn: NONE.
- All others: max 1–3 emojis.
`;

  return out;
};

// --------------------------------------------------
// VISUAL DESCRIPTION
// --------------------------------------------------

const getVisualInstructions = (state: GeneratorFormState) => {
  const get = (t: string) =>
    state.textElements.find((x) => x.type === t)?.content;

  const headline = get("HEADLINE") || "Headline";
  const body = get("BODY");
  const meta = getPlatformMeta(state.platform);

  const assetDescriptions = state.images
    .map((i) => i.description)
    .filter(Boolean)
    .join(", ");

  const assetRules =
    state.images.length > 0
      ? `
ASSET PRESERVATION (CRITICAL):
- Uploaded images MUST appear EXACTLY as provided.
- DO NOT redraw, stylize, or recolor them.
- Treat them as fixed photographic layers.
- Integrate using composition, lighting, spacing ONLY.
`
      : `
No uploaded assets — full creative freedom allowed.
`;

  const density =
    state.layoutDensity === 1
      ? "Minimalist layout."
      : state.layoutDensity === 2
      ? "Balanced layout."
      : "Layered, high-energy composition.";

  return `
VISUAL DESCRIPTION (~300–350 words):

1. PLATFORM SETTINGS
- Aspect Ratio: ${meta.aspectRatio}
- Render Size: ${meta.recommendedWidth}x${meta.recommendedHeight}
- Safe Zones: ${meta.textSafeZone}
- Behaviour: ${meta.usageNotes}
- Focal Guidance: ${meta.focalGuidance}

2. NARRATIVE DIRECTION
Create a visually compelling concept based on "${state.postIdea}".
Reflect audience tone: "${state.targetAudience}".
Incorporate emotional tone from: "${body || ""}".
Use cinematic light, depth cues, contrast, smooth gradients.

3. UPLOADED ASSETS
${assetRules}
- Asset descriptions: ${assetDescriptions || "none"}.

4. TYPOGRAPHY
- Use headline "${headline}" prominently.
- Typography Mood: ${state.typographyMood}
- Include subtle CTA region if applicable.

5. BRAND SYSTEM
- Colors: ${state.colors.map((c) => c.value).join(", ")}
- Background Style: ${state.backgroundStyle}
- Layout Density: ${density}
- Keywords: ${state.designKeywords || "None"}

6. COMPOSITION RULES
- Strong hierarchy.
- Maintain readability at small preview sizes.
- Use lighting & framing to guide the eye.
- Avoid clutter or distortions.

7. RENDERING QUALITY
- High-end cinematic detail.
- Smooth gradients, DOF, natural shadows.
- Avoid surreal artifacts unless user implied.
`;
};

// --------------------------------------------------
// FINAL PROMPT BUILDER
// --------------------------------------------------

export const buildSinglePostPrompt = (state: GeneratorFormState) => {
  (globalThis as any).platformContext = state.platform;

  const meta = getPlatformMeta(state.platform);
  const content = getContentInstructions(state.textElements, state.postIdea);
  const visuals = getVisualInstructions(state);

  // RETURN IMAGE DATA TO GEMINI
  const imagesForGemini = state.images.map((i) => ({
    base64: i.base64 || "",
    mimeType: i.mimeType || "image/png",
    description: i.description || "",
  }));

  // STRICT JSON SCHEMA
  const schema = `
RETURN EXACTLY ONE JSON OBJECT WITH ALL FIELDS REQUIRED:

{
  "type": "${state.postType.toLowerCase()}",
  "headline": string,
  "content": string,
  "caption": string,
  "visual_description": string,

  "strategy": {
    "best_posting_day": string,
    "best_posting_time": string,
    "why_this_works": string,
    "algorithm_alignment": string,
    "engagement_tips": string[],
    "visual_tips": string[],
    "caption_tips": string[]
  },

  "engagement_score": {
    "score_value": number,
    "predicted_performance": string,
    "score_explanation": string,
    "platform_factors": object,
    "content_factors": object,
    "audience_factors": object
  },

  "hashtags": string[],
  "alt_text": string,
  "seo_keywords": string[],
  "thumbnail_text": string,

  "cross_platform_reposts": {
    "instagram": string,
    "linkedin": string,
    "facebook": string,
    "pinterest": string,
    "twitter": string
  },

  "input_images": ${JSON.stringify(imagesForGemini)},

  "image_request": "Generate using visual_description at ${
    meta.recommendedWidth
  }x${meta.recommendedHeight} respecting ${meta.aspectRatio}."
}

RULES:
- DO NOT omit any field.
- Use "" or [] if data not available.
- DO NOT output markdown.
- DO NOT add explanations.
- RETURN RAW JSON ONLY.
`;

  return `
You are a world-class Creative Director + Social Strategist.
Follow ALL rules strictly.

${schema}

==============================
CONTENT RULES
==============================
${content}

==============================
VISUAL ART DIRECTION
==============================
${visuals}

==============================
STRATEGY RULES
==============================
- engagement_tips = EXACTLY 3
- visual_tips = 2–3
- caption_tips = 2–3
- posting times must be realistic

==============================
ENGAGEMENT SCORE RULES
==============================
Score 0–100 + reasoning (+ 3 category factors).

==============================
METADATA RULES
==============================
- Hashtags follow platform rules
- SEO keywords: 4–8
- Alt text: short & descriptive
- Thumbnail text: 4–8 words

==============================
RETURN ONLY JSON NOW.
==============================
`;
};

// REMOVED "use server" - This is a helper utility, not a Server Action
import {
  GeneratorFormState,
  PlatformFormat,
} from "@/app/pages/appPages/[id]/postGenerator/page";

// --------------------------------------------------
// PLATFORM RULEBOOK
// --------------------------------------------------
const getPlatformRules = (platform: PlatformFormat): string => {
  const rules: Record<string, string> = {
    IG_SQUARE: "Instagram Square (1:1). Central, bold, high-impact visuals.",
    IG_PORTRAIT:
      "Instagram Portrait (4:5). Immersive storytelling composition.",
    IG_STORY:
      "Instagram Story (9:16). Full bleed, motion-feel, safe text zones.",
    LINKEDIN_LANDSCAPE: "LinkedIn Landscape. Corporate, editorial, structured.",
    LINKEDIN_PORTRAIT:
      "LinkedIn Portrait. Document-style, clean text hierarchy.",
    LINKEDIN_SQUARE: "LinkedIn Square. Strong corporate identity feel.",
    TWITTER_POST: "Twitter/X. Fast readability, high contrast.",
    FB_POST: "Facebook. Warm, emotional, broad demographic appeal.",
  };
  return (
    rules[platform] || "General Social Media — strong readability + contrast."
  );
};

// --------------------------------------------------
// CONTENT LOGIC
// --------------------------------------------------
const getContentInstructions = (textElements: any[], postIdea: string) => {
  let out = "CRITICAL JSON RULES:";

  const get = (t: string) =>
    textElements.find((x: any) => x.type === t)?.content;

  const headline = get("HEADLINE");
  const subhead = get("SUBHEAD");
  const body = get("BODY");
  const quote = get("QUOTE");
  const cta = get("CTA");

  // HEADLINE
  if (headline) {
    out += `\n- JSON "headline" MUST BE: "${headline}"`;
  } else {
    out += `\n- JSON "headline": Create a strong hook based on "${postIdea}".`;
  }

  // CONTENT MERGE
  let merged = "";
  if (subhead) merged += subhead + " ";
  if (body) merged += body + " ";
  if (quote) merged += `"${quote}"`;

  if (merged.trim().length > 0) {
    out += `\n- JSON "content" MUST BE: "${merged.trim()}"`;
  } else {
    out += `\n- JSON "content": Write a clear explanation of the topic.`;
  }

  // CTA
  if (cta) {
    out += `\n- JSON "caption" MUST END WITH CTA: "${cta}"`;
  }

  return out;
};

// --------------------------------------------------
// VISUAL LOGIC → SUPER CREATIVE VERSION
// --------------------------------------------------
const getVisualInstructions = (state: GeneratorFormState) => {
  const get = (t: string) =>
    state.textElements.find((x) => x.type === t)?.content;

  const headline = get("HEADLINE") || "HEADLINE";
  const subhead = get("SUBHEAD");
  const body = get("BODY");
  const quote = get("QUOTE");
  const cta = get("CTA");

  const tone = state.tone || "Professional";

  // Narrative Layer
  let narrative = `Create a visually arresting, concept-driven artwork inspired by the post topic: "${state.postIdea}". 
The image should feel like it came from a world-class creative director — rich cinematic storytelling, metaphorical depth, and premium brand aesthetics.`;

  if (body) narrative += `\n- Core narrative theme: "${body}".`;
  if (subhead) narrative += `\n- Reinforcing motif: "${subhead}".`;
  if (quote) narrative += `\n- Emotional shading guided by: "${quote}".`;

  // User Images
  let assets = "";
  const descs = state.images.map((i) => i.description).filter(Boolean);
  if (descs.length) {
    assets = `\n- Integrate user assets (${descs.join(
      ", "
    )}) as stylized design elements blended naturally into the composition — avoid flat pasting.`;
  }

  // Brand Colors
  const colors =
    state.colors.length > 0
      ? `STRICT BRAND PALETTE: ${state.colors
          .map((c) => `${c.name} (${c.value})`)
          .join(
            ", "
          )}. Use with tonal harmony, cinematic contrast, and luxurious refinement.`
      : "Use a premium, high-end, design-forward palette.";

  return `
VISUAL DESCRIPTION RULES (ENHANCED CREATIVE DIRECTOR MODE):
Provide a 150–200 word Imagen 4 art-direction prompt.

1. HIGH-END CONCEPTUAL DIRECTION:
   ${narrative}
   ${assets}

   Treat the artwork like a luxury brand campaign: sculpted contrast, intentional spacing,
   atmospheric lighting, and a strong visual hierarchy. Lean into symbolism — transform abstract
   ideas into physical, sculptural scenes that evoke emotion and meaning.

2. TYPOGRAPHY AS PHYSICAL DESIGN:
   - Render headline "${headline}" as a real 3D object.
   - Material style: ${
     state.typographyMood
   } (interpret creatively — metallic, carved stone,
     iridescent, holographic, brushed alloy, etc. depending on tone).
   - Text should interact with the scene: cast shadows, reflect light, occupy space.
   ${cta ? `- Add a small CTA badge "${cta}" with elegant emphasis.` : ""}

3. VISUAL STYLE + BRAND SYSTEM:
   - ${colors}
   - Background Style: ${
     state.backgroundStyle
   }, reimagined with cinematic atmosphere, fog,
     volumetric light, or texture depth.
   - Design Keywords: ${state.designKeywords || "None"}
   - Layout Density: ${
     state.layoutDensity === 1
       ? "Minimalist — clean negative space, quiet tension."
       : state.layoutDensity === 2
       ? "Balanced — symmetrical asymmetry, controlled flow."
       : "Maximalist — layered textures, energetic composition."
   }
   - Tone: ${tone}
   - Target Audience: ${state.targetAudience}

4. RENDERING ENGINE:
   - “8K UHD, Octane Render, volumetric god-rays, cinematic shadows, soft bokeh,
      shallow depth of field, photoreal microtexturing, art studio lighting”
`;
};

// --------------------------------------------------
// FINAL PROMPT BUILDER
// --------------------------------------------------
export const buildSinglePostPrompt = (state: GeneratorFormState) => {
  const platformRules = getPlatformRules(state.platform);
  const content = getContentInstructions(state.textElements, state.postIdea);
  const visuals = getVisualInstructions(state);

  const tone = state.tone || "Professional";

  return `
You are a world-class Creative Director & Social Media Strategist.

POST TYPE:
- ${state.postType}

PLATFORM:
- ${state.platform}
- Rules: ${platformRules}

TOPIC:
- "${state.postIdea}"

TARGET AUDIENCE:
- "${state.targetAudience}"

BRAND SYSTEM:
- Use Brand Kit: ${state.useBrandKit}
- Colors: ${state.colors.map((c) => `${c.name} (${c.value})`).join(", ")}
- Background Style: ${state.backgroundStyle}
- Typography Mood: ${state.typographyMood}
- Design Keywords: ${state.designKeywords}
- Layout Density: ${state.layoutDensity}
- Tone: ${tone}

USER IMAGES:
${
  state.images.length
    ? state.images.map((i) => `- ${i.description}`).join("\n")
    : "- None"
}

${content}

${visuals}

RETURN ONLY THIS JSON:

{
  "type": "${state.postType.toLowerCase()}",
  "headline": "Exact or generated headline",
  "content": "Body text merged from inputs",
  "caption": "Engaging caption with CTA",
  "visual_description": "150-200 word Imagen prompt"
}
`;
};

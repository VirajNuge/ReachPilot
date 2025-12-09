import {
  GeneratorFormState,
  PlatformFormat,
} from "@/app/pages/appPages/[id]/postGenerator/page";

// --- LOCAL HELPERS (Duplicated for independence) ---

const getPlatformRules = (platform: PlatformFormat): string => {
  if (platform.includes("LINKEDIN"))
    return "Platform: LinkedIn. Focus on professional value, industry insights, and clear structure.";
  return "Platform: General Social Media. Focus on storytelling and flow.";
};

const getMandatoryTextInstructions = (textElements: any[]) => {
  const headline = textElements.find(
    (t: any) => t.type === "HEADLINE"
  )?.content;
  const cta = textElements.find((t: any) => t.type === "CTA")?.content;

  // For carousels, we mainly care about the Hook (Slide 1) and the CTA (Slide 4)
  let instructions = "CRITICAL JSON DATA RULES:";
  if (headline) instructions += `\n- Slide 1 Headline MUST BE: "${headline}"`;
  if (cta) instructions += `\n- Slide 4 CTA MUST BE: "${cta}"`;

  return instructions;
};

const getVisualInstructions = (state: GeneratorFormState) => {
  const colorInstruction =
    state.useBrandKit && state.colors.length > 0
      ? `PALETTE: Strictly use: ${state.colors
          .map((c) => c.name + " (" + c.value + ")")
          .join(", ")}.`
      : "PALETTE: Consistent, high-end branding colors.";

  return `
    VISUAL DESCRIPTION RULES (for 'visual_description' field):
    - **ROLE:** You are designing a 4-part visual narrative.
    - **CONSISTENCY:** All 4 slides must look like they belong to the same high-end campaign.
    - **VISUAL METAPHOR:** Invent a 3D environment based on "${state.postIdea}".
    - **TEXT INTEGRATION:**
      - **Slide 1:** Must explicitly ask the image generator to render the Title Text in 3D.
      - **Slide 2 & 3:** Focus on visual icons, data visualizations, or abstract 3D elements representing the key points.
      - **Slide 4:** Must explicitly ask the image generator to render the CTA text in a button/badge.
    - ${colorInstruction}
    - Mood: ${state.typographyMood}
    - Style: ${state.designKeywords}
  `;
};

// --- MAIN BUILDER ---

export const buildCarouselPostPrompt = (state: GeneratorFormState) => {
  const platformRules = getPlatformRules(state.platform);
  const mandatoryText = getMandatoryTextInstructions(state.textElements);
  const visualRules = getVisualInstructions(state);

  const headline =
    state.textElements.find((t) => t.type === "HEADLINE")?.content ||
    "Slide 1 Hook";
  const cta =
    state.textElements.find((t) => t.type === "CTA")?.content || "Learn More";

  return `
    You are a strictly compliant Creative Director.
    
    CORE CONTEXT:
    - Topic: "${state.postIdea}"
    - Audience: "${state.targetAudience}"
    - Tone: "${state.tone}"
    - ${platformRules}

    ${mandatoryText}

    ${visualRules}

    TASK: Generate a 4-Slide Carousel JSON.
    
    STRICT JSON OUTPUT (No Markdown):
    {
      "type": "carousel",
      "main_caption": "Main post caption",
      "slides": [
        {
          "slide_number": 1,
          "headline": "${headline}",
          "content": "Intro text",
          "visual_description": "Creative 3D Typography prompt for Slide 1. Headline '${headline}' is the main physical object."
        },
        {
          "slide_number": 2,
          "headline": "Key Point 1",
          "content": "Explanation",
          "visual_description": "Creative 3D prompt for Slide 2. A large 3D number '2' or visual icon representing the key point."
        },
        {
          "slide_number": 3,
          "headline": "Key Point 2",
          "content": "Explanation",
          "visual_description": "Creative 3D prompt for Slide 3. A large 3D number '3' or visual icon representing the key point."
        },
        {
          "slide_number": 4,
          "headline": "Conclusion",
          "content": "${cta}",
          "visual_description": "Creative 3D Typography prompt for Slide 4. Focusing on the CTA '${cta}' inside a physical button element."
        }
      ]
    }
  `;
};

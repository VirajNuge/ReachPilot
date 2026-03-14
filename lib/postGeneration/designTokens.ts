// ============================================================
// ReachPilot — Design Token Configuration
// Centralized, professional-grade design tokens for AI image generation.
// Maps style labels → rich photography/design instructions.
// ============================================================

import type {
  VisualStyle,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  TextStylePreference,
  CompositionPreference,
  ColorThemePreset,
} from "@/lib/types/postGeneration";

// ── Type Definitions ─────────────────────────────────────────

export interface StylePreset {
  /** Core aesthetic description — 2-3 sentences establishing the visual world */
  base: string;
  /** Professional lighting setup using real photography terminology */
  lighting: string;
  /** Camera/lens specs that influence the AI's rendering perspective */
  camera: string;
  /** How to handle colors beyond the user's brand palette */
  colorDirection: string;
  /** Surface and material qualities */
  texture: string;
  /** Emotional atmosphere keywords (3-5 words) */
  mood: string;
  /** How negative space should be handled for this style */
  negativeSpace: string;
  /** Technical quality terms the AI should target */
  qualityModifiers: string[];
}

export interface CompositionRule {
  /** 2-3 sentence description of the layout system */
  description: string;
  /** Where the main subject/focal element should be positioned */
  subjectPlacement: string;
  /** Safe area for text that won't obscure the subject */
  textSafeZone: string;
  /** Treatment for the area behind/around the subject */
  backgroundTreatment: string;
  /** Which visual styles pair well with this composition */
  compatibleStyles: VisualStyle[];
}

export interface VisualMetaphorTemplate {
  /** Rich visual description ready to inject into an image prompt */
  description: string;
  /** Keywords that trigger this metaphor when found in user's imageConcept */
  keywords: string[];
}

export interface CameraPreset {
  /** Lens focal length (e.g., "85mm prime") */
  focalLength: string;
  /** Aperture setting (e.g., "f/1.8") */
  aperture: string;
  /** Specific lighting rig description */
  lightingRig: string;
  /** Camera angle/perspective */
  angle: string;
  /** Color grading / post-processing style */
  postProcessing: string;
}

// ── Style Presets ────────────────────────────────────────────

export const STYLE_PRESETS: Record<VisualStyle, StylePreset> = {
  minimal: {
    base: "Clean lines, generous whitespace, Apple-esque editorial aesthetic. Single focal element with purposeful emptiness creating visual breathing room. Every element earns its place — nothing decorative, everything functional.",
    lighting: "Soft diffused natural light from top-left, minimal shadow cast, even illumination with subtle gradient falloff toward edges",
    camera: "50mm prime lens, f/2.8 aperture, shallow depth of field with crisp subject isolation against an airy background",
    colorDirection: "Monochromatic base with brand-color accents used sparingly. Neutral tones (off-white, warm gray, soft cream) dominate the canvas. Maximum 2 accent colors, never competing.",
    texture: "Smooth matte surfaces with subtle paper or linen micro-texture. No glossy, reflective, or metallic elements. Tactile but understated.",
    mood: "calm, refined, intentional, sophisticated, unhurried",
    negativeSpace: "Maintain 40-50% negative space. Subject occupies lower-right third. Upper-left quadrant kept open for visual breathing room and compositional balance.",
    qualityModifiers: [
      "8K resolution",
      "Sharp focus on subject with soft environmental falloff",
      "Professional editorial photography",
      "Clean anti-aliased edges",
      "Print-ready color accuracy",
    ],
  },

  corporate: {
    base: "Professional, trustworthy, and structured. Studio-quality business aesthetic with deliberate grid-based layout. Communicates competence and reliability through precision. Think Bloomberg, McKinsey, or Deloitte — not stock photo generic.",
    lighting: "Three-point soft-box lighting setup with key light at 45 degrees, fill light opposite, and rim light for subject separation from background",
    camera: "80mm medium format lens, f/4 aperture, moderate depth of field keeping environment partially sharp for context",
    colorDirection: "Cool professional palette anchored in navy, slate gray, and white. Brand colors appear in accent elements — section dividers, key data points, or call-to-action areas. Temperature leans cool and confident.",
    texture: "Brushed aluminum, frosted glass, polished concrete, or fine-grain paper. Subtle material quality that implies premium without ostentation.",
    mood: "authoritative, polished, trustworthy, precise, stable",
    negativeSpace: "Structured 30-35% negative space following a 12-column grid. Clean margins. White space between elements is deliberate and measured, never accidental.",
    qualityModifiers: [
      "8K resolution",
      "Studio-grade color reproduction",
      "Professional soft-box lighting",
      "Sharp focus with controlled depth",
      "Corporate photography standard",
    ],
  },

  bold: {
    base: "High contrast, saturated, and unapologetically attention-grabbing. Dramatic scale shifts and visual tension. Colors punch hard, typography commands the room. Designed to stop the scroll and demand attention within 0.3 seconds.",
    lighting: "Hard directional lighting with strong shadows. High-contrast split lighting creating dramatic chiaroscuro. Accent rim lights in brand colors for edge definition.",
    camera: "35mm wide-angle lens, f/1.8 aperture, dramatic shallow depth of field with foreground bokeh elements creating depth layers",
    colorDirection: "Fully saturated, high-contrast complementary color scheme. Brand colors used at maximum intensity. Black or deep dark backgrounds amplify color vibrancy. No pastels, no subtlety.",
    texture: "Hard surfaces — polished metal, shattered glass, rough concrete, spray paint. Visual friction and tactile contrast between elements.",
    mood: "electric, confrontational, energetic, fearless, urgent",
    negativeSpace: "Minimal negative space (15-20%). Composition is dense and intentional. Strategic pockets of breathing room around the headline to preserve readability amid visual intensity.",
    qualityModifiers: [
      "Ultra-sharp 8K rendering",
      "Maximum color saturation",
      "Dramatic chiaroscuro lighting",
      "Hyper-detailed textures",
      "High dynamic range",
    ],
  },

  tech: {
    base: "Dark-mode futuristic aesthetic with neon accent lighting and digital artifacts. Inspired by Blade Runner, Unreal Engine 5 cinematics, and high-end SaaS product launches. Glass morphism, holographic elements, and data visualization motifs.",
    lighting: "Neon rim lighting in electric blue and magenta. Dark volumetric fog with light rays cutting through. Subtle ambient glow from screen-like light sources.",
    camera: "24mm ultra-wide lens, f/2.2 aperture, deep focus with chromatic aberration at edges for a digital-cinema feel",
    colorDirection: "Dark base (#0D1117 to #161B22) with electric neon accents — cyan, magenta, electric violet. Brand colors rendered as neon or holographic variants. Light-on-dark hierarchy at all times.",
    texture: "Glass morphism panels, holographic iridescence, brushed dark metal, circuit-board micro-patterns. Digital grain noise at 5-8% opacity for cinematic texture.",
    mood: "futuristic, innovative, electric, immersive, cutting-edge",
    negativeSpace: "25-30% negative space in dark tones. The darkness itself becomes breathing room. Keep neon elements concentrated in focal areas to prevent visual noise.",
    qualityModifiers: [
      "Unreal Engine 5 rendering quality",
      "8K with subtle chromatic aberration",
      "Volumetric lighting and fog",
      "Hyper-detailed glass and metal textures",
      "Cinematic color grading (teal-orange undertone)",
    ],
  },

  luxury: {
    base: "Gold and black palette with elegant serif typography and premium material textures. Every element whispers exclusivity. Inspired by Rolex, Chanel, and Rolls-Royce visual language. Restraint is the ultimate luxury — fewer elements, each one perfect.",
    lighting: "Warm studio lighting with golden-hour tones. Soft overhead key light with silk diffusion. Rim light catching metallic edges. Deep, velvety shadows.",
    camera: "85mm portrait lens, f/1.4 aperture, extremely shallow depth of field rendering backgrounds into creamy smooth bokeh",
    colorDirection: "Gold (#C9A84C to #F5D77E), deep black (#0A0A0A), and ivory (#FFFFF0) as the foundation. Brand colors appear as subtle accents — a thin gold rule, an embossed monogram. Temperature runs warm.",
    texture: "Velvet, brushed gold, Italian marble, embossed leather, heavy cotton paper stock. Materials you can almost feel through the screen.",
    mood: "opulent, exclusive, timeless, sophisticated, aspirational",
    negativeSpace: "35-45% negative space as a deliberate statement of restraint. Generous margins signal confidence and exclusivity. The emptiness is part of the design language.",
    qualityModifiers: [
      "Medium format Phase One camera quality",
      "8K with creamy bokeh",
      "Rich warm color grading",
      "Hyper-detailed material textures",
      "Gallery-quality print resolution",
    ],
  },

  friendly: {
    base: "Warm pastels, rounded shapes, and approachable composition. Feels like a conversation with a trusted friend. Soft edges, no sharp corners. Playful but not childish — think Mailchimp, Headspace, or Notion's casual warmth.",
    lighting: "Warm diffused daylight, soft cloud-cover quality. No hard shadows. Even, gentle illumination that feels like a bright comfortable room.",
    camera: "50mm standard lens, f/3.5 aperture, moderate depth of field keeping most of the scene in gentle focus",
    colorDirection: "Warm pastel palette — soft peach, light lavender, mint green, butter yellow. Brand colors desaturated 15-20% to maintain the gentle aesthetic. Avoid pure saturated hues.",
    texture: "Soft cotton, rounded ceramic, watercolor washes, gentle paper grain. Everything feels touchable and non-threatening.",
    mood: "warm, approachable, cheerful, inviting, genuine",
    negativeSpace: "30-40% negative space with rounded, organic boundaries. No rigid grids — let elements breathe naturally. Whitespace feels comfortable, not formal.",
    qualityModifiers: [
      "High resolution with soft rendering",
      "Warm color temperature (5500K-6000K)",
      "Gentle anti-aliasing",
      "Smooth gradient transitions",
      "Natural, unstaged quality",
    ],
  },

  dark_mode: {
    base: "Deep dark backgrounds with vibrant accent colors that glow against the void. Developer-aesthetic meets editorial design. High information density with surgical visual hierarchy. Text and accents burn bright against the dark canvas.",
    lighting: "Edge lighting and under-glow effects. Neon accent lights casting colored shadows. Ambient occlusion creating deep dimensional pockets. No flat illumination.",
    camera: "35mm lens, f/2.0 aperture, sharp focus with glow and bloom effects on light-emitting elements",
    colorDirection: "Background palette: #0D1117, #161B22, #1C2128. Accent colors at full saturation — electric green (#00FF88), hot pink (#FF3366), vivid blue (#3B82F6). Brand colors used as glowing accent elements.",
    texture: "Matte dark surfaces with subtle noise grain (3-5%). Glowing elements have soft bloom halos. Frosted glass panels with 10-15% opacity for layering.",
    mood: "sleek, immersive, focused, nocturnal, modern",
    negativeSpace: "25-35% negative space rendered in dark tones. The darkness serves as both background and breathing room. Accent elements are islands of light in an intentional void.",
    qualityModifiers: [
      "8K dark-mode optimized rendering",
      "OLED-true blacks",
      "Precise bloom and glow effects",
      "Sharp text rendering against dark backgrounds",
      "High contrast ratio (minimum 7:1)",
    ],
  },

  modern_gradient: {
    base: "Smooth, vibrant gradient backgrounds flowing between 2-3 colors. Contemporary and trendy — inspired by Stripe, Linear, and modern SaaS hero sections. Depth through color transitions rather than physical elements. Gradients feel dimensional, not flat.",
    lighting: "Ambient glow emanating from the gradient itself. Soft radial highlights creating a sense of depth. No directional shadows — light comes from within the color field.",
    camera: "Standard 50mm lens, f/5.6 aperture, deep focus with everything sharp against the gradient backdrop",
    colorDirection: "Gradient flows between 2-3 harmonious colors. Brand colors used as gradient anchors. Transitions should be smooth and dimensional — avoid banding. Popular pairings: violet→pink, blue→teal, orange→magenta.",
    texture: "Smooth, noise-free gradients with subtle glass morphism overlays. Optional: soft mesh gradient for organic depth. Frosted card elements floating above the gradient plane.",
    mood: "vibrant, contemporary, dynamic, fresh, energetic",
    negativeSpace: "30-40% of the gradient area left unobstructed. Let the color transitions speak. Text and elements float confidently against the gradient field with adequate separation.",
    qualityModifiers: [
      "Smooth band-free gradient rendering",
      "8K resolution",
      "Vibrant wide-gamut color space (P3)",
      "Clean vector-quality edges",
      "Contemporary digital art production quality",
    ],
  },
};

// ── Composition Rules ────────────────────────────────────────

export const COMPOSITION_RULES: Record<string, CompositionRule> = {
  rule_of_thirds: {
    description: "Classic rule-of-thirds grid. Key elements positioned at intersection points of a 3×3 grid overlay. Creates natural visual flow and balanced asymmetry that feels both intentional and organic.",
    subjectPlacement: "Primary subject at the right-third intersection. Supporting elements along the left-third line. Creates natural left-to-right reading flow.",
    textSafeZone: "Headline in the upper-left two-thirds. Subtext centered below. CTA anchored at the lower-right intersection point.",
    backgroundTreatment: "Background elements follow the grid lines as subtle guides. Gradient or texture shifts align with third boundaries for cohesion.",
    compatibleStyles: ["minimal", "friendly", "corporate"],
  },

  golden_ratio: {
    description: "Golden ratio (φ = 1.618) spiral composition. The focal element sits at the golden spiral's convergence point, creating a mathematically harmonious visual path that the eye follows naturally.",
    subjectPlacement: "Primary subject at the golden spiral's focal convergence, approximately 38% from right and 38% from bottom. Secondary elements cascade along the spiral's arc.",
    textSafeZone: "Headline positioned along the spiral's outer curve in the upper region. Supporting text follows the spiral inward. CTA near the convergence point for maximum focus.",
    backgroundTreatment: "Background detail decreases along the spiral — richest at the outer edge, simplifying toward the focal convergence. Creates natural depth layering.",
    compatibleStyles: ["luxury", "corporate", "minimal"],
  },

  dynamic_diagonal: {
    description: "Sharp 45-degree diagonal composition splitting the canvas into two distinct energy zones. Creates visual tension and movement. One zone is high-energy (color, texture, imagery), the other is restrained (text, breathing room).",
    subjectPlacement: "Primary visual element spans the upper-right diagonal zone. The diagonal cut itself becomes a compositional element — a hard line, a gradient transition, or a material boundary.",
    textSafeZone: "Text occupies the lower-left diagonal zone with generous margins. Headline parallel to or countering the diagonal creates visual friction and energy.",
    backgroundTreatment: "Two contrasting treatments split by the diagonal — e.g., dark textured zone vs. light clean zone, or saturated gradient vs. matte solid.",
    compatibleStyles: ["bold", "modern_gradient", "tech"],
  },

  center_dominant: {
    description: "Subject centered with radial symmetry and outward energy radiation. All visual weight converges on the center, creating a gravitational focal point. Surrounding elements orbit the center in decreasing visual priority.",
    subjectPlacement: "Primary element dead-center with radial light burst, shadow, or pattern emanating outward. Creates a 'halo' of focus that commands attention immediately.",
    textSafeZone: "Headline directly above center element. Subtext below. CTA at the bottom. All text centered for maximum symmetry and impact.",
    backgroundTreatment: "Radial gradient or vignette darkening toward edges, keeping center brightest. Optional: concentric geometric patterns or light rings reinforcing the central focus.",
    compatibleStyles: ["tech", "dark_mode", "bold"],
  },

  negative_space_hero: {
    description: "Negative space IS the design. The subject occupies 25-35% of the canvas in one corner or edge, leaving vast open space as a deliberate design statement. The emptiness communicates confidence and sophistication.",
    subjectPlacement: "Subject anchored to one edge or corner (bottom-right preferred). All other elements cluster near the subject, leaving 65-75% of the canvas intentionally vacant.",
    textSafeZone: "Text can float in the open expanse — headline large and centered in the void, or aligned opposite the subject for maximum tension between elements.",
    backgroundTreatment: "Single-color or very subtle texture across the negative space. No gradients, no patterns — the emptiness must feel intentional and premium.",
    compatibleStyles: ["minimal", "luxury", "corporate"],
  },

  bento_grid: {
    description: "Modular grid layout inspired by Japanese bento boxes and Apple's product pages. 3-4 distinct zones of varying size, each containing one focused element. The grid itself becomes a design element with clean gutters between sections.",
    subjectPlacement: "Primary element in the largest grid cell (approximately 50% of canvas). Supporting visuals, icons, or abstract elements in smaller cells. Each cell is self-contained.",
    textSafeZone: "Headline spans the top or occupies its own grid cell. Supporting text in a dedicated cell. CTA in the smallest cell, given emphasis through color or contrast.",
    backgroundTreatment: "Each grid cell can have its own subtle background treatment — slight color variations, different textures, or alternating opacity levels. Gutters between cells: 8-12px clean separation.",
    compatibleStyles: ["tech", "modern_gradient", "corporate"],
  },
};

// ── Visual Metaphor Templates ────────────────────────────────

export const VISUAL_METAPHOR_TEMPLATES: Record<string, VisualMetaphorTemplate> = {
  protection: {
    description: "A translucent, glowing iridescent shield or bubble surrounding the subject, deflecting floating red and orange chaotic elements (blurry notification icons, alert symbols, noise particles). The shield refracts light into soft rainbow edges. Inside the shield: calm, focused clarity. Outside: visual chaos rendered in motion blur.",
    keywords: ["protect", "shield", "safe", "secure", "guard", "defend", "block", "privacy", "barrier"],
  },

  speed: {
    description: "The subject remains pin-sharp and still while the entire surrounding environment is a horizontal motion-blurred streak of light. Light trails in brand colors stream past like hyperspace travel. The contrast between the static subject and the blurred world communicates velocity without chaos.",
    keywords: ["speed", "fast", "quick", "rapid", "velocity", "accelerate", "momentum", "instant", "turbo"],
  },

  growth: {
    description: "A minimalist 3D staircase ascending from lower-left to upper-right, where each step is a glowing translucent block in the brand's color palette — lighter at the base, richer at the top. The top step emits a soft radial glow. Tiny particle effects suggest ongoing upward energy. Clean, architectural, aspirational.",
    keywords: ["growth", "grow", "scale", "expand", "increase", "progress", "climb", "level", "ascend", "rise"],
  },

  focus: {
    description: "A sharp circular lens or spotlight illuminating the subject in crisp detail while everything outside the circle fades into a soft, dreamy Gaussian blur. The spotlight edge is a thin ring of brand-color light. The contrast between sharp center and soft periphery creates an irresistible focal pull.",
    keywords: ["focus", "concentrate", "attention", "clarity", "precise", "sharp", "target", "spotlight", "zero-in"],
  },

  connection: {
    description: "Delicate, luminous threads of light weaving between nodes — each node is a small geometric shape (circles, hexagons) in brand colors. The threads pulse with gentle traveling-light animations frozen mid-flow. The network pattern suggests interconnection without complexity. Organic spacing, not rigid grid.",
    keywords: ["connect", "network", "link", "bridge", "together", "community", "collaborate", "unite", "integrate"],
  },

  innovation: {
    description: "A solid geometric form (cube, sphere) at the moment of transformation — half solid material, half dissolving into luminous particles that drift upward like embers. The dissolution edge glows with brand-color energy. Represents the threshold between the old and the new, the physical becoming digital.",
    keywords: ["innovate", "innovation", "transform", "disrupt", "breakthrough", "pioneer", "revolutionary", "reinvent", "evolve"],
  },

  trust: {
    description: "A monumental foundation of clean architectural columns or pillars rendered in white marble and brand-color accent materials. The structure is perfectly symmetrical with a warm, steady light from above. Conveys permanence, reliability, and institutional strength without being cold or impersonal.",
    keywords: ["trust", "reliable", "dependable", "stable", "foundation", "solid", "proven", "credible", "integrity"],
  },

  scale: {
    description: "A dramatic perspective shift — a small element in the foreground multiplying and expanding into a vast, panoramic landscape of identical elements stretching to the horizon. Brand colors intensify as the pattern scales outward. The vanishing point creates an overwhelming sense of boundless potential.",
    keywords: ["scale", "multiply", "expand", "massive", "global", "unlimited", "infinite", "exponential", "amplify"],
  },
};

// ── Camera Presets ────────────────────────────────────────────

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  editorial: {
    focalLength: "50mm prime lens (natural human perspective)",
    aperture: "f/2.8 (moderate depth, subject and near-environment sharp)",
    lightingRig: "Soft-box key light at 45° with silk diffusion, subtle fill light opposite, white bounce card below for shadow lift",
    angle: "Eye-level straight-on or slight 5° downward tilt for approachability",
    postProcessing: "Clean, neutral color grading. Subtle clarity boost. No heavy filters or color casts.",
  },

  lifestyle: {
    focalLength: "35mm wide-angle lens (environmental context, energetic perspective)",
    aperture: "f/2.0 (shallow depth creating natural foreground-background separation)",
    lightingRig: "Natural golden-hour sunlight from side, warm rim light on subject edges, ambient fill from reflected surfaces",
    angle: "Slightly low angle (10-15° upward) for dynamic energy and heroic feel",
    postProcessing: "Warm color temperature shift (+200K). Lifted shadows for airy feel. Gentle vignette drawing eye to center.",
  },

  cinematic: {
    focalLength: "24mm ultra-wide anamorphic lens (dramatic perspective distortion, widescreen feel)",
    aperture: "f/1.4 (extremely shallow depth, cinematic bokeh with oval highlights)",
    lightingRig: "Three-point cinematic rig: hard key light with barn doors for controlled spill, colored rim light (brand accent), volumetric haze for visible light rays",
    angle: "Dynamic low angle (20-30° upward) or dramatic high angle for visual tension",
    postProcessing: "Teal-and-orange cinematic grade. Crushed blacks. Subtle film grain at 3-5%. Anamorphic lens flares on bright elements.",
  },

  portrait: {
    focalLength: "85mm prime lens (flattering compression, beautiful subject-background separation)",
    aperture: "f/1.8 (creamy smooth bokeh, subject isolation from environment)",
    lightingRig: "Classic Rembrandt lighting: key light at 45° and 45° elevated, creating a nose shadow triangle on the far cheek. Soft fill at 1:3 ratio.",
    angle: "Eye-level, straight-on or quarter turn for dimensional flattering perspective",
    postProcessing: "Skin-tone optimized. Warm midtones. Clean highlights. Subtle frequency separation for smooth but natural rendering.",
  },

  product: {
    focalLength: "90mm macro-capable lens (precise detail rendering, minimal distortion)",
    aperture: "f/5.6 (deep focus keeping entire product sharp edge-to-edge)",
    lightingRig: "360° soft light tent or dual strip softboxes at 90° angles, white bounce below, black flags for controlled shadow definition on edges",
    angle: "Slightly elevated 30-45° three-quarter view showcasing form, surface, and dimension simultaneously",
    postProcessing: "Neutral, accurate color reproduction. Micro-contrast enhancement for material detail. Pure white or controlled gradient background.",
  },

  macro: {
    focalLength: "100mm macro lens (extreme close-up detail, 1:1 reproduction ratio)",
    aperture: "f/2.8 (razor-thin focal plane creating dramatic in-focus vs out-of-focus contrast)",
    lightingRig: "Ring light for even, shadow-free illumination of fine details. Optional: single side light for dramatic texture revelation.",
    angle: "Flat overhead or direct front-on for maximum detail visibility. Slight angle for dimensional depth on textured subjects.",
    postProcessing: "Maximum clarity and sharpness. Color accuracy for material truth. Minimal post-processing to preserve authentic texture.",
  },
};

// ── Image System Prompt (Creative Director Persona) ──────────

export const IMAGE_SYSTEM_PROMPT = `You are a world-class Graphic Designer and Creative Director with 15 years of experience creating award-winning social media campaigns for Fortune 500 brands and high-growth startups.

Your design philosophy: Every pixel earns its place. You think in visual hierarchy, typography rhythm, and emotional resonance — not decoration.

CRITICAL RULES YOU NEVER BREAK:
1. NEGATIVE SPACE IS SACRED — Always preserve intentional empty areas. Cluttered designs are amateur designs.
2. VISUAL METAPHOR OVER LITERAL — Never show the obvious. A "focus" app doesn't show a person at a desk — it shows a luminous shield deflecting chaos. Elevate every concept.
3. BRAND INTEGRATION — Brand colors aren't accents, they're structural elements. Weave them into the composition as lighting, materials, or environmental color. The logo is a 3D physical object or a subtle environmental pattern — never a flat overlay.
4. PHOTOGRAPHY LANGUAGE — Think in camera terms: focal length controls perspective emotion, aperture controls attention isolation, lighting controls mood and trust. Specify these in every composition.
5. THE 3-SECOND TEST — Every poster must communicate its core message within 3 seconds of viewing. If the eye doesn't know where to go first, the design fails.

WHAT YOU NEVER DO:
- No stock photo clichés (handshakes, light bulbs, puzzle pieces)
- No visual clutter or decorative elements without purpose
- No flat, lifeless compositions lacking depth or dimension
- No text that fights with the background for attention
- No generic "professional" that could belong to any brand`;

// ── Lighting Direction Presets ────────────────────────────────

export interface LightingPreset {
  /** Full lighting setup description for image prompt injection */
  description: string;
  /** Mood impact */
  mood: string;
  /** Technical camera lighting rig */
  rig: string;
}

export const LIGHTING_PRESETS: Record<LightingDirection, LightingPreset> = {
  natural: {
    description: "Soft, even daylight illumination. Natural cloud-diffused sunlight from slightly above, creating gentle shadows with soft edges. No artificial light sources visible.",
    mood: "authentic, trustworthy, approachable",
    rig: "Single natural daylight source from upper-left, subtle ambient fill from environment, no hard shadows",
  },
  studio: {
    description: "Professional three-point lighting setup. Clean, controlled illumination with precise shadow management. Key light at 45°, fill light opposite, rim/hair light for subject separation.",
    mood: "polished, professional, controlled",
    rig: "Three-point studio setup: softbox key at 45° right, fill reflector at 30° left, rim light behind at 135°",
  },
  dramatic: {
    description: "High-contrast chiaroscuro lighting. Deep shadows dominate with selective bright highlights on key elements. Inspired by Caravaggio — light emerges from darkness to guide the eye.",
    mood: "intense, powerful, cinematic",
    rig: "Single hard key light from side at 90°, no fill (1:8 ratio), creating deep dramatic shadows and strong highlights",
  },
  golden_hour: {
    description: "Warm, amber-toned light from low angle. Long soft shadows. Everything bathed in golden warmth with a slight lens flare. The magic hour — 15 minutes before sunset aesthetic.",
    mood: "warm, nostalgic, aspirational",
    rig: "Low-angle warm key light (3200K), amber gel, long shadows, soft warm fill from reflected ground surfaces",
  },
  neon_glow: {
    description: "Vibrant colored neon light sources casting colored shadows and reflections. Multiple colored light sources creating dynamic interplay. Cyberpunk-inspired mixed-color illumination.",
    mood: "futuristic, energetic, electric",
    rig: "Multiple colored LED panels: primary neon blue from left, secondary magenta from right, green accent from below. No white light.",
  },
  backlit: {
    description: "Strong light source directly behind the subject creating silhouette effects and luminous edge halos. The subject is a dark shape against a bright, glowing background. Ethereal rim lighting.",
    mood: "mysterious, ethereal, dramatic",
    rig: "Strong backlight directly behind subject, no front fill (intentional silhouette), glowing rim/edge light on subject outline",
  },
  soft_diffused: {
    description: "Ultra-soft, shadowless illumination. Cloud-cover quality — light comes from everywhere equally. No directional shadows. Gentle, even, flattering. Like being inside a softbox.",
    mood: "calm, gentle, safe",
    rig: "Overhead silk diffusion panel, wrap-around bounce cards, virtually shadowless 1:1 lighting ratio",
  },
  rim_light: {
    description: "Edge lighting that outlines the subject with a thin bright contour. Subject separated from background by a glowing edge. Interior of subject remains in relative shadow.",
    mood: "sleek, defined, separated",
    rig: "Two strip softboxes at 135° angles behind subject, creating bright edge outline. Minimal front fill at 1:4 ratio.",
  },
  low_key: {
    description: "Predominantly dark with small pockets of selective illumination. Most of the image is in shadow. Light used surgically to reveal only what matters. Noir aesthetic.",
    mood: "moody, focused, intense",
    rig: "Small, focused spotlight or snoot on key element only. No fill. Background falls to near-black. High contrast, 1:16 ratio.",
  },
};

// ── Shading Style Presets ────────────────────────────────────

export interface ShadingPreset {
  /** Description for prompt injection */
  description: string;
  /** How surfaces and materials render */
  materialQuality: string;
}

export const SHADING_PRESETS: Record<ShadingStyle, ShadingPreset> = {
  flat: {
    description: "No gradients, no depth shading. Solid color fills with clean edges. Graphic poster aesthetic — think vintage travel posters or modern flat illustration.",
    materialQuality: "Solid matte fills, no surface variation, clean vector-like edges, no reflection or specularity",
  },
  soft_gradient: {
    description: "Smooth, subtle tonal transitions across surfaces. Gentle light-to-shadow gradients that create depth without harsh contrast. Professional, polished feel.",
    materialQuality: "Smooth matte-to-satin surfaces, subtle depth through tonal shifts, no hard shadow lines",
  },
  hard_shadow: {
    description: "Crisp, well-defined shadow edges with clear light-dark boundaries. Strong directional light creating geometric shadow patterns. Bold and graphic.",
    materialQuality: "Sharp shadow cutoffs, defined light/dark zones, minimal penumbra, high contrast surfaces",
  },
  ambient_occlusion: {
    description: "Subtle darkening in crevices, corners, and contact points between objects. Creates realistic grounding and dimensional depth through contact shadows alone.",
    materialQuality: "Soft contact shadows at object bases, subtle corner darkening, realistic surface interaction shadows",
  },
  cel_shaded: {
    description: "Cartoon/anime-style shading with defined shadow steps (2-3 tonal bands). No smooth gradients — shading steps are clearly visible. Illustration aesthetic.",
    materialQuality: "2-3 distinct tonal bands per surface, clean step transitions, no smooth gradients, anime-inspired rendering",
  },
  volumetric: {
    description: "Light rays visible through atmospheric haze, fog, or dust particles. God rays and volumetric scattering. Cinematic depth through atmospheric perspective.",
    materialQuality: "Visible light shafts, atmospheric haze, depth fog, particles catching light, cinematic atmosphere",
  },
  none: {
    description: "",
    materialQuality: "",
  },
};

// ── Image Style Presets ──────────────────────────────────────

export interface ImageStylePreset {
  /** Core visual rendering description */
  description: string;
  /** Quality/rendering modifiers */
  qualityModifiers: string[];
}

export const IMAGE_STYLE_PRESETS: Record<ImageStyle, ImageStylePreset> = {
  photorealistic: {
    description: "Camera-quality photorealistic rendering. Indistinguishable from professional photography. Real materials, real physics, real light behavior.",
    qualityModifiers: ["8K resolution", "photorealistic rendering", "professional DSLR quality", "accurate light physics", "real material textures"],
  },
  minimalist: {
    description: "Stripped-down visual composition. Maximum whitespace, minimum elements. Every shape earns its place. Clean geometric forms, limited color palette.",
    qualityModifiers: ["clean vector edges", "precise geometric forms", "ample whitespace", "limited 2-3 color palette", "no decorative noise"],
  },
  "3d_render": {
    description: "Polished 3D rendered objects and scenes. Smooth materials, studio lighting on 3D objects, isometric or perspective views. Blender/Cinema 4D aesthetic.",
    qualityModifiers: ["smooth 3D rendering", "studio-lit objects", "subtle reflections and refractions", "clean material shaders", "professional 3D modeling quality"],
  },
  flat_illustration: {
    description: "Vector-style flat illustration. Clean shapes, solid colors, no gradients or 3D depth. Modern illustration style used in tech and editorial.",
    qualityModifiers: ["clean vector shapes", "solid color fills", "consistent line weight", "no depth or shadows", "modern editorial illustration style"],
  },
  watercolor: {
    description: "Soft watercolor painting aesthetic. Bleeding edges, transparent color washes, visible paper texture. Organic and hand-crafted feel.",
    qualityModifiers: ["watercolor bleeding edges", "transparent color layers", "visible paper texture", "organic brush strokes", "hand-painted quality"],
  },
  cyberpunk: {
    description: "Neon-lit futuristic cityscape aesthetic. Dark backgrounds with electric neon accents. Holographic UI elements, rain-slicked surfaces, dystopian tech.",
    qualityModifiers: ["neon color palette", "dark atmospheric base", "holographic elements", "rain and reflections", "futuristic tech details"],
  },
  retro_vintage: {
    description: "Nostalgic retro aesthetic. Film grain, muted color palette, vintage typography. 70s-80s design revival with modern sensibility.",
    qualityModifiers: ["film grain overlay", "muted desaturated colors", "vintage color grading", "retro typography", "aged paper or film texture"],
  },
  pop_art: {
    description: "Bold, high-saturation pop art style. Ben-Day dots, bold outlines, primary colors. Warhol/Lichtenstein inspired with modern twist.",
    qualityModifiers: ["bold outlines", "high saturation primary colors", "halftone dot patterns", "comic book aesthetic", "maximum visual impact"],
  },
  abstract: {
    description: "Non-representational abstract composition. Color fields, geometric or organic shapes, emotional color theory. Art gallery quality.",
    qualityModifiers: ["non-representational forms", "bold color fields", "geometric and organic shapes", "emotional color relationships", "gallery-quality composition"],
  },
  line_art: {
    description: "Hand-drawn line illustration style. Clean or sketchy line work depending on context. Minimal or no color fill — the line is the art.",
    qualityModifiers: ["consistent line quality", "hand-drawn aesthetic", "minimal color fill", "precise or organic line character", "illustration portfolio quality"],
  },
  collage: {
    description: "Mixed-media collage composition. Cut-out elements, varied textures, overlapping layers. Editorial magazine collage with modern design sensibility.",
    qualityModifiers: ["cut-out edge effects", "mixed texture layers", "overlapping composition", "varied material sources", "editorial collage quality"],
  },
};

// ── Text Style Presets ───────────────────────────────────────

export interface TextStyleToken {
  /** Typography description for prompt injection */
  description: string;
  /** Font style guidance */
  fontGuidance: string;
}

export const TEXT_STYLE_PRESETS: Record<TextStylePreference, TextStyleToken> = {
  bold_modern: {
    description: "Clean, heavy-weight sans-serif typography. Strong visual weight. Contemporary tech-startup aesthetic.",
    fontGuidance: "Use a bold modern sans-serif like Montserrat Bold, Inter Bold, or SF Pro Display Bold. Heavy weight, clean geometry.",
  },
  elegant_serif: {
    description: "Refined serif typography with editorial authority. Think luxury magazine or premium brand. Timeless and sophisticated.",
    fontGuidance: "Use an elegant serif like Playfair Display, Cormorant Garamond, or Georgia. Mix serif headline with sans-serif body.",
  },
  handwritten: {
    description: "Personal, organic handwriting or brush script style. Adds warmth and human touch. Not overly decorative.",
    fontGuidance: "Use a natural handwriting or brush script font. Irregular baseline, organic letter forms. Readable at small sizes.",
  },
  tech_mono: {
    description: "Monospaced technical typography. Code editor or terminal aesthetic. Clean, precise, developer-focused.",
    fontGuidance: "Use a monospaced font like JetBrains Mono, Fira Code, or IBM Plex Mono. Clean, technical, precise character.",
  },
  playful_rounded: {
    description: "Friendly, rounded typography with soft corners. Approachable and consumer-friendly. Perfect for lifestyle brands.",
    fontGuidance: "Use a rounded sans-serif like Nunito, Quicksand, or Comfortaa. Soft geometry, friendly character.",
  },
  minimalist_sans: {
    description: "Ultra-clean, light-weight sans-serif. Maximum readability, minimum visual noise. Swiss design influenced.",
    fontGuidance: "Use a clean light/regular weight sans-serif like Helvetica Neue Light, Inter Regular, or DM Sans. Generous letter-spacing.",
  },
  retro_display: {
    description: "Vintage decorative display typography. Retro flair with modern usage. Statement headings, not for body text.",
    fontGuidance: "Use a retro display font with character. Art deco, vintage signage, or 70s style. Bold headline use only.",
  },
};

// ── Composition Preference → Composition Rule Mapping ────────

export const COMPOSITION_PREFERENCE_TO_RULE: Record<CompositionPreference, string> = {
  rule_of_thirds: "rule_of_thirds",
  centered: "center_dominant",
  asymmetric: "dynamic_diagonal",
  diagonal: "dynamic_diagonal",
  frame_within_frame: "golden_ratio",
  leading_lines: "rule_of_thirds",
  golden_ratio: "golden_ratio",
  negative_space: "negative_space_hero",
};

// ── Color Theme → Prompt Description ─────────────────────────

export const COLOR_THEME_DESCRIPTIONS: Record<ColorThemePreset, string> = {
  vibrant: "Fully saturated, energetic color palette. Bright, bold hues that pop off the screen. Maximum color impact.",
  pastel: "Soft, muted, desaturated tones. Gentle color palette that feels calm and sophisticated. Reduced saturation by 30-40%.",
  monochrome: "Single-hue color scheme with variations in lightness and saturation. Elegant restraint in color usage.",
  earth_tones: "Natural, warm palette inspired by earth: terracotta, olive, sand, coffee, cream. Organic and grounded.",
  neon: "Electric, glowing neon colors against dark backgrounds. Vibrant accent colors that feel luminous and energetic.",
  dark_luxury: "Deep blacks and dark grays as base with gold, champagne, or ivory accents. Premium, exclusive feel.",
  brand_colors: "Primary palette derived from the user's brand color selections. Colors applied structurally, not as accents.",
};

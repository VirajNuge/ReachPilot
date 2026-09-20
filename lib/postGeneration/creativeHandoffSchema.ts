import { type Schema } from "@/lib/ai/schema";
import { SchemaType } from "@/lib/ai/schema";

import type {
  NegativeSpaceZone,
  OverlayStyle,
  TemplateAlignment,
  TemplateId,
  TextTheme,
} from "@/lib/types/postGeneration";

export const TEMPLATE_IDS: TemplateId[] = [
  "hero-bottom-overlay",
  "split-editorial",
  "minimal-card",
  "quote-focus",
];

export const NEGATIVE_SPACE_ZONES: NegativeSpaceZone[] = [
  "top_left",
  "top_center",
  "top_right",
  "center_left",
  "center",
  "center_right",
  "bottom_left",
  "bottom_center",
  "bottom_right",
];

export const TEMPLATE_ALIGNMENTS: TemplateAlignment[] = ["left", "center", "right"];

export const TEXT_THEMES: TextTheme[] = ["light-on-dark", "dark-on-light", "brand-accent"];

export const OVERLAY_STYLES: OverlayStyle[] = [
  "none",
  "black-gradient-80",
  "black-gradient-60",
  "dark-glass",
  "brand-tint",
];

export const creativeHandoffSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    schemaVersion: {
      type: SchemaType.STRING,
      enum: ["v2"],
      format: "enum",
      description: "Always return v2.",
    },
    visualBrief: {
      type: SchemaType.OBJECT,
      properties: {
        prompt: {
          type: SchemaType.STRING,
          description: "Text-free visual brief for the image model. Never include headline, CTA, or visible text instructions.",
        },
        subject: { type: SchemaType.STRING, description: "Main focal subject or object." },
        environment: { type: SchemaType.STRING, description: "Specific setting or world." },
        lighting: { type: SchemaType.STRING, description: "Primary lighting direction and mood." },
        mood: { type: SchemaType.STRING, description: "Emotional tone of the visual." },
        composition: {
          type: SchemaType.STRING,
          enum: [
            "rule_of_thirds",
            "centered",
            "asymmetric",
            "diagonal",
            "frame_within_frame",
            "leading_lines",
            "golden_ratio",
            "negative_space",
          ],
          format: "enum",
          description: "Composition approach for the background image.",
        },
        negativeSpaceZone: {
          type: SchemaType.STRING,
          enum: NEGATIVE_SPACE_ZONES,
          format: "enum",
          description: "Where the background should leave room for text overlay later.",
        },
        renderStyle: {
          type: SchemaType.STRING,
          enum: [
            "photorealistic",
            "minimalist",
            "3d_render",
            "flat_illustration",
            "watercolor",
            "cyberpunk",
            "retro_vintage",
            "pop_art",
            "abstract",
            "line_art",
            "collage",
          ],
          format: "enum",
          description: "Rendering style for the background image.",
        },
        brandColorUsage: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Hex colors or named colors to weave into the scene as materials, lighting, or accents.",
        },
        avoid: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Things the image model must avoid, especially visible text, watermarks, logos, UI mockups, and cliché scenes.",
        },
      },
      required: [
        "prompt",
        "subject",
        "environment",
        "lighting",
        "mood",
        "composition",
        "negativeSpaceZone",
        "renderStyle",
        "brandColorUsage",
        "avoid",
      ],
    },
    copyBrief: {
      type: SchemaType.OBJECT,
      properties: {
        headline: { type: SchemaType.STRING, description: "Short overlay headline. Prefer 3-6 words unless user text is explicit." },
        subtext: { type: SchemaType.STRING, description: "Short supporting line. Prefer 5-12 words unless user text is explicit." },
        cta: { type: SchemaType.STRING, description: "Short call to action. Prefer 2-4 words unless user text is explicit." },
      },
      required: ["headline", "subtext", "cta"],
    },
    layoutBrief: {
      type: SchemaType.OBJECT,
      properties: {
        templateId: {
          type: SchemaType.STRING,
          enum: TEMPLATE_IDS,
          format: "enum",
          description: "Template ReachPilot should use for composition.",
        },
        alignment: {
          type: SchemaType.STRING,
          enum: TEMPLATE_ALIGNMENTS,
          format: "enum",
          description: "Horizontal text alignment inside the chosen template.",
        },
        textTheme: {
          type: SchemaType.STRING,
          enum: TEXT_THEMES,
          format: "enum",
          description: "Recommended text color treatment for composition.",
        },
        safeArea: {
          type: SchemaType.STRING,
          enum: NEGATIVE_SPACE_ZONES,
          format: "enum",
          description: "Where ReachPilot should place copy safely on top of the background.",
        },
        overlay: {
          type: SchemaType.STRING,
          enum: OVERLAY_STYLES,
          format: "enum",
          description: "Recommended readability overlay for the composition layer.",
        },
      },
      required: ["templateId", "alignment", "textTheme", "safeArea", "overlay"],
    },
  },
  required: ["schemaVersion", "visualBrief", "copyBrief", "layoutBrief"],
};

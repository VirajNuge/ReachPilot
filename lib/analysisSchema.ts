// Shared Gemini analysis schema — used by both /api/analyze and /api/analyze-extension
import { SchemaType, Schema } from "@google/generative-ai";

export const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    profile: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        headline: { type: SchemaType.STRING },
        followers: { type: SchemaType.NUMBER },
        projects: { type: SchemaType.STRING },
        profileScore: { type: SchemaType.NUMBER },
      },
      required: ["name", "headline", "followers", "projects", "profileScore"],
    },
    quickFixes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          headline: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          tag: {
            type: SchemaType.STRING,
            enum: ["HIGH IMPACT", "MEDIUM IMPACT", "LOW IMPACT"],
          } as any,
        },
        required: ["headline", "description", "tag"],
      },
    },
    bioAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        clarityScore: { type: SchemaType.NUMBER },
        keywordScore: { type: SchemaType.NUMBER },
        tone: { type: SchemaType.STRING },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        weaknesses: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        suggestions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        "clarityScore",
        "keywordScore",
        "tone",
        "strengths",
        "weaknesses",
        "suggestions",
      ],
    },
    keywords: {
      type: SchemaType.OBJECT,
      properties: {
        current: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        missing: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["current", "missing"],
    },
    textAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        frequency: { type: SchemaType.STRING },
        contentMix: { type: SchemaType.STRING },
        engagement: { type: SchemaType.STRING },
      },
      required: ["frequency", "contentMix", "engagement"],
    },
    contentMetrics: {
      type: SchemaType.OBJECT,
      properties: {
        frequencyScore: { type: SchemaType.NUMBER },
        contentMixScore: { type: SchemaType.NUMBER },
        engagementScore: { type: SchemaType.NUMBER },
      },
      required: ["frequencyScore", "contentMixScore", "engagementScore"],
    },
    schedule: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: { type: SchemaType.STRING },
          slots: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                label: { type: SchemaType.STRING },
                value: { type: SchemaType.NUMBER },
                engagement: { type: SchemaType.STRING },
              },
              required: ["id", "label", "value", "engagement"],
            },
          },
        },
        required: ["day", "slots"],
      },
    },
    scheduleHighlight: { type: SchemaType.STRING },
    csiScore: { type: SchemaType.NUMBER },
    contentPillars: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          topic: { type: SchemaType.STRING },
          performance: { type: SchemaType.STRING },
        },
        required: ["topic", "performance"],
      },
    },
    audiencePersonas: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          percentage: { type: SchemaType.NUMBER },
        },
        required: ["name", "description", "percentage"],
      },
    },
    hypeValueScore: {
      type: SchemaType.OBJECT,
      properties: {
        hype: { type: SchemaType.NUMBER },
        value: { type: SchemaType.NUMBER },
      },
      required: ["hype", "value"],
    },
    ideaBank: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          concept: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
        },
        required: ["concept", "impact"],
      },
    },
    postDNA: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          hookType: { type: SchemaType.STRING },
          format: { type: SchemaType.STRING },
          topic: { type: SchemaType.STRING },
          verdict: { type: SchemaType.STRING },
        },
        required: ["hookType", "format", "topic", "verdict"],
      },
    },
    tribes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          size: { type: SchemaType.NUMBER },
          growth: { type: SchemaType.STRING },
          sentiment: { type: SchemaType.STRING },
        },
        required: ["name", "size", "growth", "sentiment"],
      },
    },
    shadowAudience: {
      type: SchemaType.OBJECT,
      properties: {
        lurkersPercent: { type: SchemaType.NUMBER },
        engagersPercent: { type: SchemaType.NUMBER },
        insight: { type: SchemaType.STRING },
      },
      required: ["lurkersPercent", "engagersPercent", "insight"],
    },
  },
  required: [
    "profile",
    "quickFixes",
    "bioAnalysis",
    "keywords",
    "textAnalysis",
    "contentMetrics",
    "schedule",
    "scheduleHighlight",
    "csiScore",
    "contentPillars",
    "audiencePersonas",
    "hypeValueScore",
    "ideaBank",
    "postDNA",
    "tribes",
    "shadowAudience",
  ],
};

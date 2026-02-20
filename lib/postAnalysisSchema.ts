import { SchemaType, Schema } from "@google/generative-ai";

export const postAnalysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    hookCTA: {
      type: SchemaType.OBJECT,
      properties: {
        trigger: { type: SchemaType.STRING },
        skeleton: { type: SchemaType.STRING },
        pivotA: { type: SchemaType.STRING },
        pivotB: { type: SchemaType.STRING },
        pivotC: { type: SchemaType.STRING },
        ctaType: { type: SchemaType.STRING },
        ctaTip: { type: SchemaType.STRING },
      },
      required: [
        "trigger",
        "skeleton",
        "pivotA",
        "pivotB",
        "pivotC",
        "ctaType",
        "ctaTip",
      ],
    },
    retention: {
      type: SchemaType.OBJECT,
      properties: {
        segments: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              text: { type: SchemaType.STRING },
              retention: { type: SchemaType.STRING },
              warning: { type: SchemaType.BOOLEAN },
              fix: { type: SchemaType.STRING },
            },
            required: ["text", "retention"],
          },
        },
        seedComments: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["segments", "seedComments"],
    },
    leadPersona: {
      type: SchemaType.OBJECT,
      properties: {
        audienceData: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              value: { type: SchemaType.NUMBER },
              color: { type: SchemaType.STRING },
            },
            required: ["label", "value", "color"],
          },
        },
        highIntentLeads: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              role: { type: SchemaType.STRING },
              intent: { type: SchemaType.STRING },
              avatar: { type: SchemaType.STRING },
            },
            required: ["name", "role", "intent", "avatar"],
          },
        },
        icpAlignment: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            score: { type: SchemaType.NUMBER },
          },
          required: ["title", "score"],
        },
      },
      required: ["audienceData", "highIntentLeads", "icpAlignment"],
    },
    commentGap: {
      type: SchemaType.OBJECT,
      properties: {
        gapData: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              gap: { type: SchemaType.STRING },
              frequency: { type: SchemaType.NUMBER },
              strategy: { type: SchemaType.STRING },
            },
            required: ["gap", "frequency", "strategy"],
          },
        },
        confusionPoint: {
          type: SchemaType.OBJECT,
          properties: {
            text: { type: SchemaType.STRING },
            sentiment: { type: SchemaType.STRING },
            insight: { type: SchemaType.STRING },
          },
          required: ["text", "sentiment", "insight"],
        },
      },
      required: ["gapData", "confusionPoint"],
    },
    visualStrategy: {
      type: SchemaType.OBJECT,
      properties: {
        category: { type: SchemaType.STRING },
        colors: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        prompts: {
          type: SchemaType.OBJECT,
          properties: {
            midjourney: { type: SchemaType.STRING },
            dalle: { type: SchemaType.STRING },
          },
          required: ["midjourney", "dalle"],
        },
      },
      required: ["category", "colors", "prompts"],
    },
    viralVelocity: {
      type: SchemaType.OBJECT,
      properties: {
        velocityData: {
          type: SchemaType.OBJECT,
          properties: {
            likesPerHour: { type: SchemaType.NUMBER },
            trend: { type: SchemaType.STRING },
            peakTime: { type: SchemaType.STRING },
            accountAvg: { type: SchemaType.NUMBER },
            growthPrediction: { type: SchemaType.STRING },
          },
          required: [
            "likesPerHour",
            "trend",
            "peakTime",
            "accountAvg",
            "growthPrediction",
          ],
        },
      },
      required: ["velocityData"],
    },
    sentiment: {
      type: SchemaType.OBJECT,
      properties: {
        sentimentData: {
          type: SchemaType.OBJECT,
          properties: {
            positive: { type: SchemaType.NUMBER },
            constructive: { type: SchemaType.NUMBER },
            neutral: { type: SchemaType.NUMBER },
            negative: { type: SchemaType.NUMBER },
            keywords: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            dominantEmotion: { type: SchemaType.STRING },
            trustScore: { type: SchemaType.STRING },
            sarcasmLevel: { type: SchemaType.STRING },
            isControversial: { type: SchemaType.BOOLEAN },
          },
          required: [
            "positive",
            "constructive",
            "neutral",
            "negative",
            "keywords",
            "dominantEmotion",
            "trustScore",
            "sarcasmLevel",
            "isControversial",
          ],
        },
      },
      required: ["sentimentData"],
    },
    competitor: {
      type: SchemaType.OBJECT,
      properties: {
        benchmarkData: {
          type: SchemaType.OBJECT,
          properties: {
            engagementRate: { type: SchemaType.NUMBER },
            accountAvg: { type: SchemaType.NUMBER },
            nicheAvg: { type: SchemaType.NUMBER },
            isOutlier: { type: SchemaType.BOOLEAN },
            botSignal: { type: SchemaType.STRING },
            followers: { type: SchemaType.STRING },
          },
          required: [
            "engagementRate",
            "accountAvg",
            "nicheAvg",
            "isOutlier",
            "botSignal",
            "followers",
          ],
        },
      },
      required: ["benchmarkData"],
    },
  },
  required: [
    "hookCTA",
    "retention",
    "leadPersona",
    "commentGap",
    "visualStrategy",
    "viralVelocity",
    "sentiment",
    "competitor",
  ],
};

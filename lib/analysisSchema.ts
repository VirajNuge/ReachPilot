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
    // --- THE CROWD & BLUEPRINT DATA ---
    crowdSentiment: {
      type: SchemaType.OBJECT,
      properties: {
        positivePercent: { type: SchemaType.NUMBER },
        neutralPercent: { type: SchemaType.NUMBER },
        negativePercent: { type: SchemaType.NUMBER },
        dominantEmotion: { type: SchemaType.STRING },
        insight: { type: SchemaType.STRING },
      },
      required: [
        "positivePercent",
        "neutralPercent",
        "negativePercent",
        "dominantEmotion",
        "insight",
      ],
    },
    questionCloud: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          frequency: { type: SchemaType.NUMBER },
        },
        required: ["text", "frequency"],
      },
    },
    activeHours: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: { type: SchemaType.STRING },
          hours: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.NUMBER },
          },
        },
        required: ["day", "hours"],
      },
    },
    leadMagnet: {
      type: SchemaType.OBJECT,
      properties: {
        suggestion: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING },
        relevanceScore: { type: SchemaType.NUMBER },
        whyItWorks: { type: SchemaType.STRING },
      },
      required: ["suggestion", "type", "relevanceScore", "whyItWorks"],
    },
    ctaAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        effectivenessScore: { type: SchemaType.NUMBER },
        commonPhrases: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        improvementSuggestion: { type: SchemaType.STRING },
      },
      required: [
        "effectivenessScore",
        "commonPhrases",
        "improvementSuggestion",
      ],
    },
    techStack: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          tool: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
        },
        required: ["tool", "category", "confidence"],
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
    // --- THE LAB DATA ---
    velocity: {
      type: SchemaType.OBJECT,
      properties: {
        hookRate: { type: SchemaType.NUMBER },
        category: { type: SchemaType.STRING },
        velocityGraph: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              hour: { type: SchemaType.STRING },
              engagement: { type: SchemaType.NUMBER },
            },
            required: ["hour", "engagement"],
          },
        },
        insight: { type: SchemaType.STRING },
      },
      required: ["hookRate", "category", "velocityGraph", "insight"],
    },
    psychTriggers: {
      type: SchemaType.OBJECT,
      properties: {
        radarData: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              trigger: { type: SchemaType.STRING },
              score: { type: SchemaType.NUMBER },
              fullMark: { type: SchemaType.NUMBER },
            },
            required: ["trigger", "score", "fullMark"],
          },
        },
        winningTrigger: { type: SchemaType.STRING },
        insight: { type: SchemaType.STRING },
      },
      required: ["radarData", "winningTrigger", "insight"],
    },
    postFatigue: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING },
        fatigueScore: { type: SchemaType.NUMBER },
        optimalFrequency: { type: SchemaType.STRING },
        saturationPoint: { type: SchemaType.NUMBER },
        weeklyImpact: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              day: { type: SchemaType.STRING },
              posts: { type: SchemaType.NUMBER },
              impactScore: { type: SchemaType.NUMBER },
            },
            required: ["day", "posts", "impactScore"],
          },
        },
      },
      required: [
        "status",
        "fatigueScore",
        "optimalFrequency",
        "saturationPoint",
        "weeklyImpact",
      ],
    },
    competitorGap: {
      type: SchemaType.OBJECT,
      properties: {
        metrics: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category: { type: SchemaType.STRING },
              profileValue: { type: SchemaType.NUMBER },
              benchmarkValue: { type: SchemaType.NUMBER },
              gapType: { type: SchemaType.STRING },
            },
            required: ["category", "profileValue", "benchmarkValue", "gapType"],
          },
        },
        topOpportunity: { type: SchemaType.STRING },
        insight: { type: SchemaType.STRING },
        recommendations: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["metrics", "topOpportunity", "insight", "recommendations"],
    },
    viralRecipe: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          engagementMultiplier: { type: SchemaType.STRING },
          hookType: { type: SchemaType.STRING },
          hookText: { type: SchemaType.STRING },
          ingredients: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                value: { type: SchemaType.STRING },
                score: { type: SchemaType.NUMBER },
              },
              required: ["name", "value", "score"],
            },
          },
          whyItWorked: { type: SchemaType.STRING },
          templateStructure: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          "id",
          "engagementMultiplier",
          "hookType",
          "hookText",
          "ingredients",
          "whyItWorked",
          "templateStructure",
        ],
      },
    },
    voiceSpectrum: {
      type: SchemaType.OBJECT,
      properties: {
        personaName: { type: SchemaType.STRING },
        axes: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              leftLabel: { type: SchemaType.STRING },
              rightLabel: { type: SchemaType.STRING },
              score: { type: SchemaType.NUMBER },
            },
            required: ["id", "leftLabel", "rightLabel", "score"],
          },
        },
        signatureWords: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        insight: { type: SchemaType.STRING },
      },
      required: ["personaName", "axes", "signatureWords", "insight"],
    },

    // --- LEGACY/SHARED DATA ---
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
    "velocity",
    "psychTriggers",
    "postFatigue",
    "competitorGap",
    "viralRecipe",
    "voiceSpectrum",
    "crowdSentiment",
    "questionCloud",
    "activeHours",
    "leadMagnet",
    "ctaAnalysis",
    "techStack",
  ],
};

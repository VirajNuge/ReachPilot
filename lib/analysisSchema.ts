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
    valueLadder: {
      type: SchemaType.OBJECT,
      properties: {
        products: {
          type: SchemaType.OBJECT,
          properties: {
            Bait: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                price: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                intensity: {
                  type: SchemaType.STRING,
                  enum: ["Low", "Medium", "High"],
                } as any,
              },
              required: ["name", "price", "type", "intensity"],
            },
            Tripwire: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                price: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                intensity: { type: SchemaType.STRING },
              },
              required: ["name", "price", "type", "intensity"],
            },
            Core: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                price: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                intensity: { type: SchemaType.STRING },
              },
              required: ["name", "price", "type", "intensity"],
            },
            "High-Ticket": {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                price: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                intensity: { type: SchemaType.STRING },
              },
              required: ["name", "price", "type", "intensity"],
            },
          },
        },
        gap: { type: SchemaType.STRING },
        insight: { type: SchemaType.STRING },
      },
      required: ["products", "gap", "insight"],
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
          name: { type: SchemaType.STRING },
          percentage: { type: SchemaType.NUMBER },
          count: { type: SchemaType.NUMBER },
          avgEngagement: { type: SchemaType.STRING },
          color: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          topPosts: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                engagementRate: { type: SchemaType.STRING },
                captionSnippet: { type: SchemaType.STRING },
                thumbnail: { type: SchemaType.STRING },
              },
              required: ["id", "type", "engagementRate", "captionSnippet"],
            },
          },
        },
        required: [
          "name",
          "percentage",
          "count",
          "avgEngagement",
          "description",
          "topPosts",
        ],
      },
    },
    pillarInsight: { type: SchemaType.STRING },
    crowdPersonas: {
      type: SchemaType.OBJECT,
      properties: {
        primaryArchetype: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            role: { type: SchemaType.STRING },
            iconName: {
              type: SchemaType.STRING,
              enum: ["UserTie", "LaptopCode", "Bullhorn", "Rocket", "Users"],
            } as any,
            color: { type: SchemaType.STRING },
            bio: { type: SchemaType.STRING },
            percentage: { type: SchemaType.NUMBER },
            triggers: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            painPoints: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: [
            "id",
            "role",
            "iconName",
            "color",
            "bio",
            "percentage",
            "triggers",
            "painPoints",
          ],
        },
        secondaryArchetypes: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              role: { type: SchemaType.STRING },
              iconName: { type: SchemaType.STRING },
              color: { type: SchemaType.STRING },
              bio: { type: SchemaType.STRING },
              percentage: { type: SchemaType.NUMBER },
              triggers: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              painPoints: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: [
              "id",
              "role",
              "iconName",
              "color",
              "bio",
              "percentage",
              "triggers",
              "painPoints",
            ],
          },
        },
        insight: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            actionable: { type: SchemaType.STRING },
          },
          required: ["title", "description", "actionable"],
        },
      },
      required: ["primaryArchetype", "secondaryArchetypes", "insight"],
    },
    // --- THE CROWD & BLUEPRINT DATA ---
    crowdSentiment: {
      type: SchemaType.OBJECT,
      properties: {
        totalComments: { type: SchemaType.NUMBER },
        vibeScore: { type: SchemaType.NUMBER },
        vibes: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: {
                type: SchemaType.STRING,
                enum: ["Fanboys", "Seekers", "Skeptics", "Critics"],
              } as any,
              percentage: { type: SchemaType.NUMBER },
              count: { type: SchemaType.NUMBER },
              keywords: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              color: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
            },
            required: [
              "type",
              "percentage",
              "count",
              "keywords",
              "color",
              "description",
            ],
          },
        },
        sentimentTrend: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              post: { type: SchemaType.NUMBER },
              score: { type: SchemaType.NUMBER },
            },
            required: ["post", "score"],
          },
        },
      },
      required: ["totalComments", "vibeScore", "vibes", "sentimentTrend"],
    },
    questionCloud: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          word: { type: SchemaType.STRING },
          count: { type: SchemaType.NUMBER },
          engagement: { type: SchemaType.NUMBER },
          intent: {
            type: SchemaType.STRING,
            enum: ["Urgency", "Buying", "Educational"],
          } as any,
          sampleQuestions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: { type: SchemaType.STRING },
                likes: { type: SchemaType.NUMBER },
              },
              required: ["text", "likes"],
            },
          },
        },
        required: [
          "id",
          "word",
          "count",
          "engagement",
          "intent",
          "sampleQuestions",
        ],
      },
    },
    activeHours: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          hour: { type: SchemaType.NUMBER },
          creatorPosts: { type: SchemaType.NUMBER },
          audienceActivity: { type: SchemaType.NUMBER },
        },
        required: ["hour", "creatorPosts", "audienceActivity"],
      },
    },
    leadMagnet: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.STRING,
          enum: [
            "Checklist",
            "Webinar",
            "Free Trial",
            "Discovery Call",
            "Other",
          ],
        } as any,
        title: { type: SchemaType.STRING },
        hook: { type: SchemaType.STRING },
        friction: {
          type: SchemaType.STRING,
          enum: ["Low", "Medium", "High"],
        } as any,
        temp: {
          type: SchemaType.STRING,
          enum: ["Cold", "Warm", "Hot"],
        } as any,
        suggestion: { type: SchemaType.STRING },
        whyItWorks: { type: SchemaType.STRING },
      },
      required: [
        "type",
        "title",
        "hook",
        "friction",
        "temp",
        "suggestion",
        "whyItWorks",
      ],
    },
    ctaAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        mix: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: {
                type: SchemaType.STRING,
                enum: ["Engagement", "Bridge", "Conversion", "Conversation"],
              } as any,
              score: { type: SchemaType.NUMBER },
              fullMark: { type: SchemaType.NUMBER },
            },
            required: ["type", "score", "fullMark"],
          },
        },
        topTrigger: {
          type: SchemaType.OBJECT,
          properties: {
            keyword: { type: SchemaType.STRING },
            count: { type: SchemaType.NUMBER },
          },
          required: ["keyword", "count"],
        },
        urgencyScore: { type: SchemaType.NUMBER },
        dominantStyle: {
          type: SchemaType.STRING,
          enum: ["Hunter-Killer", "Reach Hunter", "Community Builder"],
        } as any,
        placementHeatmap: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              location: {
                type: SchemaType.STRING,
                enum: ["First Line", "Bottom", "P.S."],
              } as any,
              count: { type: SchemaType.NUMBER },
            },
            required: ["location", "count"],
          },
        },
      },
      required: [
        "mix",
        "topTrigger",
        "urgencyScore",
        "dominantStyle",
        "placementHeatmap",
      ],
    },
    techStack: {
      type: SchemaType.OBJECT,
      properties: {
        tools: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category: {
                type: SchemaType.STRING,
                enum: [
                  "Hosting",
                  "Frontend",
                  "Tracking",
                  "Payment",
                  "Marketing",
                ],
              } as any,
              name: { type: SchemaType.STRING },
              confidence: {
                type: SchemaType.STRING,
                enum: ["High", "Medium", "Low"],
              } as any,
            },
            required: ["category", "name", "confidence"],
          },
        },
        businessClass: {
          type: SchemaType.STRING,
          enum: ["Hobbyist", "Pro Creator", "SaaS / Agency", "Enterprise"],
        } as any,
        verdict: { type: SchemaType.STRING },
      },
      required: ["tools", "businessClass", "verdict"],
    },
    growthTasks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          category: {
            type: SchemaType.STRING,
            enum: ["Quick Win", "Big Bet", "Filler", "Money Pit"],
          } as any,
          impact: { type: SchemaType.NUMBER },
          effort: { type: SchemaType.NUMBER },
          type: {
            type: SchemaType.STRING,
            enum: ["Funnel", "Content", "Crowd"],
          } as any,
          status: {
            type: SchemaType.STRING,
            enum: ["Pending", "In Progress", "Completed"],
          } as any,
          reasoning: { type: SchemaType.STRING },
          actionType: {
            type: SchemaType.STRING,
            enum: ["Bio", "Content", "Strategy", "Tech"],
          } as any,
        },
        required: [
          "id",
          "title",
          "category",
          "impact",
          "effort",
          "type",
          "status",
          "reasoning",
          "actionType",
        ],
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
    "growthTasks",
  ],
};

import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { scrapeProfile } from "@/lib/scrapeService"; // Ensure strict alias or use '../../../../lib/scrapeService'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const { link } = await req.json();

    // 1. Scrape the public profile
    console.log(`[API] Scraping link: ${link}`);
    const scrapedText = await scrapeProfile(link);

    // 2. Setup Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        profile: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            headline: { type: SchemaType.STRING },
            followers: { type: SchemaType.NUMBER },
            projects: { type: SchemaType.STRING },
          },
          required: ["name", "headline", "followers", "projects"],
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
      },
      required: [
        "profile",
        "quickFixes",
        "bioAnalysis",
        "keywords",
        "textAnalysis",
        "schedule",
        "scheduleHighlight",
      ],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      Analyze this RAW SCRAPED CONTENT from a social media profile:
      ---
      ${scrapedText}
      ---
      
      Generate a simulated audit based on this text.
      If the text is an error or empty, generate a realistic simulation for a "Digital Marketer".
      Strictly follow the JSON schema.
      Schedule: Generate 7 days.
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}

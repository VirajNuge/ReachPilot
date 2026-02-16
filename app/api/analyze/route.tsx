import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { scrapeProfile } from "@/lib/scrapeService";
import {
  getPlatformPrompt,
  Platform,
  PLATFORM_BENCHMARKS,
} from "./platformPrompts";
import { analysisSchema } from "@/lib/analysisSchema";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const { link, platform = "linkedin" } = await req.json();
    const platformType = (platform as Platform) || "linkedin";
    // Fallback to linkedin benchmarks if platform not found
    const benchmarks =
      PLATFORM_BENCHMARKS[platformType] || PLATFORM_BENCHMARKS.linkedin;

    // 1. Scrape the public profile
    console.log(`[API] Scraping ${platformType} link: ${link}`);
    const scrapedText = await scrapeProfile(link);

    // 2. Setup Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    // Get platform-specific context
    const platformName =
      platformType.charAt(0).toUpperCase() + platformType.slice(1);

    const prompt = `
      You are an expert ${platformName} profile analyst. Analyze this RAW SCRAPED CONTENT from a ${platformName} profile:
      ---
      ${scrapedText}
      ---
      
      PLATFORM CONTEXT (${platformName}):
      - Optimal posting frequency: ${benchmarks.optimalPostFrequency}
      - Peak engagement hours: ${benchmarks.peakHours.join(", ")}
      - Top content types: ${benchmarks.contentTypes.join(", ")}
      - Key metrics: ${benchmarks.keyMetrics.join(", ")}
      
      BENCHMARKS:
      - Low performer: ~${benchmarks.avgFollowers.low.toLocaleString()} followers, ${benchmarks.avgEngagement.low}% engagement
      - Average: ~${benchmarks.avgFollowers.medium.toLocaleString()} followers, ${benchmarks.avgEngagement.medium}% engagement
      - Top performer: ${benchmarks.avgFollowers.high.toLocaleString()}+ followers, ${benchmarks.avgEngagement.high}%+ engagement
      
      Generate a comprehensive profile audit. If the text is an error or empty, generate a realistic simulation.
      
      REQUIREMENTS:
      
      1. **profile.profileScore**: Calculate a 0-100 weighted score based on:
         - Bio clarity (30%)
         - Keyword optimization (20%)
         - Content engagement potential (30%)
         - Profile completeness (20%)
      
      2. **quickFixes**: Generate 6-8 ${platformName}-specific fixes:
         - 2-3 HIGH IMPACT (headline, bio, CTA)
         - 2-3 MEDIUM IMPACT (keywords, formatting)
         - 1-2 LOW IMPACT (minor tweaks)
      
      3. **bioAnalysis**: 
         - clarityScore: 1-10
         - keywordScore: 1-10
         - strengths: 3-4 items
         - weaknesses: 3-4 items
         - suggestions: 3-4 actionable items
      
      4. **contentMetrics**: Scores 0-100 for:
         - frequencyScore (posting consistency)
         - contentMixScore (variety of content types)
         - engagementScore (interaction quality)
      
      5. **keywords**:
         - current: 8-12 visible keywords
         - missing: 6-10 ${platformName}-specific keywords to add
      
      6. **schedule**: 7 days (MONDAY-SUNDAY), 4 slots each:
         - Based on ${platformName} peak hours: ${benchmarks.peakHours.join(", ")}
         - value: 0-100 (use varied values: 20, 45, 70, 90)
         - engagement: "High", "Medium", "Low"
      
      7. **scheduleHighlight**: Best posting times insight for ${platformName}.

      8. **csiScore**: Calculate "Creator Sustainability Index" (0-100) based on:
         - Consistency of posting (30%)
         - Engagement trend (50%)
         - Sentiment of content (20%)
         - <50 indicates burnout risk, >80 indicates healthy growth.

      9. **contentPillars**: Identify 3-4 recurring content themes.
         - topic: Name of the theme (e.g., "AI Tutorials", "Personal Stories")
         - performance: "High", "Medium", or "Low" based on estimated engagement.

      10. **audiencePersonas**: Infer 3 distinct audience segments likely to follow this account.
          - name: Creative label (e.g., "The Aspiring Founder")
          - description: Brief psychographic profile
          - percentage: Estimated share of audience (sum to 100%)

      11. **hypeValueScore**: Analyze the balance of "Hype" (clickbait/trends) vs "Value" (education/depth).
          - Sum must equal 100.
          - hype: % of content driven by excitement/trends.
          - value: % of content driven by education/insight.

      12. **ideaBank**: Generate 4-5 high-impact post ideas to fill gaps.
          - concept: The core idea (one sentence)
          - impact: Why it will work (e.g., "High Viral Potential", "Authority Builder")
      
      13. **postDNA**: Analyze the "DNA" of 5 recent or simulated top posts:
          - hookType: e.g., "Question", "Controversial", "Story", "Stat-heavy"
          - format: e.g., "Text", "Video", "Carousel", "Image"
          - topic: e.g., "Productivity", "AI", "Startup Life"
          - verdict: One short sentence explaining WHY it worked (e.g., "High relatability", "Punchy hook")
      
      14. **tribes**: Identify 3-4 audience sub-cultures in their network.
          - name: Creative label (e.g., "The Indie Hackers", "Corporate Climbers")
          - size: Relative size (0-100)
          - growth: Estimated growth trend (e.g., "+15%", "-5%")
          - sentiment: "Positive", "Neutral", or "Negative"

      15. **shadowAudience**: Analyze the ratio of silent observers vs active commenters.
          - lurkersPercent: Estimate % of followers who see but don't engage (usually 80-90%)
          - engagersPercent: Estimate % who actively like/comment (10-20%)
          - insight: Strategic advice to activate them (e.g., "Post more polls to lower friction")

      Strictly follow the JSON schema.
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 },
    );
  }
}

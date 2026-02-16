// Extension-specific prompt builder for Gemini analysis
// Uses formatted post data (from extensionDataFormatter) instead of raw HTML scrape
import { Platform, PLATFORM_BENCHMARKS } from "../analyze/platformPrompts";

function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    linkedin: "LinkedIn",
    facebook: "Facebook",
    twitter: "X (Twitter)",
    x: "X (Twitter)",
    instagram: "Instagram",
  };
  return names[platform] || platform;
}

// Normalize extension platform names to canonical Platform type names
function normalizePlatform(platform: string): Platform {
  const normalized: Record<string, Platform> = {
    x: "twitter", // Extension outputs "x", but benchmarks use "twitter"
    linkedin: "linkedin",
    facebook: "facebook",
    instagram: "instagram",
  };
  return normalized[platform.toLowerCase()] || "linkedin";
}

export function buildExtensionPrompt(
  formattedData: string,
  platform: string,
): string {
  const platformType = normalizePlatform(platform);
  const benchmarks = PLATFORM_BENCHMARKS[platformType];
  const platformName = getPlatformName(platform);

  return `
You are an expert ${platformName} profile analyst and growth strategist.

Below is REAL SCRAPED DATA from a ${platformName} profile, captured by a browser extension.
This includes actual post content, engagement metrics, posting patterns, and comment data.

SCRAPED PROFILE DATA:
---
${formattedData}
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

IMPORTANT: This data comes from real scraped posts with actual metrics. Use the REAL numbers provided. Do NOT invent engagement numbers — calculate from the data above.

Generate a comprehensive profile audit. Strictly follow the JSON schema.

REQUIREMENTS:

1. **profile.profileScore**: Calculate a 0-100 weighted score based on:
   - Content quality and clarity (30%)
   - Keyword optimization (20%)
   - Engagement performance vs benchmarks (30%)
   - Posting consistency (20%)
   Use the ACTUAL engagement rates from the data.

2. **profile.headline**: Infer the creator's positioning from their content patterns.

3. **profile.followers**: Estimate from engagement patterns (if not directly available).

4. **quickFixes**: Generate 6-8 ${platformName}-specific fixes:
   - 2-3 HIGH IMPACT (content strategy, posting cadence)
   - 2-3 MEDIUM IMPACT (engagement tactics, format changes)
   - 1-2 LOW IMPACT (minor optimizations)

5. **bioAnalysis**: Analyze their content voice and positioning:
   - clarityScore: 1-10 (how clear is their niche/value prop from posts)
   - keywordScore: 1-10 (presence of searchable terms)
   - strengths/weaknesses/suggestions: 3-4 items each

6. **contentMetrics**: Scores 0-100 based on ACTUAL data:
   - frequencyScore: Based on their posting frequency vs optimal
   - contentMixScore: Based on variety (text/image/video/carousel)
   - engagementScore: Based on actual engagement vs platform benchmarks

7. **keywords**: Analyze the ACTUAL post content for:
   - current: 8-12 keywords they consistently use
   - missing: 6-10 ${platformName}-specific keywords they should add

8. **schedule**: 7 days (MONDAY-SUNDAY), 4 slots each:
   - Use the ACTUAL posting times from the data to determine peak slots
   - value: 0-100 engagement potential
   - engagement: "High", "Medium", "Low"

9. **scheduleHighlight**: Best posting times insight based on their REAL data.

10. **csiScore**: Creator Sustainability Index (0-100) based on:
    - Consistency of posting from the ACTUAL date range
    - Engagement TREND from the data (growing/declining)
    - Content quality signals
    - <50 = burnout risk, >80 = healthy growth

11. **contentPillars**: Identify 3-4 recurring content themes from ACTUAL posts.

12. **audiencePersonas**: Infer 3 audience segments from commenter patterns and content topics.

13. **hypeValueScore**: Analyze "Hype" vs "Value" balance from ACTUAL post content. Sum = 100.

14. **ideaBank**: Generate 4-5 post ideas that fill gaps in their content strategy.

15. **postDNA**: Analyze the ACTUAL posts (use real content from above):
    - hookType: How the post opens
    - format: Detected content type
    - topic: Subject matter
    - verdict: Why it performed well/poorly based on REAL metrics

16. **tribes**: Identify 3-4 audience sub-cultures from comment patterns.

17. **shadowAudience**: Estimate lurker vs active commenter ratio using ACTUAL data.

Strictly follow the JSON schema. Base everything on the REAL scraped data provided.
  `.trim();
}

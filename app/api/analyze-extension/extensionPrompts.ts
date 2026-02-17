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
  profile: any = {},
): string {
  const platformType = normalizePlatform(platform);
  const benchmarks = PLATFORM_BENCHMARKS[platformType];
  const platformName = getPlatformName(platform);

  const profileSummary = `
- Name: ${profile.name || "Unknown"}
- Bio: ${profile.bio || "No bio scraped"}
- Followers: ${profile.followers || "Unknown"}
- Following: ${profile.following || "Unknown"}
- Profile Pic: ${profile.pfp || "None"}
- Banner: ${profile.banner || "None"}
  `.trim();

  return `
You are an expert ${platformName} profile analyst and growth strategist.

Below is REAL SCRAPED DATA from a ${platformName} profile, captured by a browser extension.
This includes actual post content, engagement metrics, posting patterns, and comment data.

SCRAPED PROFILE INFO:
---
${profileSummary}
---

SCRAPED CONTENT DATA:
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

3. **profile.followers**: Use the REAL follower count from the scraped profile info: ${profile.followers || "Unknown"}. If unknown, estimate from engagement.

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
    - performance: "Top Performer", "Consistent", "Underperforming"

12. **velocity**: Analyze engagement speed based on hook strength & format:
    - hookRate: 0-100 (how strong are the first lines?)
    - category: "Flash" (high drop-off), "Steady" (consistent), "Slow-Burn" (grows over time)
    - velocityGraph: 5 points (1h, 2h, 4h, 12h, 24h) estimating cumulative engagement %
    - insight: 1 sentence analysis

13. **psychTriggers**: Score 0-100 on 6 persuasion levers based on their writing style:
    - radarData: [{trigger: "Authority", score: 0-100, fullMark: 100}, ...] (Triggers: Authority, Scarcity, Social Proof, Reciprocity, Liking, Curiosity)
    - winningTrigger: The strongest one
    - insight: 1 sentence analysis

14. **postFatigue**:
    - status: "Fresh", "Saturated", "Burned Out"
    - fatigueScore: 0-100
    - optimalFrequency: e.g. "3-5 posts/week"
    - saturationPoint: Max posts/day
    - weeklyImpact: 7 days (Mon-Sun), impactScore 0-2.0

15. **competitorGap**: Compare against benchmarks:
    - metrics: [{category: "Reels", profileValue: 50, benchmarkValue: 30, gapType: "Over-indexed"}, ...]
    - topOpportunity: Biggest gap
    - insight: Strategic analysis
    - recommendations: 3 actionable tips

16. **viralRecipe**: Analyze their BEST performing post:
    - engagementMultiplier: e.g. "3.5x"
    - hookType: e.g. "Controversial", "Story", "Data"
    - hookText: The actual first line
    - ingredients: [{name: "Visuals", value: "High Contrast", score: 9}, ...]
    - whyItWorked: Psychological breakdown
    - templateStructure: 4-step framework

17. **voiceSpectrum**: Brand voice analysis:
    - axes: [{id: "tone", leftLabel: "Pro", rightLabel: "Casual", score: 1-10}, ...]
    - signatureWords: 5 unique words
    - insight: Tone analysis

18. **audiencePersonas**: Infer 3 audience segments from commenter patterns and content topics.

19. **hypeValueScore**: Analyze "Hype" vs "Value" balance from ACTUAL post content. Sum = 100.

20. **ideaBank**: Generate 4-5 post ideas that fill gaps in their content strategy.

21. **postDNA**: Analyze the ACTUAL posts (use real content from above):
    - hookType: How the post opens
    - format: Detected content type
    - topic: Subject matter
    - verdict: Why it performed well/poorly based on REAL metrics

22. **tribes**: Identify 3-4 audience sub-cultures from comment patterns.

23. **shadowAudience**: Estimate lurker vs active commenter ratio using ACTUAL data.


24. **crowdSentiment**: Analyze comment section sentiment:
    - positivePercent: 0-100
    - neutralPercent: 0-100
    - negativePercent: 0-100
    - dominantEmotion: e.g. "Inspiring", "Controversial", "Educational"
    - insight: Summary of how people feel

25. **questionCloud**: Identify top 5 questions people ask in comments:
    - text: The question topic
    - frequency: How often it appears

26. **activeHours**: Heatmap of when their audience is most active (based on comment timestamps):
    - day: "Monday", etc.
    - hours: Array of active hours [9, 10, 14, 15]

27. **leadMagnet**: Suggest a high-converting freebie based on their content:
    - suggestion: e.g. "Ultimate Checklist"
    - type: "PDF", "Webinar", "Template"
    - relevanceScore: 0-100
    - whyItWorks: Strategic reason

28. **ctaAnalysis**: Evaluate their Calls to Action:
    - effectivenessScore: 0-100
    - commonPhrases: ["Link in bio", "DM me"]
    - improvementSuggestion: Better CTA to resize

29. **techStack**: Infer tools they use from their content style:
    - tool: e.g. "Notion", "Canva", "Hypefury"
    - category: "Design", "Productivity", "Scheduling"
    - confidence: "High", "Medium", "Low"

Strictly follow the JSON schema. Base everything on the REAL scraped data provided.
  `.trim();
}

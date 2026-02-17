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

11. **contentPillars**: Analyze the ACTUAL post content and engagement to cluster posts into 3-5 strategic themes (e.g., "Educational/How-to", "Personal/Behind-the-Scenes", "Promotional/Offers", "Thought Leadership"). For each pillar:
    - name: The theme name (e.g., "Educational")
    - percentage: Percentage of total content this pillar represents (should sum to 1.0 or 100).
    - count: Number of posts in this pillar.
    - avgEngagement: e.g., "3.5%" or "High"
    - color: A HEX color representing the pillar (e.g., #8b5cf6)
    - description: A brief summary of what this pillar contains.
    - topPosts: Array of 2-3 top posts in this category:
        - id: Post identifier or index
        - type: "Image", "Video", "Carousel", or "Text"
        - engagementRate: e.g., "5.2%"
        - captionSnippet: A 2-sentence summary of the post content.
        - thumbnail: (Optional) Mention media type if image/video.
    AI SUMMARY (aiSummary field): Suggest an "Optimal Content Mix" based on their top performers. e.g., "Double down on Educational Reels; they drive 2x more engagement than plain text tips."

12. **velocity**: Analyze engagement speed based on hook strength & format. Use ACTUAL data provided:
    - hookRate: 0-100 (Estimate percentage of views that became interactions in the first 2 hours).
    - category: Categorize based on Average Engagement Rate:
        - "Pulse": < 5% engagement
        - "Momentum": 5-10% engagement
        - "Growth": 10-20% engagement
        - "Viral": > 20% engagement
    - velocityGraph: 5 points (1h, 2h, 4h, 12h, 24h) estimating cumulative engagement units based on the post metrics.
    - insight: 1 sentence analysis focusing on the hook's effectiveness.

13. **psychTriggers**: Score 1-100 on 6 specific persuasion levers based on their writing style and ACTUAL post content.
    - radarData: Array of objects [{trigger: string, score: number, fullMark: 100}]
    - REQUIRED TRIGGERS:
      - **Urgency**: Detection keywords: "limited time", "now", "today only", countdowns.
      - **Curiosity**: Detection patterns: Questions, cliffhangers, "wait for the end", teasers.
      - **Social Proof**: Detection keywords: "X people", testimonials, client results, stats, case studies.
      - **Authority**: Detection signals: Credentials, years of experience, expertise, certifications.
      - **FOMO**: Detection keywords: "don't miss", "exclusivity", "scarcity", "last chance".
      - **Reciprocity**: Detection patterns: Free value, actionable tips, industry insights, giveaways.
    - winningTrigger: The highest scoring trigger.
    - insight: 1 sentence explaining which trigger is most effective for their engagement.

14. **postFatigue**: Analyze audience saturation based on posting frequency and engagement decay:
    - status: "Healthy" (consistent/growing engagement), "Warning" (slight decay), or "Critical" (significant engagement drop-off).
    - fatigueScore: 0-100 (0 = growing interest, 100 = terminal fatigue).
    - optimalFrequency: Strategic recommendation, e.g., "Once every 2 days" or "3x per week".
    - saturationPoint: Number of posts per day/week where engagement starts to significantly drop.
    - weeklyImpact: 7 days (Mon-Sun), with avg posts and an impactScore (1.0 = baseline, <1.0 = decay, >1.0 = peak interest).

15. **competitorGap**: Benchmark this profile against industry averages for their niche (e.g., SaaS, Creator, Agency).
    - metrics: Array of objects [{category: string, profileValue: number, benchmarkValue: number, gapType: string}]
    - REQUIRED CATEGORIES: "Engagement Rate", "Post Frequency", "Content Quality", "Hook Strength".
    - gapType: "Opportunity" (profile < benchmark), "Over-indexed" (profile > benchmark), or "On Par" (profile ≈ benchmark).
    - topOpportunity: The category with the largest negative gap.
    - insight: A detailed analysis of the competitor's weak point.
    - recommendations: 3 specific tactics to exploit the identified gap.

16. **viralRecipe**: Identify the single highest-engagement post (outlier) to deconstruct:
    - id: The post ID.
    - engagementMultiplier: e.g. "5.2x" (compared to their average).
    - hookType: Classify the hook (e.g., "Negative Hook", "Story", "Contrarian", "Listicle").
    - hookText: The exact first sentence/line of the post.
    - ingredients: 3 key elements that made it work (e.g., {name: "Formatting", value: "line breaks every 4 words", score: 9}).
    - whyItWorked: A psychological analysis of why this specific post resonated.
    - templateStructure: A 4-line reusable template based on the post's structure (e.g., "1. Hook: [Call out pain point]...").

17. **voiceSpectrum**: Deep brand voice analysis across 4 specific axes:
    - axes: Array of 4 objects [{id: string, leftLabel: string, rightLabel: string, score: number}]
    - REQUIRED AXES:
        1. **Formal ↔ Casual** (Score -100 to 100: -100 = Extremely Formal, 100 = Street Slang/Casual)
        2. **Technical ↔ Simple** (Score -100 to 100: -100 = Expert/Jargon-heavy, 100 = ELI5/Simple)
        3. **Serious ↔ Playful** (Score -100 to 100: -100 = No-nonsense/Grave, 100 = Humorous/Witty)
        4. **Data-driven ↔ Story-driven** (Score -100 to 100: -100 = Statistics/Facts, 100 = Narratives/Anecdotes)
    - personaName: A catchy 2-3 word name for this writing style (e.g. "The Tech Philosopher").
    - signatureWords: 5 unique words or phrases they use frequently.
    - insight: 1 sentence analysis of why this voice works for their audience.

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

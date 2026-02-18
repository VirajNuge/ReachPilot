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

4. **quickFixes**: Generate 6-8 ${platformName}-specific fixes. IMPORTANT: Sort by impact — HIGH IMPACT fixes MUST come first.
   The first 3 items will be displayed in the "Triage Station" on the Pulse Overview.
    - headline: Short punchy title (max 5 words).
    - description: One sentence calculation of impact (e.g. "Fixing this could add 200 followers/mo").
    - tag: "HIGH IMPACT", "MEDIUM IMPACT", or "LOW IMPACT".

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

19. **crowdPersonas**: Deep Audience Archetype Modeling – Identify WHO is leading the conversation.

    CRITICAL: Return 1 PRIMARY archetype + 2-3 SECONDARY archetypes.

    METHODOLOGY:
    1. Analyze comment AUTHORS (not just content):
        - Who comments most frequently?
        - What language/jargon do they use?
        - What are they asking about?
    2. Cluster commenters into personas based on:
        - Job role signals (e.g., "I'm a dev", "our agency", "building a SaaS")
        - Pain points mentioned
        - Topics they engage with

    For EACH archetype:
    - **id**: Unique string
    - **role**: Persona name (e.g., "The Mid-Level Dev", "The Agency Founder", "The Indie Hacker")
    - **iconName**: Icon identifier from: "UserTie" | "LaptopCode" | "Bullhorn" | "Rocket" | "Users"
    - **color**: HEX color code (use: #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)
    - **bio**: 1-2 sentence persona description (who they are, what they do, what they care about)
    - **percentage**: % of comment volume from this persona (should sum to 100 across all)
    - **triggers**: Array of 3-4 topics that activate this persona (e.g., ["MRR", "Launch", "Viral"])
    - **painPoints**: Array of 2-3 problems this persona faces (e.g., ["Churn", "Traffic"])

    Additionally, provide:
    - **insight**:
        - **title**: Strategic summary (e.g., "Shift to Advanced Content")
        - **description**: What the persona distribution reveals
        - **actionable**: Specific content strategy recommendation

    STRATEGIC INTENT: Use this to guide content strategy. If 60% are "Mid-Level Devs", stop posting "Hello World" tutorials.

19. **hypeValueScore**: Analyze "Hype" vs "Value" balance from ACTUAL post content. Sum = 100.

20. **ideaBank**: Generate 4-5 post ideas that fill gaps in their content strategy.

21. **postDNA**: Analyze the ACTUAL posts (use real content from above):
    - hookType: How the post opens
    - format: Detected content type
    - topic: Subject matter
    - verdict: Why it performed well/poorly based on REAL metrics

22. **tribes**: Identify 3-4 audience sub-cultures from comment patterns.

23. **shadowAudience**: Estimate lurker vs active commenter ratio using ACTUAL data.


    - positivePercent: 0-100
    - neutralPercent: 0-100
    - negativePercent: 0-100
    - dominantEmotion: e.g. "Inspiring", "Controversial", "Educational"
    - insight: Summary of how people feel

24. **crowdSentiment**: Deep vibe analysis of comment sections across all posts.
    CRITICAL: Categorize comments into 4 strategic "Vibes" based on INTENT and LANGUAGE PATTERNS:

    - **Fanboys** (Loyalty & Social Proof):
        - Detection: "amazing", "obsessed", "love this", "fire", "need this", emojis (🔥❤️), exclamation marks
        - Percentage: % of total comments
        - Count: Absolute number
        - Keywords: Array of 5-8 sample phrases from actual comments
        - Color: "#8b5cf6" (violet)
        - Description: "Social Proof & Loyalty"

    - **Seekers** (Unmet Demand / High Intent):
        - Detection: Questions about pricing, shipping, compatibility, how-to, availability
        - Example patterns: "price?", "does this work with X?", "how to install?", "where to buy?"
        - Percentage, Count, Keywords, Color: "#3b82f6" (blue)
        - Description: "Unmet Demand (High Intent)"

    - **Skeptics** (Trust Barriers):
        - Detection: Doubt, comparison to competitors, requests for proof/reviews
        - Example: "is this real?", "X is cheaper", "any reviews?", "looks too good to be true"
        - Percentage, Count, Keywords, Color: "#f59e0b" (amber)
        - Description: "Trust Barriers"

    - **Critics** (Vulnerabilities):
        - Detection: Complaints, bugs, service issues, negative experiences
        - Example: "broken", "slow", "bad support", "no response", "scam"
        - Percentage, Count, Keywords, Color: "#ef4444" (red)
        - Description: "Vulnerabilities"

    - **totalComments**: Sum of all comment counts across posts
    - **vibeScore**: 0-10 overall sentiment (weighted: Fanboys boost, Critics lower)
    - **sentimentTrend**: Array of 5 objects tracking vibeScore across last 5 posts
        - Format: [{ post: 1, score: 7.2 }, { post: 2, score: 8.1 }, ...]

    AI INSTRUCTION: Read ACTUAL comment text. Use language patterns, not just keywords. If <10 comments total, still categorize but note low confidence.

25. **questionCloud**: Strategic Question Intelligence – Extract keyword topics from questions/comments and classify by COMMERCIAL INTENT.

    CRITICAL: Return 10-15 KeywordNodes. Each represents a topic/theme.

    For EACH keyword:
    - **id**: Unique string (e.g., "kw_1")
    - **word**: Topic label (1-3 words, e.g., "Pricing", "Next.js", "Bug", "Shipping")
    - **count**: How many comments mention this topic
    - **engagement**: Average likes/reactions on comments mentioning this (0-100 normalized)
    - **intent**: Classify as:
        - **"Buying"** (GREEN): Price, payment, deals, refund, enterprise, purchasing questions
            - Examples: "lifetime deal?", "discount code?", "enterprise plan?", "money-back guarantee?"
        - **"Educational"** (BLUE): How-to, tutorials, feature questions, compatibility, integrations
            - Examples: "how to install?", "works with Shopify?", "tutorial?", "mobile support?"
        - **"Urgency"** (RED): Bugs, complaints, support requests, issues
            - Examples: "not working", "slow", "crash", "customer support?"

    - **sampleQuestions**: Array of 2-3 actual questions with:
        - text: The full question from a comment
        - likes: Number of likes on that comment

    AI INSTRUCTION:
    1. Read ALL comments across ALL posts
    2. Extract question-like phrases (sentences with "?", or requests)
    3. Cluster similar questions into themes/keywords
    4. For each keyword, identify intent, count mentions, sample top questions

    PRIORITIZATION: Focus on HIGH-ENGAGEMENT keywords (many mentions OR high likes).

26. **activeHours**: 24-hour activity analysis comparing Creator Posting Schedule vs. Audience Engagement Windows.

    CRITICAL: Return exactly 24 objects (one per hour, 0-23).

    For EACH hour (0 = midnight, 12 = noon, 23 = 11 PM):
    - **hour**: Integer 0-23
    - **creatorPosts**: Count of posts made during this hour (analyze post timestamps)
    - **audienceActivity**: 0-100 heatmap intensity based on:
        - Comment timestamps (when audience replies)
        - Like/reaction patterns if timestamps available
        - Estimation: If most comments arrive 22:00-02:00, those hours = 80-100

    AI LOGIC:
    1. Parse ALL post timestamps → Identify creator's posting hours
    2. Parse ALL comment timestamps → Identify audience response hours
    3. For each of 24 hours, calculate:
        - creatorPosts: How many posts were made in this hour?
        - audienceActivity: Normalized comment volume (0-100, where 100 = peak hour)

    STRATEGIC INSIGHT: The "Golden Window" is the hour with HIGHEST audienceActivity. If creator posts at low-activity hours, flag as "Misalignment Opportunity".

27. **leadMagnet**: Analyze the "Ethical Bribe" (Freebie) strategy from bio links/posts.
    - **type**: "Checklist" | "Webinar" | "Free Trial" | "Discovery Call" | "Other"
    - **title**: The exact name of the freebie (e.g. "SaaS Launch Checklist")
    - **hook**: The promise/benefit (e.g. "Get 100 users in 30 days")
    - **friction**: 
        - "Low" (Email only)
        - "Medium" (Name + Email)
        - "High" (Application/Phone required)
    - **temp**: 
        - "Cold" (Low commitment, e.g. PDF/Template)
        - "Warm" (Webinar/Video)
        - "Hot" (Call/Consultation)
    - **suggestion**: A strategic counter-offer (e.g. "They digest content; you should offer a 'Done-For-You' template")
    - **whyItWorks**: Why this hook is effective (brief analysis)

28. **ctaAnalysis**: Decode the "Ask" strategy.
    - **mix**: Analyze last 10-20 posts and categorize the "Ask" type (return 4 objects):
        - { type: "Engagement", score: 0-100, fullMark: 100 } (e.g. "Tag a friend", "Save this")
        - { type: "Bridge", score: 0-100, fullMark: 100 } (e.g. "Link in bio", "Check my story")
        - { type: "Conversion", score: 0-100, fullMark: 100 } (e.g. "Buy now", "Sign up", "DM me 'CLIENT'")
        - { type: "Conversation", score: 0-100, fullMark: 100 } (e.g. "Thoughts?", "Agree?")
    - **topTrigger**: The most frequent automation keyword used
        - { keyword: "GROWTH", count: 12 }
    - **urgencyScore**: 0-100 (High if they use "Limited time", "Expires soon", "Only 3 spots")
    - **dominantStyle**:
        - "Hunter-Killer" (Aggressive sales, high Urgency/Conversion)
        - "Reach Hunter" (Viral focus, high Engagement/Conversation)
        - "Community Builder" (Balanced, high Conversation/Bridge)
    - **placementHeatmap**: Where do they put the CTA? (Count occurrences)
        - [{ location: "First Line", count: 2 }, { location: "Bottom", count: 15 }, { location: "P.S.", count: 5 }]

29. **techStack**: X-Ray their infrastructure to determine "Business Class".
    - **tools**: Infer tools from content/links (return 3-5 detected tools):
        - { category: "Hosting", name: "Vercel", confidence: "High" }
        - { category: "Marketing", name: "Hypefury", confidence: "Medium" }
        - { category: "Payment", name: "Stripe", confidence: "High" }
    - **businessClass**:
        - "Hobbyist" (Linktree, Gumroad, Substack)
        - "Pro Creator" (Kajabi, Beehiiv, Circle)
        - "SaaS / Agency" (Custom Next.js, Framer, High-end tracking)
        - "Enterprise" (HubSpot, Salesforce, Marketo)
    - **verdict**: A 1-sentence analysis of their sophistication (e.g. "They are running a Pro setup with low overhead.")

30. **valueLadder**: Map their Revenue Ecosystem (Products/Services).
    - **products**: Identify up to 4 distinct offers from bio links/posts:
        - **"Bait"** (Free): Lead magnets, newsletters, free templates.
        - **"Tripwire"** (Low Ticket <$50): E-books, workshops, paid templates.
        - **"Core"** (Mid Ticket $50-$500): Courses, cohorts, memberships.
        - **"High-Ticket"** ($500+): Coaching, consulting, done-for-you services.
    - Return object keys: "Bait", "Tripwire", "Core", "High-Ticket".
    - For each found product:
        - { name: "SaaS Kit", price: "$29", type: "Template", intensity: "Low" }
    - **gap**: Identify the missing rung (e.g. "Missing Tripwire").
    - **insight**: Strategic advice on how to fill the gap (e.g. "They jump from Free to $500. Offer a $47 workshop to capture the middle.").

31. **growthTasks**: Synthesize a "Growth Battle Plan" (5-7 actionable tasks).
    - Base tasks on gaps found in Zones 1-4 (e.g., if "Missing Tripwire", suggest "Create $27 Template").
    - **category**:
        - "Quick Win" (High Impact, Low Effort)
        - "Big Bet" (High Impact, High Effort)
        - "Filler" (Low Impact, Low Effort - avoid suggesting these unless necessary)
        - "Money Pit" (Low Impact, High Effort - usually something to avoid, but maybe fixable)
    - **impact**: 1-10 score (10 = Viral/Revenue spike).
    - **effort**: 1-10 score (10 = Weeks of work).
    - **type**: "Funnel" (Revenue), "Content" (Reach), "Crowd" (Engagement).
    - **actionType**: "Bio", "Content", "Strategy", "Tech".
    - **reasoning**: One sentence on WHY this is high priority (e.g. "Captures lost leads from bio.").
    - Return a list of objects.

32. **disruptor**: Create a "7-Day Content Disruptor" plan to counter their strategy.
    - **score**: 0-100 "Disruptor Score" (how easy they are to outshine).
    - **focus**: One phrase summary (e.g. "Empathetic Storytelling").
    - **schedule**: Array of 7 days (Mon-Sun).
      - **day**: "Monday", etc.
      - **time**: Best time to post (e.g. "08:00 AM").
      - **pillar**: Content category (e.g. "Authority").
      - **topic**: Specific topic idea.
      - **hookStyle**: "Empathetic", "Controversial", "Story-driven", "Data-backed".
      - **suggestedHook**: Specific first line.
      - **strategicReason**: Why this works against the competitor (e.g. "They post boring tips on Mon, you post a hot take.").

33. **funnelTactics**: Identify 3 specific revenue leaks in their funnel (Zone 4) and suggest fixes.
    - **title**: Short tactic name (e.g. "Add Tripwire").
    - **problem**: What they are doing wrong (e.g. "Linktree has too many options").
    - **solution**: The specific fix (e.g. "Replace with dedicated landing page").
    - **impact**: Exp. Impact (e.g. "+20% Click-through").
    - **difficulty**: "Easy", "Medium", "Hard".
    - **status**: Always "Pending".

34. **crowdTactics**: Identify 3 specific ways to hijack their audience (Zone 3) based on sentiment.
    - **title**: Short tactic name (e.g. "Vibe Matching").
    - **audienceState**: "Skeptical", "Frustrated", "Engaged".
    - **action**: Specific action to take (e.g. "Reply to top 5 comments with case study").
    - **targetParams**: Why this works (e.g. "Builds Trust").
    - **status**: Always "Ready".

35. **pulseHeartbeat**: 7-day activity ECG for the Pulse Overview.
    - Return exactly 7 objects (Mon-Sun).
    - day: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    - activityScore: 0-100 (100 = most active day based on post count + engagement)
    - postsCount: Number of posts on that day
    - peakHour: The hour with most engagement on that day (e.g. "9 AM")
    - trend: "Rising" (engagement up vs prev week), "Flat", or "Dropping"

36. **engagementVitals**: Medical-style engagement vitals for the Pulse Overview.
    - engagementRate: Actual average engagement rate % from the scraped data.
    - benchmarkRate: Platform average engagement rate % (use PLATFORM_BENCHMARKS).
    - reachEfficiency: 0-100 score (how well posts reach beyond followers).
    - interactionRatio: Avg likes ÷ avg comments (e.g. 15.3).
    - status: "Healthy" if engagementRate > benchmarkRate, "Warning" if within 50%, "Critical" if below 50%.
    - insight: One sentence explaining the most important engagement finding.

37. **audienceTemperature**: Audience heat level for the Pulse Overview.
    - tempScore: 0-100. Formula: (fanboyPercent * 1.0) + (seekerPercent * 0.5) - (criticPercent * 1.5). Clamp 0-100.
    - label: "Ice Cold" (0-20), "Cold" (21-40), "Warm" (41-60), "Hot" (61-80), "On Fire" (81-100).
    - fanboyPercent: % from crowdSentiment.vibes where type="Fanboys".
    - criticPercent: % from crowdSentiment.vibes where type="Critics".
    - dominantEmotion: The single most common emotion in comments (e.g. "Inspired", "Curious", "Frustrated").
    - recommendation: One sentence on how to raise the temperature.

38. **growthTrajectory**: Growth trend for the Pulse Overview.
    - direction: "Up" if engagement is trending up, "Flat" if stable, "Down" if declining.
    - changePercent: % change in avg engagement from first half to second half of scraped posts.
    - forecast: One sentence prediction (e.g. "On track for +12% follower growth in 30 days").
    - sparkline: 4 weekly data points (week 1-4) with a score 0-100 representing engagement health.

Strictly follow the JSON schema. Base everything on the REAL scraped data provided.
  `.trim();
}

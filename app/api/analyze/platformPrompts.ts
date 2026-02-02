// Platform-specific prompts and benchmarks for AI analysis

export type Platform =
  | "linkedin"
  | "facebook"
  | "twitter"
  | "instagram"
  | "pinterest";

// Industry benchmarks per platform
export const PLATFORM_BENCHMARKS: Record<
  Platform,
  {
    avgFollowers: { low: number; medium: number; high: number };
    avgEngagement: { low: number; medium: number; high: number };
    optimalPostFrequency: string;
    peakHours: string[];
    contentTypes: string[];
    keyMetrics: string[];
  }
> = {
  linkedin: {
    avgFollowers: { low: 500, medium: 5000, high: 25000 },
    avgEngagement: { low: 1.5, medium: 3.5, high: 6 },
    optimalPostFrequency: "3-5 posts per week",
    peakHours: ["8-9 AM", "12 PM", "5-6 PM"],
    contentTypes: [
      "Thought leadership",
      "Industry insights",
      "Career advice",
      "Company updates",
    ],
    keyMetrics: [
      "Profile views",
      "Post impressions",
      "Connection growth",
      "SSI score",
    ],
  },
  facebook: {
    avgFollowers: { low: 1000, medium: 10000, high: 100000 },
    avgEngagement: { low: 0.5, medium: 1.5, high: 3 },
    optimalPostFrequency: "1-2 posts per day",
    peakHours: ["1-3 PM", "6-9 PM"],
    contentTypes: ["Videos", "Live streams", "Stories", "Community posts"],
    keyMetrics: ["Page likes", "Reach", "Engagement rate", "Video views"],
  },
  twitter: {
    avgFollowers: { low: 1000, medium: 10000, high: 50000 },
    avgEngagement: { low: 0.5, medium: 1.5, high: 3 },
    optimalPostFrequency: "3-5 tweets per day",
    peakHours: ["9 AM", "12 PM", "3 PM", "6 PM"],
    contentTypes: ["Threads", "Quotes", "Polls", "Media tweets"],
    keyMetrics: ["Impressions", "Engagement rate", "Retweets", "Link clicks"],
  },
  instagram: {
    avgFollowers: { low: 1000, medium: 10000, high: 100000 },
    avgEngagement: { low: 1, medium: 3, high: 6 },
    optimalPostFrequency: "1-2 posts per day + 5-10 stories",
    peakHours: ["11 AM", "2 PM", "7-9 PM"],
    contentTypes: ["Reels", "Carousels", "Stories", "Lives"],
    keyMetrics: ["Reach", "Saves", "Shares", "Story views"],
  },
  pinterest: {
    avgFollowers: { low: 500, medium: 5000, high: 50000 },
    avgEngagement: { low: 0.5, medium: 2, high: 5 },
    optimalPostFrequency: "10-25 pins per day",
    peakHours: ["8-11 PM", "2-4 AM (for global)"],
    contentTypes: ["Idea Pins", "Product Pins", "Rich Pins", "Video Pins"],
    keyMetrics: ["Monthly views", "Saves", "Outbound clicks", "Pin clicks"],
  },
};

// Platform-specific analysis prompts
export function getPlatformPrompt(
  platform: Platform,
  profileData: string,
): string {
  const benchmarks = PLATFORM_BENCHMARKS[platform];

  const basePrompt = `
You are an expert ${getPlatformName(platform)} marketing strategist.
Analyze this ${getPlatformName(platform)} profile data and provide actionable insights.

PROFILE DATA:
---
${profileData}
---

PLATFORM CONTEXT:
- Optimal posting frequency: ${benchmarks.optimalPostFrequency}
- Peak engagement hours: ${benchmarks.peakHours.join(", ")}
- Top content types: ${benchmarks.contentTypes.join(", ")}
- Key metrics to track: ${benchmarks.keyMetrics.join(", ")}

BENCHMARKS:
- Low performer: ~${benchmarks.avgFollowers.low.toLocaleString()} followers, ${benchmarks.avgEngagement.low}% engagement
- Average performer: ~${benchmarks.avgFollowers.medium.toLocaleString()} followers, ${benchmarks.avgEngagement.medium}% engagement  
- Top performer: ${benchmarks.avgFollowers.high.toLocaleString()}+ followers, ${benchmarks.avgEngagement.high}%+ engagement
`;

  // Add platform-specific instructions
  const platformInstructions = getPlatformInstructions(platform);

  return (
    basePrompt +
    platformInstructions +
    `

Generate the analysis strictly following the JSON schema provided.
If data is incomplete, make educated inferences based on available information.
Focus on ${getPlatformName(platform)}-specific best practices and opportunities.
`
  );
}

function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    linkedin: "LinkedIn",
    facebook: "Facebook",
    twitter: "X (Twitter)",
    instagram: "Instagram",
    pinterest: "Pinterest",
  };
  return names[platform];
}

function getPlatformInstructions(platform: Platform): string {
  switch (platform) {
    case "linkedin":
      return `
LINKEDIN-SPECIFIC ANALYSIS:
1. Headline Optimization: Does it clearly state value proposition? Uses keywords?
2. About Section: Compelling narrative? Call-to-action? Keyword-rich?
3. Featured Section: Showcasing best work? Portfolio items?
4. Experience: Results-focused? Quantified achievements?
5. Content Strategy: Thought leadership? Industry insights? Engagement patterns?
6. Network Quality: SSI score indicators? Connection strategy?
7. Recommendations: Social proof strength?

LINKEDIN KEYWORDS TO LOOK FOR:
- Role-specific terms (e.g., "Product Manager", "Full-Stack Developer")
- Industry buzzwords (e.g., "AI/ML", "SaaS", "Growth")
- Skill keywords (e.g., "Leadership", "Strategy", "Analytics")
`;

    case "facebook":
      return `
FACEBOOK-SPECIFIC ANALYSIS:
1. Page Optimization: Complete info? Clear CTA button?
2. Visual Branding: Profile/cover photos on-brand? Consistent aesthetic?
3. Content Mix: Video vs. image vs. text ratio?
4. Community Engagement: Response rate? Comment interaction?
5. Groups Strategy: Owned groups? Community building?
6. Ads/Boosted Content: Evidence of promotion strategy?
7. Reviews/Recommendations: Social proof signals?

FACEBOOK GROWTH OPPORTUNITIES:
- Video content (especially Reels and Lives)
- Community building through Groups
- Messenger integration for customer service
`;

    case "twitter":
      return `
X (TWITTER)-SPECIFIC ANALYSIS:
1. Bio Optimization: Clear value prop in 160 chars? CTA/link?
2. Pinned Tweet: Strong introduction? Recent or relevant?
3. Thread Strategy: Long-form content? Educational threads?
4. Engagement Pattern: Reply frequency? Quote tweet usage?
5. Visual Content: Media tweets? Infographics?
6. Hashtag Strategy: Relevant? Not overused?
7. Voice & Personality: Consistent tone? Authentic?

X GROWTH TACTICS:
- Consistent posting schedule (3-5x daily)
- Engaging with larger accounts in niche
- Thread creation for viral potential
- Spaces hosting for community building
`;

    case "instagram":
      return `
INSTAGRAM-SPECIFIC ANALYSIS:
1. Bio Optimization: Clear niche? CTA? Link in bio strategy?
2. Visual Aesthetic: Consistent grid? Brand colors? Quality?
3. Reels Strategy: Using trending sounds? Hook in first 3s?
4. Story Engagement: Interactive stickers? Polls? Q&A?
5. Carousel Usage: Educational content? Swipe-worthy?
6. Caption Strategy: Hook + value + CTA? Optimal length?
7. Hashtag Strategy: Mix of sizes? Niche-specific?

INSTAGRAM GROWTH OPPORTUNITIES:
- Reels for reach (algorithm priority)
- Collaborations and tagged content
- Story highlights as evergreen content
- User-generated content reposts
`;

    case "pinterest":
      return `
PINTEREST-SPECIFIC ANALYSIS:
1. Profile Optimization: Clear niche? Business account? Claimed website?
2. Board Strategy: Organized? SEO-friendly titles? Cover images?
3. Pin Quality: Vertical format? Text overlays? Rich Pins?
4. Idea Pins: Using video? Multi-page content?
5. SEO Strategy: Keyword-rich descriptions? Alt text?
6. Pinning Consistency: Regular schedule? Fresh content ratio?
7. Analytics Usage: Understanding what performs?

PINTEREST GROWTH TACTICS:
- Vertical pins (2:3 aspect ratio)
- Keyword-rich descriptions (first 50 chars crucial)
- Consistent pinning (10-25 pins/day)
- Idea Pins for engagement
- Rich Pins for e-commerce/blog
`;

    default:
      return "";
  }
}

// Comparison prompt for two profiles
export function getComparisonPrompt(
  platform: Platform,
  yourProfile: string,
  competitorProfile: string,
): string {
  const benchmarks = PLATFORM_BENCHMARKS[platform];

  return `
You are an expert ${getPlatformName(platform)} competitive analyst.
Compare these two ${getPlatformName(platform)} profiles and provide strategic insights.

YOUR PROFILE:
---
${yourProfile}
---

COMPETITOR PROFILE:
---
${competitorProfile}
---

PLATFORM BENCHMARKS:
- Top performer: ${benchmarks.avgFollowers.high.toLocaleString()}+ followers, ${benchmarks.avgEngagement.high}%+ engagement
- Optimal posting: ${benchmarks.optimalPostFrequency}
- Key content types: ${benchmarks.contentTypes.join(", ")}

ANALYSIS REQUIREMENTS:
1. Overview: Side-by-side metrics comparison
2. Content Strategy: What content types does competitor use that you don't?
3. Engagement: How does competitor drive more engagement?
4. Growth Tactics: What specific tactics is competitor using?
5. Gaps to Exploit: Where is competitor weak that you can capitalize?
6. Action Plan: Top 5 specific actions to outperform competitor

Be specific with numbers and actionable recommendations.
Focus on ${getPlatformName(platform)}-specific strategies.
Generate the analysis strictly following the JSON schema provided.
`;
}

// Platform-specific quick wins
export function getQuickWins(platform: Platform): string[] {
  const wins: Record<Platform, string[]> = {
    linkedin: [
      "Add Keywords to Headline",
      "Update Featured Section",
      "Request 3 Recommendations",
      "Enable Creator Mode",
      "Optimize About Section with CTA",
    ],
    facebook: [
      "Complete Page Info 100%",
      "Add CTA Button",
      "Pin Best-Performing Post",
      "Respond to All Reviews",
      "Create Welcome Post for New Followers",
    ],
    twitter: [
      "Optimize Bio with Keywords",
      "Pin Your Best Thread",
      "Add Website Link",
      "Create a Spaces Schedule",
      "Engage with 10 Posts Daily",
    ],
    instagram: [
      "Optimize Bio with CTA",
      "Create Story Highlights",
      "Post First Reel",
      "Use 3-5 Niche Hashtags",
      "Add Link in Bio Tool",
    ],
    pinterest: [
      "Convert to Business Account",
      "Claim Your Website",
      "Create 10 Organized Boards",
      "Enable Rich Pins",
      "Add Keywords to Board Titles",
    ],
  };
  return wins[platform] || [];
}

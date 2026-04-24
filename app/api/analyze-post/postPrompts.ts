export const buildPostPrompt = (postData: any) => {
  const { author, content, platform, metrics, comments } = postData;

  const formattedComments =
    comments && comments.length > 0
      ? comments
          .slice(0, 15)
          .map(
            (c: any) =>
              `- ${c.user}: "${c.text}" (Likes: ${c.engagement?.likes || 0})`,
          )
          .join("\n")
      : "No comments available.";

  return `
You are a world-class Social Media Strategist, Copywriter, and Data Analyst.
Analyze the following social media post from ${platform} by the author '${author}'.

POST CONTENT:
"""
${content}
"""

ENGAGEMENT METRICS:
- Likes: ${metrics?.likes || 0}
- Replies/Comments: ${metrics?.replies || 0}
- Reposts/Retweets: ${metrics?.retweets || 0}
- Views: ${metrics?.views || 0}

TOP COMMENTS (up to 15):
"""
${formattedComments}
"""

INSTRUCTIONS:
Conduct a deep-dive forensic analysis of this post to reverse-engineer why it worked (or didn't) and identify actionable growth gaps. 
Extract the underlying psychological triggers, content structure, visual strategy, and audience sentiment.

Generate the output strictly following the JSON schema provided.

Additional Guidelines:
- "hookCTA": Deconstruct the core hook structure. Identify the psychological trigger (e.g., Curiosity Gap, Negativity Bias, Social Proof) and provide alternative pivots (Option A, B, C) that the user could use to recreate this effect.
  
  For EACH pivot option (A, B, C), also predict the expected engagement type:
  - pivotAEngagement, pivotBEngagement, pivotCEngagement should each be one of:
    * "High Comments" - if the pivot encourages discussion/debate
    * "High Shares" - if the pivot is shareable/viral
    * "High Likes" - if the pivot resonates emotionally
    * "Balanced" - if engagement is expected across all metrics
  
  Example:
  - pivotA: "Here's the mistake 90% of founders make with cold emails"
  - pivotAEngagement: "High Comments" (invites disagreement/discussion)
  - pivotB: "I analyzed 10,000 cold emails. Here's what works:"
  - pivotBEngagement: "High Shares" (data-backed insights are shareable)
  - pivotC: "Stop sending cold emails like this (before it's too late)"
  - pivotCEngagement: "High Likes" (urgency + relatability)
- "retention": Break the post down segment by segment. Assign retention probabilities (high, medium, low) to each sentence/block. Provide 3 "seed comments" (Engagement Hijacks) the user could drop on this post to siphon traffic.
- "leadPersona": Identify the types of users interacting with this post. Break down the engagement into 3 personas with percentages. Highlight 2 "High-Intent Targets" based on the comments provided. Estimate the ICP alignment score.
- "commentGap": Analyze the comments strictly to find pain points, gaps (Pricing, Technical, Alternative tools), and frequent questions. Suggest content strategies to address these. Highlight one "Confusion Point" if any exists.
- "visualStrategy": Determine the visual aesthetic required to match this type of post. Suggest a "category" and "colors", and provide Midjourney and DALL-E prompts to recreate a suitable image for this post.
- "viralVelocity": Estimate the viral velocity based on engagement. (e.g. 145 Likes/hr). Set a trend ("Trending High", "Stable", "Decaying") and peak time.
- "sentiment": Analyze the emotional landscape of the comments. Provide an exact breakdown of positive/constructive/neutral/negative percentages. Pick a dominant emotion and note if the post is controversial.
- "competitor": Benchmark this post against typical niche averages using these MANDATORY calculations:
  
  **benchmarkData.engagementRate**: CRITICAL - Calculate using the EXACT metrics provided above:
    Formula: ((Likes + Replies + Reposts) / Views) × 100
    Example: If Likes=89, Replies=37, Reposts=3, Views=3355, then:
      totalEngagements = 89 + 37 + 3 = 129
      engagementRate = (129 / 3355) × 100 = 3.84
      CORRECT value: 3.84
      WRONG value: 0.01 or any other incorrect calculation
    Return this as a NUMBER (e.g., 3.84, NOT "3.84%")
  
  **benchmarkData.accountAvg**: Estimate the author's typical engagement rate based on platform and follower signals (usually 1-5% for most accounts)
  
  **benchmarkData.nicheAvg**: Use platform-specific niche averages:
    - Twitter/X: ~2-3%
    - LinkedIn: ~3-5%
    - Instagram: ~1-3%
    - Facebook: ~1-2%
  
  **benchmarkData.isOutlier**: true if engagementRate > (accountAvg × 2), false otherwise
  
  **benchmarkData.botSignal**: "Low" unless comments contain obvious bot patterns (spam, repetitive phrases, nonsense)
  
  **benchmarkData.followers**: Format follower count estimate (e.g., "12.5K")

Ensure the response is raw JSON ONLY. No markdown formatting.
`;
};

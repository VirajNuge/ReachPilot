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
- "retention": Break the post down segment by segment. Assign retention probabilities (high, medium, low) to each sentence/block. Provide 3 "seed comments" (Engagement Hijacks) the user could drop on this post to siphon traffic.
- "leadPersona": Identify the types of users interacting with this post. Break down the engagement into 3 personas with percentages. Highlight 2 "High-Intent Targets" based on the comments provided. Estimate the ICP alignment score.
- "commentGap": Analyze the comments strictly to find pain points, gaps (Pricing, Technical, Alternative tools), and frequent questions. Suggest content strategies to address these. Highlight one "Confusion Point" if any exists.
- "visualStrategy": Determine the visual aesthetic required to match this type of post. Suggest a "category" and "colors", and provide Midjourney and DALL-E prompts to recreate a suitable image for this post.
- "viralVelocity": Estimate the viral velocity based on engagement. (e.g. 145 Likes/hr). Set a trend ("Trending High", "Stable", "Decaying") and peak time.
- "sentiment": Analyze the emotional landscape of the comments. Provide an exact breakdown of positive/constructive/neutral/negative percentages. Pick a dominant emotion and note if the post is controversial.
- "competitor": Benchmark this post against typical niche averages. Is it an outlier? Is there a bot signal? (Usually "Low" unless comments look spammy).

Ensure the response is raw JSON ONLY. No markdown formatting.
`;
};

interface ExtensionPost {
  author: string;
  content: string;
  postUrl: string;
  postedAt: string;
  metrics: {
    likes: number;
    replies: number;
    retweets: number;
    views: number;
  };
  commentCount: number;
  comments: Array<{
    user: string;
    text: string;
    timestamp: string;
    engagement: {
      likes: number;
      replies: number;
      retweets: number;
    };
  }>;
  images: string[];
  videos: string[];
  platform: string;
}

export function formatExtensionData(posts: ExtensionPost[]): string {
  // Aggregate metrics
  const totalLikes = posts.reduce((sum, p) => sum + p.metrics.likes, 0);
  const totalReplies = posts.reduce((sum, p) => sum + p.metrics.replies, 0);
  const totalRetweets = posts.reduce((sum, p) => sum + p.metrics.retweets, 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.metrics.views || 0), 0);
  const totalCommentScraped = posts.reduce(
    (sum, p) => sum + p.comments.length,
    0,
  );

  // Engagement rate = (likes + replies + retweets) / views
  const totalInteractions = totalLikes + totalReplies + totalRetweets;
  const avgEngagement =
    totalViews > 0
      ? ((totalInteractions / totalViews) * 100).toFixed(2)
      : "N/A (no view data)";

  // Posting frequency
  const dates = posts.map(
    (p) => new Date(p.postedAt).toISOString().split("T")[0],
  );
  const uniqueDays = new Set(dates).size;
  const avgPerDay = (posts.length / Math.max(uniqueDays, 1)).toFixed(1);

  // Per-post summaries
  const postSummaries = posts.map((post, i) => {
    const interactions =
      post.metrics.likes + post.metrics.replies + post.metrics.retweets;
    const engRate =
      post.metrics.views > 0
        ? ((interactions / post.metrics.views) * 100).toFixed(2) + "%"
        : "N/A";

    const topComments = post.comments
      .slice(0, 3)
      .map(
        (c) =>
          `  • "${c.text.substring(0, 70)}..." - ${c.user} (${c.engagement.likes} ❤️)`,
      )
      .join("\n");

    return `
POST ${i + 1}:
Content: "${post.content.substring(0, 200)}..."
URL: ${post.postUrl}
Posted: ${new Date(post.postedAt).toLocaleString()}
Metrics: ${post.metrics.likes} likes, ${post.metrics.replies} replies, ${post.metrics.retweets} retweets, ${post.metrics.views} views (${engRate} engagement)
Media: ${post.images.length} images, ${post.videos.length} videos
Comments (${post.commentCount}):
${topComments || "  (none)"}
    `.trim();
  });

  return `
PROFILE OVERVIEW:
Author: ${posts[0]?.author || "Unknown"}
Platform: ${posts[0]?.platform?.toUpperCase() || "UNKNOWN"}
Posts Analyzed: ${posts.length}
Date Range: ${dates[0]} to ${dates[dates.length - 1]}
Posting Frequency: ${avgPerDay} posts/day

ENGAGEMENT TOTALS:
Total Likes: ${totalLikes}
Total Replies: ${totalReplies}
Total Retweets/Shares: ${totalRetweets}
Total Views: ${totalViews}
Total Comments Scraped: ${totalCommentScraped}
Average Engagement Rate: ${avgEngagement}

DETAILED POST BREAKDOWN:
${postSummaries.join("\n\n")}
  `.trim();
}

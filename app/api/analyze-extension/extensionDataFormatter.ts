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

// Detect content type from media attachments
function getContentType(post: ExtensionPost): string {
  if (post.videos.length > 0 && post.images.length > 0) return "Mixed Media";
  if (post.videos.length > 0) return "Video";
  if (post.images.length > 1) return "Carousel";
  if (post.images.length === 1) return "Image";
  return "Text";
}

export function formatExtensionData(posts: ExtensionPost[]): string {
  // --- Aggregate metrics ---
  const totalLikes = posts.reduce((sum, p) => sum + p.metrics.likes, 0);
  const totalReplies = posts.reduce((sum, p) => sum + p.metrics.replies, 0);
  const totalRetweets = posts.reduce((sum, p) => sum + p.metrics.retweets, 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.metrics.views || 0), 0);
  const totalCommentScraped = posts.reduce(
    (sum, p) => sum + p.comments.length,
    0,
  );

  const totalInteractions = totalLikes + totalReplies + totalRetweets;
  const avgEngagement =
    totalViews > 0
      ? ((totalInteractions / totalViews) * 100).toFixed(2)
      : "N/A (no view data)";

  // --- Posting frequency & date analysis ---
  const parsedDates = posts.map((p) => new Date(p.postedAt));
  const dates = parsedDates.map((d) => d.toISOString().split("T")[0]);
  const uniqueDays = new Set(dates).size;
  const avgPerDay = (posts.length / Math.max(uniqueDays, 1)).toFixed(1);

  // --- Posting time analysis (for schedule/activeHours) ---
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const postingTimes = parsedDates
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => `${dayNames[d.getDay()]} ${d.getHours()}:00`);

  const hourCounts: Record<number, number> = {};
  parsedDates.forEach((d) => {
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  });
  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => `${h}:00`);

  // --- Content type mix ---
  const typeCounts: Record<string, number> = {};
  posts.forEach((p) => {
    const t = getContentType(p);
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const contentMix = Object.entries(typeCounts)
    .map(
      ([type, count]) =>
        `${type}: ${count} (${((count / posts.length) * 100).toFixed(0)}%)`,
    )
    .join(", ");

  // --- Engagement trend (oldest → newest) ---
  const engagementTrend = posts
    .map((p, i) => {
      const interactions =
        p.metrics.likes + p.metrics.replies + p.metrics.retweets;
      const rate =
        p.metrics.views > 0
          ? ((interactions / p.metrics.views) * 100).toFixed(1) + "%"
          : `${interactions} interactions`;
      return `Post ${i + 1}: ${rate}`;
    })
    .join(" → ");

  // --- Commenter analysis ---
  const allCommenters = posts.flatMap((p) => p.comments.map((c) => c.user));
  const uniqueCommenters = new Set(allCommenters).size;
  const commenterFreq: Record<string, number> = {};
  allCommenters.forEach((u) => {
    commenterFreq[u] = (commenterFreq[u] || 0) + 1;
  });
  const topCommenters = Object.entries(commenterFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([user, count]) => `${user} (${count}x)`)
    .join(", ");

  // --- Per-post summaries ---
  const postSummaries = posts.map((post, i) => {
    const interactions =
      post.metrics.likes + post.metrics.replies + post.metrics.retweets;
    const engRate =
      post.metrics.views > 0
        ? ((interactions / post.metrics.views) * 100).toFixed(2) + "%"
        : "N/A";

    const contentType = getContentType(post);
    const postDate = new Date(post.postedAt);
    const dayOfWeek = !isNaN(postDate.getTime())
      ? dayNames[postDate.getDay()]
      : "Unknown";
    const hourPosted = !isNaN(postDate.getTime())
      ? `${postDate.getHours()}:00`
      : "Unknown";

    const topComments = post.comments
      .slice(0, 5)
      .map(
        (c) =>
          `  • "${c.text.substring(0, 200)}" — ${c.user} (${c.engagement.likes} ❤️)`,
      )
      .join("\n");

    return `
POST ${i + 1}:
Content: "${post.content.substring(0, 500)}"
URL: ${post.postUrl}
Posted: ${!isNaN(postDate.getTime()) ? postDate.toLocaleString() : post.postedAt} (${dayOfWeek} at ${hourPosted})
Content Type: ${contentType}
Metrics: ${post.metrics.likes} likes, ${post.metrics.replies} replies, ${post.metrics.retweets} retweets, ${post.metrics.views} views (${engRate} engagement)
Media: ${post.images.length} images, ${post.videos.length} videos
Comments (${post.commentCount} total, ${post.comments.length} scraped):
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
Profile Bio/Headline: (Infer from content patterns below)

CONTENT MIX:
${contentMix}

POSTING SCHEDULE:
Times Posted: ${postingTimes.join(", ")}
Peak Hours: ${peakHours.join(", ")}

ENGAGEMENT TOTALS:
Total Likes: ${totalLikes}
Total Replies: ${totalReplies}
Total Retweets/Shares: ${totalRetweets}
Total Views: ${totalViews}
Total Comments Scraped: ${totalCommentScraped}
Average Engagement Rate: ${avgEngagement}

ENGAGEMENT TREND (oldest → newest):
${engagementTrend}

AUDIENCE SIGNALS:
Unique Commenters: ${uniqueCommenters}
Total Comments: ${totalCommentScraped}
Avg Comments Per Post: ${(totalCommentScraped / posts.length).toFixed(1)}
Top Commenters: ${topCommenters || "(none)"}

DETAILED POST BREAKDOWN:
${postSummaries.join("\n\n")}
  `.trim();
}

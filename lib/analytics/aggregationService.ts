/**
 * Aggregation Service
 * 
 * Aggregates normalized data to create analytics summaries.
 * Handles:
 * - Temporal aggregations (daily, weekly, monthly trends)
 * - Platform aggregations
 * - Format analysis
 * - Top performer identification
 */

import {
  getPostsByAccount,
  getTopPostsByEngagement,
  getMetricsForAccount,
  getPostCountByFormat,
  getAverageEngagementByFormat,
  getPostsByDateRange,
  getMetricsForPlatform,
} from "@/lib/models/persistedTypes";

import {
  normalizePost,
  normalizeMetrics,
  calculateAggregateMetrics,
  normalizeCrossPlatformMetrics,
  enrichPostData,
  type NormalizedPost,
  type NormalizedMetrics,
  type AggregateMetrics,
} from "./dataNormalizer";

import type { Platform } from "@/lib/models/persistedTypes";

/**
 * Analytics summary for dashboard
 */
export interface AnalyticsSummary {
  dateRange: {
    start: Date;
    end: Date;
  };
  aggregate: AggregateMetrics;
  topPosts: NormalizedPost[];
  topPostsByPlatform: Record<Platform, NormalizedPost[]>;
  formatAnalysis: FormatPerformance[];
  platformComparison: PlatformMetrics[];
  trends: TrendData[];
  health: AccountHealth;
}

/**
 * Format performance metrics
 */
export interface FormatPerformance {
  format: string;
  count: number;
  avgEngagementRate: number;
  avgComments: number;
  avgLikes: number;
  avgShares: number;
  recommendation: string;
}

/**
 * Platform comparison metrics
 */
export interface PlatformMetrics extends NormalizedMetrics {
  platform: string;
  rank: number;
  growth: {
    followers: number;
    engagements: number;
    impressions: number;
  };
}

/**
 * Trend data point
 */
export interface TrendData {
  date: Date;
  platform: string;
  followers: number;
  impressions: number;
  engagements: number;
  engagementRate: number;
}

/**
 * Account health score
 */
export interface AccountHealth {
  score: number; // 0-100
  status: "excellent" | "good" | "fair" | "poor";
  insights: string[];
  recommendations: string[];
}

/**
 * Get analytics summary for account
 */
export async function getAnalyticsSummary(
  userId: string,
  accountId: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Fetch all data
  const [posts, metrics, formatStats] = await Promise.all([
    getPostsByDateRange(userId, accountId, startDate, endDate),
    getMetricsForAccount(userId, accountId, startDate, endDate),
    getPostCountByFormat(userId, accountId),
  ]);

  // Normalize data
  const normalizedPosts = posts.map(normalizePost);
  const normalizedMetrics = metrics.map(normalizeMetrics);
  const metricsByPlatform = normalizeCrossPlatformMetrics(
    metrics.filter((m) => m.date >= startDate && m.date <= endDate)
  );

  // Calculate aggregates
  const aggregate = calculateAggregateMetrics(metricsByPlatform);

  // Get top posts
  const topPosts = await getTopPostsByEngagement(
    userId,
    accountId,
    5,
    startDate,
    endDate
  );

  // Get top posts per platform
  const topPostsByPlatform: Record<Platform, NormalizedPost[]> = {} as any;
  for (const platform of [
    "linkedin",
    "facebook",
    "instagram",
    "x",
    "pinterest",
    "threads",
  ] as Platform[]) {
    const platformPosts = await getTopPostsByEngagement(userId, accountId, 3);
    topPostsByPlatform[platform] = platformPosts
      .filter((p) => p.platform === platform)
      .map(normalizePost);
  }

  // Format analysis
  const avgEngagement = await getAverageEngagementByFormat(
    userId,
    accountId
  );
  const formatAnalysis: FormatPerformance[] = avgEngagement.map((stat) => ({
    format: stat.format,
    count: stat.postCount,
    avgEngagementRate: stat.avgEngagementRate,
    avgComments: stat.avgComments,
    avgLikes: stat.avgLikes,
    avgShares: stat.avgShares,
    recommendation: getFormatRecommendation(
      stat.format,
      stat.avgEngagementRate,
      aggregate.overallEngagementRate
    ),
  }));

  // Platform comparison
  const platformComparison: PlatformMetrics[] = Array.from(
    metricsByPlatform.entries()
  )
    .map(([platform, metrics], rank) => ({
      ...metrics,
      platform,
      rank: rank + 1,
      growth: {
        followers: metrics.followerGrowth,
        engagements: metrics.engagementGrowth,
        impressions: metrics.impressionGrowth,
      },
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // Trends
  const trends = normalizedMetrics
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((m) => ({
      date: m.date,
      platform: m.platform,
      followers: m.followers,
      impressions: m.impressions,
      engagements: m.engagements,
      engagementRate: m.engagementRate,
    }));

  // Health assessment
  const health = assessAccountHealth(
    normalizedPosts,
    platformComparison,
    aggregate,
    formatAnalysis
  );

  return {
    dateRange: { start: startDate, end: endDate },
    aggregate,
    topPosts: topPosts.slice(0, 5).map(normalizePost),
    topPostsByPlatform,
    formatAnalysis,
    platformComparison,
    trends,
    health,
  };
}

/**
 * Get recommendations by format
 */
function getFormatRecommendation(
  format: string,
  avgEngagementRate: number,
  overallRate: number
): string {
  const ratio = avgEngagementRate / overallRate;

  if (ratio > 1.5) {
    return `${format} posts are highly effective. Increase posting frequency.`;
  } else if (ratio > 1) {
    return `${format} posts perform well. Keep posting this format regularly.`;
  } else if (ratio > 0.5) {
    return `${format} posts are underperforming. Consider alternate formats.`;
  } else {
    return `${format} posts have low engagement. Try other post formats.`;
  }
}

/**
 * Assess overall account health
 */
function assessAccountHealth(
  posts: NormalizedPost[],
  platformComparison: PlatformMetrics[],
  aggregate: AggregateMetrics,
  formatAnalysis: FormatPerformance[]
): AccountHealth {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check posting frequency
  if (posts.length === 0) {
    score -= 30;
    insights.push("No recent posts");
    recommendations.push("Start posting regularly to engage your audience.");
  } else if (posts.length < 5) {
    score -= 10;
    insights.push("Low posting frequency");
    recommendations.push("Consider posting more frequently.");
  } else {
    insights.push("Good posting frequency");
  }

  // Check engagement
  if (aggregate.overallEngagementRate < 1) {
    score -= 20;
    insights.push("Low engagement rate");
    recommendations.push("Try different content types to boost engagement.");
  } else if (aggregate.overallEngagementRate < 3) {
    score -= 10;
    insights.push("Below-average engagement");
  } else {
    insights.push("Strong engagement rate");
  }

  // Check platform diversity
  if (platformComparison.length === 1) {
    score -= 15;
    insights.push("Only active on one platform");
    recommendations.push("Expand to additional platforms to reach wider audience.");
  } else if (platformComparison.length < 3) {
    score -= 5;
    insights.push("Limited platform presence");
  } else {
    insights.push("Strong multi-platform presence");
  }

  // Check format diversity
  const formats = formatAnalysis.filter((f) => f.count > 0).length;
  if (formats === 1) {
    score -= 5;
    insights.push("Limited content formats");
    recommendations.push("Experiment with different content formats.");
  } else {
    insights.push("Good content format variety");
  }

  // Check follower growth
  const recentFollowerGrowth = platformComparison.reduce(
    (sum, p) => sum + p.followerGrowth,
    0
  );
  if (recentFollowerGrowth > 100) {
    insights.push("Strong follower growth");
  } else if (recentFollowerGrowth > 0) {
    insights.push("Steady follower growth");
  } else {
    score -= 5;
    insights.push("No recent follower growth");
    recommendations.push("Focus on creating engaging content to attract followers.");
  }

  // Ensure score is in valid range
  score = Math.max(0, Math.min(100, score));

  let status: "excellent" | "good" | "fair" | "poor";
  if (score >= 80) status = "excellent";
  else if (score >= 60) status = "good";
  else if (score >= 40) status = "fair";
  else status = "poor";

  return {
    score,
    status,
    insights,
    recommendations,
  };
}

/**
 * Get detailed platform analysis
 */
export async function getPlatformAnalysis(
  userId: string,
  accountId: string,
  platform: Platform,
  days: number = 30
): Promise<{
  platform: string;
  metrics: NormalizedMetrics;
  topPosts: NormalizedPost[];
  formatBreakdown: FormatPerformance[];
  growthTrend: TrendData[];
}> {
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [posts, metrics] = await Promise.all([
    getPostsByDateRange(userId, accountId, startDate, endDate),
    getMetricsForPlatform(userId, accountId, platform, startDate, endDate),
  ]);

  // Filter to this platform
  const platformPosts = posts.filter((p) => p.platform === platform);
  const platformMetrics = metrics.filter((m) => m.platform === platform);

  // Get format breakdown for this platform
  const avgEngagement = await getAverageEngagementByFormat(
    userId,
    accountId
  );
  const formatBreakdown: FormatPerformance[] = avgEngagement
    .filter((stat) =>
      platformPosts.some((p) => p.format === stat.format)
    )
    .map((stat) => ({
      format: stat.format,
      count: stat.postCount,
      avgEngagementRate: stat.avgEngagementRate,
      avgComments: stat.avgComments,
      avgLikes: stat.avgLikes,
      avgShares: stat.avgShares,
      recommendation: "",
    }));

  return {
    platform,
    metrics: normalizeMetrics(platformMetrics[platformMetrics.length - 1]),
    topPosts: platformPosts
      .sort(
        (a, b) => b.engagement.engagementRate - a.engagement.engagementRate
      )
      .slice(0, 5)
      .map(normalizePost),
    formatBreakdown,
    growthTrend: platformMetrics.map((m) => ({
      date: m.date,
      platform,
      followers: m.metrics.followers,
      impressions: m.metrics.totalImpressions,
      engagements: m.metrics.totalEngagements,
      engagementRate: m.metrics.averageEngagementRate,
    })),
  };
}

/**
 * Get content recommendations
 */
export async function getContentRecommendations(
  userId: string,
  accountId: string
): Promise<string[]> {
  const summary = await getAnalyticsSummary(userId, accountId);
  const recommendations: Set<string> = new Set(
    summary.health.recommendations
  );

  // Add format-based recommendations
  for (const format of summary.formatAnalysis) {
    if (format.recommendation) {
      recommendations.add(format.recommendation);
    }
  }

  // Add platform-based recommendations
  for (const platform of summary.platformComparison) {
    if (platform.engagementRate > 8) {
      recommendations.add(
        `${platform.platform} is your strongest platform. Post there more frequently.`
      );
    } else if (platform.engagementRate < 2) {
      recommendations.add(
        `${platform.platform} engagement is low. Consider different content types or posting times.`
      );
    }
  }

  return Array.from(recommendations);
}

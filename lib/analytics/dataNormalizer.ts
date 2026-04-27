/**
 * Data Normalizer
 * 
 * Normalizes and enriches data from Phase 2 fetchers.
 * Handles:
 * - Cross-platform data consistency
 * - Metric standardization
 * - Data quality checks
 * - Missing data imputation
 */

import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

/**
 * Normalized post data for analytics display
 */
export interface NormalizedPost {
  id: string;
  platform: string;
  caption: string;
  format: string;
  postedAt: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
    saves: number;
  };
  engagement: {
    rate: number;
    commentRate: number;
    shareRate: number;
  };
  performance: "excellent" | "good" | "average" | "poor";
  performanceScore: number; // 0-100
}

/**
 * Normalized metrics for analytics display
 */
export interface NormalizedMetrics {
  date: Date;
  platform: string;
  followers: number;
  followerGrowth: number;
  followerGrowthRate: number;
  posts: number;
  impressions: number;
  impressionGrowth: number;
  impressionGrowthRate: number;
  engagements: number;
  engagementRate: number;
  engagementGrowth: number;
  engagementGrowthRate: number;
  clicks: number;
  avgPostPerformance: number;
}

/**
 * Normalize a post for analytics
 */
export function normalizePost(post: SocialMediaPostDocument): NormalizedPost {
  const totalEngagements =
    post.metrics.likes +
    post.metrics.comments +
    (post.metrics.shares || 0);
  const engagementRate = post.engagement.engagementRate || 0;

  return {
    id: post._id?.toString() || "",
    platform: post.platform,
    caption: post.caption,
    format: post.format,
    postedAt: post.postedAt,
    metrics: {
      likes: post.metrics.likes,
      comments: post.metrics.comments,
      shares: post.metrics.shares || 0,
      views: post.metrics.views,
      clicks: post.metrics.clicks || 0,
      saves: post.metrics.saves || 0,
    },
    engagement: {
      rate: engagementRate,
      commentRate: post.engagement.commentRate || 0,
      shareRate: post.engagement.shareRate || 0,
    },
    performance: getPerformanceCategory(engagementRate),
    performanceScore: calculatePerformanceScore(post),
  };
}

/**
 * Normalize metrics for analytics
 */
export function normalizeMetrics(
  metrics: SocialMediaMetricsDocument
): NormalizedMetrics {
  return {
    date: metrics.date,
    platform: metrics.platform,
    followers: metrics.metrics.followers,
    followerGrowth: metrics.growth?.followerGrowth || 0,
    followerGrowthRate: metrics.growth?.followerGrowthRate || 0,
    posts: metrics.metrics.posts,
    impressions: metrics.metrics.totalImpressions,
    impressionGrowth: metrics.growth?.impressionGrowth || 0,
    impressionGrowthRate: metrics.growth?.impressionGrowthRate || 0,
    engagements: metrics.metrics.totalEngagements,
    engagementRate: metrics.metrics.averageEngagementRate || 0,
    engagementGrowth: metrics.growth?.engagementGrowth || 0,
    engagementGrowthRate: metrics.growth?.engagementGrowthRate || 0,
    clicks: metrics.metrics.totalClicks,
    avgPostPerformance: calculateAveragePostPerformance(metrics),
  };
}

/**
 * Get performance category based on engagement rate
 */
export function getPerformanceCategory(
  engagementRate: number
): "excellent" | "good" | "average" | "poor" {
  if (engagementRate >= 10) return "excellent";
  if (engagementRate >= 5) return "good";
  if (engagementRate >= 2) return "average";
  return "poor";
}

/**
 * Calculate performance score (0-100) for a post
 */
export function calculatePerformanceScore(post: SocialMediaPostDocument): number {
  const engagementRate = post.engagement.engagementRate || 0;

  // Weight different factors
  const engagementScore = Math.min(engagementRate * 10, 100);
  const shareScore = post.metrics.shares > 0 ? 20 : 0;
  const viewScore = post.metrics.views > 0 ? 10 : 0;

  const totalScore =
    (engagementScore * 0.7 + shareScore * 0.2 + viewScore * 0.1);

  return Math.round(totalScore);
}

/**
 * Calculate average post performance for metrics
 */
export function calculateAveragePostPerformance(
  metrics: SocialMediaMetricsDocument
): number {
  const totalEngagements = metrics.metrics.totalEngagements;
  const totalImpressions = Math.max(metrics.metrics.totalImpressions, 1);

  const engagementRate = (totalEngagements / totalImpressions) * 100;
  const postsCount = Math.max(metrics.metrics.posts, 1);

  const avgPerPost = engagementRate / postsCount;
  return Math.round(Math.min(avgPerPost * 10, 100));
}

/**
 * Normalize platform metrics across all platforms
 */
export function normalizeCrossPlatformMetrics(
  metricsArray: SocialMediaMetricsDocument[]
): Map<string, NormalizedMetrics> {
  const normalized = new Map<string, NormalizedMetrics>();

  for (const m of metricsArray) {
    normalized.set(m.platform, normalizeMetrics(m));
  }

  return normalized;
}

/**
 * Calculate aggregate metrics across platforms
 */
export interface AggregateMetrics {
  totalFollowers: number;
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  totalClicks: number;
  overallEngagementRate: number;
  platformCount: number;
  topPerformingPlatform: string;
  topPerformingScore: number;
}

export function calculateAggregateMetrics(
  normalizedMetrics: Map<string, NormalizedMetrics>
): AggregateMetrics {
  let totalFollowers = 0;
  let totalPosts = 0;
  let totalImpressions = 0;
  let totalEngagements = 0;
  let totalClicks = 0;
  let topPerformingPlatform = "";
  let topPerformingScore = 0;

  for (const [platform, metrics] of normalizedMetrics) {
    totalFollowers += metrics.followers;
    totalPosts += metrics.posts;
    totalImpressions += metrics.impressions;
    totalEngagements += metrics.engagements;
    totalClicks += metrics.clicks;

    if (metrics.engagementRate > topPerformingScore) {
      topPerformingScore = metrics.engagementRate;
      topPerformingPlatform = platform;
    }
  }

  const overallEngagementRate =
    totalImpressions > 0
      ? (totalEngagements / totalImpressions) * 100
      : 0;

  return {
    totalFollowers,
    totalPosts,
    totalImpressions,
    totalEngagements,
    totalClicks,
    overallEngagementRate: Math.round(overallEngagementRate * 100) / 100,
    platformCount: normalizedMetrics.size,
    topPerformingPlatform,
    topPerformingScore: Math.round(topPerformingScore * 100) / 100,
  };
}

/**
 * Check data quality
 */
export interface DataQuality {
  completeness: number; // 0-100%
  accuracy: string[];
  warnings: string[];
}

export function assessDataQuality(
  posts: NormalizedPost[],
  metrics: NormalizedMetrics
): DataQuality {
  const quality: DataQuality = {
    completeness: 100,
    accuracy: [],
    warnings: [],
  };

  if (posts.length === 0) {
    quality.completeness = 0;
    quality.warnings.push("No posts found");
  }

  if (metrics.followers === 0) {
    quality.warnings.push("No followers - account may be new");
  }

  if (metrics.impressions === 0) {
    quality.warnings.push("No impressions - posts not being seen");
  }

  // Check for suspicious data
  if (metrics.engagements > metrics.impressions) {
    quality.warnings.push("Engagement exceeds impressions - possible data issue");
  }

  return quality;
}

/**
 * Enrich post data with calculated fields
 */
export interface EnrichedPost extends NormalizedPost {
  isTopPerformer: boolean;
  isUnderperformer: boolean;
  recommendation?: string;
}

export function enrichPostData(
  post: NormalizedPost,
  avgPerformance: number
): EnrichedPost {
  const enriched: EnrichedPost = {
    ...post,
    isTopPerformer: post.performanceScore > avgPerformance * 1.5,
    isUnderperformer: post.performanceScore < avgPerformance * 0.5,
  };

  if (enriched.isTopPerformer) {
    enriched.recommendation = `This ${post.format} post is performing exceptionally well. Consider posting similar content more frequently.`;
  } else if (enriched.isUnderperformer) {
    enriched.recommendation = `This ${post.format} post is underperforming. Try posting at different times or use different content formats.`;
  }

  return enriched;
}

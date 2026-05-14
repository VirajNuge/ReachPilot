/**
 * Analytics Calculation Engine
 * 
 * Calculates real analytics metrics from aggregated data.
 * Generates metrics for all dashboard components.
 */

import { getAnalyticsSummary, getPlatformAnalysis } from "./aggregationService";
import type { Platform } from "@/lib/models/persistedTypes";

/**
 * Velocity metrics (for VelocityCard)
 */
export interface VelocityMetrics {
  currentFollowers: number;
  previousFollowers: number;
  followerVelocity: number;
  followerVelocityPercentage: number;
  currentEngagement: number;
  previousEngagement: number;
  engagementVelocity: number;
  engagementVelocityPercentage: number;
  currentImpressions: number;
  previousImpressions: number;
  impressionVelocity: number;
  impressionVelocityPercentage: number;
  currentComments: number;
  currentShares: number;
}

/**
 * Growth metrics (for GrowthChart)
 */
export interface GrowthMetrics {
  date: Date;
  platform?: Platform;
  followers: number;
  impressions: number;
  engagements: number;
  engagementRate: number;
}

/**
 * Platform comparison metrics (for RadarInsight)
 */
export interface PlatformComparisonMetrics {
  platform: Platform;
  followers: number;
  engagements: number;
  engagementRate: number;
  impressions: number;
  posting: number; // posts per day
  growth: number; // follower growth rate
  comments?: number;
  shares?: number;
}

/**
 * Top posts (for CopyCatEngine)
 */
export interface TopPostMetrics {
  id: string;
  platform: Platform;
  format: string;
  caption: string;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  performanceScore: number;
}

/**
 * Format performance (for ContentDNATable)
 */
export interface FormatPerformanceMetrics {
  format: string;
  count: number;
  avgEngagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  performanceRank: number;
  recommendation: string;
}

/**
 * Audience insights (for AudienceDeepDive)
 */
export interface AudienceInsights {
  totalReach: number;
  totalFollowers: number;
  platformBreakdown: {
    platform: Platform;
    followers: number;
    percentage: number;
  }[];
  topDemographics: string[];
  engagementTrend: number; // percentage change
  growthTrend: number; // percentage change
}

/**
 * Platform comparison for ComparisonEngine
 */
export interface PlatformComparison {
  platforms: Platform[];
  metrics: {
    platform: Platform;
    followers: number;
    engagementRate: number;
    impressionShare: number;
    postingFrequency: number;
  }[];
}

/**
 * Calculate velocity metrics
 */
export async function calculateVelocityMetrics(
  userId: string,
  accountId: string,
  platform?: Platform
): Promise<VelocityMetrics> {
  const summary = await getAnalyticsSummary(userId, accountId, 30, platform);
  const previousSummary = await getAnalyticsSummary(userId, accountId, 60, platform);

  const currentFollowers = summary.aggregate.totalFollowers;
  const previousFollowers = previousSummary.aggregate.totalFollowers;
  const followerVelocity = currentFollowers - previousFollowers;
  const followerVelocityPercentage =
    previousFollowers > 0 ? (followerVelocity / previousFollowers) * 100 : 0;

  const currentEngagement = summary.aggregate.totalEngagements;
  const previousEngagement = previousSummary.aggregate.totalEngagements;
  const engagementVelocity = currentEngagement - previousEngagement;
  const engagementVelocityPercentage =
    previousEngagement > 0
      ? (engagementVelocity / previousEngagement) * 100
      : 0;

  const currentImpressions = summary.aggregate.totalImpressions;
  const previousImpressions = previousSummary.aggregate.totalImpressions;
  const impressionVelocity = currentImpressions - previousImpressions;
  const impressionVelocityPercentage =
    previousImpressions > 0
      ? (impressionVelocity / previousImpressions) * 100
      : 0;

  // Get comments and shares from aggregate
  const currentComments = (summary.aggregate as any).totalComments || 0;
  const currentShares = (summary.aggregate as any).totalShares || 0;

  return {
    currentFollowers,
    previousFollowers,
    followerVelocity,
    followerVelocityPercentage: Math.round(followerVelocityPercentage * 100) / 100,
    currentEngagement,
    previousEngagement,
    engagementVelocity,
    engagementVelocityPercentage: Math.round(
      engagementVelocityPercentage * 100
    ) / 100,
    currentImpressions,
    previousImpressions,
    impressionVelocity,
    impressionVelocityPercentage: Math.round(impressionVelocityPercentage * 100) / 100,
    currentComments,
    currentShares,
  };
}

/**
 * Calculate growth metrics for chart
 */
export async function calculateGrowthMetrics(
  userId: string,
  accountId: string,
  days: number = 30
): Promise<GrowthMetrics[]> {
  const summary = await getAnalyticsSummary(userId, accountId, days);

  return summary.trends.map((trend) => ({
    date: trend.date,
    platform: trend.platform as Platform,
    followers: trend.followers,
    impressions: trend.impressions,
    engagements: trend.engagements,
    engagementRate: trend.engagementRate,
  }));
}

/**
 * Calculate platform comparison metrics
 */
export async function calculatePlatformComparison(
  userId: string,
  accountId: string
): Promise<PlatformComparisonMetrics[]> {
  const summary = await getAnalyticsSummary(userId, accountId);

  return summary.platformComparison.map((p) => ({
    platform: p.platform as Platform,
    followers: p.followers,
    engagements: p.engagements,
    engagementRate: p.engagementRate,
    impressions: p.impressions,
    posting: p.posts > 0 ? (p.posts / 30) : 0, // posts per day in 30 days
    growth: p.followerGrowthRate,
    comments: p.comments || 0,
    shares: p.shares || 0,
  }));
}

/**
 * Get top posts metrics
 */
export async function getTopPostsMetrics(
  userId: string,
  accountId: string,
  limit: number = 10,
  platform?: Platform
): Promise<TopPostMetrics[]> {
  const summary = await getAnalyticsSummary(userId, accountId, 30, platform);

  return summary.topPosts.slice(0, limit).map((post) => ({
    id: post.id,
    platform: post.platform as Platform,
    format: post.format,
    caption: post.caption,
    engagementRate: post.engagement.rate,
    likes: post.metrics.likes,
    comments: post.metrics.comments,
    shares: post.metrics.shares,
    views: post.metrics.views,
    performanceScore: post.performanceScore,
  }));
}

/**
 * Get format performance metrics
 */
export async function getFormatPerformanceMetrics(
  userId: string,
  accountId: string
): Promise<FormatPerformanceMetrics[]> {
  const summary = await getAnalyticsSummary(userId, accountId);

  // Sort by engagement rate
  const sorted = [...summary.formatAnalysis].sort(
    (a, b) => b.avgEngagementRate - a.avgEngagementRate
  );

  return sorted.map((format, index) => ({
    format: format.format,
    count: format.count,
    avgEngagement: Math.round(format.avgEngagementRate * 100) / 100,
    avgLikes: Math.round(format.avgLikes),
    avgComments: Math.round(format.avgComments),
    avgShares: Math.round(format.avgShares),
    performanceRank: index + 1,
    recommendation: format.recommendation,
  }));
}

/**
 * Get audience insights
 */
export async function getAudienceInsights(
  userId: string,
  accountId: string
): Promise<AudienceInsights> {
  const summary = await getAnalyticsSummary(userId, accountId, 30);
  const previousSummary = await getAnalyticsSummary(userId, accountId, 60);

  const totalFollowers = summary.aggregate.totalFollowers;
  const previousFollowers = previousSummary.aggregate.totalFollowers;
  const growthTrend = 
    previousFollowers > 0
      ? ((totalFollowers - previousFollowers) / previousFollowers) * 100
      : 0;

  const engagementTrend =
    previousSummary.aggregate.totalEngagements > 0
      ? (
          (summary.aggregate.totalEngagements -
            previousSummary.aggregate.totalEngagements) /
          previousSummary.aggregate.totalEngagements
        ) * 100
      : 0;

  const platformBreakdown = summary.platformComparison.map((p) => ({
    platform: p.platform as Platform,
    followers: p.followers,
    percentage:
      totalFollowers > 0
        ? Math.round((p.followers / totalFollowers) * 100)
        : 0,
  }));

  return {
    totalReach: summary.aggregate.totalImpressions,
    totalFollowers,
    platformBreakdown,
    topDemographics: [], // Would require additional data source
    engagementTrend: Math.round(engagementTrend * 100) / 100,
    growthTrend: Math.round(growthTrend * 100) / 100,
  };
}

/**
 * Get platform comparison for chart
 */
export async function getPlatformComparisonMetrics(
  userId: string,
  accountId: string
): Promise<PlatformComparison> {
  const summary = await getAnalyticsSummary(userId, accountId);

  const totalImpressions = summary.aggregate.totalImpressions;

  return {
    platforms: summary.platformComparison.map((p) => p.platform as Platform),
    metrics: summary.platformComparison.map((p) => ({
      platform: p.platform as Platform,
      followers: p.followers,
      engagementRate: p.engagementRate,
      impressionShare:
        totalImpressions > 0
          ? Math.round((p.impressions / totalImpressions) * 100)
          : 0,
      postingFrequency: p.posts > 0 ? (p.posts / 30) : 0,
    })),
  };
}

/**
 * Calculate anomaly score (0-100) for content
 */
export function calculateAnomalyScore(
  currentValue: number,
  avgValue: number,
  stdDev: number = avgValue * 0.5
): number {
  if (stdDev === 0) return currentValue > avgValue ? 50 : 0;

  const zScore = Math.abs((currentValue - avgValue) / stdDev);
  const anomalyScore = Math.min(zScore * 20, 100);

  return Math.round(anomalyScore);
}

/**
 * Get all analytics metrics at once
 */
export async function getAllAnalyticsMetrics(
  userId: string,
  accountId: string,
  platform?: Platform
) {
  const [velocity, growth, platformComp, topPosts, formats, audience, comparison] =
    await Promise.all([
      calculateVelocityMetrics(userId, accountId, platform), // Only filter velocity for vitals card
      calculateGrowthMetrics(userId, accountId, 30), // Never filter - show all platforms
      calculatePlatformComparison(userId, accountId), // Never filter - show all platforms
      getTopPostsMetrics(userId, accountId, 10, platform), // Only filter for top posts card
      getFormatPerformanceMetrics(userId, accountId), // Never filter - global analysis
      getAudienceInsights(userId, accountId), // Never filter - global analysis
      getPlatformComparisonMetrics(userId, accountId), // Never filter - radar needs all
    ]);

  return {
    velocity,
    growth,
    platformComparison: platformComp,
    topPosts,
    formatPerformance: formats,
    audience,
    comparison,
  };
}

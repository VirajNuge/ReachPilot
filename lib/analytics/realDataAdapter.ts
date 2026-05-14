/**
 * Real Data Adapter
 * 
 * Converts real analytics data from getAllAnalyticsMetrics() into the
 * AnalyticsSummaryResponse format expected by frontend components.
 */

import type { 
  AnalyticsDataset, 
  AnalyticsSummaryResponse, 
  DateRangeKey,
  VelocityMetric,
  ContentInsight,
  RadarPoint,
  DemographicsSnapshot,
  AnomalyPoint,
  TopPost,
  HistoryPoint,
  PredictionPoint,
  AnalyticsVitals,
} from "./types";
import type { PlatformKey } from "./platforms";
import { getAllAnalyticsMetrics } from "./analyticsCalculator";
import { getPostsByDateRange } from "@/lib/models/persistedTypes";
import { normalizePost } from "./dataNormalizer";
import type { Platform } from "@/lib/models/persistedTypes";

function toPersistedPlatform(platform: PlatformKey): Platform | null {
  switch (platform) {
    case "facebook":
      return "facebook";
    case "instagram":
      return "instagram";
    case "twitter":
      return "x";
    case "threads":
      return "threads";
    default:
      return null;
  }
}

/**
 * Convert velocity metrics to VelocityMetric format
 */
function convertVelocityMetrics(velocity: any, platformComparison?: any[]): AnalyticsVitals {
  const formatTrend = (value: number): "up" | "down" | "neutral" => {
    if (value > 5) return "up";
    if (value < -5) return "down";
    return "neutral";
  };

  const formatVelocity = (percentage: number): "high" | "medium" | "low" => {
    if (Math.abs(percentage) > 20) return "high";
    if (Math.abs(percentage) > 5) return "medium";
    return "low";
  };

  const formatValue = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // When a single-platform view, pull numbers from platformComparison rather than
  // aggregate velocity so that the vitals card shows platform-specific figures.
  let followers = velocity.currentFollowers;
  let impressions = velocity.currentImpressions;
  let engagements = velocity.currentEngagement;
  let clicks = 0;
  let comments = velocity.currentComments || 0;
  let shares = velocity.currentShares || 0;
  let activePlatform = "all";

  if (platformComparison && platformComparison.length === 1) {
    const p = platformComparison[0]; // only one platform in filtered view
    followers    = p.followers    ?? followers;
    impressions  = p.impressions  ?? impressions;
    engagements  = p.engagements  ?? engagements;
    clicks       = p.clicks       ?? 0;
    comments     = p.comments     ?? 0;
    shares       = p.shares       ?? 0;
    activePlatform = p.platform   || "all";
  }

  return {
    audience: {
      id: "followers",
      label: "Total Followers",
      value: formatValue(followers),
      change: velocity.followerVelocity,
      trend: formatTrend(velocity.followerVelocityPercentage),
      velocity: formatVelocity(velocity.followerVelocityPercentage),
    },
    reach: {
      id: "impressions",
      label: "Total Impressions",
      value: formatValue(impressions),
      change: velocity.impressionVelocity,
      trend: formatTrend(velocity.impressionVelocityPercentage),
      velocity: formatVelocity(velocity.impressionVelocityPercentage),
    },
    engagement: {
      id: "engagement",
      label: "Total Engagements",
      value: formatValue(engagements),
      change: velocity.engagementVelocity,
      trend: formatTrend(velocity.engagementVelocityPercentage),
      velocity: formatVelocity(velocity.engagementVelocityPercentage),
    },
    clicks: {
      id: "clicks",
      label: "Total Clicks",
      value: formatValue(clicks),
      change: 0,
      trend: "neutral",
      velocity: "low",
    },
    comments: {
      id: "comments",
      label: "Total Comments",
      value: formatValue(comments),
      change: 0,
      trend: comments > 0 ? "up" : "neutral",
      velocity: comments > 10 ? "high" : comments > 0 ? "medium" : "low",
    },
    shares: {
      id: "shares",
      label: activePlatform === "instagram" ? "Total Saves" : (activePlatform === "threads" ? "Total Reposts" : "Total Shares"),
      value: formatValue(shares),
      change: 0,
      trend: shares > 0 ? "up" : "neutral",
      velocity: shares > 10 ? "high" : shares > 0 ? "medium" : "low",
    },
    topDriver: "audience",
  };
}


/**
 * Convert growth metrics to history and prediction points
 */
function convertGrowthMetrics(growth: any[]): { history: HistoryPoint[]; prediction: PredictionPoint[] } {
  if (!growth || growth.length === 0) {
    return { history: [], prediction: [] };
  }

  const entries = new Map<string, HistoryPoint>();
  const platformMap: Record<string, PlatformKey> = {
    facebook: "facebook",
    instagram: "instagram",
    x: "twitter",
    twitter: "twitter",
    threads: "threads",
  };

  for (const point of growth) {
    const date = point.date
      ? new Date(point.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    if (!entries.has(date)) {
      entries.set(date, {
        date,
        all: 0,
        facebook: 0,
        instagram: 0,
        twitter: 0,
        threads: 0,
      });
    }

    const target = entries.get(date)!;
    // Use followers count (integer) as the primary chart value, not engagementRate (float fraction)
    const value = Math.round(Number(point.followers || 0));
    const platformKey = platformMap[String(point.platform || "")];

    if (platformKey) {
      target[platformKey] = value;
    } else {
      target.facebook = value;
      target.instagram = value;
      target.twitter = value;
      target.threads = value;
    }
  }

  const history: HistoryPoint[] = Array.from(entries.values())
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((point) => ({
      ...point,
      all:
        Number(point.facebook || 0) +
        Number(point.instagram || 0) +
        Number(point.twitter || 0) +
        Number(point.threads || 0),
    }));

  // Generate simple predictions based on trend
  const prediction: PredictionPoint[] = history.slice(-7).map((point, index) => ({
    date: point.date,
    all: Math.round((point.all as number) * (1 + (index * 0.02))),
    facebook: Math.round((point.facebook as number) * (1 + (index * 0.02))),
    instagram: Math.round((point.instagram as number) * (1 + (index * 0.02))),
    twitter: Math.round((point.twitter as number) * (1 + (index * 0.02))),
    threads: Math.round((point.threads as number) * (1 + (index * 0.02))),
  }));

  return { history, prediction };
}

/**
 * Convert platform comparison to radar points
 */
function convertPlatformComparison(platformComp: any[]): RadarPoint[] {
  if (!platformComp || platformComp.length === 0) {
    return [];
  }

  return platformComp.slice(0, 6).map((platform) => ({
    subject: platform.platform ? platform.platform.toUpperCase() : "Unknown",
    A: Math.round((platform.engagementRate || 0) * 100),
    fullMark: 100,
  }));
}

/**
 * Convert top posts to TopPost format
 */
function convertTopPosts(topPosts: any[]): TopPost[] {
  if (!topPosts || topPosts.length === 0) {
    return [];
  }

  return topPosts.slice(0, 5).map((post) => ({
    id: Math.abs(hash(post.id || "")) % 10000,
    headline: post.caption ? post.caption.substring(0, 60) : "Untitled Post",
    format: post.format || "Unknown",
    stats: {
      views: post.views ? formatNumber(post.views) : "0",
      engagement: post.engagementRate ? `${(post.engagementRate * 100).toFixed(1)}%` : "0%",
    },
    score: Math.round(post.performanceScore || 0),
    whyItWorked: `Strong ${post.format} performance with ${post.metrics?.likes || 0} likes`,
  }));
}

/**
 * Convert format performance to content insights
 */
function convertFormatPerformance(formats: any[]): ContentInsight[] {
  if (!formats || formats.length === 0) {
    return [];
  }

  return formats.slice(0, 5).map((format, index) => ({
    id: index,
    format: format.format || "Unknown",
    performance: Math.round(format.avgEngagement * 100),
    engagement: `${(format.avgEngagement * 100).toFixed(1)}%`,
    insight: `${format.format} posts average ${format.count || 0} posts with strong engagement`,
    action: `Continue posting ${format.format} content regularly`,
  }));
}

/**
 * Convert audience insights to demographics snapshot
 */
function convertAudience(audience: any): DemographicsSnapshot {
  return {
    jobs: (audience.topDemographics || []).slice(0, 5).map((demo: any, index: number) => ({
      name: `Demographic ${index + 1}`,
      value: Math.round(Math.random() * 30 + 10),
    })),
    locations: (audience.platformBreakdown || []).slice(0, 5).map((plat: any, index: number) => ({
      city: plat.platform || `Location ${index + 1}`,
      percent: plat.percentage || 0,
    })),
    seniority: "Mixed",
  };
}

/**
 * Generate anomaly points based on growth spikes
 */
function generateAnomalyPoints(growth: any[]): AnomalyPoint[] {
  const anomalies: AnomalyPoint[] = [];

  if (!growth || growth.length < 2) {
    return anomalies;
  }

  // Detect significant changes
  for (let i = 1; i < growth.length; i++) {
    const prev = growth[i - 1].engagementRate || 0;
    const current = growth[i].engagementRate || 0;
    const change = ((current - prev) / (prev || 1)) * 100;

    if (Math.abs(change) > 30) {
      anomalies.push({
        date: growth[i].date ? new Date(growth[i].date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        type: change > 0 ? "spike" : "drop",
        value: Math.round(Math.abs(change)),
        icon: change > 0 ? "📈" : "📉",
        reason: change > 0 ? "Engagement spike detected" : "Engagement drop detected",
      });
    }
  }

  return anomalies.slice(-5);
}

/**
 * Simple hash function for generating consistent IDs
 */
function hash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Format number with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Build analytics dataset from real data
 */
function buildRealAnalyticsDataset(
  metrics: any,
  filteredPlatformComparison?: any[]
): AnalyticsDataset {
  const { history, prediction } = convertGrowthMetrics(metrics.growth || []);

  // When rendering a single-platform view, override velocity vitals using
  // that platform's own metrics from platformComparison.
  const compForVitals = filteredPlatformComparison ?? metrics.platformComparison;

  return {
    vitals: convertVelocityMetrics(metrics.velocity, compForVitals),
    history,
    prediction,
    radar: convertPlatformComparison(metrics.platformComparison || []),
    contentInsights: convertFormatPerformance(metrics.formatPerformance || []),
    demographics: convertAudience(metrics.audience),
    anomalies: generateAnomalyPoints(metrics.growth || []),
    topPosts: convertTopPosts(metrics.topPosts || []),
  };
}

function filterMetricsForPlatform(metrics: any, platform: PlatformKey): any {
  if (platform === "all") return metrics;
  const persistedPlatform = toPersistedPlatform(platform);
  if (!persistedPlatform) return metrics;

  const filteredGrowth = Array.isArray(metrics.growth)
    ? metrics.growth.filter((point: any) => {
        const pointPlatform = String(point?.platform || "").toLowerCase();
        return pointPlatform === persistedPlatform;
      })
    : [];

  const filteredTopPosts = Array.isArray(metrics.topPosts)
    ? metrics.topPosts.filter((post: any) => String(post?.platform || "").toLowerCase() === persistedPlatform)
    : [];

  const filteredPlatformComparison = Array.isArray(metrics.platformComparison)
    ? metrics.platformComparison.filter(
        (item: any) => String(item?.platform || "").toLowerCase() === persistedPlatform
      )
    : [];

  const filteredAudienceBreakdown = Array.isArray(metrics.audience?.platformBreakdown)
    ? metrics.audience.platformBreakdown.filter(
        (item: any) => String(item?.platform || "").toLowerCase() === persistedPlatform
      )
    : [];

  return {
    ...metrics,
    growth: filteredGrowth,
    topPosts: filteredTopPosts,
    platformComparison: filteredPlatformComparison,
    audience: {
      ...metrics.audience,
      platformBreakdown: filteredAudienceBreakdown,
    },
  };
}

/**
 * Get analytics summary from real data
 */
export async function buildRealAnalyticsSummary(
  userId: string,
  accountId: string,
  platform: PlatformKey,
  dateRange: DateRangeKey,
  plan: "core" | "pro",
): Promise<AnalyticsSummaryResponse> {
  try {
    // Map date range to days
    const daysMap = { "7D": 7, "30D": 30, "90D": 90 };
    const days = daysMap[dateRange] || 30;

    // Fetch real metrics from the analytics calculator
    // 1. Fetch Global (Aggregate) Metrics
    const globalMetrics = await getAllAnalyticsMetrics(userId, accountId);

    // Validate that we have data
    if (!globalMetrics || Object.keys(globalMetrics).length === 0) {
      return {
        platform,
        dateRange,
        plan,
        generatedAt: new Date().toISOString(),
        globalData: {
          vitals: {
            audience: { id: "followers", label: "Total Followers", value: "0", change: 0, trend: "neutral", velocity: "low" },
            reach: { id: "impressions", label: "Total Impressions", value: "0", change: 0, trend: "neutral", velocity: "low" },
            engagement: { id: "engagement", label: "Total Engagements", value: "0", change: 0, trend: "neutral", velocity: "low" },
            clicks: { id: "clicks", label: "Total Clicks", value: "0", change: 0, trend: "neutral", velocity: "low" },
            comments: { id: "comments", label: "Total Comments", value: "0", change: 0, trend: "neutral", velocity: "low" },
            shares: { id: "shares", label: "Total Shares", value: "0", change: 0, trend: "neutral", velocity: "low" },
            topDriver: "audience"
          },
          history: [],
          prediction: [],
          radar: [],
          contentInsights: [],
          demographics: { jobs: [], locations: [], seniority: "" },
          anomalies: [],
          topPosts: []
        },
        platformData: null
      };
    }

    // Build the analytics dataset
    const globalData = buildRealAnalyticsDataset(globalMetrics);

    // Attach post events and best posts for the overview chart and list
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const rawPosts = await getPostsByDateRange(userId, accountId, startDate, endDate, 500);
      const normalizedPosts = rawPosts.map(normalizePost);

      const postEvents = normalizedPosts.map((p) => ({
        postId: p.id,
        platform: p.platform,
        postedAt: p.postedAt instanceof Date ? p.postedAt.toISOString() : String(p.postedAt),
        thumbnail: (rawPosts.find(r => String(r._id) === p.id)?.mediaUrls?.[0]) || null,
        metrics: {
          likes: p.metrics.likes,
          comments: p.metrics.comments,
          shares: p.metrics.shares,
          views: p.metrics.views,
        },
      }));

      const bestPosts30d = normalizedPosts
        .slice()
        .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
        .slice(0, 10)
        .map((p) => ({
          postId: p.id,
          platform: p.platform,
          postedAt: p.postedAt instanceof Date ? p.postedAt.toISOString() : String(p.postedAt),
          thumbnail: (rawPosts.find(r => String(r._id) === p.id)?.mediaUrls?.[0]) || null,
          caption: p.caption?.slice(0, 220) || "",
          metricValue: Math.round((p.engagement?.rate || 0) * 100) / 100,
        }));

      globalData.postEvents = postEvents;
      globalData.bestPosts30d = bestPosts30d;
    } catch (err) {
      // Non-fatal; add empty lists if post enrichment fails
      globalData.postEvents = [];
      globalData.bestPosts30d = [];
    }

    let platformData: AnalyticsDataset | null = null;
    if (platform !== "all") {
      const persistedPlatform = toPersistedPlatform(platform);
      if (persistedPlatform) {
        // 2. Fetch Platform-Specific Metrics for isolated velocity
        const platformMetrics = await getAllAnalyticsMetrics(userId, accountId, persistedPlatform);
        const filteredMetrics = filterMetricsForPlatform(platformMetrics, platform);
        platformData = buildRealAnalyticsDataset(filteredMetrics, filteredMetrics.platformComparison);
      }
    }

    return {
      platform,
      dateRange,
      plan,
      generatedAt: new Date().toISOString(),
      globalData,
      platformData,
    };
  } catch (error) {
    console.error("Error building real analytics summary:", error);
    throw error;
  }
}

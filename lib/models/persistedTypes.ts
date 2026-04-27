/**
 * Persisted Analytics Types
 * 
 * These types are used for storing and retrieving analytics data from MongoDB.
 * They represent the schema for social media posts and metrics collected from various platforms.
 */

export type {
  SocialMediaPostDocument,
  Platform,
  PostFormat,
} from "./socialMediaPost";

export type {
  SocialMediaMetricsDocument,
  MetricsGranularity,
} from "./socialMediaMetrics";

export {
  ensurePostIndexes,
  createPost,
  upsertPost,
  getPostsByAccount,
  getPostsByPlatform,
  getTopPostsByEngagement,
  getTopPostsByPlatform,
  updatePostMetrics,
  getPostsNeedingRefresh,
  getPostsByFormat,
  getPostsByDateRange,
  getPostCountByFormat,
  getAverageEngagementByFormat,
  deleteOldPosts,
  getPostById,
  getTotalPostCount,
} from "./socialMediaPost";

export {
  ensureMetricsIndexes,
  createMetrics,
  upsertMetrics,
  getMetricsForAccount,
  getMetricsForPlatform,
  getLatestMetricsForAccount,
  getLatestMetricsForPlatform,
  calculateGrowthVsPrevious,
  getTopPostForPeriod,
  getAggregatedMetrics,
  archiveOldMetrics,
  getMetricsByDate,
  getTrendingMetrics,
  getMetricsById,
} from "./socialMediaMetrics";

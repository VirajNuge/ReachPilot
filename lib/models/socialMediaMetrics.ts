import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";
import type { Platform } from "./socialMediaPost";

export type MetricsGranularity = "daily" | "hourly";

export interface SocialMediaMetricsDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  platform: Platform;

  // Time bucket
  date: Date;
  granularity: MetricsGranularity;

  // Account-level metrics at this point in time
  metrics: {
    followers: number;
    following?: number;
    posts: number;
    totalImpressions: number;
    totalEngagements: number;
    totalClicks: number;
    totalShares: number;
    totalComments?: number;
    totalSaves?: number;
    averageEngagementRate: number;
    averageCommentRate: number;
    averageShareRate: number;
  };

  // Growth metrics (vs previous period)
  growth: {
    followerGrowth: number;
    followerGrowthRate: number;
    impressionGrowth: number;
    impressionGrowthRate: number;
    engagementGrowth: number;
    engagementGrowthRate: number;
  };

  // Top performer in this period
  topPost?: {
    platformPostId: string;
    engagement: number;
    engagementRate: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "social_media_metrics";

function normalizeMetricDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<SocialMediaMetricsDocument>(COLLECTION);
}

/**
 * Ensure all indexes are created
 */
export async function ensureMetricsIndexes(): Promise<void> {
  const col = await getCollection();

  await Promise.all([
    // Main query pattern: get metrics for account by date
    col.createIndex({
      userId: 1,
      accountId: 1,
      platform: 1,
      date: -1,
    }),

    // Get all platforms for account
    col.createIndex({ userId: 1, accountId: 1, date: -1 }),

    // Get all metrics for user
    col.createIndex({ userId: 1, date: -1 }),

    // Prevent duplicates - unique constraint
    col.createIndex(
      { userId: 1, accountId: 1, platform: 1, date: 1, granularity: 1 },
      { unique: true }
    ),

    // Find records by granularity
    col.createIndex({ granularity: 1, date: -1 }),

    // Archive queries
    col.createIndex({ createdAt: -1 }),
  ]);
}

/**
 * Create metrics for a day/hour
 */
export async function createMetrics(
  data: Omit<SocialMediaMetricsDocument, "_id" | "createdAt" | "updatedAt">
): Promise<SocialMediaMetricsDocument> {
  const col = await getCollection();
  const now = new Date();
  const normalizedDate = normalizeMetricDate(data.date);

  const doc: SocialMediaMetricsDocument = {
    ...data,
    date: normalizedDate,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Upsert metrics (update if exists, insert if not)
 */
export async function upsertMetrics(
  data: Omit<SocialMediaMetricsDocument, "_id" | "createdAt" | "updatedAt">
): Promise<SocialMediaMetricsDocument> {
  const col = await getCollection();
  const now = new Date();
  const normalizedDate = normalizeMetricDate(data.date);

  const result = await col.findOneAndUpdate(
    {
      userId: data.userId,
      accountId: data.accountId,
      platform: data.platform,
      date: normalizedDate,
      granularity: data.granularity,
    },
    {
      $set: {
        ...data,
        date: normalizedDate,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  if (!result) {
    throw new Error("Failed to upsert metrics");
  }

  return result;
}

/**
 * Get metrics for account over time (for trends/charts)
 */
export async function getMetricsForAccount(
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date,
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument[]> {
  const col = await getCollection();

  return col
    .find({
      userId,
      accountId,
      date: { $gte: startDate, $lte: endDate },
      granularity,
    })
    .sort({ date: 1 })
    .toArray();
}

/**
 * Get metrics for specific platform over time
 */
export async function getMetricsForPlatform(
  userId: string,
  accountId: string,
  platform: Platform,
  startDate: Date,
  endDate: Date,
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument[]> {
  const col = await getCollection();

  return col
    .find({
      userId,
      accountId,
      platform,
      date: { $gte: startDate, $lte: endDate },
      granularity,
    })
    .sort({ date: 1 })
    .toArray();
}

/**
 * Get latest metrics for an account (all platforms)
 */
export async function getLatestMetricsForAccount(
  userId: string,
  accountId: string,
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument[]> {
  const col = await getCollection();

  // Get the most recent date first
  const latest = await col
    .findOne(
      { userId, accountId, granularity },
      { sort: { date: -1 } }
    );

  if (!latest) return [];

  // Get all platforms for that date
  return col
    .find({
      userId,
      accountId,
      date: latest.date,
      granularity,
    })
    .toArray();
}

/**
 * Get latest metrics for a specific platform
 */
export async function getLatestMetricsForPlatform(
  userId: string,
  accountId: string,
  platform: Platform,
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument | null> {
  const col = await getCollection();

  return col.findOne(
    { userId, accountId, platform, granularity },
    { sort: { date: -1 } }
  );
}

/**
 * Calculate growth vs previous period
 */
export async function calculateGrowthVsPrevious(
  userId: string,
  accountId: string,
  platform: Platform,
  currentMetrics: SocialMediaMetricsDocument["metrics"],
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument["growth"]> {
  const col = await getCollection();

  // Find previous metrics
  let previous = await col.findOne(
    { userId, accountId, platform, granularity },
    { sort: { date: -1 }, skip: 1 }
  );

  if (!previous) {
    // No previous data, return zero growth
    return {
      followerGrowth: 0,
      followerGrowthRate: 0,
      impressionGrowth: 0,
      impressionGrowthRate: 0,
      engagementGrowth: 0,
      engagementGrowthRate: 0,
    };
  }

  const prevMetrics = previous.metrics;

  const followerGrowth = currentMetrics.followers - prevMetrics.followers;
  const followerGrowthRate =
    prevMetrics.followers > 0
      ? (followerGrowth / prevMetrics.followers) * 100
      : 0;

  const impressionGrowth = currentMetrics.totalImpressions - prevMetrics.totalImpressions;
  const impressionGrowthRate =
    prevMetrics.totalImpressions > 0
      ? (impressionGrowth / prevMetrics.totalImpressions) * 100
      : 0;

  const engagementGrowth = currentMetrics.totalEngagements - prevMetrics.totalEngagements;
  const engagementGrowthRate =
    prevMetrics.totalEngagements > 0
      ? (engagementGrowth / prevMetrics.totalEngagements) * 100
      : 0;

  return {
    followerGrowth,
    followerGrowthRate: Math.round(followerGrowthRate * 100) / 100,
    impressionGrowth,
    impressionGrowthRate: Math.round(impressionGrowthRate * 100) / 100,
    engagementGrowth,
    engagementGrowthRate: Math.round(engagementGrowthRate * 100) / 100,
  };
}

/**
 * Get top post for a date range
 */
export async function getTopPostForPeriod(
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<SocialMediaMetricsDocument["topPost"] | null> {
  const col = await getCollection();

  const result = await col
    .find({
      userId,
      accountId,
      date: { $gte: startDate, $lte: endDate },
      topPost: { $exists: true },
    })
    .sort({ "topPost.engagementRate": -1 })
    .limit(1)
    .toArray();

  return result.length > 0 ? result[0].topPost ?? null : null;
}

/**
 * Get metrics aggregated across all platforms
 */
export async function getAggregatedMetrics(
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date,
  granularity: MetricsGranularity = "daily"
): Promise<
  Array<{
    date: Date;
    totalFollowers: number;
    totalImpressions: number;
    totalEngagements: number;
    totalClicks: number;
    platformCount: number;
  }>
> {
  const col = await getCollection();

  const results = await col
    .aggregate([
      {
        $match: {
          userId,
          accountId,
          date: { $gte: startDate, $lte: endDate },
          granularity,
        },
      },
      {
        $group: {
          _id: "$date",
          totalFollowers: { $sum: "$metrics.followers" },
          totalImpressions: { $sum: "$metrics.totalImpressions" },
          totalEngagements: { $sum: "$metrics.totalEngagements" },
          totalClicks: { $sum: "$metrics.totalClicks" },
          platformCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();

  return results.map((r) => ({
    date: r._id,
    totalFollowers: r.totalFollowers,
    totalImpressions: r.totalImpressions,
    totalEngagements: r.totalEngagements,
    totalClicks: r.totalClicks,
    platformCount: r.platformCount,
  }));
}

/**
 * Archive old metrics (delete from main collection)
 */
export async function archiveOldMetrics(
  daysOld: number = 90
): Promise<number> {
  const col = await getCollection();
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await col.deleteMany({
    createdAt: { $lt: cutoffDate },
    granularity: "hourly", // Only archive hourly metrics, keep daily
  });

  return result.deletedCount ?? 0;
}

/**
 * Get metrics by date (single snapshot)
 */
export async function getMetricsByDate(
  userId: string,
  accountId: string,
  date: Date,
  granularity: MetricsGranularity = "daily"
): Promise<SocialMediaMetricsDocument[]> {
  const col = await getCollection();

  // Normalize date to start of day/hour
  const startOfPeriod = new Date(date);
  if (granularity === "daily") {
    startOfPeriod.setHours(0, 0, 0, 0);
  } else {
    startOfPeriod.setMinutes(0, 0, 0);
  }

  const endOfPeriod = new Date(startOfPeriod);
  if (granularity === "daily") {
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);
  } else {
    endOfPeriod.setHours(endOfPeriod.getHours() + 1);
  }

  return col
    .find({
      userId,
      accountId,
      date: { $gte: startOfPeriod, $lt: endOfPeriod },
      granularity,
    })
    .toArray();
}

/**
 * Get trending metrics (biggest growth recently)
 */
export async function getTrendingMetrics(
  userId: string,
  accountId: string,
  days: number = 7
): Promise<
  Array<{
    platform: Platform;
    followerGrowth: number;
    followerGrowthRate: number;
    engagementGrowth: number;
  }>
> {
  const col = await getCollection();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await col
    .aggregate([
      {
        $match: {
          userId,
          accountId,
          date: { $gte: startDate },
          granularity: "daily",
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $group: {
          _id: "$platform",
          followerGrowth: { $first: "$growth.followerGrowth" },
          followerGrowthRate: { $first: "$growth.followerGrowthRate" },
          engagementGrowth: { $first: "$growth.engagementGrowth" },
          totalGrowth: {
            $sum: {
              $add: [
                "$growth.followerGrowth",
                "$growth.engagementGrowth",
              ],
            },
          },
        },
      },
      {
        $sort: { totalGrowth: -1 },
      },
    ])
    .toArray();

  return results.map((r) => ({
    platform: r._id,
    followerGrowth: r.followerGrowth,
    followerGrowthRate: r.followerGrowthRate,
    engagementGrowth: r.engagementGrowth,
  }));
}

/**
 * Get metrics by ID
 */
export async function getMetricsById(
  metricsId: string
): Promise<SocialMediaMetricsDocument | null> {
  if (!ObjectId.isValid(metricsId)) return null;
  const col = await getCollection();
  return col.findOne({ _id: new ObjectId(metricsId) });
}

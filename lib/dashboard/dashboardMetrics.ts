import { connectToDatabase } from "../mongodb";
import { getPeriodDates } from "../models/dashboardMetricsSnapshot";
import type { DashboardPeriodType } from "../models/dashboardConfig";
import type {
  DashboardMetricsSnapshotDocument,
  DashboardMetricDelta,
} from "../models/dashboardMetricsSnapshot";

const POSTS_COLLECTION = "postGenerations";
const IDEAS_COLLECTION = "savedIdeas";
const TEMPLATES_COLLECTION = "userSavedPostTemplates";
const METRICS_COLLECTION = "social_media_metrics";
const SOCIAL_POSTS_COLLECTION = "social_media_posts";

export function calculateDelta(current: number, previous: number): DashboardMetricDelta {
  if (previous === 0) {
    const growth = current > 0 ? 100 : 0;
    const trend = current > 0 ? "up" : "stable";
    return { current, previous, growth, trend };
  }

  const growth = ((current - previous) / previous) * 100;
  const trend = growth > 0.5 ? "up" : growth < -0.5 ? "down" : "stable";
  return {
    current,
    previous,
    growth: Number(growth.toFixed(1)),
    trend,
  };
}

function getPreviousPeriod(period: DashboardPeriodType) {
  const { startDate, endDate } = getPeriodDates(period);
  const duration = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { startDate: prevStart, endDate: prevEnd };
}

export async function buildDashboardKpiSnapshot(
  userId: string,
  accountId: string,
  period: DashboardPeriodType
): Promise<DashboardMetricsSnapshotDocument> {
  const { db } = await connectToDatabase();
  const { startDate, endDate } = getPeriodDates(period);
  const previous = getPreviousPeriod(period);

  const [
    currentGenerated,
    previousGenerated,
    currentPublished,
    previousPublished,
    currentIdeas,
    previousIdeas,
    currentTemplates,
    previousTemplates,
  ] = await Promise.all([
    db.collection(POSTS_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    db.collection(POSTS_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: previous.startDate, $lte: previous.endDate },
    }),
    db.collection(POSTS_COLLECTION).countDocuments({
      userId,
      accountId,
      status: "published",
      $or: [
        { publishedAt: { $gte: startDate, $lte: endDate } },
        { publishedAt: { $exists: false }, createdAt: { $gte: startDate, $lte: endDate } },
      ],
    }),
    db.collection(POSTS_COLLECTION).countDocuments({
      userId,
      accountId,
      status: "published",
      $or: [
        { publishedAt: { $gte: previous.startDate, $lte: previous.endDate } },
        {
          publishedAt: { $exists: false },
          createdAt: { $gte: previous.startDate, $lte: previous.endDate },
        },
      ],
    }),
    db.collection(IDEAS_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    db.collection(IDEAS_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: previous.startDate, $lte: previous.endDate },
    }),
    db.collection(TEMPLATES_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    db.collection(TEMPLATES_COLLECTION).countDocuments({
      userId,
      accountId,
      createdAt: { $gte: previous.startDate, $lte: previous.endDate },
    }),
  ]);

  const [currentRate, previousRate] = await Promise.all([
    db
      .collection(METRICS_COLLECTION)
      .aggregate([
        {
          $match: {
            userId,
            accountId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, avgRate: { $avg: "$metrics.averageEngagementRate" } } },
      ])
      .toArray(),
    db
      .collection(METRICS_COLLECTION)
      .aggregate([
        {
          $match: {
            userId,
            accountId,
            date: { $gte: previous.startDate, $lte: previous.endDate },
          },
        },
        { $group: { _id: null, avgRate: { $avg: "$metrics.averageEngagementRate" } } },
      ])
      .toArray(),
  ]);

  const currentEngagementRate = (currentRate[0]?.avgRate || 0) * 100;
  const previousEngagementRate = (previousRate[0]?.avgRate || 0) * 100;

  const [currentFollower, previousFollower] = await Promise.all([
    getFollowerGrowth(db, userId, accountId, startDate, endDate),
    getFollowerGrowth(db, userId, accountId, previous.startDate, previous.endDate),
  ]);

  const platformMetrics = await buildPlatformMetrics(db, userId, accountId, startDate, endDate);
  const engagementTrend = await buildEngagementTrend(db, userId, accountId, startDate, endDate);
  const followerTrend = await buildFollowerTrend(db, userId, accountId, startDate, endDate);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    userId,
    accountId,
    period: { startDate, endDate, periodType: period },
    kpis: {
      postsGenerated: calculateDelta(currentGenerated, previousGenerated),
      postsPublished: calculateDelta(currentPublished, previousPublished),
      avgEngagementRate: calculateDelta(currentEngagementRate, previousEngagementRate),
      followerGrowth: calculateDelta(currentFollower, previousFollower),
      templatesSaved: calculateDelta(currentTemplates, previousTemplates),
      ideasExplored: calculateDelta(currentIdeas, previousIdeas),
    },
    platformMetrics,
    engagementTrend,
    followerTrend,
    lastComputedAt: now,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };
}

async function getFollowerGrowth(
  db: any,
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const first = await db
    .collection(METRICS_COLLECTION)
    .find({ userId, accountId, date: { $gte: startDate, $lte: endDate } })
    .sort({ date: 1 })
    .limit(1)
    .toArray();

  const last = await db
    .collection(METRICS_COLLECTION)
    .find({ userId, accountId, date: { $gte: startDate, $lte: endDate } })
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  const firstValue = first[0]?.metrics?.followers || 0;
  const lastValue = last[0]?.metrics?.followers || 0;
  return lastValue - firstValue;
}

async function buildPlatformMetrics(
  db: any,
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  const metrics = await db
    .collection(METRICS_COLLECTION)
    .aggregate([
      {
        $match: { userId, accountId, date: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: "$platform",
          impressions: { $sum: "$metrics.totalImpressions" },
          engagement: { $sum: "$metrics.totalEngagements" },
          engagementRate: { $avg: "$metrics.averageEngagementRate" },
        },
      },
    ])
    .toArray();

  const posts = await db
    .collection(SOCIAL_POSTS_COLLECTION)
    .aggregate([
      {
        $match: { userId, accountId, postedAt: { $gte: startDate, $lte: endDate } },
      },
      { $group: { _id: "$platform", posts: { $sum: 1 } } },
    ])
    .toArray();

  const postMap: Record<string, number> = {};
  posts.forEach((row: any) => {
    postMap[row._id] = row.posts || 0;
  });

  const platformMetrics: Record<string, { impressions: number; engagement: number; engagementRate: number; posts: number }> = {};
  metrics.forEach((row: any) => {
    platformMetrics[row._id] = {
      impressions: row.impressions || 0,
      engagement: row.engagement || 0,
      engagementRate: Number(((row.engagementRate || 0) * 100).toFixed(2)),
      posts: postMap[row._id] || 0,
    };
  });

  return platformMetrics;
}

async function buildEngagementTrend(
  db: any,
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  const rows = await db
    .collection(METRICS_COLLECTION)
    .find({
      userId,
      accountId,
      date: { $gte: startDate, $lte: endDate },
      granularity: "daily",
    })
    .sort({ date: 1 })
    .limit(30)
    .toArray();

  return rows.map((row: any) => ({
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
    value: Number(((row.metrics?.averageEngagementRate || 0) * 100).toFixed(2)),
  }));
}

async function buildFollowerTrend(
  db: any,
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  const rows = await db
    .collection(METRICS_COLLECTION)
    .find({
      userId,
      accountId,
      date: { $gte: startDate, $lte: endDate },
      granularity: "daily",
    })
    .sort({ date: 1 })
    .limit(30)
    .toArray();

  return rows.map((row: any) => ({
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
    value: row.metrics?.followers || 0,
  }));
}

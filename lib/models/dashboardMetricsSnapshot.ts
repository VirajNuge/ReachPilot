import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";
import type { DashboardPeriodType } from "./dashboardConfig";

export type DashboardTrend = "up" | "down" | "stable";

export interface DashboardMetricDelta {
  current: number;
  previous: number;
  growth: number;
  trend: DashboardTrend;
}

export interface DashboardMetricsSnapshotDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  period: {
    startDate: Date;
    endDate: Date;
    periodType: DashboardPeriodType;
  };
  kpis: {
    postsGenerated: DashboardMetricDelta;
    postsPublished: DashboardMetricDelta;
    avgEngagementRate: DashboardMetricDelta;
    followerGrowth: DashboardMetricDelta;
    templatesSaved: DashboardMetricDelta;
    ideasExplored: DashboardMetricDelta;
  };
  platformMetrics: Record<string, {
    impressions: number;
    engagement: number;
    engagementRate: number;
    posts: number;
  }>;
  engagementTrend: Array<{ date: string; value: number }>;
  followerTrend: Array<{ date: string; value: number }>;
  lastComputedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "dashboard_metrics_snapshots";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<DashboardMetricsSnapshotDocument>(COLLECTION);
}

export async function ensureDashboardMetricsIndexes(): Promise<void> {
  const col = await getCollection();
  await Promise.all([
    col.createIndex({ userId: 1, accountId: 1, "period.periodType": 1 }),
    col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export function getPeriodDates(periodType: DashboardPeriodType) {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (periodType === "7days") {
    startDate.setDate(endDate.getDate() - 7);
  } else if (periodType === "30days") {
    startDate.setDate(endDate.getDate() - 30);
  } else if (periodType === "90days") {
    startDate.setDate(endDate.getDate() - 90);
  } else {
    startDate.setDate(endDate.getDate() - 365);
  }

  return { startDate, endDate };
}

function emptyDelta(): DashboardMetricDelta {
  return { current: 0, previous: 0, growth: 0, trend: "stable" };
}

export function buildEmptyDashboardMetricsSnapshot(
  userId: string,
  accountId: string,
  periodType: DashboardPeriodType
): DashboardMetricsSnapshotDocument {
  const { startDate, endDate } = getPeriodDates(periodType);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    userId,
    accountId,
    period: {
      startDate,
      endDate,
      periodType,
    },
    kpis: {
      postsGenerated: emptyDelta(),
      postsPublished: emptyDelta(),
      avgEngagementRate: emptyDelta(),
      followerGrowth: emptyDelta(),
      templatesSaved: emptyDelta(),
      ideasExplored: emptyDelta(),
    },
    platformMetrics: {},
    engagementTrend: [],
    followerTrend: [],
    lastComputedAt: now,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getDashboardMetricsSnapshot(
  userId: string,
  accountId: string,
  periodType: DashboardPeriodType
): Promise<DashboardMetricsSnapshotDocument | null> {
  const col = await getCollection();
  const doc = await col.findOne({
    userId,
    accountId,
    "period.periodType": periodType,
  });

  if (!doc) return null;
  if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
    return null;
  }
  return doc;
}

export async function saveDashboardMetricsSnapshot(
  snapshot: DashboardMetricsSnapshotDocument
): Promise<void> {
  const col = await getCollection();
  await col.replaceOne(
    {
      userId: snapshot.userId,
      accountId: snapshot.accountId,
      "period.periodType": snapshot.period.periodType,
    },
    {
      ...snapshot,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

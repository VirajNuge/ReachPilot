import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type DashboardPeriodType = "7days" | "30days" | "90days" | "all";
export type DashboardTheme = "light" | "dark";

export interface DashboardLayoutConfig {
  columns: 2 | 3 | 4;
  sectionOrder: string[];
  hiddenSections: string[];
  sectionSizes: Record<string, number>;
}

export interface DashboardTimeRangeConfig {
  default: DashboardPeriodType;
  activityFeedDays: number;
  analyticsLookback: number;
  calendarDaysAhead: number;
}

export interface DashboardPlatformFilterConfig {
  selected: string[];
  allSelected: boolean;
}

export interface DashboardKpiConfig {
  selected: string[];
  comparisonPeriod: "previous_period" | "last_year";
}

export interface DashboardAutoRefreshConfig {
  enabled: boolean;
  kpiInterval: number;
  analyticsInterval: number;
  activityInterval: number;
}

export interface DashboardConfigDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  layout: DashboardLayoutConfig;
  timeRange: DashboardTimeRangeConfig;
  platforms: DashboardPlatformFilterConfig;
  kpis: DashboardKpiConfig;
  autoRefresh: DashboardAutoRefreshConfig;
  theme: DashboardTheme;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "dashboard_configurations";

const DEFAULT_SECTION_ORDER = [
  "kpi",
  "activity",
  "analytics",
  "calendar",
  "posts",
  "ideas",
  "templates",
  "profile",
  "publishing",
  "recommendations",
];

const DEFAULT_KPIS = [
  "posts_generated",
  "posts_published",
  "engagement_rate",
  "follower_growth",
  "templates_saved",
  "ideas_explored",
];

export function buildDefaultDashboardConfig(
  userId: string,
  accountId: string
): DashboardConfigDocument {
  const now = new Date();
  return {
    userId,
    accountId,
    layout: {
      columns: 2,
      sectionOrder: DEFAULT_SECTION_ORDER,
      hiddenSections: [],
      sectionSizes: {
        kpi: 4,
        activity: 2,
        analytics: 2,
        calendar: 2,
        posts: 4,
        ideas: 2,
        templates: 1,
        profile: 1,
        publishing: 1,
        recommendations: 4,
      },
    },
    timeRange: {
      default: "7days",
      activityFeedDays: 7,
      analyticsLookback: 30,
      calendarDaysAhead: 14,
    },
    platforms: {
      selected: ["linkedin", "x", "instagram"],
      allSelected: false,
    },
    kpis: {
      selected: DEFAULT_KPIS,
      comparisonPeriod: "previous_period",
    },
    autoRefresh: {
      enabled: true,
      kpiInterval: 300,
      analyticsInterval: 900,
      activityInterval: 120,
    },
    theme: "light",
    createdAt: now,
    updatedAt: now,
  };
}

function mergeDashboardConfig(
  base: DashboardConfigDocument,
  updates: Partial<DashboardConfigDocument>
): DashboardConfigDocument {
  return {
    ...base,
    ...updates,
    layout: {
      ...base.layout,
      ...(updates.layout || {}),
    },
    timeRange: {
      ...base.timeRange,
      ...(updates.timeRange || {}),
    },
    platforms: {
      ...base.platforms,
      ...(updates.platforms || {}),
    },
    kpis: {
      ...base.kpis,
      ...(updates.kpis || {}),
    },
    autoRefresh: {
      ...base.autoRefresh,
      ...(updates.autoRefresh || {}),
    },
    updatedAt: new Date(),
  };
}

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<DashboardConfigDocument>(COLLECTION);
}

export async function ensureDashboardConfigIndexes(): Promise<void> {
  const col = await getCollection();
  await Promise.all([
    col.createIndex({ userId: 1, accountId: 1 }, { unique: true }),
    col.createIndex({ userId: 1, updatedAt: -1 }),
  ]);
}

export async function getDashboardConfig(
  userId: string,
  accountId: string
): Promise<DashboardConfigDocument | null> {
  const col = await getCollection();
  return col.findOne({ userId, accountId });
}

export async function upsertDashboardConfig(
  userId: string,
  accountId: string,
  updates: Partial<DashboardConfigDocument>
): Promise<DashboardConfigDocument> {
  const existing = await getDashboardConfig(userId, accountId);
  const base = existing || buildDefaultDashboardConfig(userId, accountId);
  const nextConfig = mergeDashboardConfig(base, updates);

  const col = await getCollection();
  await col.replaceOne({ userId, accountId }, nextConfig, { upsert: true });

  return nextConfig;
}

export async function resetDashboardConfig(
  userId: string,
  accountId: string
): Promise<DashboardConfigDocument> {
  const defaultConfig = buildDefaultDashboardConfig(userId, accountId);
  const col = await getCollection();
  await col.replaceOne({ userId, accountId }, defaultConfig, { upsert: true });
  return defaultConfig;
}

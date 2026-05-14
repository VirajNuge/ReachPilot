import type { PlatformKey } from "./platforms";
import type {
  AnalyticsDataset,
  AnalyticsSummaryResponse,
  DateRangeKey,
} from "./types";
import {
  ANALYTICS_DATA,
  HISTORY_DATA,
  PREDICTION_DATA,
  RADAR_DATA,
  CONTENT_INSIGHTS,
  DEMOGRAPHICS_DATA,
  ANOMALY_DATA,
  TOP_POSTS_DATA,
} from "@/app/pages/appPages/components/Analytics/mockData";
import { normalizeAnalyticsPayload } from "./normalizers";

export function buildMockAnalyticsDataset(platform: PlatformKey): AnalyticsDataset {
  const correlation =
    platform === "all"
      ? undefined
      : {
          platformA: platform,
          platformB: "twitter" as PlatformKey,
          series: HISTORY_DATA.map((point) => ({
            date: point.date as string,
            platformA: typeof point[platform] === "number" ? (point[platform] as number) : 0,
            platformB: typeof point.twitter === "number" ? point.twitter : 0,
          })),
        };
  return normalizeAnalyticsPayload({
    platform,
    vitals: ANALYTICS_DATA[platform] ?? ANALYTICS_DATA.all,
    history: HISTORY_DATA,
    prediction: PREDICTION_DATA,
    radar: RADAR_DATA[platform] ?? RADAR_DATA.all,
    contentInsights: CONTENT_INSIGHTS[platform] ?? CONTENT_INSIGHTS.all,
    demographics: DEMOGRAPHICS_DATA[platform] ?? DEMOGRAPHICS_DATA.all,
    anomalies: ANOMALY_DATA as any[],
    topPosts: TOP_POSTS_DATA,
    correlation,
  });
}

export function buildMockAnalyticsSummary(
  platform: PlatformKey,
  dateRange: DateRangeKey,
  plan: "core" | "pro",
): AnalyticsSummaryResponse {
  const globalData = buildMockAnalyticsDataset("all");
  const platformData = platform === "all" ? null : buildMockAnalyticsDataset(platform);

  return {
    platform,
    dateRange,
    plan,
    generatedAt: new Date().toISOString(),
    globalData,
    platformData,
  };
}

import type { PlatformKey } from "./platforms";

export type DateRangeKey = "7D" | "30D" | "90D";

export interface UnifiedMetric {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  growthRate: number;
}

export interface VelocityMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  velocity: "high" | "medium" | "low";
}

export interface ContentInsight {
  id: number;
  format: string;
  performance: number;
  engagement: string;
  insight: string;
  action: string;
}

export interface RadarPoint {
  subject: string;
  A: number;
  fullMark: number;
}

export interface DemographicJob {
  name: string;
  value: number;
}

export interface DemographicLocation {
  city: string;
  percent: number;
}

export interface DemographicsSnapshot {
  jobs: DemographicJob[];
  locations: DemographicLocation[];
  seniority: string;
}

export interface AnomalyPoint {
  date: string;
  type: "spike" | "drop";
  value: number;
  icon: string;
  reason: string;
}

export interface PredictionPoint {
  date: string;
  [platform: string]: number | string;
}

export interface HistoryPoint {
  date: string;
  [platform: string]: number | string;
}

export interface TopPost {
  id: number;
  headline: string;
  format: string;
  stats: {
    views: string;
    engagement: string;
  };
  score: number;
  whyItWorked: string;
}

export interface PostEvent {
  postId: string;
  platform: string;
  postedAt: string; // ISO date
  thumbnail?: string | null;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
}

export interface BestPost {
  postId: string;
  platform: string;
  postedAt: string;
  thumbnail?: string | null;
  caption?: string;
  metricValue: number;
}

export interface CorrelationSeriesPoint {
  date: string;
  platformA: number;
  platformB: number;
}

export interface CorrelationSeries {
  platformA: PlatformKey;
  platformB: PlatformKey;
  series: CorrelationSeriesPoint[];
}

export interface AnalyticsVitals {
  audience: VelocityMetric;
  reach: VelocityMetric;
  engagement: VelocityMetric;
  clicks: VelocityMetric;
  comments?: VelocityMetric;
  shares?: VelocityMetric;
  topDriver?: string;
}

export interface AnalyticsDataset {
  vitals: AnalyticsVitals;
  history: HistoryPoint[];
  prediction: PredictionPoint[];
  radar: RadarPoint[];
  contentInsights: ContentInsight[];
  demographics: DemographicsSnapshot;
  anomalies: AnomalyPoint[];
  topPosts: TopPost[];
  correlation?: CorrelationSeries;
  postEvents?: PostEvent[];
  bestPosts30d?: BestPost[];
}

export interface AnalyticsSummaryResponse {
  platform: PlatformKey;
  dateRange: DateRangeKey;
  plan: "core" | "pro";
  generatedAt: string;
  globalData: AnalyticsDataset;
  platformData: AnalyticsDataset | null;
}

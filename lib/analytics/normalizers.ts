import type { PlatformKey } from "./platforms";
import type {
  AnalyticsDataset,
  AnomalyPoint,
  ContentInsight,
  DemographicsSnapshot,
  HistoryPoint,
  PredictionPoint,
  RadarPoint,
  TopPost,
  VelocityMetric,
  AnalyticsVitals,
  CorrelationSeries,
} from "./types";

export interface UnifiedMetricInput {
  impressions?: number | null;
  engagements?: number | null;
  clicks?: number | null;
  shares?: number | null;
  growthRate?: number | null;
}

export interface RawAnalyticsPayload {
  platform: PlatformKey;
  vitals?: Partial<AnalyticsVitals> | null;
  history?: HistoryPoint[] | null;
  prediction?: PredictionPoint[] | null;
  radar?: RadarPoint[] | null;
  contentInsights?: ContentInsight[] | null;
  demographics?: DemographicsSnapshot | null;
  anomalies?: AnomalyPoint[] | null;
  topPosts?: TopPost[] | null;
  correlation?: CorrelationSeries | null;
}

const EMPTY_VELOCITY: VelocityMetric = {
  id: "0",
  label: "",
  value: "0",
  change: 0,
  trend: "neutral",
  velocity: "low",
};

const EMPTY_VITALS: AnalyticsVitals = {
  audience: EMPTY_VELOCITY,
  reach: EMPTY_VELOCITY,
  engagement: EMPTY_VELOCITY,
  clicks: EMPTY_VELOCITY,
};

const EMPTY_DATASET: AnalyticsDataset = {
  vitals: EMPTY_VITALS,
  history: [],
  prediction: [],
  radar: [],
  contentInsights: [],
  demographics: { jobs: [], locations: [], seniority: "" },
  anomalies: [],
  topPosts: [],
};

export function normalizeVelocityMetric(metric?: Partial<VelocityMetric> | null): VelocityMetric {
  return {
    id: metric?.id ?? "0",
    label: metric?.label ?? "",
    value: metric?.value ?? "0",
    change: metric?.change ?? 0,
    trend: metric?.trend ?? "neutral",
    velocity: metric?.velocity ?? "low",
  };
}

export function normalizeAnalyticsPayload(
  payload?: RawAnalyticsPayload | null,
): AnalyticsDataset {
  if (!payload) return { ...EMPTY_DATASET };

  return {
    vitals: {
      audience: normalizeVelocityMetric(payload.vitals?.audience),
      reach: normalizeVelocityMetric(payload.vitals?.reach),
      engagement: normalizeVelocityMetric(payload.vitals?.engagement),
      clicks: normalizeVelocityMetric(payload.vitals?.clicks),
      topDriver: payload.vitals?.topDriver,
    },
    history: payload.history ?? [],
    prediction: payload.prediction ?? [],
    radar: payload.radar ?? [],
    contentInsights: payload.contentInsights ?? [],
    demographics: payload.demographics ?? { jobs: [], locations: [], seniority: "" },
    anomalies: payload.anomalies ?? [],
    topPosts: payload.topPosts ?? [],
    correlation: payload.correlation ?? undefined,
  };
}

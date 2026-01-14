// 1. Platform Keys
export type PlatformKey =
  | "all"
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "threads"
  | "pinterest";

// 2. Velocity Metrics (For the "Live Vitals" Cards)
// This replaces the old 'KPIMetric' to support the velocity badge
export interface VelocityMetric {
  id: string;
  label: string;
  value: string; // e.g., "12.5k"
  change: number; // e.g., 12.5
  trend: "up" | "down" | "neutral";
  velocity: "high" | "medium" | "low"; // ⭐ CRITICAL: The "Next Level" indicator
}

// 3. Content Intelligence (For the "Content DNA" Table)
export interface ContentInsight {
  id: number;
  format: string; // e.g., "Carousel", "Reel"
  performance: number; // Score 0-100
  engagement: string; // e.g., "8.2%"
  insight: string; // The AI Analysis text
  action: string; // The Button text (e.g., "Create Carousel")
}

// 4. Page State (Optional helper)
export interface AnalyticsState {
  selectedPlatform: PlatformKey;
  dateRange: "7d" | "30d" | "90d";
}

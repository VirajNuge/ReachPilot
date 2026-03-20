import { RawAnalysisData } from "./types/analysis";

export interface PulseScoreBreakdown {
  profileHealth: number;
  contentFitness: number;
  engagementPower: number;
  audienceWarmth: number;
  growthMomentum: number;
}

export interface PulseScoreResult {
  totalScore: number;
  breakdown: PulseScoreBreakdown;
  grade: { label: string; color: string };
}

export function computePulseScore(data: RawAnalysisData): PulseScoreResult {
  const profileHealth = data.profile?.profileScore ?? 50;
  const contentFitness = data.csiScore ?? 50;
  const engagementPower = data.contentMetrics?.engagementScore ?? 30;
  const audienceWarmth = data.audienceTemperature?.tempScore ?? 50;

  // Normalise growth: map -20%..+40% range → 0..100
  const rawGrowth = data.growthTrajectory?.changePercent ?? 0;
  const growthMomentum = Math.min(100, Math.max(0, ((rawGrowth + 20) / 60) * 100));

  // Weighted composite (weights sum to 1.0)
  const totalScore = Math.round(
    profileHealth   * 0.15 +
    contentFitness  * 0.30 +
    engagementPower * 0.30 +
    audienceWarmth  * 0.15 +
    growthMomentum  * 0.10,
  );

  const breakdown: PulseScoreBreakdown = {
    profileHealth,
    contentFitness,
    engagementPower,
    audienceWarmth,
    growthMomentum: Math.round(growthMomentum),
  };

  return { totalScore, breakdown, grade: getGrade(totalScore) };
}

export function getGrade(s: number): { label: string; color: string } {
  if (s >= 90) return { label: "S", color: "#B6FF33" };
  if (s >= 80) return { label: "A", color: "#0052FF" };
  if (s >= 65) return { label: "B", color: "#0052FF" };
  if (s >= 50) return { label: "C", color: "#1A1D23" };
  if (s >= 35) return { label: "D", color: "#EF4444" };
  return        { label: "F", color: "#EF4444" };
}

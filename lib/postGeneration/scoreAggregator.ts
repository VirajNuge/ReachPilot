import type { ContentScore, PostPlatform } from "@/lib/types/postGeneration";

export type PlatformScoreMap = Partial<Record<PostPlatform, ContentScore>>;

function round(value: number): number {
  return Math.round(value);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function aggregatePlatformScores(scoreMap: PlatformScoreMap): ContentScore | null {
  const entries = Object.entries(scoreMap).filter((entry): entry is [PostPlatform, ContentScore] => Boolean(entry[1]));
  if (entries.length === 0) return null;

  const scores = entries.map(([, score]) => score);

  const feedback = entries
    .map(([platform, score]) => `${platform}: ${score.feedback}`)
    .filter((line) => line.trim().length > 0)
    .join(" | ");

  return {
    hookStrength: round(average(scores.map((score) => score.hookStrength))),
    clarity: round(average(scores.map((score) => score.clarity))),
    engagementPotential: round(average(scores.map((score) => score.engagementPotential))),
    virality: round(average(scores.map((score) => score.virality))),
    overall: round(average(scores.map((score) => score.overall))),
    feedback: feedback || "Auto analytics completed.",
  };
}


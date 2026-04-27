import { describe, expect, it } from "vitest";
import { aggregatePlatformScores } from "./scoreAggregator";

describe("aggregatePlatformScores", () => {
  it("returns null when no platform scores exist", () => {
    expect(aggregatePlatformScores({})).toBeNull();
  });

  it("averages metrics and merges feedback", () => {
    const aggregated = aggregatePlatformScores({
      linkedin: {
        hookStrength: 90,
        clarity: 80,
        engagementPotential: 70,
        virality: 60,
        overall: 75,
        feedback: "Strong hook",
      },
      x: {
        hookStrength: 70,
        clarity: 90,
        engagementPotential: 80,
        virality: 70,
        overall: 78,
        feedback: "Great clarity",
      },
    });

    expect(aggregated).toEqual({
      hookStrength: 80,
      clarity: 85,
      engagementPotential: 75,
      virality: 65,
      overall: 77,
      feedback: "linkedin: Strong hook | x: Great clarity",
    });
  });
});


import { describe, expect, it } from "vitest";
import { flattenGroupedHashtags, normalizeGroupedHashtags } from "./hashtags";

describe("hashtags helpers", () => {
  it("normalizes, dedupes, and preserves group ordering", () => {
    const grouped = normalizeGroupedHashtags({
      highReach: ["#Growth", " growth ", "##B2B"],
      niche: ["#b2b", "#RevenueOps"],
      branded: ["ReachPilot", "#Growth"],
    });

    expect(grouped).toEqual({
      highReach: ["#Growth", "#B2B"],
      niche: ["#RevenueOps"],
      branded: ["#ReachPilot"],
    });
  });

  it("flattens groups as highReach -> niche -> branded", () => {
    const flattened = flattenGroupedHashtags({
      highReach: ["#one"],
      niche: ["#two"],
      branded: ["#three"],
    });

    expect(flattened).toEqual(["#one", "#two", "#three"]);
  });
});


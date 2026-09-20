import { describe, expect, it } from "vitest";
import {
  getDashboardGridSpan,
  orderDashboardSections,
  type DashboardSectionDefinition,
} from "./types";

const definitions: DashboardSectionDefinition[] = [
  { id: "analytics", title: "Analytics", defaultVisible: true, defaultSpan: 1, render: () => null },
  { id: "publishing", title: "Publishing", defaultVisible: true, defaultSpan: 1, render: () => null },
  { id: "activity", title: "Activity", defaultVisible: true, defaultSpan: 1, render: () => null },
];

describe("dashboard section registry", () => {
  it("applies the saved order and appends new sections safely", () => {
    const ordered = orderDashboardSections(["activity", "missing"], definitions);
    expect(ordered.map((section) => section.id)).toEqual(["activity", "analytics", "publishing"]);
  });

  it("maps legacy section sizes to the configured column count", () => {
    expect(getDashboardGridSpan(definitions[0], { analytics: 4 }, 3)).toBe(3);
    expect(getDashboardGridSpan(definitions[0], { analytics: 1 }, 3)).toBe(1);
    expect(getDashboardGridSpan(definitions[0], undefined, 2)).toBe(1);
  });
});

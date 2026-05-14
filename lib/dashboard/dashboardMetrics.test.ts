import { describe, it, expect } from "vitest";
import { calculateDelta } from "./dashboardMetrics";
import { getPeriodDates } from "../models/dashboardMetricsSnapshot";

function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

describe("dashboardMetrics helpers", () => {
  it("calculates a positive delta", () => {
    const result = calculateDelta(120, 100);
    expect(result.trend).toBe("up");
    expect(result.growth).toBe(20);
  });

  it("calculates a negative delta", () => {
    const result = calculateDelta(80, 100);
    expect(result.trend).toBe("down");
    expect(result.growth).toBe(-20);
  });

  it("handles a zero previous value", () => {
    const result = calculateDelta(10, 0);
    expect(result.trend).toBe("up");
    expect(result.growth).toBe(100);
  });

  it("returns stable when growth is near zero", () => {
    const result = calculateDelta(100, 100);
    expect(result.trend).toBe("stable");
    expect(result.growth).toBe(0);
  });

  it("getPeriodDates returns expected ranges", () => {
    const seven = getPeriodDates("7days");
    const thirty = getPeriodDates("30days");
    const ninety = getPeriodDates("90days");

    expect(daysBetween(seven.startDate, seven.endDate)).toBeGreaterThanOrEqual(6);
    expect(daysBetween(thirty.startDate, thirty.endDate)).toBeGreaterThanOrEqual(29);
    expect(daysBetween(ninety.startDate, ninety.endDate)).toBeGreaterThanOrEqual(89);
  });
});

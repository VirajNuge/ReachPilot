import { describe, it, expect } from "vitest";
import { buildDefaultDashboardConfig } from "./dashboardConfig";

describe("dashboardConfig defaults", () => {
  it("builds default configuration with expected fields", () => {
    const config = buildDefaultDashboardConfig("user-1", "account-1");

    expect(config.userId).toBe("user-1");
    expect(config.accountId).toBe("account-1");
    expect(config.layout.columns).toBe(2);
    expect(config.layout.sectionOrder.length).toBeGreaterThan(0);
    expect(config.kpis.selected.length).toBeGreaterThan(0);
    expect(config.timeRange.default).toBe("7days");
    expect(config.autoRefresh.enabled).toBe(true);
  });
});

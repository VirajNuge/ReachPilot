import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("post generation feature flags", () => {
  it("respects explicit env overrides", async () => {
    process.env.POSTGEN_AUTO_ANALYTICS = "false";
    process.env.POSTGEN_PLATFORM_WRITING_STYLE_MAP = "1";
    process.env.POSTGEN_CREATIVE_DIRECTOR_STAGE = "0";

    const flags = await import("./featureFlags");
    expect(flags.POSTGEN_AUTO_ANALYTICS).toBe(false);
    expect(flags.POSTGEN_PLATFORM_WRITING_STYLE_MAP).toBe(true);
    expect(flags.POSTGEN_CREATIVE_DIRECTOR_STAGE).toBe(false);
  });
});


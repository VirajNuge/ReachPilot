import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/analytics/platforms";
import type { AnalyticsSummaryResponse, DateRangeKey } from "@/lib/analytics/types";
import { buildRealAnalyticsSummary } from "@/lib/analytics/realDataAdapter";
import {
  initializeCache,
  buildCacheKey,
  getCachedAnalytics,
  setCachedAnalytics,
  getCacheStats,
} from "@/lib/analytics/cacheLayer";
import { productionMetrics, errorTracker } from "@/lib/analytics/productionMonitoring";

// Initialize cache on module load
try {
  initializeCache(50, 100); // 50MB max, 100 entries
} catch (e) {
  // Already initialized
}

function parsePlatform(value: string | null): PlatformKey {
  if (!value) return "all";
  return PLATFORM_KEYS.includes(value as PlatformKey)
    ? (value as PlatformKey)
    : "all";
}

function parseRange(value: string | null): DateRangeKey {
  if (!value) return "30D";
  const normalized = value.toUpperCase();
  if (normalized === "7D" || normalized === "30D" || normalized === "90D") {
    return normalized;
  }
  return "30D";
}

function parsePlan(value: string | null): "core" | "pro" {
  return value === "pro" ? "pro" : "core";
}

function sliceByRange<T>(data: T[], range: DateRangeKey): T[] {
  const limit = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  if (data.length <= limit) return data;
  return data.slice(-limit);
}

function withRangeLimits(
  summary: AnalyticsSummaryResponse,
  range: DateRangeKey,
): AnalyticsSummaryResponse {
  const applyRange = (dataset: AnalyticsSummaryResponse["globalData"]) => ({
    ...dataset,
    history: sliceByRange(dataset.history, range),
    prediction: sliceByRange(dataset.prediction, range),
  });

  return {
    ...summary,
    globalData: applyRange(summary.globalData),
    platformData: summary.platformData ? applyRange(summary.platformData) : null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = performance.now();
  const { searchParams } = new URL(request.url);
  const platform = parsePlatform(searchParams.get("platform"));
  const requestedRange = parseRange(searchParams.get("range"));
  const plan = parsePlan(searchParams.get("plan"));
  const accountId = searchParams.get("accountId") ?? "";

  const effectiveRange = plan === "core" ? "7D" : requestedRange;
  const cacheKey = buildCacheKey(auth.userId, accountId, platform, effectiveRange, plan);

  const cached = getCachedAnalytics(cacheKey);
  if (cached) {
    const duration = performance.now() - startTime;
    productionMetrics.recordRequest(request.url, duration, 200, true);

    const response = NextResponse.json(cached);
    response.headers.set("X-Cache", "HIT");
    return response;
  }

  let summary: AnalyticsSummaryResponse;

  try {
    summary = await buildRealAnalyticsSummary(
      auth.userId,
      accountId,
      platform,
      effectiveRange,
      plan
    );
  } catch (error) {
    errorTracker.trackError("analytics-summary", String(error), "medium");
    console.error("Real analytics data fetch failed:", error);
    return NextResponse.json({ error: "Failed to generate analytics summary" }, { status: 500 });
  }

  const rangedSummary = withRangeLimits(summary, effectiveRange);
  setCachedAnalytics(cacheKey, rangedSummary);

  const duration = performance.now() - startTime;
  productionMetrics.recordRequest(request.url, duration, 200, false);

  const response = NextResponse.json(rangedSummary);
  response.headers.set("X-Cache", "MISS");
  return response;
}

/**
 * GET /api/analytics/cache-stats
 */
export async function OPTIONS(request: NextRequest) {
  // Health check endpoint
  if (request.url.includes("cache-stats")) {
    const stats = getCacheStats();
    return NextResponse.json(stats);
  }

  return NextResponse.json({ ok: true });
}

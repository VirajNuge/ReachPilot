import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/analytics/platforms";
import type { AnalyticsSummaryResponse, DateRangeKey } from "@/lib/analytics/types";
import { buildMockAnalyticsSummary } from "@/lib/analytics/mockDataAdapter";
import { buildRealAnalyticsSummary } from "@/lib/analytics/realDataAdapter";
import {
  initializeCache,
  buildCacheKey,
  getCachedAnalytics,
  setCachedAnalytics,
  getCacheStats,
} from "@/lib/analytics/cacheLayer";
import { queueFullAccountSync } from "@/lib/analytics/backgroundSyncService";
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
  const auth = await getAuthFromCookies();
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

  // Check multi-level cache
  let cached = getCachedAnalytics(cacheKey);
  if (cached) {
    const duration = performance.now() - startTime;
    productionMetrics.recordRequest(request.url, duration, 200, true);
    
    const response = NextResponse.json(cached);
    response.headers.set("X-Cache", "HIT");
    return response;
  }

  let summary: AnalyticsSummaryResponse;

  try {
    // Try to fetch real data first
    summary = await buildRealAnalyticsSummary(
      auth.userId,
      accountId,
      platform,
      effectiveRange,
      plan
    );

    // Queue background sync for next refresh
    if (accountId) {
      try {
        queueFullAccountSync(auth.userId, accountId);
      } catch (e) {
        // Silently fail if queuing fails
      }
    }
  } catch (error) {
    // Fallback to mock data if real data fetch fails
    errorTracker.trackError("analytics-summary", String(error), "medium");
    console.warn(
      "Real analytics data fetch failed, falling back to mock data:",
      error
    );
    summary = buildMockAnalyticsSummary(platform, effectiveRange, plan);
  }

  summary = withRangeLimits(summary, effectiveRange);

  if (plan === "core") {
    summary = {
      ...summary,
      platformData: null,
    };
  }

  // Cache with 1-hour TTL
  setCachedAnalytics(cacheKey, summary, 1000 * 60 * 60);

  const duration = performance.now() - startTime;
  productionMetrics.recordRequest(request.url, duration, 200, false);

  const response = NextResponse.json(summary);
  response.headers.set("X-Cache", "MISS");
  response.headers.set("X-Response-Time", `${duration.toFixed(2)}ms`);
  return response;
}

/**
 * Optional: Cache statistics endpoint
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

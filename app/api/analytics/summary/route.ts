import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/analytics/platforms";
import type { AnalyticsSummaryResponse, DateRangeKey } from "@/lib/analytics/types";
import { buildMockAnalyticsSummary } from "@/lib/analytics/mockDataAdapter";

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const memoryCache = new Map<
  string,
  { expiresAt: number; payload: AnalyticsSummaryResponse }
>();

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

  const { searchParams } = new URL(request.url);
  const platform = parsePlatform(searchParams.get("platform"));
  const requestedRange = parseRange(searchParams.get("range"));
  const plan = parsePlan(searchParams.get("plan"));
  const accountId = searchParams.get("accountId") ?? "";

  const effectiveRange = plan === "core" ? "7D" : requestedRange;
  const cacheKey = `${auth.userId}:${accountId}:${platform}:${effectiveRange}:${plan}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload);
  }

  let summary = buildMockAnalyticsSummary(platform, effectiveRange, plan);
  summary = withRangeLimits(summary, effectiveRange);

  if (plan === "core") {
    summary = {
      ...summary,
      platformData: null,
    };
  }

  memoryCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    payload: summary,
  });

  return NextResponse.json(summary);
}

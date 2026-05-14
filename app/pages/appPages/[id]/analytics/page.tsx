"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, AlertCircle, BarChart3 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// --- COMPONENT IMPORTS ---
import PlatformFilter from "../../components/Analytics/PlatformFilter";

// Removed AI-generated sections (CopyCatEngine, ContentDNATable, AudienceDeepDive)
// per user request to hide generated content across tabs.

const ComparisonEngine = dynamic(() => import("../../components/Analytics/ComparisonEngine"), {
  ssr: false,
  loading: () => <div className="h-[240px] rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] animate-pulse" />,
});

const OverviewDashboard = dynamic(() => import("../../components/Analytics/OverviewDashboard"), {
  ssr: false,
  loading: () => <div className="h-[720px] rounded-[32px] border border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] animate-pulse" />,
});

const PlatformTabDashboard = dynamic(() => import("../../components/Analytics/PlatformTabDashboard"), {
  ssr: false,
  loading: () => <div className="h-[720px] rounded-[32px] border border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] animate-pulse" />,
});

// --- TYPE IMPORTS ---
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { AnalyticsSummaryResponse, DateRangeKey, VelocityMetric } from "@/lib/analytics/types";
import { buildAnalyticsOverview, type AnalyticsOverview } from "@/lib/analytics/overview";
import { buildPlatformTabAnalysis, type PlatformTabAnalysis } from "@/lib/analytics/platformTab";
import type { PersonaDocument } from "@/lib/models/persona";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { PostGenerationDocument } from "@/lib/types/postGeneration";

// Empty velocity metric placeholder
const EMPTY_METRIC = (label: string): VelocityMetric => ({
  id: label.toLowerCase(),
  label,
  value: "0",
  change: 0,
  trend: "neutral",
  velocity: "low",
});

type PersonaResponse = { persona: PersonaDocument | null };
type ConnectionsResponse = { connections: ConnectionDocument[] };
type PostGenerationResponse = { posts: PostGenerationDocument[] };

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parseMetricValue(value?: string): number {
  if (!value) return 0;
  const normalized = value.replace(/,/g, "").trim().toUpperCase();
  const match = normalized.match(/(-?\d+(?:\.\d+)?)([KMB])?/);
  if (!match) return Number(normalized) || 0;

  const amount = Number.parseFloat(match[1]) || 0;
  const suffix = match[2] ?? "";
  if (suffix === "K") return amount * 1000;
  if (suffix === "M") return amount * 1000000;
  if (suffix === "B") return amount * 1000000000;
  return amount;
}

export default function AnalyticsPage() {
  const [platform, setPlatform] = useState<PlatformKey>("all");
  const [dateRange, setDateRange] = useState<DateRangeKey>("30D");
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [persona, setPersona] = useState<PersonaDocument | null>(null);
  const [connections, setConnections] = useState<ConnectionDocument[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostGenerationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string | undefined;
  const isMountedRef = useRef(true);
  const autoSyncAttemptedRef = useRef(false);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      search.set("platform", platform);
      search.set("range", dateRange);
      search.set("plan", "pro");
      if (accountId) search.set("accountId", accountId);

      const personaSearch = new URLSearchParams();
      if (accountId) personaSearch.set("accountId", accountId);

      const connectionsSearch = new URLSearchParams();
      if (accountId) connectionsSearch.set("accountId", accountId);

      const postsSearch = new URLSearchParams();
      if (accountId) postsSearch.set("accountId", accountId);
      postsSearch.set("limit", "12");

      const [summaryPayload, personaPayload, connectionsPayload, postsPayload] = await Promise.all([
        fetchJson<AnalyticsSummaryResponse>(`/api/analytics/summary?${search.toString()}`),
        accountId
          ? fetchJson<PersonaResponse>(`/api/persona?${personaSearch.toString()}`).catch(() => ({ persona: null }))
          : Promise.resolve({ persona: null }),
        accountId
          ? fetchJson<ConnectionsResponse>(`/api/auth/connections?${connectionsSearch.toString()}`).catch(() => ({ connections: [] }))
          : Promise.resolve({ connections: [] }),
        accountId
          ? fetchJson<PostGenerationResponse>(`/api/post-generation/save?${postsSearch.toString()}`).catch(() => ({ posts: [] }))
          : Promise.resolve({ posts: [] }),
      ]);

      if (!isMountedRef.current) return;

      setSummary(summaryPayload);
      setPersona(personaPayload.persona);
      setConnections(connectionsPayload.connections ?? []);
      setRecentPosts(postsPayload.posts ?? []);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [platform, dateRange, accountId]);

  // Manual force-sync: triggers background sync then reloads
  const handleSync = useCallback(async () => {
    if (!accountId || isSyncing) return;
    setIsSyncing(true);
    try {
      await fetch(`/api/analytics/sync?accountId=${accountId}`, { method: "POST" });
    } catch {
      // sync errors are non-fatal; we still reload
    }
    await loadSummary();
    setIsSyncing(false);
  }, [accountId, isSyncing, loadSummary]);

  useEffect(() => {
    isMountedRef.current = true;
    loadSummary();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadSummary]);

  // Active dataset: platformData when a specific tab is selected, else globalData
  const dataset = useMemo(() => {
    if (!summary) return null;
    return platform === "all" ? summary.globalData : (summary.platformData ?? summary.globalData);
  }, [summary, platform]);

  // Whether the current view has any real data
  const audienceValue = parseMetricValue(dataset?.vitals.audience.value);
  const reachValue = parseMetricValue(dataset?.vitals.reach.value);
  const hasData = dataset && (
    audienceValue > 0 ||
    reachValue > 0 ||
    (dataset.topPosts?.length ?? 0) > 0 ||
    (dataset.history?.length ?? 0) > 0
  );

  useEffect(() => {
    if (isLoading || isSyncing || !accountId) return;
    if (hasData) return;
    if (connections.length === 0) return;
    if (autoSyncAttemptedRef.current) return;

    autoSyncAttemptedRef.current = true;
    void handleSync();
  }, [isLoading, isSyncing, accountId, hasData, connections.length, handleSync]);

  const overview: AnalyticsOverview | null = useMemo(() => {
    if (platform !== "all") return null;
    return buildAnalyticsOverview({
      summary,
      persona,
      connections,
      postGenerations: recentPosts,
      dateRange,
    });
  }, [platform, summary, persona, connections, recentPosts, dateRange]);

  const overviewToShow = useMemo(() => {
    if (!overview) return null;
    if (savedRecommendations && Array.isArray(savedRecommendations)) {
      return { ...overview, actionRecommendations: savedRecommendations } as AnalyticsOverview;
    }
    return overview;
  }, [overview, savedRecommendations]);

  // Load persisted recommendations for this account+range when overview is available
  useEffect(() => {
    let canceled = false;
    async function loadSaved() {
      if (!overview || !accountId) return;
      try {
        const res = await fetch(`/api/analytics/recommendations?accountId=${accountId}&range=${dateRange}`);
        if (!res.ok) return;
        const data = await res.json();
        if (canceled) return;
        setSavedRecommendations(Array.isArray(data.recommendations) ? data.recommendations : null);
      } catch {
        // ignore
      }
    }
    loadSaved();
    return () => {
      canceled = true;
    };
  }, [overview, accountId, dateRange]);

  const handleRecomputeRecommendations = useCallback(async () => {
    if (!overview || !accountId) return;
    try {
      const res = await fetch(`/api/analytics/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, range: dateRange, recommendations: overview.actionRecommendations }),
      });
      if (res.ok) {
        setSavedRecommendations(overview.actionRecommendations);
      }
    } catch {
      // ignore
    }
  }, [overview, accountId, dateRange]);

  const platformAnalysis: PlatformTabAnalysis | null = useMemo(() => {
    if (platform === "all") return null;
    return buildPlatformTabAnalysis({
      platform,
      summary,
      dataset,
      persona,
      postGenerations: recentPosts,
      dateRange,
    });
  }, [platform, summary, dataset, persona, recentPosts, dateRange]);

  const selectedConnection = useMemo(() => {
    if (platform === "all") return null;
    return connections.find((item) => item.platform === platform) ?? null;
  }, [connections, platform]);

  const handleCompletePersona = useCallback(() => {
    if (!accountId) return;
    router.push(`/${accountId}/accountPersona`);
  }, [accountId, router]);

  const platformLabel = platform === "all" ? "all platforms" : platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-[#000100]">
      {/* STICKY CONTROL DECK */}
      <div className="sticky top-0 z-30 bg-[#f4f8fb]/95 backdrop-blur-sm border-b border-slate-200/60">
        <div className="px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <PlatformFilter selected={platform} onSelect={setPlatform} />
            </div>

            {/* Sync button + last synced */}
            <div className="flex items-center gap-3 shrink-0">
              {lastSynced && !isLoading && (
                <span className="hidden md:block text-[10px] text-slate-400 font-medium">
                  Updated {lastSynced}
                </span>
              )}
              <button
                onClick={handleSync}
                disabled={isSyncing || isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-[#0052FF] hover:text-white hover:border-[#0052FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing…" : "Sync Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD AREA */}
      <div className="px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {platform === "all" && overviewToShow && (
            <OverviewDashboard overview={overviewToShow} history={dataset?.history} postEvents={dataset?.postEvents} bestPosts={dataset?.bestPosts30d} />
          )}

          {platform !== "all" && platformAnalysis && !isLoading && hasData && (
            <PlatformTabDashboard
              analysis={platformAnalysis}
              history={dataset?.history}
              postEvents={dataset?.postEvents}
              bestPosts={dataset?.bestPosts30d}
              connection={selectedConnection}
              onCompletePersona={handleCompletePersona}
            />
          )}

          {/* No-data state for a specific platform */}
          {!isLoading && !error && !hasData && platform !== "all" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                <BarChart3 size={28} className="text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No data yet for {platformLabel}</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Connect your {platformLabel} account and click <strong>Sync Now</strong> to pull your first analytics data.
              </p>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white rounded-full text-sm font-bold hover:bg-[#003DD4] transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing…" : "Sync Now"}
              </button>
            </div>
          )}

          {/* Live Vitals removed per user request */}

          {/* Strategic Insights removed per user request */}

          {/* Removed AI-generated UI sections (Copy-Cat, Content DNA, Audience Intelligence) */}
          {/* Platform correlation still stays when needed: */}
          {(isLoading || hasData) && (
            <div>
              <ComparisonEngine series={dataset?.correlation} platform={platform} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


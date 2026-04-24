"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, Eye, MousePointer2, Activity } from "lucide-react";
import { useParams } from "next/navigation";

// --- COMPONENT IMPORTS ---
import PlatformFilter from "../../components/Analytics/PlatformFilter";
import VelocityCard from "../../components/Analytics/VelocityCard";
import GrowthChart from "../../components/Analytics/GrowthChart";
import RadarInsight from "../../components/Analytics/RadarInsight";
import CopyCatEngine from "../../components/Analytics/CopyCatEngine"; // ⭐ NEW: Hall of Fame
import ContentDNATable from "../../components/Analytics/ContentDNATable";
import AudienceDeepDive from "../../components/Analytics/AudienceDeepDive";
import ComparisonEngine from "../../components/Analytics/ComparisonEngine";

// --- TYPE & DATA IMPORTS ---
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { AnalyticsSummaryResponse, DateRangeKey } from "@/lib/analytics/types";
import { ANALYTICS_DATA } from "../../components/Analytics/mockData";

export default function AnalyticsPage() {
  // Global Dashboard State
  const [platform, setPlatform] = useState<PlatformKey>("all");
  const [dateRange, setDateRange] = useState<DateRangeKey>("30D");
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const accountId = params?.id as string | undefined;

  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const search = new URLSearchParams();
        search.set("platform", platform);
        search.set("range", dateRange);
        search.set("plan", "core");
        if (accountId) search.set("accountId", accountId);

        const response = await fetch(`/api/analytics/summary?${search.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to load analytics summary");
        }
        const payload = (await response.json()) as AnalyticsSummaryResponse;
        if (isMounted) {
          setSummary(payload);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load analytics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [platform, dateRange, accountId]);

  // Get data for the selected platform (with safety fallback to 'all')
  const currentData = ANALYTICS_DATA[platform] || ANALYTICS_DATA["all"];
  const dataset = useMemo(() => {
    if (!summary) return null;
    if (platform === "all") return summary.globalData;
    return summary.platformData ?? summary.globalData;
  }, [summary, platform]);

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-[#000100]">
      {/* 1. STICKY CONTROL DECK */}
      <div className="sticky top-0 z-30 bg-[#f4f8fb]/95 backdrop-blur-sm border-b border-slate-200/60">
        <div className="px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto relative">
            <PlatformFilter selected={platform} onSelect={setPlatform} />

            {/* Date Toggle (SaaS Minimal Style) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-full shadow-sm">
              {["7D", "30D", "90D"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as DateRangeKey)}
                  className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-full transition-all duration-300 ${
                    dateRange === range
                      ? "bg-[#0052FF] text-white shadow-md transform scale-105"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD AREA */}
      <div className="px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm">
              Loading analytics summary...
            </div>
          )}
          {/* Dashboard Header Context */}

          {/* ROW 1: VELOCITY VITALS */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Live Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`vital-skeleton-${idx}`}
                    className="h-[140px] rounded-3xl border border-slate-100 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.05)] animate-pulse"
                  />
                ))
              ) : (
                <>
                  <VelocityCard
                    data={dataset?.vitals.audience ?? currentData.audience}
                    icon={<Users size={20} />}
                  />
                  <VelocityCard
                    data={dataset?.vitals.reach ?? currentData.reach}
                    icon={<Eye size={20} />}
                  />
                  <VelocityCard
                    data={dataset?.vitals.engagement ?? currentData.engagement}
                    icon={<Activity size={20} />}
                  />
                  <VelocityCard
                    data={dataset?.vitals.clicks ?? currentData.clicks}
                    icon={<MousePointer2 size={20} />}
                  />
                </>
              )}
            </div>
          </div>

          {/* ROW 2: STRATEGIC CHARTS */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Strategic Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
              <div className="lg:col-span-2 h-full">
                <GrowthChart
                  platform={platform}
                  history={dataset?.history}
                  prediction={dataset?.prediction}
                  anomalies={dataset?.anomalies}
                />
              </div>
              <div className="h-full">
                <RadarInsight platform={platform} data={dataset?.radar} />
              </div>
            </div>
          </div>

          {/* ⭐ ROW 3: THE COPY-CAT ENGINE (HALL OF FAME) */}
          <div className="pt-2">
            <CopyCatEngine posts={dataset?.topPosts} />
          </div>

          {/* ⭐ ROW 3B: PLATFORM CORRELATION */}
          <div>
            <ComparisonEngine series={dataset?.correlation} platform={platform} />
          </div>

          {/* ROW 4: CONTENT DNA (THE ROI ENGINE) */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">
              Deep Dive Analysis
            </h3>
            <div className="h-[400px]">
              <ContentDNATable platform={platform} insights={dataset?.contentInsights} />
            </div>
          </div>

          {/* ROW 5: AUDIENCE INTELLIGENCE */}
          <div className="pb-20">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Audience Intelligence
            </h3>
            <div className="h-[350px]">
              <AudienceDeepDive platform={platform} data={dataset?.demographics} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

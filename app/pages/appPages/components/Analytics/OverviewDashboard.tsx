"use client";

import React from "react";
import { AlertCircle, ArrowUpRight, BadgeInfo, BarChart3, CheckCircle2, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { AnalyticsOverview } from "@/lib/analytics/overview";
import type { HistoryPoint, PostEvent, BestPost } from "@/lib/analytics/types";
import GrowthChart from "./GrowthChart";
import BestPostsList from "./BestPostsList";
import PostMarkerTooltip from "./PostMarkerTooltip";

interface OverviewDashboardProps {
  overview: AnalyticsOverview;
  history?: HistoryPoint[] | undefined;
  postEvents?: PostEvent[] | undefined;
  bestPosts?: BestPost[] | undefined;
}

function trendClass(trend: "up" | "down" | "neutral"): string {
  if (trend === "up") return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (trend === "down") return "text-rose-600 bg-rose-50 border-rose-100";
  return "text-slate-500 bg-slate-50 border-slate-200";

}

function priorityClass(priority: "high" | "medium" | "low"): string {
  if (priority === "high") return "bg-rose-50 text-rose-700 border-rose-100";
  if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function scoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-[#0052FF]";
  if (score >= 55) return "bg-amber-500";
  return "bg-rose-500";
}

export default function OverviewDashboard({ overview, history, postEvents, bestPosts }: OverviewDashboardProps) {
  function buildSeries(history: HistoryPoint[] | undefined, platformKey: string) {
    if (!history || history.length === 0) return [] as { date: string; value: number }[];
    return history.map((h) => ({ date: h.date, value: Number((h as any)[platformKey]) || 0 }));
  }

  function MiniSparkline({ series }: { series: { date: string; value: number }[] }) {
    if (!series || series.length === 0) return null;
    const width = 160;
    const height = 32;
    const padding = 4;
    const vals = series.map((s) => s.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = Math.max(1, max - min);
    const points = series.map((s, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(1, series.length - 1);
      const y = height - padding - ((s.value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });
    const poly = points.join(" ");
    return (
      <svg width={width} height={height} className="rounded">
        <polyline fill="none" stroke="#0052FF" strokeWidth={2} points={poly} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-br from-[#0052FF]/10 via-white to-[#F6FAFF] shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0052FF]/15 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0052FF] shadow-sm">
                <Sparkles size={12} />
                Overview
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#000100] lg:text-4xl">
                Your cross-platform growth snapshot
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">
                This view merges connected accounts, top posts, saved persona strategy, and recent generated posts into one decision layer.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {overview.connectedAccounts.map((account) => (
                <div key={`${account.platform}-${account.username}`} className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Connected</div>
                  <div className="mt-1 text-sm font-bold text-[#000100]">{account.label}</div>
                  <div className="text-xs text-slate-500">{account.username}</div>
                </div>
              ))}
              {overview.connectedAccounts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-sm">
                  No connected accounts detected yet.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {overview.snapshot.map((card) => (
              <div key={card.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                    <div className="mt-3 text-3xl font-black tracking-tight text-[#000100]">{card.value}</div>
                  </div>
                  <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${trendClass(card.trend)}`}>
                    {card.trend === "up" ? <TrendingUp size={11} /> : card.trend === "down" ? <TrendingDown size={11} /> : <BadgeInfo size={11} />}
                    {card.delta}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{card.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New: Cross-platform chart + Best posts list */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Overview trends</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">Cross-platform growth</h3>
            </div>
          </div>
          <div className="mt-5">
            <GrowthChart
              platform={"all" as any}
              history={history}
              prediction={[]}
              anomalies={overview ? (overview.signalHighlights as any) : []}
              postEvents={postEvents}
            />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between gap-4 px-2 pt-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Best posts (30d)</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">Best performing posts for this account</h3>
            </div>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-5 rounded-[24px] border border-slate-100 bg-slate-50/40 p-2">
            <BestPostsList posts={bestPosts ?? overview?.recentGeneratedPosts.map((p) => ({ postId: p.id, platform: p.platform, postedAt: p.createdAt, thumbnail: null, caption: p.title, metricValue: 0 }))} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] lg:col-span-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform Leaderboard</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">Best and weakest platform</h3>
            </div>
            <div className="rounded-full border border-[#0052FF]/15 bg-[#0052FF]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0052FF]">
              Engagement rate
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {overview.platformLeaderboard.map((platform) => (
              <div key={platform.platform} className={`rounded-2xl border px-4 py-3 ${platform.rank === 1 ? "border-[#0052FF]/20 bg-[#0052FF]/6" : "border-slate-100 bg-slate-50/70"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#000100]">{platform.label}</div>
                    <div className="text-xs text-slate-500">{platform.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#000100]">{platform.score.toFixed(1)}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rank #{platform.rank}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="h-2 rounded-full bg-white flex-1 mr-3">
                    <div className={`h-2 rounded-full ${scoreColor(platform.score)}`} style={{ width: `${Math.max(8, Math.min(100, platform.score))}%` }} />
                  </div>
                  {/* Platform action */}
                  <p className="mt-3 text-xs leading-5 text-slate-500">{platform.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] lg:col-span-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Persona Fit Score</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">How well the content matches the saved strategy</h3>
            </div>
            <Sparkles size={18} className="text-[#0052FF]" />
          </div>

          <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Overall alignment</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-[#000100]">{overview.personaAlignment.score}/100</div>
              </div>
              <div className="max-w-sm text-right text-sm leading-6 text-slate-600">
                {overview.personaAlignment.summary}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Audience", overview.personaAlignment.audience],
                ["Tone", overview.personaAlignment.tone],
                ["Format", overview.personaAlignment.format],
                ["Objective", overview.personaAlignment.objective],
                ["Brand", overview.personaAlignment.brand],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    <span>{label}</span>
                    <span>{value as number}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <div className={`h-2 rounded-full ${scoreColor(value as number)}`} style={{ width: `${value as number}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm leading-6 text-slate-600">
            The fit score is a rules-based readout using saved persona fields, recent generated posts, top content formats, and brand asset consistency.
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recommendations</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">What to do next</h3>
            </div>
            <BarChart3 size={18} className="text-[#0052FF]" />
          </div>

          <div className="mt-5 space-y-3">
            {overview.actionRecommendations.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{item.priority} priority</div>
                    <div className="mt-1 text-base font-bold">{item.title}</div>
                  </div>
                  <div className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                    {item.metric}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 opacity-90">{item.explanation}</p>
                <div className="mt-3 rounded-xl border border-white/70 bg-white/70 p-3 text-sm text-slate-700">
                  {item.nextStep}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-[#0052FF]" />
              <h3 className="text-xl font-bold text-[#000100]">Trending Signals</h3>
            </div>
            <div className="mt-5 space-y-3">
              {overview.signalHighlights.map((signal, i) => (
                <div key={`${signal.label}-${signal.value}-${signal.reason ?? ""}-${i}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{signal.type}</div>
                      <div className="mt-1 text-sm font-bold text-[#000100]">{signal.label}</div>
                    </div>
                    <div className="rounded-full border border-[#0052FF]/15 bg-[#0052FF]/8 px-3 py-1 text-xs font-black text-[#0052FF]">
                      {signal.value}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{signal.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <BadgeInfo size={18} className="text-[#0052FF]" />
              <h3 className="text-xl font-bold text-[#000100]">Recent Generated Posts</h3>
            </div>
            <div className="mt-5 space-y-3">
              {overview.recentGeneratedPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{post.platform}</div>
                      <div className="mt-1 text-sm font-bold text-[#000100]">{post.title}</div>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {post.status}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <span className="rounded-full bg-white px-2.5 py-1">{post.objective}</span>
                    <span className="rounded-full bg-white px-2.5 py-1">{post.createdAt.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
              {overview.recentGeneratedPosts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                  No saved generated posts were found in the selected range.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

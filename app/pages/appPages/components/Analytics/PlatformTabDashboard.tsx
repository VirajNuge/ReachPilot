"use client";

import React from "react";
import { AlertCircle, ArrowUpRight, BarChart3, CheckCircle2, Link2, Sparkles, TrendingDown, TrendingUp, User2, BadgeInfo, Users } from "lucide-react";
import type { PlatformTabAnalysis } from "@/lib/analytics/platformTab";
import type { HistoryPoint, BestPost, PostEvent } from "@/lib/analytics/types";
import type { ConnectionDocument } from "@/lib/models/connection";
import GrowthChart from "./GrowthChart";
import BestPostsList from "./BestPostsList";

interface PlatformTabDashboardProps {
  analysis: PlatformTabAnalysis;
  history?: HistoryPoint[] | undefined;
  postEvents?: PostEvent[] | undefined;
  bestPosts?: BestPost[] | undefined;
  connection?: ConnectionDocument | null;
  onCompletePersona?: () => void;
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

export default function PlatformTabDashboard({ analysis, history, postEvents, bestPosts, connection, onCompletePersona }: PlatformTabDashboardProps) {
  const platformPosts = bestPosts?.filter((item) => item.platform === analysis.platform) ?? [];
  const platformEvents = postEvents?.filter((item) => item.platform === analysis.platform) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0052FF]/15 bg-[#0052FF]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0052FF] shadow-sm">
                <Sparkles size={12} />
                {analysis.platformLabel}
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#000100] lg:text-4xl">{analysis.platformLabel} performance snapshot</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">{analysis.analysisSummary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Account</div>
                <div className="mt-1 text-sm font-bold text-[#000100]">{connection?.platformUsername ?? analysis.platformLabel}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <User2 size={12} />
                  {connection?.platformUserId ?? "Connected account"}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Connection</div>
                <div className="mt-1 text-sm font-bold text-[#000100]">{connection?.pageId ? "Page / business account" : "Account connected"}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Link2 size={12} />
                  {connection?.pageId ?? "Synced from platform API"}
                </div>
              </div>
            </div>
          </div>

          {analysis.missingPersonaFields.length > 0 && (
            <section className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-700 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-900">Complete your persona to unlock deeper guidance</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.missingPersonaFields.map((field) => (
                      <span key={field.key} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800">
                        {field.label}
                      </span>
                    ))}
                  </div>
                  {onCompletePersona && (
                    <button
                      onClick={onCompletePersona}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-900 hover:bg-amber-200"
                    >
                      Complete Persona
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {analysis.trendSignals.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {analysis.trendSignals.map((signal) => (
                <div key={`${signal.label}-${signal.value}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{signal.type}</div>
                  <div className="mt-1 text-sm font-bold text-[#000100]">{signal.label}</div>
                  <div className="text-xs text-slate-500">{signal.reason}</div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#0052FF]/15 bg-[#0052FF]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0052FF]">
                    {signal.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analysis.stats.map((card) => (
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

          <div className="rounded-[28px] border border-slate-100 bg-slate-50/80 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent trend</div>
                <div className="text-sm font-bold text-[#000100]">Selected platform growth</div>
              </div>
              <BarChart3 size={16} className="text-slate-400" />
            </div>
            {history && history.length > 0 ? (
              <GrowthChart platform={analysis.platform} history={history} prediction={[]} anomalies={[]} postEvents={platformEvents} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">No trend history available for this account yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.26fr_0.74fr]">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recommendations</div>
              <h3 className="mt-2 text-xl font-bold text-[#000100]">What to do next on {analysis.platformLabel}</h3>
            </div>
            <ArrowUpRight size={18} className="text-[#0052FF]" />
          </div>

          <div className="mt-5 space-y-3">
            {analysis.recommendations.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{item.priority} priority</div>
                    <div className="mt-1 text-base font-bold">{item.title}</div>
                  </div>
                  <div className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">{item.metric}</div>
                </div>
                <p className="mt-3 text-sm leading-6 opacity-90">{item.explanation}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#0052FF]/15 bg-[#0052FF]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0052FF]">
                  <ArrowUpRight size={12} />
                  {item.nextStep}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)] min-w-0">
            <div className="mb-3 flex items-center justify-between gap-4 px-2 pt-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Best posts (30d)</div>
                <h3 className="mt-2 text-xl font-bold text-[#000100]">Best performing posts for this account</h3>
              </div>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <BestPostsList posts={platformPosts} />
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Account details</div>
                <h3 className="mt-2 text-xl font-bold text-[#000100]">Connected profile</h3>
              </div>
              <BarChart3 size={18} className="text-[#0052FF]" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform</div>
                <div className="mt-1 text-sm font-bold text-[#000100]">{analysis.platformLabel}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Username</div>
                <div className="mt-1 text-sm font-bold text-[#000100]">{connection?.platformUsername ?? "Not available"}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Page / profile ID</div>
                <div className="mt-1 break-all text-sm font-bold text-[#000100]">{connection?.pageId ?? connection?.platformUserId ?? "Not available"}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Connected at</div>
                <div className="mt-1 text-sm font-bold text-[#000100]">{connection?.updatedAt ? new Date(connection.updatedAt).toLocaleString() : "Unknown"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Persona fit</div>
                <h3 className="mt-2 text-xl font-bold text-[#000100]">Strategy alignment for this platform</h3>
              </div>
              <Users size={18} className="text-[#0052FF]" />
            </div>

            <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Fit score</div>
                  <div className="mt-2 text-4xl font-black tracking-tight text-[#000100]">{analysis.personaFit.score}/100</div>
                </div>
                <div className="max-w-sm text-right text-sm leading-6 text-slate-600">{analysis.personaFit.summary}</div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Audience", analysis.personaFit.audience],
                  ["Tone", analysis.personaFit.tone],
                  ["Format", analysis.personaFit.format],
                  ["Objective", analysis.personaFit.objective],
                  ["Brand", analysis.personaFit.brand],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      <span>{label}</span>
                      <span>{value as number}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white">
                      <div className={`h-2 rounded-full ${value as number >= 85 ? "bg-emerald-500" : value as number >= 70 ? "bg-[#0052FF]" : value as number >= 55 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${value as number}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import {
  FaBalanceScale,
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
} from "react-icons/fa";
import { CompetitorProps } from "@/lib/postAnalyzerTypes";

export default function CompetitorBenchmarking({
  benchmarkData,
}: CompetitorProps) {
  const isExceptional =
    benchmarkData.engagementRate > benchmarkData.nicheAvg * 2;
  const isAboveAvg = benchmarkData.engagementRate > benchmarkData.nicheAvg;

  const engagementLabel = isExceptional
    ? "Exceptional"
    : isAboveAvg
      ? "Above Average"
      : "Standard";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Fairness Check
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Competitor Benchmark
            </h3>
            {benchmarkData.isOutlier && (
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-xl ml-1">
                Valid Viral
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaBalanceScale size={16} />
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Compare this post's performance against account average and niche
            standards. Identify true outliers.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ── True Engagement Rate ── */}
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            True Engagement Rate
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <FaStar className="text-[#B6FF33]" size={20} />
              <span className="text-4xl font-bold text-[#1A1D23] leading-none">
                {benchmarkData.engagementRate}%
              </span>
            </div>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-xl ${
                isExceptional
                  ? "bg-[#B6FF33]/20 text-[#4D8C00]"
                  : isAboveAvg
                    ? "bg-[#EEF4FF] text-[#0052FF]"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {engagementLabel}
            </span>
          </div>
        </div>

        {/* ── Comparison Bars ── */}
        <div className="space-y-4">
          {/* This Post */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[13px] font-semibold text-[#1A1D23]">
                This Post
              </span>
              <span className="text-[13px] font-bold text-[#0052FF]">
                {benchmarkData.engagementRate}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0052FF]"
                style={{
                  width: `${Math.min((benchmarkData.engagementRate / (benchmarkData.nicheAvg * 3)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Account Average */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[13px] font-semibold text-[#1A1D23]">
                Account Avg
              </span>
              <span className="text-[13px] font-bold text-slate-500">
                {benchmarkData.accountAvg}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#B6FF33]"
                style={{
                  width: `${Math.min((benchmarkData.accountAvg / (benchmarkData.nicheAvg * 3)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Niche Standard */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[13px] font-semibold text-[#1A1D23]">
                Niche Standard
              </span>
              <span className="text-[13px] font-bold text-slate-500">
                {benchmarkData.nicheAvg}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1A1D23]"
                style={{
                  width: `${Math.min((benchmarkData.nicheAvg / (benchmarkData.nicheAvg * 3)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 py-2 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF]"></span>
            <span className="text-[11px] font-semibold text-slate-500">
              Post
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF33]"></span>
            <span className="text-[11px] font-semibold text-slate-500">
              Acc. Avg
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A1D23]"></span>
            <span className="text-[11px] font-semibold text-slate-500">
              Niche
            </span>
          </div>
        </div>

        {/* ── Bot Signal ── */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#B6FF33]" size={14} />
            <p className="text-[13px] text-slate-500 leading-relaxed">
              <strong className="text-[#1A1D23]">
                Bot Signal: {benchmarkData.botSignal}.
              </strong>{" "}
              Engagement is verified human. Safe to model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

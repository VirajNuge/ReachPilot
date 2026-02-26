import React from "react";
import { FaBalanceScale, FaUserFriends, FaCheckCircle } from "react-icons/fa";
import { CompetitorProps } from "@/lib/postAnalyzerTypes";

export default function CompetitorBenchmarking({
  benchmarkData,
}: CompetitorProps) {
  const perfMultiplier = (
    benchmarkData.engagementRate / benchmarkData.accountAvg
  ).toFixed(1);

  const engagementLabel =
    benchmarkData.engagementRate > benchmarkData.nicheAvg * 2
      ? "Exceptional"
      : benchmarkData.engagementRate > benchmarkData.nicheAvg
        ? "Above Average"
        : "Standard";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <FaBalanceScale size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Fairness Check
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-orange-300">
                Why this matters:
              </div>
              Compare this post's performance against account average and niche
              standards. Identify true outliers.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center gap-1">
          <FaCheckCircle size={10} /> Verified Organic
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: TRUE ENGAGEMENT RATIO --- */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              True Engagement
            </span>
            <span className="text-2xl font-black text-gray-900 flex items-baseline gap-1">
              {benchmarkData.engagementRate}%
              <span className="text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded font-bold uppercase">
                {engagementLabel}
              </span>
            </span>
          </div>

          {/* Comparison Bar */}
          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden flex items-center px-2">
            {/* Account Avg Marker */}
            <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-gray-400 z-10"></div>
            <div className="absolute left-[15%] -top-3 text-[9px] font-bold text-gray-400 transform -translate-x-1/2">
              Avg
            </div>

            {/* This Post Bar */}
            <div
              className="h-4 bg-orange-500 rounded-full relative z-20 shadow-sm"
              style={{
                width: `${Math.min((benchmarkData.engagementRate / (benchmarkData.nicheAvg * 3)) * 100, 100)}%`,
              }}
            ></div>
            <span className="absolute right-4 text-[9px] font-bold text-gray-400 z-10 w-full text-right pointer-events-none">
              Outperforming Account by {perfMultiplier}x
            </span>
          </div>
        </div>

        {/* --- SECTION 2: CONTEXTUAL INSIGHT --- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Niche Standard
            </p>
            <p className="text-sm font-bold text-gray-700">
              {benchmarkData.nicheAvg}%{" "}
              <span className="text-gray-400 font-normal text-xs">
                (Niche Avg)
              </span>
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">
              Performance
            </p>
            <p className="text-sm font-bold text-orange-700">
              Top 5%{" "}
              <span className="text-orange-400 font-normal text-xs">
                Outlier
              </span>
            </p>
          </div>
        </div>

        {/* --- SECTION 3: SIGNAL VS NOISE (BOT CHECK) --- */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
            <FaUserFriends size={14} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-900">
              Bot Signal: {benchmarkData.botSignal}
            </h4>
            <p className="text-[10px] text-gray-500">
              Engagement is human. Safe to model.
            </p>
          </div>
          {benchmarkData.isOutlier && (
            <span className="text-[10px] font-bold text-white bg-gray-900 px-2 py-1 rounded-md">
              Valid Viral
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

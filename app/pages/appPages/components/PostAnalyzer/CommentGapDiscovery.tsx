import React from "react";
import {
  FaComments,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { CommentGapProps } from "@/lib/postAnalyzerTypes";

export default function CommentGapDiscovery({
  gapData,
  confusionPoint,
}: CommentGapProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Content Opportunities
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Comment Gap
            </h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl flex items-center gap-1">
              <FaCheckCircle className="text-[#0052FF]" size={10} />{" "}
              {gapData.length} Found
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaComments size={16} />
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Identify user questions and complaints in the comments to create
            high-value problem-solving content.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ── Top Gap Metric ── */}
        {gapData.length > 0 && (
          <div className="flex items-end justify-between">
            <div className="w-full">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  Top Requested Topic
                </p>
                <span className="text-xl font-bold text-[#1A1D23]">
                  {gapData[0].frequency} Mentions
                </span>
              </div>

              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#B6FF33] h-full w-[65%]"
                  title="High Demand"
                />
                <div className="bg-[#0052FF] h-full w-[20%]" />
                <div className="bg-slate-300 h-full w-[15%]" />
              </div>

              <div className="mt-3">
                <div className="text-[14px] font-bold text-[#1A1D23] flex flex-wrap gap-2 items-center mb-1">
                  {gapData[0].gap}
                  <span className="w-2 h-2 rounded-full bg-[#B6FF33] inline-block ml-1"></span>
                </div>
                <div className="text-[13px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-600">
                    Playbook:
                  </span>{" "}
                  {gapData[0].strategy}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── All Opportunities ── */}
        <div className="pt-2">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            Opportunity Breakdown
          </span>
          <div className="flex flex-col gap-3">
            {gapData.slice(1).map((item, index) => (
              <div
                key={index}
                className="bg-white border text-left border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-[#1A1D23] text-[13px] leading-tight flex-1 pr-3">
                    {item.gap}
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg shrink-0">
                    {item.frequency}x
                  </span>
                </div>
                <div className="text-[12px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-600">
                    Strategy:
                  </span>{" "}
                  {item.strategy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Friction Finder (Styled like Controversy Chip) ── */}
        <div className="mt-auto pt-4">
          <div className="bg-[#1A1D23] text-white px-4 py-3 rounded-2xl flex items-start gap-3">
            <div className="mt-0.5">
              <FaExclamationTriangle className="text-[#B6FF33]" size={14} />
            </div>
            <div>
              <p className="text-[13px] font-bold mb-0.5 text-white">
                Confusion Alert: {confusionPoint.text}
              </p>
              <p className="text-[12px] text-slate-400 leading-snug">
                {confusionPoint.insight}
              </p>
            </div>
          </div>
        </div>

        {/* ── Action Button ── */}
        <div className="pt-2">
          <button className="w-full py-3 bg-[#0052FF] hover:bg-[#003DD4] text-white rounded-xl text-[13px] font-bold transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]">
            Generate &ldquo;Reply Post&rdquo; Content
          </button>
        </div>
      </div>
    </div>
  );
}

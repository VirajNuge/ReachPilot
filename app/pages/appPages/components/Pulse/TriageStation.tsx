"use client";

import React, { useState } from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";
import { FaCheck } from "react-icons/fa";

interface TriageStationProps {
  fixes: RawAnalysisData["quickFixes"];
}

export default function TriageStation({ fixes }: TriageStationProps) {
  // Only show top 3 HIGH IMPACT fixes
  const highImpactFixes =
    fixes?.filter((f: any) => f.tag === "HIGH IMPACT").slice(0, 3) || [];

  // Fallback if no high impact fixes
  const displayFixes =
    highImpactFixes.length > 0 ? highImpactFixes : fixes?.slice(0, 3) || [];

  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (index: number) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter((i) => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Optimization
        </h3>
        <div className="flex items-center">
          <h2 className="text-xl font-black text-[#1A1D23] tracking-tight">
            Triage Station
          </h2>
          <span className="bg-[#0052FF] text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2">
            {displayFixes.length - completed.length}
          </span>
        </div>
      </div>

      {/* Fix Items List */}
      <div className="space-y-3 mt-5 flex-1">
        {displayFixes.map((fix: any, i: number) => {
          const isDone = completed.includes(i);
          return (
            <div
              key={i}
              onClick={() => toggleComplete(i)}
              className={`group bg-[#F5F6FA] rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                isDone
                  ? "border-slate-100 opacity-50"
                  : "border-slate-100 hover:border-[#0052FF]/30 hover:shadow-[0_2px_12px_rgba(0,82,255,0.07)]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Item Number Circle */}
                <div
                  className={`w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[#0052FF] text-white"
                  }`}
                >
                  {isDone ? <FaCheck size={10} /> : i + 1}
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {fix.tag === "HIGH IMPACT" ? (
                      <span className="bg-[#0052FF] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        HIGH IMPACT
                      </span>
                    ) : fix.tag === "MEDIUM IMPACT" ? (
                      <span className="bg-[#F0FFF4] text-[#22C55E] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        QUICK WIN
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {fix.tag}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4
                    className={`text-sm font-black leading-snug ${isDone ? "text-slate-500 line-through" : "text-[#1A1D23]"}`}
                  >
                    {fix.headline}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    {fix.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {displayFixes.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            No urgent issues found. You're fully optimized!
          </div>
        )}
      </div>
    </div>
  );
}

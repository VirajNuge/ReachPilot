"use client";

import React, { useState } from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";
import { FaCheck } from "react-icons/fa";

interface TriageStationProps {
  fixes: RawAnalysisData["quickFixes"];
}

const TAG_ORDER: Record<string, number> = {
  "HIGH IMPACT": 0,
  "MEDIUM IMPACT": 1,
  "LOW IMPACT": 2,
};

export default function TriageStation({ fixes }: TriageStationProps) {
  // Show all fixes, sorted: HIGH IMPACT → MEDIUM IMPACT → LOW IMPACT
  const displayFixes = [...(fixes || [])].sort(
    (a, b) => (TAG_ORDER[a.tag] ?? 3) - (TAG_ORDER[b.tag] ?? 3),
  );

  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (index: number) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter((i) => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-5 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-3 shrink-0">
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

      {/* Scrollable Fix Items List */}
      <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0 pr-1">
        {displayFixes.map((fix: any, i: number) => {
          const isDone = completed.includes(i);
          return (
            <div
              key={i}
              onClick={() => toggleComplete(i)}
              className={`group bg-[#F5F6FA] rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
                isDone
                  ? "border-slate-100 opacity-50"
                  : "border-slate-100 hover:border-[#0052FF]/30 hover:shadow-[0_2px_12px_rgba(0,82,255,0.07)]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Item Number Circle */}
                <div
                  className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[#0052FF] text-white"
                  }`}
                >
                  {isDone ? <FaCheck size={9} /> : i + 1}
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {fix.tag === "HIGH IMPACT" ? (
                      <span className="bg-[#0052FF] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                        HIGH IMPACT
                      </span>
                    ) : fix.tag === "MEDIUM IMPACT" ? (
                      <span className="bg-[#F0FFF4] text-[#22C55E] font-bold text-[10px] px-2 py-0.5 rounded-full">
                        QUICK WIN
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {fix.tag}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4
                    className={`text-xs font-black leading-snug ${isDone ? "text-slate-500 line-through" : "text-[#1A1D23]"}`}
                  >
                    {fix.headline}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
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

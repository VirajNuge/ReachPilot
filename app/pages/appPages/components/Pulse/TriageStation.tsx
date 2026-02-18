"use client";

import React, { useState } from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";
import { FaFirstAid, FaCheck } from "react-icons/fa";

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
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 relative overflow-hidden h-full">
      {/* Red Cross Background Watermark */}
      <div className="absolute -right-6 -bottom-6 text-red-50 opacity-50 transform rotate-12 pointer-events-none">
        <FaFirstAid size={180} />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-red-500 rounded-lg p-2 text-white shadow-md shadow-red-200">
          <FaFirstAid size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Triage Station
          </h3>
          <p className="text-xs font-medium text-red-500">
            Immediate Action Required
          </p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {displayFixes.map((fix: any, i: number) => {
          const isDone = completed.includes(i);
          return (
            <div
              key={i}
              className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDone
                  ? "bg-slate-50 border-slate-100 opacity-50"
                  : "bg-white border-slate-100 hover:border-red-200 hover:shadow-md hover:-translate-y-0.5"
              }`}
              onClick={() => toggleComplete(i)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-bold text-sm ${isDone ? "text-slate-500 line-through" : "text-slate-800"}`}
                    >
                      {fix.headline}
                    </h4>
                    {!isDone && (
                      <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {fix.description}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-200 group-hover:border-red-400"
                  }`}
                >
                  {isDone && <FaCheck size={10} />}
                </div>
              </div>
            </div>
          );
        })}

        {displayFixes.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No urgent issues found. You're in good health!
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Edit3 } from "lucide-react";

export interface OptimalSlot {
  day: number;   // 0 = Sunday … 6 = Saturday
  hour: number;  // 24-hr
  minute: number;
  label: string;
  reason: string;
}

interface OptimalTimesPanelProps {
  onApply:      (slots: OptimalSlot[]) => void;
  isLoading:    boolean;
  setIsLoading: (v: boolean) => void;
  savedSlots:   OptimalSlot[] | null;
  isEmbedded?:  boolean;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Map 0-4 index rank → tailwind bg class (darkest = best)
const RANK_BG = [
  "bg-[#003BB3]",  // rank 0 – best
  "bg-[#0052FF]",
  "bg-[#3B82F6]",
  "bg-[#93C5FD]",
  "bg-[#DBEAFE]",  // rank 4 – weakest
];
const RANK_TEXT = ["text-white", "text-white", "text-white", "text-[#1A1D23]", "text-[#1A1D23]"];

export function OptimalTimesPanel({ onApply, isLoading, setIsLoading, savedSlots, isEmbedded }: OptimalTimesPanelProps) {
  const [country,   setCountry]   = useState("");
  const [niche,     setNiche]     = useState("");
  const [audience,  setAudience]  = useState("");
  const [error,     setError]     = useState("");
  const [editing,   setEditing]   = useState(!savedSlots);

  const hasSlots = savedSlots && savedSlots.length > 0;

  const handleGenerate = async () => {
    if (!country || !niche || !audience) { setError("Please fill in all fields"); return; }
    setIsLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/publishing/optimal-times", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ country, niche, targetAudience: audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      onApply(data.slots);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses = isEmbedded
    ? "flex flex-col gap-4"
    : "bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-5 w-[280px] shrink-0 border border-slate-100 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none]";

  return (
    <div className={containerClasses}>

      {/* Edit button — only shown when slots exist and not editing */}
      {hasSlots && !editing && (
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-[#0052FF] p-1 rounded-md hover:bg-[#EEF3FF] transition-colors"
            title="Change settings"
          >
            <Edit3 size={11} />
          </button>
        </div>
      )}

      {/* Form — Ultra-Slim Horizontal Bar */}
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleGenerate();
          }}
          className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm mt-1"
        >

          <div className="flex-1 flex items-center gap-3">
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Region"
              className="flex-1 min-w-[80px] bg-slate-50/50 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#1A1D23] outline-none border border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Niche"
              className="flex-1 min-w-[80px] bg-slate-50/50 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#1A1D23] outline-none border border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Audience"
              className="flex-1 min-w-[80px] bg-slate-50/50 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#1A1D23] outline-none border border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-1.5 shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="h-[30px] px-4 bg-[#0052FF] hover:bg-[#003DD4] text-white rounded-lg font-bold text-[11px] transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : "Calculate"}
            </button>
            {hasSlots && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-[28px] px-3 rounded-lg text-[10px] font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
            )}
          </div>
          
          {error && <p className="text-[9px] font-bold text-red-500 whitespace-nowrap">{error}</p>}
        </form>
      )}

      {/* Empty state when we have slots but not editing — just show the edit button already handled above */}
      {hasSlots && !editing && (
        <div className="flex items-center gap-2 py-2 text-[11px] font-medium text-slate-400 italic">
          <Sparkles size={12} className="text-[#0052FF]" />
          Calendar heatmap updated based on your AI analysis.
        </div>
      )}

      {/* Empty state when no slots yet and not showing form */}
      {!hasSlots && !editing && (
        <p className="text-[11px] text-slate-400 font-medium text-center py-4">
          No data yet. Fill in your profile above to get started.
        </p>
      )}
    </div>
  );
}

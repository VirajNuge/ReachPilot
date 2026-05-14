"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { OptimalSlot } from "@/lib/publishing/types";

interface OptimalTimesPanelProps {
  onCalculate: () => void;
  isLoading: boolean;
  savedSlots: OptimalSlot[] | null;
  hasPersona: boolean;
  isEmbedded?: boolean;
}

export function OptimalTimesPanel({ onCalculate, isLoading, savedSlots, hasPersona, isEmbedded }: OptimalTimesPanelProps) {
  const hasSlots = (savedSlots?.length ?? 0) > 0;

  const containerClasses = isEmbedded
    ? "flex items-start justify-between gap-3"
    : "bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-5 w-[280px] shrink-0 border border-slate-100 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none]";

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={() => {
          if (isLoading) return;
          void onCalculate();
        }}
        disabled={isLoading}
        className="order-2 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0052FF] px-3 py-2 text-[11px] font-black text-white shadow-[0_4px_14px_rgba(0,82,255,0.22)] transition-colors hover:bg-[#003DD4] disabled:opacity-70"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        Calculate
      </button>

      {hasSlots ? (
        <div className={isEmbedded ? "order-1 min-w-0 max-w-[260px] space-y-1 text-left" : "space-y-1.5 rounded-2xl bg-[#F4F7FA] px-4 py-3"}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Saved this month</p>
          <p className="text-[12px] font-semibold text-[#1A1D23]">
            {savedSlots?.length ?? 0} recommended slots ready for the current calendar.
          </p>
          <p className="text-[11px] text-slate-500">
            Darker blue marks the strongest recommendations.
          </p>
        </div>
      ) : hasPersona ? (
        <p className="order-1 max-w-[260px] text-[11px] text-slate-400 font-medium leading-relaxed">
          Use your saved persona to generate monthly posting windows. The calendar will keep your scheduled posts visible on top.
        </p>
      ) : (
        <p className="order-1 max-w-[260px] text-[11px] text-slate-400 font-medium leading-relaxed">
          Complete Persona Builder first so the calculator can use your audience, industry, and content signals instead of fallback timings.
        </p>
      )}
    </div>
  );
}

import React from "react";
import KPICard, { KPITrend } from "./KPICard";

export interface KPIItem {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  trend?: KPITrend;
  icon?: React.ReactNode;
}

interface KPIBarProps {
  items: KPIItem[];
  onShowAll?: () => void;
}

export default function KPIBar({ items, onShowAll }: KPIBarProps) {
  const isExpanded = items.length > 4;

  return (
    <div className="min-w-0">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              At a glance
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Key performance metrics for this period
          </p>
        </div>
        {onShowAll ? (
          <button
            type="button"
            onClick={onShowAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>{isExpanded ? "Show fewer metrics" : "View all metrics"}</span>
          </button>
        ) : null}
      </div>
      <div
        className={`grid min-w-0 gap-3 sm:gap-4 ${
          isExpanded
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            : "grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {items.map((item) => (
          <KPICard key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

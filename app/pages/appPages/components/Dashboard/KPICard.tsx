import React from "react";

export type KPITrend = "up" | "down" | "stable";

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  trend?: KPITrend;
  icon?: React.ReactNode;
}

const trendConfig: Record<KPITrend, { textColor: string; badgeBg: string; glyph: string; barColor: string }> = {
  up:     { textColor: "text-emerald-600", badgeBg: "bg-emerald-50 border-emerald-100",  glyph: "↑", barColor: "bg-emerald-400" },
  down:   { textColor: "text-rose-500",    badgeBg: "bg-rose-50 border-rose-100",        glyph: "↓", barColor: "bg-rose-400"   },
  stable: { textColor: "text-slate-500",   badgeBg: "bg-slate-100 border-slate-200",     glyph: "→", barColor: "bg-slate-300"  },
};

export default function KPICard({ label, value, unit, delta, trend = "stable" }: KPICardProps) {
  const cfg = trendConfig[trend];

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden cursor-default">
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.barColor} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
          {label}
        </span>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeBg} ${cfg.textColor} transition-transform group-hover:scale-110`}
        >
          {cfg.glyph}
        </span>
      </div>

      <div className="text-[32px] font-black text-[#1A1D23] tracking-tight leading-none">
        {value}
        {unit ? <span className="text-[18px] font-bold text-slate-400 ml-1">{unit}</span> : null}
      </div>

      <div className={`mt-2.5 text-[12px] font-semibold ${cfg.textColor}`}>
        {delta !== undefined ? (
          <>{delta > 0 ? "+" : ""}{delta}% vs last period</>
        ) : (
          <span className="text-slate-300">— no change</span>
        )}
      </div>
    </div>
  );
}

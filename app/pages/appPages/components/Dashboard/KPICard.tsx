import React from "react";
import {
  PenTool,
  Send,
  Zap,
  Users,
  Bookmark,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export type KPITrend = "up" | "down" | "stable";

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  trend?: KPITrend;
  icon?: React.ReactNode;
}

function getDefaultIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("generated")) {
    return {
      icon: <PenTool size={16} strokeWidth={2.2} />,
      bg: "bg-blue-50 text-blue-600",
    };
  }
  if (l.includes("published")) {
    return {
      icon: <Send size={16} strokeWidth={2.2} />,
      bg: "bg-emerald-50 text-emerald-600",
    };
  }
  if (l.includes("engagement")) {
    return {
      icon: <Zap size={16} strokeWidth={2.2} />,
      bg: "bg-purple-50 text-purple-600",
    };
  }
  if (l.includes("follower")) {
    return {
      icon: <Users size={16} strokeWidth={2.2} />,
      bg: "bg-amber-50 text-amber-600",
    };
  }
  if (l.includes("template")) {
    return {
      icon: <Bookmark size={16} strokeWidth={2.2} />,
      bg: "bg-indigo-50 text-indigo-600",
    };
  }
  return {
    icon: <Sparkles size={16} strokeWidth={2.2} />,
    bg: "bg-cyan-50 text-cyan-600",
  };
}

export default function KPICard({
  label,
  value,
  unit,
  delta,
  trend = "stable",
  icon,
}: KPICardProps) {
  const defaultIcon = getDefaultIcon(label);

  const trendStyles = {
    up: {
      text: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100/80",
      Icon: TrendingUp,
    },
    down: {
      text: "text-rose-600",
      bg: "bg-rose-50 border-rose-100/80",
      Icon: TrendingDown,
    },
    stable: {
      text: "text-slate-500",
      bg: "bg-slate-100 border-slate-200/80",
      Icon: Minus,
    },
  }[trend];

  const TrendIcon = trendStyles.Icon;

  return (
    <div className="group relative min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Top row: Icon + Trend badge */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${defaultIcon.bg}`}>
          {icon || defaultIcon.icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${trendStyles.bg} ${trendStyles.text}`}
        >
          <TrendIcon size={12} strokeWidth={2.5} />
          {delta !== undefined ? `${delta > 0 ? "+" : ""}${delta}%` : "—"}
        </span>
      </div>

      {/* Middle: Value */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {unit ? (
          <span className="text-base font-semibold text-slate-500">{unit}</span>
        ) : null}
      </div>

      {/* Bottom: Label & context */}
      <div className="mt-1">
        <div className="truncate text-xs font-semibold text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-400">
          vs last period
        </div>
      </div>
    </div>
  );
}

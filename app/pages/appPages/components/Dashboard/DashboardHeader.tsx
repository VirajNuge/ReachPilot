import React from "react";
import QuickActions, { QuickActionItem } from "./QuickActions";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  actions: QuickActionItem[];
  onOpenSettings?: () => void;
  showTitle?: boolean;
}

export default function DashboardHeader({
  title,
  subtitle,
  actions,
  onOpenSettings,
  showTitle = true,
}: DashboardHeaderProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm p-5 md:p-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-[#0052FF]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0052FF]">
            Workspace overview
          </div>
          {showTitle ? (
            <h2 className="text-2xl md:text-3xl font-black text-[#1A1D23] tracking-tight">
              {title}
            </h2>
          ) : null}
          <p className="text-sm text-slate-500 max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
          {onOpenSettings ? (
            <button
              onClick={onOpenSettings}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:border-[#9C4BFF] hover:text-[#9C4BFF] hover:bg-purple-50/30 transition-all duration-300 shadow-sm"
            >
              Customize
            </button>
          ) : null}
          <QuickActions actions={actions} />
        </div>
      </div>
    </div>
  );
}

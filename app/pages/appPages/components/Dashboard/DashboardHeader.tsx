import React from "react";
import { SlidersHorizontal } from "lucide-react";
import QuickActions, { QuickActionItem } from "./QuickActions";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  workspaceName?: string;
  actions: QuickActionItem[];
  onOpenSettings?: () => void;
  showTitle?: boolean;
  onAction?: (action: QuickActionItem) => void;
}

export default function DashboardHeader({
  title,
  subtitle,
  workspaceName,
  actions,
  onOpenSettings,
  showTitle = true,
  onAction,
}: DashboardHeaderProps) {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(subtitle.replace(/^Workspace:\s*/, "").trim());
  const friendlySubtitle =
    isMongoId || subtitle.startsWith("Workspace:")
      ? "Monitor content performance, publishing pipeline, and audience growth across channels."
      : subtitle;

  return (
    <div className="min-w-0 border-b border-slate-200/80 pb-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              Workspace Overview
            </span>
            {workspaceName ? (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {workspaceName}
              </span>
            ) : null}
          </div>
          {showTitle ? (
            <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
          ) : null}
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">{friendlySubtitle}</p>
        </div>

        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 xl:justify-end">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <SlidersHorizontal size={13} className="text-slate-500" />
              <span>Customize</span>
            </button>
          ) : null}
          <QuickActions actions={actions} onAction={onAction} />
        </div>
      </div>
    </div>
  );
}

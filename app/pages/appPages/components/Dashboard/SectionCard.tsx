import React from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  noPadding = false,
}: SectionCardProps) {
  return (
    <div
      className={`min-w-0 flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow duration-200 hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 sm:py-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold tracking-tight text-slate-900">
            {title}
          </h3>
          {subtitle ? (
            <p className="truncate mt-0.5 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={`flex-1 flex flex-col ${noPadding ? "" : "p-4 sm:p-5"}`}>{children}</div>
    </div>
  );
}

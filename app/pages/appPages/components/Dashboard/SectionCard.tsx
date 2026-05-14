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
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}
    >
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-slate-100">
        <div>
          <h3 className="text-[15px] font-bold text-[#1A1D23] tracking-tight leading-tight">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-[12px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 mt-0.5">{action}</div> : null}
      </div>
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

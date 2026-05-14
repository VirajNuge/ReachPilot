import React from "react";

export interface QuickActionItem {
  id: string;
  label: string;
  intent: "primary" | "secondary";
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2.5 xl:justify-end">
      {actions.map((action) => (
        <button
          key={action.id}
          className={
            action.intent === "primary"
              ? "min-w-[170px] px-5 py-2.5 rounded-full bg-[#9C4BFF] text-white text-[13px] font-bold shadow-[0_8px_18px_rgba(156,75,255,0.25)] hover:bg-[#8035FF] hover:-translate-y-0.5 transition-all duration-300"
              : "min-w-[140px] px-5 py-2.5 rounded-full bg-white border border-slate-200 text-[13px] font-bold text-[#1A1D23] hover:border-[#9C4BFF] hover:text-[#9C4BFF] hover:bg-purple-50/30 transition-all duration-300 shadow-sm"
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

import React from "react";
import SectionCard from "./SectionCard";

export interface RecommendationItem {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
}

interface SmartRecommendationsProps {
  items: RecommendationItem[];
}

export default function SmartRecommendations({ items }: SmartRecommendationsProps) {
  return (
    <SectionCard
      title="Smart Recommendations"
      subtitle="Suggested next actions"
      action={
        <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
          Dismiss all
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/30 hover:bg-white hover:border-[#9C4BFF] hover:shadow-md transition-all duration-300">
            <div className="text-[14px] font-bold text-[#1A1D23] leading-tight">{item.title}</div>
            <p className="text-[12px] text-slate-500 mt-2 font-medium leading-relaxed">{item.reason}</p>
            <button className="mt-4 text-[12px] font-bold text-[#0052FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              {item.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

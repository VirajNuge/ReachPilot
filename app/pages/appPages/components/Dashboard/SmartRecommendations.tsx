import React from "react";
import SectionCard from "./SectionCard";
import { Sparkles, ArrowRight } from "lucide-react";

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
      subtitle="Suggested next actions to boost growth"
      action={
        <button
          type="button"
          className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Dismiss all
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles size={12} />
                </span>
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{item.reason}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

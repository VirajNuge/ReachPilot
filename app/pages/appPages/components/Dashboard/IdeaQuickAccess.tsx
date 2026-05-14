import React from "react";
import SectionCard from "./SectionCard";

export interface IdeaItem {
  id: string;
  title: string;
  mode: string;
}

interface IdeaQuickAccessProps {
  ideas: IdeaItem[];
}

export default function IdeaQuickAccess({ ideas }: IdeaQuickAccessProps) {
  return (
    <SectionCard
      title="Idea Finder"
      subtitle="Fresh ideas ready to generate"
      action={
        <button className="text-[11px] font-semibold text-[#0052FF] hover:text-[#003ED1] bg-blue-50 px-2.5 py-1 rounded-full">
          Generate new
        </button>
      }
    >
      <div className="space-y-3">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-white hover:border-[#0052FF] transition-all group flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-[14px] font-bold text-[#1A1D23] group-hover:text-[#0052FF] transition-colors">
                {idea.title}
              </div>
              <div className="text-[12px] font-medium text-slate-500 mt-1">{idea.mode}</div>
            </div>
            <button className="text-[12px] font-bold text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              Use
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

import React from "react";
import SectionCard from "./SectionCard";

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  usage: number;
}

interface TemplatePreviewProps {
  templates: TemplateItem[];
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  general:     { bg: "bg-slate-100",   text: "text-slate-600"  },
  linkedin:    { bg: "bg-[#0A66C2]/8", text: "text-[#0A66C2]" },
  hooks:       { bg: "bg-purple-50",   text: "text-purple-600" },
  storytelling:{ bg: "bg-amber-50",    text: "text-amber-600"  },
  engagement:  { bg: "bg-emerald-50",  text: "text-emerald-600"},
  cta:         { bg: "bg-rose-50",     text: "text-rose-500"   },
};

function getCategoryStyle(category: string) {
  return categoryColors[category?.toLowerCase()] || { bg: "bg-slate-100", text: "text-slate-600" };
}

export default function TemplatePreview({ templates }: TemplatePreviewProps) {
  return (
    <SectionCard
      title="Templates"
      subtitle="Most used patterns"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          View library
        </button>
      }
      noPadding
    >
      <div className="divide-y divide-slate-100">
        {templates.map((template) => {
          const cs = getCategoryStyle(template.category);
          return (
            <div
              key={template.id}
              className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 flex items-center justify-center text-[15px] group-hover:scale-105 transition-transform">
                📄
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A1D23] truncate group-hover:text-[#9C4BFF] transition-colors">
                  {template.name}
                </div>
                <span className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cs.bg} ${cs.text}`}>
                  {template.category}
                </span>
              </div>

              {/* Usage */}
              <div className="flex-shrink-0 flex items-center gap-1 text-[12px] font-bold text-slate-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                  <path d="M8 1v9M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {template.usage}x
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight, Bookmark, Layers } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
  general:     { bg: "bg-slate-100",   text: "text-slate-600" },
  linkedin:    { bg: "bg-[#0A66C2]/10", text: "text-[#0A66C2]" },
  hooks:       { bg: "bg-purple-50",   text: "text-purple-600" },
  storytelling:{ bg: "bg-amber-50",    text: "text-amber-600" },
  engagement:  { bg: "bg-emerald-50",  text: "text-emerald-600"},
  cta:         { bg: "bg-rose-50",     text: "text-rose-600" },
};

function getCategoryStyle(category: string) {
  return categoryColors[category?.toLowerCase()] || { bg: "bg-slate-100", text: "text-slate-600" };
}

export default function TemplatePreview({ templates }: TemplatePreviewProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  return (
    <SectionCard
      title="Templates"
      subtitle="Most used patterns"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/postGenerator`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>View library</span>
          <ArrowUpRight size={13} />
        </button>
      }
      noPadding
    >
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
            <Layers size={18} />
          </div>
          <p className="text-xs font-semibold text-slate-700">No templates saved yet</p>
          <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
            Save successful hooks and post formats to build your reuse library.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {templates.map((template) => {
            const cs = getCategoryStyle(template.category);
            return (
              <div
                key={template.id}
                className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 group-hover:text-blue-600 transition-colors">
                  <Bookmark size={15} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </div>
                  <span className={`mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cs.bg} ${cs.text}`}>
                    {template.category}
                  </span>
                </div>

                {/* Usage */}
                <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <span>{template.usage}x used</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export interface IdeaItem {
  id: string;
  title: string;
  mode: string;
}

interface IdeaQuickAccessProps {
  ideas: IdeaItem[];
}

export default function IdeaQuickAccess({ ideas }: IdeaQuickAccessProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  return (
    <SectionCard
      title="Idea Finder"
      subtitle="Fresh ideas ready to generate"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/generateIdeas`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Generate new</span>
          <ArrowUpRight size={13} />
        </button>
      }
    >
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
            <Lightbulb size={18} />
          </div>
          <p className="text-xs font-semibold text-slate-700">No ideas saved yet</p>
          <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
            Use the Idea Finder to brainstorm and save high-performing concepts.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xs group cursor-pointer"
            >
              <div className="min-w-0 flex-1 mr-3">
                <div className="truncate text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {idea.title}
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{idea.mode}</div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/${accountId}/postGenerator?idea=${encodeURIComponent(idea.title)}`)}
                className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
              >
                Use
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}


import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight, Activity, PenTool } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export interface ActivityItem {
  id: string;
  title: string;
  preview: string;
  status: "draft" | "published" | "scheduled" | "analyzed" | "failed";
  platform: string;
  time: string;
  metric?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const statusConfig: Record<
  ActivityItem["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  draft:     { label: "Draft",     bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   },
  published: { label: "Published", bg: "bg-emerald-50",  text: "text-emerald-600", dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500"    },
  analyzed:  { label: "Analyzed",  bg: "bg-purple-50",   text: "text-purple-600",  dot: "bg-purple-500"  },
  failed:    { label: "Failed",    bg: "bg-rose-50",     text: "text-rose-600",    dot: "bg-rose-500"    },
};

const platformInitial = (platform: string) => (platform || "?").slice(0, 1).toUpperCase();

const platformBg: Record<string, string> = {
  l: "bg-[#0A66C2]/10 text-[#0A66C2]",
  x: "bg-slate-100 text-slate-800",
  i: "bg-[#E1306C]/10 text-[#E1306C]",
  f: "bg-[#1877F2]/10 text-[#1877F2]",
};

function getPlatformBg(platform: string) {
  const key = platform?.slice(0, 1).toLowerCase();
  return platformBg[key] || "bg-blue-50 text-blue-600";
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  return (
    <SectionCard
      title="Recent Activity"
      subtitle="Latest posts, analyses, and templates"
      action={
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>View all</span>
          <ArrowUpRight size={13} />
        </button>
      }
      noPadding
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs">
            <Activity size={20} />
          </div>
          <p className="text-sm font-bold text-slate-800">No activity recorded yet</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
            Generate your first AI post, schedule content, or analyze an account to see live activity.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/${accountId}/postGenerator`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <PenTool size={12} />
              <span>Generate post</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${accountId}/postAnalyzer`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Analyze a post</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const sc = statusConfig[item.status] || statusConfig.draft;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Platform avatar */}
                <div
                  className={`h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center text-[13px] font-black ${getPlatformBg(item.platform)} group-hover:scale-105 transition-transform`}
                >
                  {platformInitial(item.platform)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
                    {item.preview}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 font-medium">
                    <span>{item.time}</span>
                    {item.metric ? (
                      <span className="text-emerald-600 font-semibold">{item.metric}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}


import React from "react";
import SectionCard from "./SectionCard";

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
  draft:     { label: "Draft",     bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400"   },
  published: { label: "Published", bg: "bg-emerald-50",  text: "text-emerald-600", dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500"    },
  analyzed:  { label: "Analyzed",  bg: "bg-purple-50",   text: "text-purple-600",  dot: "bg-purple-500"  },
  failed:    { label: "Failed",    bg: "bg-rose-50",     text: "text-rose-600",    dot: "bg-rose-500"    },
};

const platformInitial = (platform: string) => (platform || "?").slice(0, 1).toUpperCase();

const platformBg: Record<string, string> = {
  l: "bg-[#0A66C2]/10 text-[#0A66C2]",
  x: "bg-slate-100 text-slate-700",
  i: "bg-[#E1306C]/10 text-[#E1306C]",
  f: "bg-[#1877F2]/10 text-[#1877F2]",
};

function getPlatformBg(platform: string) {
  const key = platform?.slice(0, 1).toLowerCase();
  return platformBg[key] || "bg-purple-50 text-purple-600";
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <SectionCard
      title="Recent Activity"
      subtitle="Latest posts, analyses, and templates"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          View all
        </button>
      }
      noPadding
    >
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="flex items-start gap-3.5 px-6 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
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
                  <span className="text-[13px] font-semibold text-[#1A1D23] truncate">
                    {item.title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                  {item.preview}
                </p>
                <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-3 font-medium">
                  <span>{item.time}</span>
                  {item.metric ? (
                    <span className="text-emerald-500 font-semibold">{item.metric}</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

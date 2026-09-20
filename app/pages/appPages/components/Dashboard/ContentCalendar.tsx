import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight, Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export interface CalendarItem {
  date: string;
  count: number;
  status: "draft" | "scheduled" | "published";
}

interface ContentCalendarProps {
  items: CalendarItem[];
}

const statusConfig: Record<CalendarItem["status"], { bar: string; dot: string; label: string }> = {
  draft:     { bar: "bg-slate-300",    dot: "bg-slate-400",   label: "Draft"     },
  scheduled: { bar: "bg-blue-500",     dot: "bg-blue-500",    label: "Scheduled" },
  published: { bar: "bg-emerald-500",  dot: "bg-emerald-500", label: "Published" },
};

export default function ContentCalendar({ items }: ContentCalendarProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  return (
    <SectionCard
      title="Content Calendar"
      subtitle="Next 7 days"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/publishing`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Open calendar</span>
          <ArrowUpRight size={13} />
        </button>
      }
      noPadding
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-xs">
            <CalendarIcon size={20} />
          </div>
          <p className="text-sm font-bold text-slate-800">No scheduled content</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
            Your calendar is clear for the next 7 days. Plan ahead and queue posts to keep your channels active.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push(`/${accountId}/publishing`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Open publishing queue</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const sc = statusConfig[item.status] || statusConfig.draft;
            return (
              <div
                key={item.date}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Date block */}
                <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                  <span className="text-xs font-bold text-slate-800">
                    {item.date.split("/")[1] || item.date.split("-")[2] || item.date}
                  </span>
                </div>

                {/* Date label + count */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">{item.date}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.count} {item.count === 1 ? "item" : "items"} · {sc.label}
                    </span>
                  </div>
                </div>

                {/* Status bar */}
                <div className={`h-1.5 w-12 rounded-full ${sc.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

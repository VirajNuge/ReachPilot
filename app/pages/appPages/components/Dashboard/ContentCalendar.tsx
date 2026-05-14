import React from "react";
import SectionCard from "./SectionCard";

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
  scheduled: { bar: "bg-blue-400",     dot: "bg-blue-500",    label: "Scheduled" },
  published: { bar: "bg-emerald-400",  dot: "bg-emerald-500", label: "Published" },
};

export default function ContentCalendar({ items }: ContentCalendarProps) {
  return (
    <SectionCard
      title="Content Calendar"
      subtitle="Next 7 days"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          Open calendar
        </button>
      }
      noPadding
    >
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.date}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              {/* Date block */}
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                <span className="text-[13px] font-black text-[#1A1D23]">
                  {item.date.split("/")[1] || item.date.split("-")[2] || item.date}
                </span>
              </div>

              {/* Date label + count */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A1D23]">{item.date}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.count} {item.count === 1 ? "item" : "items"} · {sc.label}
                  </span>
                </div>
              </div>

              {/* Status bar */}
              <div className={`h-1.5 w-14 rounded-full ${sc.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

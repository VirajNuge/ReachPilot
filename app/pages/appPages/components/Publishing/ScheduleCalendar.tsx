"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Lightbulb } from "lucide-react";
import type { PostDraft } from "./types";
import { PLATFORM_META } from "./types";

interface ScheduleCalendarProps {
  selectedDate:     Date | null;
  onDateSelect:     (date: Date) => void;
  scheduledDrafts?: PostDraft[];
  activeDragId?:    string | null;
  onSchedule?:      (draftId: string, date: Date) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ── Mini post card shown inside a calendar cell ─────────────────────────── */

function MiniPostCard({ draft }: { draft: PostDraft }) {
  const primaryColor = PLATFORM_META[draft.platforms[0]]?.color ?? "#0052FF";

  return (
    <div
      className="mt-1 bg-white/95 rounded-md overflow-hidden shrink-0 shadow-sm"
      style={{ borderLeft: `2px solid ${primaryColor}` }}
    >
      {/* Image strip — only if draft has an image */}
      {draft.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={draft.imageUrl}
          alt={draft.title}
          draggable={false}
          className="w-full h-[28px] object-cover pointer-events-none"
        />
      )}

      <div className="px-1.5 py-1">
        <p className="text-[9px] font-black text-[#1A1D23] truncate leading-tight">
          {draft.title}
        </p>
        {/* Platform color dots */}
        <div className="flex items-center gap-0.5 mt-0.5">
          {draft.platforms.map((p) => (
            <span
              key={p}
              title={PLATFORM_META[p].label}
              className="w-[5px] h-[5px] rounded-full inline-block shrink-0"
              style={{ backgroundColor: PLATFORM_META[p].color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function ScheduleCalendar({
  selectedDate,
  onDateSelect,
  scheduledDrafts = [],
  activeDragId    = null,
  onSchedule,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDay,     setHoverDay]     = useState<number | null>(null);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  useEffect(() => {
    if (!activeDragId) setHoverDay(null);
  }, [activeDragId]);

  const getScoreColor = (score: number) => {
    if (score < 30) return "bg-[#F4F7FA] text-slate-600";
    if (score < 60) return "bg-[#EEF3FF] text-[#0052FF]";
    if (score < 80) return "bg-[#DBEAFE] text-[#003DD4]";
    return "bg-gradient-to-br from-[#818CF8] to-[#6B21A8] text-white shadow-md";
  };

  const today = new Date();

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year  === today.getFullYear();

  const isSelected = (day: number) =>
    !!selectedDate &&
    day   === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year  === selectedDate.getFullYear();

  /** Returns the PostDraft objects scheduled on a given day */
  const draftsForDay = (day: number): PostDraft[] =>
    scheduledDrafts.filter((d) => {
      if (!d.scheduledDate) return false;
      const sd = new Date(d.scheduledDate);
      return (
        sd.getDate()     === day   &&
        sd.getMonth()    === month &&
        sd.getFullYear() === year
      );
    });

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden flex-1 min-w-0">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              POWER HOUR HEATMAP
            </p>
            <h2 className="text-[18px] font-black text-[#1A1D23] leading-none">
              Schedule Calendar
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm transition-colors"
            >
              ‹
            </button>
            <div className="bg-[#EEF3FF] text-[#0052FF] px-3 py-1 rounded-full text-[11px] font-bold min-w-[110px] text-center">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </div>
            <button
              onClick={nextMonth}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        {/* Drag hint */}
        <div
          className={[
            "mt-2 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors",
            activeDragId
              ? "bg-[#0052FF] text-white animate-pulse"
              : "bg-[#EEF3FF] text-[#0052FF]",
          ].join(" ")}
        >
          <span>{activeDragId ? <CalendarCheck size={12} /> : <Lightbulb size={12} />}</span>
          <span>
            {activeDragId
              ? "Release on a date to schedule this post"
              : "Drag a post from the queue onto a date to schedule it"}
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 p-4 flex flex-col min-h-0 overflow-y-auto [scrollbar-width:none]">

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5 shrink-0">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1.5"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells — rows grow to fit post cards */}
        <div className="grid grid-cols-7 gap-1.5 [grid-auto-rows:minmax(52px,auto)]">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="rounded-xl" />;
            }

            const date        = new Date(year, month, day);
            const dayOfWeek   = date.getDay();
            const score       = (dayOfWeek * 7 + day) % 100;
            const colorClass  = getScoreColor(score);
            const postsForDay = draftsForDay(day);
            const hasPosts    = postsForDay.length > 0;
            const isDragHover = activeDragId !== null && hoverDay === day;

            const ringClass = isDragHover
              ? "ring-2 ring-[#0052FF] scale-[1.02] shadow-md"
              : isSelected(day)
              ? "ring-2 ring-[#0052FF]"
              : isToday(day)
              ? "ring-2 ring-[#0052FF] ring-offset-2"
              : activeDragId
              ? "ring-1 ring-[#0052FF]/20"
              : "";

            return (
              <div
                key={`day-${day}`}
                data-calendar-day={String(day)}
                data-calendar-month={String(month)}
                data-calendar-year={String(year)}
                onClick={() => onDateSelect(date)}
                onPointerEnter={() => { if (activeDragId) setHoverDay(day); }}
                onPointerLeave={() => setHoverDay(null)}
                className={[
                  "rounded-xl cursor-pointer transition-all relative select-none",
                  hasPosts
                    ? "p-1.5 flex flex-col"
                    : "flex flex-col items-center justify-center p-1",
                  colorClass,
                  isDragHover ? "" : "hover:opacity-80",
                  ringClass,
                ].join(" ")}
              >
                {hasPosts ? (
                  <>
                    {/* Day number row */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black leading-none">{day}</span>
                      {score >= 75 && (
                        <span className="text-[7px] leading-none" title="High Engagement Predicted">
                          ✨
                        </span>
                      )}
                    </div>

                    {/* Post cards — max 2 visible, "+N more" badge for overflow */}
                    {postsForDay.slice(0, 2).map((draft) => (
                      <MiniPostCard key={draft.id} draft={draft} />
                    ))}

                    {postsForDay.length > 2 && (
                      <span className="mt-1 text-[8px] font-bold text-[#0052FF] bg-white/80 rounded px-1 py-0.5 self-start">
                        +{postsForDay.length - 2} more
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold leading-none">{day}</span>
                    {score >= 75 && (
                      <div
                        className="absolute top-1 right-1 text-[7px] opacity-80 leading-none"
                        title="High Engagement Predicted"
                      >
                        ✨
                      </div>
                    )}
                  </>
                )}

                {/* Drop target pulse ring */}
                {isDragHover && (
                  <div className="absolute inset-0 rounded-xl border-2 border-[#0052FF] animate-pulse pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Low</span>
            <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-[#F4F7FA] via-[#EEF3FF] to-[#6B21A8]" />
            <span>Peak</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block bg-white border-l-2 border-[#0052FF]" />
              Scheduled post
            </span>
            <span className="flex items-center gap-1">
              <span>✨</span> High engagement window
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

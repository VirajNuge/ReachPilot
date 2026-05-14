"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Lightbulb, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import type { PostDraft } from "./types";
import { PLATFORM_META } from "./types";
import { OptimalTimesPanel } from "./OptimalTimesPanel";
import type { OptimalSlot } from "@/lib/publishing/types";

interface ScheduleCalendarProps {
  selectedDate:     Date | null;
  onDateSelect:     (date: Date) => void;
  scheduledDrafts?: PostDraft[];
  activeDragId?:    string | null;
  onSchedule?:      (draftId: string, date: Date) => void;
  viewMode:         "month" | "week";
  setViewMode:      (mode: "month" | "week") => void;
  optimalSlots:     OptimalSlot[];
  onCalculateOptimalTimes: () => void;
  hasPersona: boolean;
  isOptimalTimesLoading: boolean;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

/* ── Mini post card shown inside a calendar cell ─────────────────────────── */

function MiniPostCard({ draft }: { draft: PostDraft }) {
  const primaryColor = PLATFORM_META[draft.platforms[0]]?.color ?? "#0052FF";

  return (
    <div
      className="mt-1 bg-white/95 rounded-md overflow-hidden shrink-0 shadow-sm border border-slate-100"
      style={{ borderLeftWidth: "3px", borderLeftColor: primaryColor }}
    >
      {/* Image strip — only if draft has an image */}
      {draft.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={draft.imageUrl}
          alt={draft.title}
          draggable={false}
          className="w-full h-[24px] object-cover pointer-events-none opacity-80"
        />
      )}

      <div className="px-1.5 py-1">
        <p className="text-[9px] font-bold text-[#1A1D23] truncate leading-tight">
          {draft.title}
        </p>
        {/* Platform color dots */}
        <div className="flex items-center gap-0.5 mt-0.5">
          {draft.platforms.map((p) => (
            <span
              key={p}
              title={PLATFORM_META[p].label}
              className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
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
  viewMode,
  setViewMode,
  optimalSlots,
  onCalculateOptimalTimes,
  hasPersona,
  isOptimalTimesLoading,
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

  // Week view calculations
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const nextPeriod = () => {
    if (viewMode === "month") setCurrentMonth(new Date(year, month + 1, 1));
    else {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + 7);
      setCurrentWeekStart(d);
    }
  };

  const prevPeriod = () => {
    if (viewMode === "month") setCurrentMonth(new Date(year, month - 1, 1));
    else {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() - 7);
      setCurrentWeekStart(d);
    }
  };

  useEffect(() => {
    if (!activeDragId) setHoverDay(null);
  }, [activeDragId]);

  const today = new Date();

  const isToday = (day: number, m: number, y: number) =>
    day === today.getDate() &&
    m === today.getMonth() &&
    y === today.getFullYear();

  const isSelected = (day: number, m: number, y: number) =>
    !!selectedDate &&
    day   === selectedDate.getDate() &&
    m === selectedDate.getMonth() &&
    y === selectedDate.getFullYear();

  /** Returns the PostDraft objects scheduled on a given day */
  const draftsForDay = (day: number, m: number, y: number): PostDraft[] =>
    scheduledDrafts.filter((d) => {
      if (!d.scheduledDate) return false;
      const sd = new Date(d.scheduledDate);
      return (
        sd.getDate() === day &&
        sd.getMonth() === m &&
        sd.getFullYear() === y
      );
    });
    
  /** Returns the PostDraft objects scheduled on a given hour of a day */
  const draftsForHour = (day: number, m: number, y: number, hour: number): PostDraft[] =>
    scheduledDrafts.filter((d) => {
      if (!d.scheduledDate) return false;
      const sd = new Date(d.scheduledDate);
      return (
        sd.getDate() === day &&
        sd.getMonth() === m &&
        sd.getFullYear() === y &&
        sd.getHours() === hour
      );
    });

  /**
   * Returns a 0-5 score for a day-of-week based on ranked AI slot quality.
   * Higher-ranked slots produce darker day shading.
   */
  const dayScore = (dayOfWeek: number): number => {
    if (optimalSlots.length === 0) return 0;

    const weightedScore = optimalSlots.reduce((total, slot, index) => {
      if (slot.day !== dayOfWeek) return total;
      return total + Math.max(1, 5 - index);
    }, 0);

    if (weightedScore === 0) return 0;

    const maxWeightedScore = Math.max(
      ...DAYS_OF_WEEK.map((_, dayIndex) =>
        optimalSlots.reduce((total, slot, index) => {
          if (slot.day !== dayIndex) return total;
          return total + Math.max(1, 5 - index);
        }, 0)
      ),
      1
    );

    return Math.max(1, Math.ceil((weightedScore / maxWeightedScore) * 5));
  };

  /**
   * Returns a 0-5 score for a specific day+hour slot.
   * Slot rank (position in array) determines score: first = best.
   */
  const hourScore = (dayOfWeek: number, hour: number): number => {
    const idx = optimalSlots.findIndex(s => s.day === dayOfWeek && s.hour === hour);
    if (idx === -1) return 0;
    // Rank 0 = 5 (best), rank 4+ = 1
    return Math.max(1, 5 - idx);
  };

  /** Returns a Tailwind bg class for month cells based on day score (0-5). */
  const dayScoreBg = (score: number, isOpt: boolean): string => {
    if (!isOpt || score === 0) return "bg-white border border-slate-100";
    if (score >= 5) return "bg-[#003BB3] border border-[#003BB3]";
    if (score >= 4) return "bg-[#0052FF] border border-[#0052FF]";
    if (score >= 3) return "bg-[#3B82F6] border border-[#3B82F6]";
    if (score >= 2) return "bg-[#93C5FD] border border-[#93C5FD]";
    return "bg-[#DBEAFE] border border-[#BFDBFE]";
  };

  /** Returns text color class to contrast against the cell bg. */
  const dayScoreText = (score: number, isOpt: boolean): string => {
    if (!isOpt || score === 0) return "text-[#1A1D23]";
    if (score >= 3) return "text-white";
    return "text-[#1E40AF]";
  };

  /** Returns a Tailwind bg class for hour cells in week view (score 0-5). */
  const hourScoreBg = (score: number): string => {
    if (score === 0) return "hover:bg-slate-50";
    if (score >= 5) return "bg-[#003BB3]/20 hover:bg-[#003BB3]/30";
    if (score >= 4) return "bg-[#0052FF]/15 hover:bg-[#0052FF]/25";
    if (score >= 3) return "bg-[#3B82F6]/12 hover:bg-[#3B82F6]/20";
    if (score >= 2) return "bg-[#93C5FD]/20 hover:bg-[#93C5FD]/30";
    return "bg-[#DBEAFE]/30 hover:bg-[#DBEAFE]/50";
  };

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden flex-1 min-w-0">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Content Calendar
              </p>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode("month")}
                  className={`p-1 rounded-md transition-all ${viewMode === "month" ? "bg-white shadow-sm text-[#1A1D23]" : "text-slate-400 hover:text-slate-600"}`}
                  title="Month View"
                >
                  <LayoutGrid size={12} />
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`p-1 rounded-md transition-all ${viewMode === "week" ? "bg-white shadow-sm text-[#1A1D23]" : "text-slate-400 hover:text-slate-600"}`}
                  title="Week View"
                >
                  <List size={12} />
                </button>
              </div>
            </div>
            <h2 className="text-[18px] font-black text-[#1A1D23] leading-none">
              {viewMode === "month" 
                ? currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
                : `Week of ${currentWeekStart.toLocaleString("default", { month: "short", day: "numeric" })}`}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevPeriod}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                if (viewMode === "month") setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                else {
                  const d = new Date();
                  d.setDate(d.getDate() - d.getDay());
                  setCurrentWeekStart(d);
                }
              }}
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Drag hint */}
        <div
          className={[
            "mt-3 text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors",
            activeDragId
              ? "bg-[#0052FF] text-white animate-pulse shadow-md"
              : "bg-[#F4F7FA] text-slate-500",
          ].join(" ")}
        >
          <span>{activeDragId ? <CalendarCheck size={12} /> : <Lightbulb size={12} className={optimalSlots.length > 0 ? "text-[#0052FF]" : ""} />}</span>
          <span>
            {activeDragId
              ? "Release on a date/time to schedule this post"
              : optimalSlots.length > 0
                ? "Darker blue = better posting time. Lighter = decent. White = no data."
                : "Drag a post from the queue onto a date to schedule it"}
          </span>
        </div>
      </div>

      {/* Calendar grid - conditionally render based on viewMode */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {viewMode === "month" ? (
          <div className="flex-1 p-4 flex flex-col min-h-0 overflow-y-auto [scrollbar-width:none]">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5 shrink-0">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5 [grid-auto-rows:minmax(60px,auto)]">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="rounded-xl border border-dashed border-slate-100 bg-slate-50/50" />;
                }

                const date        = new Date(year, month, day);
                const dayOfWeek   = date.getDay();
                const score       = dayScore(dayOfWeek);
                const isOpt       = score > 0;

                const postsForDay = draftsForDay(day, month, year);
                const hasPosts    = postsForDay.length > 0;
                const isDragHover = activeDragId !== null && hoverDay === day;

                const ringClass = isDragHover
                  ? "ring-2 ring-[#0052FF] scale-[1.02] shadow-md z-10"
                  : isSelected(day, month, year)
                  ? "ring-2 ring-white/60 z-10"
                  : isToday(day, month, year)
                  ? "ring-2 ring-[#0052FF] ring-offset-2 z-10"
                  : activeDragId
                  ? "ring-1 ring-[#0052FF]/20"
                  : "";

                const bgClass   = dayScoreBg(score, isOpt);
                const textClass = dayScoreText(score, isOpt);

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
                      hasPosts ? "p-1.5 flex flex-col" : "p-2",
                      bgClass,
                      isDragHover ? "" : "hover:shadow-md",
                      ringClass,
                    ].join(" ")}
                  >
                    <div className={`flex items-center justify-between w-full ${!hasPosts && "h-full flex-col justify-center items-center"}`}>
                      <span className={`font-black leading-none ${isToday(day, month, year) ? "text-[14px]" : "text-[12px]"} ${textClass}`}>
                        {day}
                      </span>
                    </div>

                    {hasPosts && (
                      <div className="mt-1 space-y-1">
                        {postsForDay.slice(0, 2).map((draft) => (
                          <MiniPostCard key={draft.id} draft={draft} />
                        ))}

                        {postsForDay.length > 2 && (
                          <span className="mt-1 text-[8px] font-bold text-[#0052FF] bg-[#EEF3FF] rounded px-1.5 py-0.5 self-start inline-block">
                            +{postsForDay.length - 2} more
                          </span>
                        )}
                      </div>
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
            <div className="mt-3 pt-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {["bg-[#003BB3]","bg-[#0052FF]","bg-[#3B82F6]","bg-[#93C5FD]","bg-[#DBEAFE]"].map((bg,i) => (
                    <span key={i} className={`w-5 h-3 rounded ${bg} inline-block`} />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Best → Good → No data</span>
              </div>
            </div>
          </div>
        ) : (
          /* Week View */
          <div className="flex-1 flex flex-col min-h-0 relative">
            
            {/* Week Header */}
            <div className="flex border-b border-slate-200 shrink-0 bg-white z-20">
              <div className="w-[60px] shrink-0 border-r border-slate-100" /> {/* Time column header spacer */}
              {Array.from({ length: 7 }).map((_, i) => {
                const date  = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                const isT   = isToday(date.getDate(), date.getMonth(), date.getFullYear());
                const score = dayScore(i);
                const isOpt = score > 0;

                // Header bg: apply light tint of the score color for the column
                return (
                  <div key={i} className={`flex-1 text-center py-2 border-r border-slate-100 ${isT ? "bg-[#EEF3FF]" : ""}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isT ? "text-[#0052FF]" : isOpt ? "text-[#0052FF]" : "text-slate-400"}`}>
                      {DAYS_OF_WEEK[i]}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <p className={`text-[16px] font-black leading-none ${isT ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>
                        {date.getDate()}
                      </p>
                      {isOpt && score >= 4 && <span className="text-[9px]" title="Top posting day">●</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Week Grid Scrollable Area */}
            <div className="flex-1 overflow-y-auto relative [scrollbar-width:none]">
              <div className="flex">
                {/* Time Column */}
                <div className="w-[60px] shrink-0 flex flex-col bg-white">
                  {HOURS.map(h => (
                    <div key={`time-${h}`} className="h-[60px] border-b border-slate-100 flex items-start justify-end pr-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 leading-none">
                        {h > 12 ? `${h-12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Day Columns */}
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const date = new Date(currentWeekStart);
                  date.setDate(date.getDate() + dayIdx);
                  
                  return (
                    <div key={`col-${dayIdx}`} className="flex-1 flex flex-col border-r border-slate-100">
                      {HOURS.map(h => {
                        const score = hourScore(dayIdx, h);
                        const posts = draftsForHour(date.getDate(), date.getMonth(), date.getFullYear(), h);
                        return (
                          <div
                            key={`cell-${dayIdx}-${h}`}
                            onClick={() => {
                              const selectDate = new Date(date);
                              selectDate.setHours(h, 0, 0, 0);
                              onDateSelect(selectDate);
                            }}
                            className={`h-[60px] border-b border-slate-100 relative p-1 cursor-pointer transition-colors ${hourScoreBg(score)}`}
                          >

                            {posts.map((draft, i) => (
                              <div key={draft.id} className="absolute left-1 right-1" style={{ top: `${i * 24 + 4}px`, zIndex: 10 }}>
                                <MiniPostCard draft={draft} />
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
        
      </div>

      {/* Optimal Times Panel at the bottom */}
      <div className="mt-auto border-t border-slate-100 px-2 py-2 bg-slate-50/30">
        <OptimalTimesPanel 
          onCalculate={onCalculateOptimalTimes}
          isLoading={isOptimalTimesLoading}
          savedSlots={optimalSlots.length > 0 ? optimalSlots : null}
          hasPersona={hasPersona}
          isEmbedded={true}
        />
      </div>
    </div>
  );
}

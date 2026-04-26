"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaGripVertical,
  FaPlus,
  FaHashtag,
  FaPinterest,
} from "react-icons/fa";
import { Trash2, CalendarDays } from "lucide-react";
import { SiThreads } from "react-icons/si";
import type { PostDraft, Platform } from "./types";
import { PLATFORM_META } from "./types";

interface PostQueueProps {
  drafts: PostDraft[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (newDrafts: PostDraft[]) => void;
  /** Called when the user starts dragging a card (for cross-component calendar scheduling) */
  onDragStart?: (draftId: string) => void;
  /** Called when user clicks the empty-state "New Post" button */
  onNewPost?: () => void;
  /** Called when user clicks delete on a draft */
  onDelete?: (draftId: string) => void;
  /** Called to schedule a draft directly */
  onSchedule?: (draftId: string, date: Date) => void;
  /** Called to unschedule a scheduled draft */
  onUnschedule?: (draftId: string) => void;
}

const PLATFORM_ICONS: Record<Platform, { icon: React.ElementType; color: string }> = {
  linkedin:       { icon: FaLinkedin,  color: "#0A66C2" },
  x:              { icon: FaTwitter,   color: "#000000" },
  instagram_post: { icon: FaInstagram, color: "#E1306C" },
  facebook:       { icon: FaFacebook,  color: "#1877F2" },
  threads:        { icon: SiThreads,   color: "#111827" },
  pinterest:      { icon: FaPinterest, color: "#E60023" },
};

const STATUS_BADGE: Record<PostDraft["status"], string> = {
  draft:     "bg-slate-100 text-slate-500",
  scheduled: "bg-[#EEF3FF] text-[#0052FF]",
  published: "bg-[#F3FFE5] text-[#4D8C00]",
};

const STATUS_DOT: Record<PostDraft["status"], string> = {
  draft:     "bg-slate-300",
  scheduled: "bg-[#0052FF]",
  published: "bg-[#4D8C00]",
};

function totalHashtags(draft: PostDraft) {
  return (
    (draft.hashtags?.highReach?.length ?? 0) +
    (draft.hashtags?.niche?.length ?? 0) +
    (draft.hashtags?.branded?.length ?? 0)
  );
}

function firstCaption(draft: PostDraft): string {
  for (const p of draft.platforms) {
    const c = draft.captions?.[p];
    if (c) return c;
  }
  return "";
}

export function PostQueue({ drafts, selectedId, onSelect, onReorder, onDragStart, onNewPost, onDelete, onSchedule, onUnschedule }: PostQueueProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  /* ── Refs to avoid stale closures inside document-level handlers ─────── */
  const dragIndexRef    = useRef<number | null>(null);
  const overIndexRef    = useRef<number | null>(null);
  const draftsRef       = useRef(drafts);
  const onReorderRef    = useRef(onReorder);
  const onSelectRef     = useRef(onSelect);
  const onDragStartRef  = useRef(onDragStart);

  useEffect(() => { draftsRef.current      = drafts;      }, [drafts]);
  useEffect(() => { onReorderRef.current   = onReorder;   }, [onReorder]);
  useEffect(() => { onSelectRef.current    = onSelect;    }, [onSelect]);
  useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);

  /* ── Pointer-based drag ─────────────────────────────────────────────── */

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (e.button !== 0) return; // left-click only

    const startX = e.clientX;
    const startY = e.clientY;
    let dragStarted = false;

    const moveHandler = (ev: PointerEvent) => {
      if (!dragStarted) {
        // Require 5px movement before committing to a drag
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;

        dragStarted = true;
        dragIndexRef.current = index;
        setDragIndex(index);
        onDragStartRef.current?.(draftsRef.current[index].id);

        // Global cursor
        document.body.style.cursor      = "grabbing";
        document.body.style.userSelect  = "none";
      }

      // Resolve which queue card the cursor is over
      const el   = document.elementFromPoint(ev.clientX, ev.clientY);
      const card = el?.closest("[data-card-index]") as HTMLElement | null;
      if (card) {
        const idx = parseInt(card.dataset.cardIndex ?? "-1");
        if (idx >= 0) {
          overIndexRef.current = idx;
          setOverIndex(idx);
        }
      } else {
        overIndexRef.current = null;
        setOverIndex(null);
      }
    };

    const upHandler = () => {
      // Restore cursor
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";

      if (dragStarted) {
        const di = dragIndexRef.current;
        const oi = overIndexRef.current;

        if (di !== null && oi !== null && di !== oi) {
          const next      = [...draftsRef.current];
          const [removed] = next.splice(di, 1);
          next.splice(oi, 0, removed);
          onReorderRef.current(next);
        }

        dragIndexRef.current = null;
        overIndexRef.current = null;
        setDragIndex(null);
        setOverIndex(null);
      } else {
        // No movement — treat as click → select the card
        onSelectRef.current(draftsRef.current[index].id);
      }

      document.removeEventListener("pointermove", moveHandler);
      document.removeEventListener("pointerup",   upHandler);
    };

    document.addEventListener("pointermove", moveHandler);
    document.addEventListener("pointerup",   upHandler);
  };

  /* ── Inline scheduling helper ────────────────────────────────────────── */

  const handleInlineSchedule = (draftId: string) => {
    if (scheduleDate && onSchedule) {
      onSchedule(draftId, new Date(scheduleDate));
      setSchedulingId(null);
      setScheduleDate("");
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */


  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden w-[280px] shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Drafts</p>
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-black text-[#1A1D23] leading-none">Post Queue</h2>
          <span className="bg-[#EEF3FF] text-[#0052FF] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {drafts.length}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
          <FaGripVertical size={10} className="text-slate-300" />
          Drag to reorder · drop on calendar to schedule
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] p-3 space-y-2">
        {drafts.length === 0 ? (
          <div
            onClick={onNewPost}
            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-[#0052FF]/30 transition-colors cursor-pointer"
          >
            <FaPlus size={16} className="mb-1.5" />
            <span className="text-[11px] font-bold">New Post</span>
          </div>
        ) : (
          drafts.map((draft, index) => {
            const isActive   = selectedId === draft.id;
            const isDragging = dragIndex === index;
            const dropAbove  = overIndex === index && dragIndex !== null && dragIndex > index;
            const dropBelow  = overIndex === index && dragIndex !== null && dragIndex < index;
            const preview    = firstCaption(draft);
            const tagCount   = totalHashtags(draft);
            const hasImage   = !!draft.imageUrl;

            return (
              <div key={draft.id} className="relative">
                {/* Drop-above indicator */}
                {dropAbove && (
                  <div className="absolute -top-0.5 left-2 right-2 h-0.5 bg-[#0052FF] rounded-full z-10 shadow-[0_0_8px_rgba(0,82,255,0.5)]" />
                )}

                <div
                  data-card-index={String(index)}
                  onPointerDown={(e) => startDrag(e, index)}
                  className={[
                    "relative rounded-2xl select-none transition-all duration-150 group overflow-hidden",
                    isDragging
                      ? "opacity-30 scale-[0.96]"
                      : isActive
                      ? "cursor-grab bg-[#EEF3FF] border border-[#0052FF]/20 shadow-sm"
                      : "cursor-grab bg-[#F4F7FA] border border-transparent hover:bg-white hover:shadow-sm hover:border-slate-200",
                    overIndex === index && dragIndex !== null && !isDragging
                      ? "ring-2 ring-[#0052FF]/30"
                      : "",
                  ].join(" ")}
                >
                  {/* Image strip */}
                  {hasImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.imageUrl}
                      alt={draft.title}
                      draggable={false}
                      className="w-full h-[80px] object-cover pointer-events-none"
                    />
                  )}

                  <div className="p-3">
                    {/* Title row */}
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="mt-0.5 shrink-0 text-slate-300 group-hover:text-slate-400 transition-colors">
                        <FaGripVertical size={11} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 relative">
                          <h3 className="text-[12px] font-bold text-[#1A1D23] truncate leading-tight pr-6">
                            {draft.title}
                          </h3>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            {draft.status === "scheduled" && onUnschedule ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnschedule(draft.id);
                                }}
                                className="text-slate-400 hover:text-amber-500 hover:bg-amber-50 p-1 rounded transition-colors"
                                title="Remove from Schedule"
                              >
                                <CalendarDays size={12} />
                              </button>
                            ) : draft.status === "draft" && onSchedule ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSchedulingId(schedulingId === draft.id ? null : draft.id);
                                }}
                                className="text-slate-400 hover:text-[#0052FF] hover:bg-[#EEF3FF] p-1 rounded transition-colors"
                                title="Schedule Post"
                              >
                                <CalendarDays size={12} />
                              </button>
                            ) : null}

                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Are you sure you want to delete this post?")) {
                                    onDelete(draft.id);
                                  }
                                }}
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                title="Delete Post"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-start gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 capitalize flex items-center gap-1 ${STATUS_BADGE[draft.status]}`}
                          >
                            <span className={`w-1 h-1 rounded-full inline-block ${STATUS_DOT[draft.status]}`} />
                            {draft.status}
                          </span>
                          
                          {draft.status === "scheduled" && draft.scheduledDate && (
                            <span className="text-[9px] font-bold text-slate-400">
                              {new Date(draft.scheduledDate).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Caption preview */}
                    {preview && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-tight pl-5">
                        {preview}
                      </p>
                    )}

                    {/* Platform icons + hashtag count */}
                    <div className="flex items-center justify-between pl-5">
                      <div className="flex items-center gap-1.5">
                        {draft.platforms.map((p) => {
                          const { icon: Icon, color } = PLATFORM_ICONS[p];
                          return (
                            <span
                              key={p}
                              title={PLATFORM_META[p].label}
                              className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ backgroundColor: `${color}18` }}
                            >
                              <Icon size={10} color={color} />
                            </span>
                          );
                        })}
                      </div>

                      {tagCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                          <FaHashtag size={8} />
                          {tagCount}
                        </span>
                      )}
                    </div>

                    {/* Inline schedule picker */}
                    {schedulingId === draft.id && (
                      <div
                        className="mt-2 p-2 bg-[#EEF3FF] rounded-xl border border-[#0052FF]/20 shadow-sm"
                        onClick={e => e.stopPropagation()}
                        onPointerDown={e => e.stopPropagation()}
                      >
                        <label className="block text-[9px] font-bold text-[#0052FF] uppercase tracking-widest mb-1.5">Pick a date &amp; time</label>
                        <div className="flex gap-1.5">
                          <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="flex-1 bg-white rounded-lg px-2 py-1 text-[11px] font-bold text-[#1A1D23] outline-none focus:ring-1 focus:ring-[#0052FF]/40 border border-slate-200"
                          />
                          <button
                            onClick={() => handleInlineSchedule(draft.id)}
                            disabled={!scheduleDate}
                            className="bg-[#0052FF] disabled:opacity-50 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors hover:bg-[#003DD4]"
                          >
                            Set
                          </button>
                          <button
                            onClick={() => { setSchedulingId(null); setScheduleDate(""); }}
                            className="text-slate-400 hover:text-slate-600 px-1 rounded-lg text-[10px] font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scheduled date */}
                    {draft.status === "scheduled" && draft.scheduledDate && (
                      <div className="mt-2 pt-2 border-t border-[#0052FF]/10 pl-5">
                        <span className="text-[10px] font-bold text-[#0052FF]">
                          🗓{" "}
                          {new Date(draft.scheduledDate).toLocaleDateString("default", {
                            month: "short",
                            day:   "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Drop-below indicator */}
                {dropBelow && (
                  <div className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-[#0052FF] rounded-full z-10 shadow-[0_0_8px_rgba(0,82,255,0.5)]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, CalendarDays, Globe, Tag } from "lucide-react";
import { PostQueue } from "../../components/Publishing/PostQueue";
import { ScheduleCalendar } from "../../components/Publishing/ScheduleCalendar";
import { PostEditor } from "../../components/Publishing/PostEditor";
import { PostDraft, Platform } from "../../components/Publishing/types";
import { postGenerationsToDrafts } from "../../components/Publishing/utils";

/* ── Stat card ───────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, sub, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-5 py-4 flex-1 relative overflow-hidden">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[36px] font-black text-[#1A1D23] leading-none mb-0.5">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium">{sub}</p>
      <div
        className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-white text-base"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function PublishingPage() {
  const params = useParams();
  const accountId = params.id as string;
  const router = useRouter();

  const navigateToPostGenerator = () => router.push(`/${accountId}/postGenerator`);

  const [drafts,       setDrafts]       = useState<PostDraft[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Ref mirrors activeDragId for capture-phase handler (avoids stale closure)
  const activeDragIdRef = useRef<string | null>(null);

  // Fetch posts from API on mount
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/post-generation/save?accountId=${accountId}`);
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(postGenerationsToDrafts(data.posts ?? []));
    } catch {
      // Silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const selectedPost = drafts.find((d) => d.id === selectedId) ?? null;

  const handleDraftChange = (updated: PostDraft) => {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleReorder = (newDrafts: PostDraft[]) => setDrafts(newDrafts);

  const handleSchedule = async (draftId: string, date: Date) => {
    // Optimistic UI update
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, status: "scheduled" as const, scheduledDate: date } : d
      )
    );
    setSelectedDate(date);

    // Persist to API
    try {
      await fetch(`/api/post-generation/save/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduledDate: date.toISOString(),
        }),
      });
    } catch {
      // Revert on failure
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId ? { ...d, status: "draft" as const, scheduledDate: undefined } : d
        )
      );
    }
  };

  /**
   * Called by PostQueue when the user starts dragging a card.
   * Registers a capture-phase pointerup on the document so we can detect
   * if the pointer is released over a calendar cell — BEFORE any other
   * listeners (including PostQueue's own upHandler) fire.
   */
  const handleDragStart = (draftId: string) => {
    activeDragIdRef.current = draftId;
    setActiveDragId(draftId);

    const upHandler = (e: PointerEvent) => {
      const el   = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest("[data-calendar-day]") as HTMLElement | null;

      if (cell && activeDragIdRef.current) {
        const day   = parseInt(cell.dataset.calendarDay   ?? "0");
        const yr    = parseInt(cell.dataset.calendarYear  ?? "0");
        const mo    = parseInt(cell.dataset.calendarMonth ?? "0");
        if (day > 0) {
          handleSchedule(activeDragIdRef.current, new Date(yr, mo, day));
        }
      }

      activeDragIdRef.current = null;
      setActiveDragId(null);
      document.removeEventListener("pointerup", upHandler, { capture: true });
    };

    // capture: true → fires BEFORE PostQueue's bubble-phase upHandler
    document.addEventListener("pointerup", upHandler, { capture: true });
  };

  const scheduledCount = drafts.filter((d) => d.status === "scheduled").length;

  const handleSaveDraft = async (post: PostDraft) => {
    // Persist caption edits to API
    try {
      const captionsRecord: Record<string, string> = {};
      for (const [key, value] of Object.entries(post.captions)) {
        if (value !== undefined) captionsRecord[key] = value;
      }
      await fetch(`/api/post-generation/save/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: post.status,
          output: { captions: captionsRecord },
        }),
      });
    } catch {
      // Silent fail — edits remain in local state
    }
  };
  const totalPlatforms = [...new Set(drafts.flatMap((d) => d.platforms))].length;
  const totalHashtags  = drafts.reduce(
    (acc, d) =>
      acc +
      (d.hashtags?.highReach?.length ?? 0) +
      (d.hashtags?.niche?.length ?? 0) +
      (d.hashtags?.branded?.length ?? 0),
    0
  );

  return (
    <div className="h-full flex flex-col bg-[#F4F7FA] p-5 gap-4 overflow-hidden font-sans">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            SCHEDULING & PUBLISHING
          </p>
          <h1 className="text-2xl font-black text-[#1A1D23] leading-none">Content Planner</h1>
        </div>
        <button
          onClick={navigateToPostGenerator}
          className="bg-[#0052FF] hover:bg-[#003DD4] text-white px-4 py-2.5 rounded-2xl font-bold shadow-[0_4px_14px_rgba(0,82,255,0.2)] text-[13px] transition-all"
        >
          + New Post
        </button>
      </div>

      {/* Stat cards */}
      <div className="shrink-0 flex gap-4">
        <StatCard label="Drafts Ready"  value={drafts.length}    sub="posts in queue"      icon={<FileText      size={16} />} iconBg="#0052FF" />
        <StatCard label="Scheduled"     value={scheduledCount}   sub="upcoming posts"      icon={<CalendarDays  size={16} />} iconBg="#6B21A8" />
        <StatCard label="Platforms"     value={totalPlatforms}   sub="active channels"     icon={<Globe         size={16} />} iconBg="#0A66C2" />
        <StatCard label="Hashtags"      value={totalHashtags}    sub="across all drafts"   icon={<Tag           size={16} />} iconBg="#4D8C00" />
      </div>

      {/* Main row */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <PostQueue
          drafts={drafts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorder={handleReorder}
          onDragStart={handleDragStart}
          onNewPost={navigateToPostGenerator}
        />

        <ScheduleCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          scheduledDrafts={drafts.filter((d) => d.status === "scheduled")}
          activeDragId={activeDragId}
          onSchedule={handleSchedule}
        />

        {selectedPost && (
          <PostEditor
            post={selectedPost}
            onChange={handleDraftChange}
            onSchedule={handleSchedule}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, CalendarDays, Globe, Tag, Sparkles } from "lucide-react";
import { PostQueue } from "../../components/Publishing/PostQueue";
import { ScheduleCalendar } from "../../components/Publishing/ScheduleCalendar";
import { PostEditor } from "../../components/Publishing/PostEditor";
import { PostDraft, Platform } from "../../components/Publishing/types";
import { postGenerationsToDrafts } from "../../components/Publishing/utils";
import type { PlatformPublishResult } from "../../components/Publishing/PublishToast";
import { PublishToast } from "../../components/Publishing/PublishToast";
import { CustomPostModal } from "../../components/Publishing/CustomPostModal";
import type { OptimalSlot } from "@/lib/publishing/types";

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
  const routeAccountId = params.id as string;
  const router = useRouter();
  const [resolvedAccountId, setResolvedAccountId] = useState<string | null>(routeAccountId || null);

  const navigateToPostGenerator = () => router.push(`/${routeAccountId}/postGenerator`);

  const [drafts,       setDrafts]       = useState<PostDraft[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [globalPublishResults, setGlobalPublishResults] = useState<PlatformPublishResult[] | null>(null);
  const [isCustomPostModalOpen, setIsCustomPostModalOpen] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week">("month");
  const [optimalSlots, setOptimalSlots] = useState<OptimalSlot[]>([]);
  const [isOptimalTimesLoading, setIsOptimalTimesLoading] = useState(false);
  const [persona, setPersona] = useState<{ _id?: string; personaName?: string } | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);
  const currentMonth = new Date();
  const currentMonthParams = `month=${currentMonth.getMonth()}&year=${currentMonth.getFullYear()}`;

  const handleApplyOptimalSlots = (slots: OptimalSlot[]) => {
    setOptimalSlots(slots);
    setCalendarViewMode("month");
  };

  useEffect(() => {
    let mounted = true;

    const resolveAccountId = async () => {
      if (routeAccountId) {
        setResolvedAccountId(routeAccountId);
        return;
      }

      try {
        const activeRes = await fetch("/api/accounts/active");
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          if (mounted && typeof activeData?.accountId === "string" && activeData.accountId) {
            setResolvedAccountId(activeData.accountId);
            return;
          }
        }

        const accountsRes = await fetch("/api/accounts");
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          const firstAccountId = accountsData?.accounts?.[0]?._id;
          if (mounted && typeof firstAccountId === "string" && firstAccountId) {
            setResolvedAccountId(firstAccountId);
          }
        }
      } catch (error) {
        console.error("Failed to resolve active account for publishing:", error);
      }
    };

    resolveAccountId();

    return () => {
      mounted = false;
    };
  }, [routeAccountId]);

  // Ref mirrors activeDragId for capture-phase handler (avoids stale closure)
  const activeDragIdRef = useRef<string | null>(null);

  // Fetch posts from API on mount
  const fetchPosts = useCallback(async () => {
    if (!resolvedAccountId) return;
    try {
      const res = await fetch(`/api/post-generation/save?accountId=${resolvedAccountId}`);
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(postGenerationsToDrafts(data.posts ?? []));
    } catch {
      // Silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, [resolvedAccountId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!resolvedAccountId) return;

    let cancelled = false;
    const loadPublishingContext = async () => {
      setPersonaLoading(true);
      setIsOptimalTimesLoading(true);

      try {
        const personaRes = await fetch(`/api/persona/save?accountId=${resolvedAccountId}`);
        const personaData = await personaRes.json();
        const nextPersona = personaData?.persona ?? null;

        if (!cancelled) {
          setPersona(nextPersona);
        }

        const optimalRes = await fetch(`/api/publishing/optimal-times?accountId=${resolvedAccountId}&${currentMonthParams}${nextPersona?._id ? `&personaId=${nextPersona._id}` : ""}`);
        const optimalData = await optimalRes.json();

        if (!optimalRes.ok) {
          throw new Error(optimalData.error || "Failed to load optimal times");
        }

        if (!cancelled && Array.isArray(optimalData.slots)) {
          setOptimalSlots(optimalData.slots);
        }
      } catch (error) {
        console.error("Failed to load publishing context:", error);
      } finally {
        if (!cancelled) {
          setPersonaLoading(false);
          setIsOptimalTimesLoading(false);
        }
      }
    };

    loadPublishingContext();

    return () => {
      cancelled = true;
    };
  }, [resolvedAccountId, currentMonthParams]);

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

  const handleUnschedule = async (draftId: string) => {
    // Optimistic UI
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, status: "draft" as const, scheduledDate: undefined } : d
      )
    );
    try {
      await fetch(`/api/post-generation/save/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft", scheduledDate: null }),
      });
    } catch {
      fetchPosts();
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
          input: {
            platforms: post.platforms,
          },
          output: { captions: captionsRecord },
        }),
      });
    } catch {
      // Silent fail — edits remain in local state
    }
  };

  const handleDelete = async (draftId: string) => {
    // Optimistic UI update
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    if (selectedId === draftId) setSelectedId(null);
    try {
      const res = await fetch(`/api/post-generation/save/${draftId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      // Revert if failed
      fetchPosts();
    }
  };

  const handlePublishNow = async (draftId: string): Promise<PlatformPublishResult[]> => {
    try {
      const res = await fetch(`/api/post-generation/publish/${draftId}`, {
        method: "POST",
      });
      const data = await res.json() as { results?: PlatformPublishResult[]; error?: string };

      if (!res.ok) {
        return [{ platform: "all", success: false, error: data.error || "Publish failed" }];
      }

      const results: PlatformPublishResult[] = data.results ?? [];

      // Optimistically update local state if any platform succeeded
      if (results.some((r) => r.success)) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
        if (selectedId === draftId) setSelectedId(null);
      }

      return results;
    } catch {
      return [{ platform: "all", success: false, error: "Network error" }];
    }
  };

  const handleCalculateOptimalTimes = async () => {
    if (!resolvedAccountId) return;

    setIsOptimalTimesLoading(true);
    try {
      const res = await fetch("/api/publishing/optimal-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountId: resolvedAccountId,
          month: currentMonth.getMonth(),
          year: currentMonth.getFullYear()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate optimal times");
      }

      if (Array.isArray(data.slots)) {
        handleApplyOptimalSlots(data.slots);
      }
    } catch (error) {
      console.error("Failed to calculate optimal times:", error);
    } finally {
      setIsOptimalTimesLoading(false);
    }
  };

  const hasPersona = personaLoading || Boolean(persona?._id);
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
          <div className="flex items-center gap-6 mt-0.5">
            <h1 className="text-2xl font-black text-[#1A1D23] leading-none">Content Planner</h1>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={navigateToPostGenerator}
                className="bg-[#0052FF] hover:bg-[#003DD4] text-white px-4 py-2 rounded-xl font-bold shadow-[0_4px_14px_rgba(0,82,255,0.2)] text-[13px] transition-all flex items-center gap-2 border-none outline-none"
              >
                <Sparkles size={15} />
                Generate Post
              </button>
              <button
                onClick={() => setIsCustomPostModalOpen(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-[#1A1D23] px-4 py-2 rounded-xl font-bold shadow-sm text-[13px] transition-all flex items-center gap-2 outline-none"
              >
                <FileText size={15} />
                Custom Post
              </button>
            </div>
          </div>
        </div>
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
          onDelete={handleDelete}
          onSchedule={handleSchedule}
          onUnschedule={handleUnschedule}
        />

        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <ScheduleCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            scheduledDrafts={drafts.filter((d) => d.status === "scheduled")}
            activeDragId={activeDragId}
            onSchedule={handleSchedule}
            viewMode={calendarViewMode}
            setViewMode={setCalendarViewMode}
            optimalSlots={optimalSlots}
            onCalculateOptimalTimes={handleCalculateOptimalTimes}
            hasPersona={hasPersona}
            isOptimalTimesLoading={isOptimalTimesLoading}
          />
        </div>

      </div>

      {selectedPost && (
        <PostEditor
          post={selectedPost}
          onChange={handleDraftChange}
          onClose={() => setSelectedId(null)}
          onSchedule={handleSchedule}
          onSaveDraft={handleSaveDraft}
          onPublishNow={handlePublishNow}
        />
      )}

      {globalPublishResults && (
        <PublishToast
          results={globalPublishResults}
          onDismiss={() => setGlobalPublishResults(null)}
        />
      )}

      {isCustomPostModalOpen && resolvedAccountId && (
        <CustomPostModal
          accountId={resolvedAccountId}
          onClose={() => setIsCustomPostModalOpen(false)}
          onSuccess={(draftId) => {
            setIsCustomPostModalOpen(false);
            fetchPosts().then(() => {
              setSelectedId(draftId);
            });
          }}
        />
      )}
    </div>
  );
}

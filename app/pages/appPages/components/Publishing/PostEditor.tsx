"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Send,
  CalendarDays,
  Loader2,
  X,
  GripHorizontal,
} from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaHashtag,
  FaCopy,
  FaCheck,
  FaPinterest,
} from "react-icons/fa";
import type { PostDraft, Platform, ReachScore } from "./types";
import { ALL_PLATFORMS, PLATFORM_META } from "./types";
import { PublishToast } from "./PublishToast";
import type { PlatformPublishResult } from "./PublishToast";

interface PostEditorProps {
  post: PostDraft;
  onChange: (updated: PostDraft) => void;
  onClose: () => void;
  onSchedule?: (postId: string, date: Date) => void;
  onSaveDraft?: (post: PostDraft) => Promise<void> | void;
  onPublishNow?: (postId: string) => Promise<PlatformPublishResult[]>;
}

type PanelPosition = {
  x: number;
  y: number;
};

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  linkedin: FaLinkedin,
  x: FaTwitter,
  instagram_post: FaInstagram,
  facebook: FaFacebook,
  threads: FaHashtag,
  pinterest: FaPinterest,
};

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 760;
const PANEL_MARGIN = 16;

function calculateScore(content: string): ReachScore {
  const words = content.split(/\s+/).filter(Boolean);
  const longWords = words.filter((w) => w.length > 5).length;

  let kr = words.length ? Math.min((longWords / words.length) * 100, 100) : 0;
  let ss = 50;
  if (content.includes("!") || content.includes("?")) ss = 70;
  if (content.length > 100) ss += 20;
  let hv = 40;
  const lines = content.split("\n").filter(Boolean);
  if (lines.length > 0) {
    const first = lines[0];
    if (first.includes("?") || /^[A-Z]/.test(first)) hv = 80;
  }
  return {
    keywordRelevance: Math.round(kr),
    sentimentStrength: Math.min(Math.round(ss), 100),
    hookVelocity: Math.round(hv),
    total: Math.round(kr * 0.4 + ss * 0.3 + hv * 0.3),
  };
}

function HashtagPill({
  tag,
  variant,
}: {
  tag: string;
  variant: "reach" | "niche" | "branded";
}) {
  const [copied, setCopied] = useState(false);

  const styles = {
    reach: "bg-[#EEF3FF] text-[#0052FF] hover:bg-[#DBEAFE]",
    niche: "bg-[#F4F7FA] text-slate-600 hover:bg-slate-200",
    branded: "bg-[#F3FFE5] text-[#4D8C00] hover:bg-green-100",
  };

  const handleClick = () => {
    navigator.clipboard.writeText(tag).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors ${styles[variant]}`}
      title="Click to copy"
    >
      {copied ? <FaCheck size={8} /> : <FaHashtag size={8} />}
      {tag.replace(/^#/, "")}
    </button>
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function clampPanelPosition(position: PanelPosition): PanelPosition {
  const { width, height } = getViewportSize();
  const maxX = Math.max(PANEL_MARGIN, width - PANEL_WIDTH - PANEL_MARGIN);
  const maxY = Math.max(PANEL_MARGIN, height - 180);

  return {
    x: clamp(position.x, PANEL_MARGIN, maxX),
    y: clamp(position.y, PANEL_MARGIN, maxY),
  };
}

function getDefaultPanelPosition(): PanelPosition {
  const { width } = getViewportSize();

  return clampPanelPosition({
    x: width - PANEL_WIDTH - 28,
    y: 118,
  });
}

export function PostEditor({
  post,
  onChange,
  onClose,
  onSchedule,
  onSaveDraft,
  onPublishNow,
}: PostEditorProps) {
  const [activeTab, setActiveTab] = useState<Platform>(post.platforms[0] ?? "linkedin");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PlatformPublishResult[] | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    if (post.scheduledDate) {
      const d = new Date(post.scheduledDate);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return "";
  });
  const [scheduleError, setScheduleError] = useState("");
  const [panelPosition, setPanelPosition] = useState<PanelPosition>(() => getDefaultPanelPosition());
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const platform = post.platforms.includes(activeTab) ? activeTab : post.platforms[0] ?? "linkedin";

  const activeCaption = post.captions?.[platform] ?? "";
  const score = calculateScore(activeCaption);
  const meta = PLATFORM_META[platform];
  const PlatformIcon = PLATFORM_ICONS[platform];

  const arcColor = score.total < 40 ? "#94A3B8" : score.total < 70 ? "#0052FF" : "#22C55E";
  const strokeDasharray = 283;
  const strokeDashoffset =
    strokeDasharray - (score.total / 100) * (strokeDasharray * 0.75);

  const handleCaptionChange = (value: string) => {
    onChange({ ...post, captions: { ...post.captions, [platform]: value } });
  };

  const handlePlatformToggle = (target: Platform) => {
    const selected = post.platforms.includes(target);
    let nextPlatforms: Platform[];
    if (selected) {
      if (post.platforms.length === 1) return;
      nextPlatforms = post.platforms.filter((p) => p !== target);
    } else {
      nextPlatforms = [...post.platforms, target];
    }

    onChange({ ...post, platforms: nextPlatforms });
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(activeCaption).catch(() => {});
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyAllHashtags = () => {
    const all = [
      ...(post.hashtags?.highReach ?? []),
      ...(post.hashtags?.niche ?? []),
      ...(post.hashtags?.branded ?? []),
    ].join(" ");
    navigator.clipboard.writeText(all).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const charPercent = Math.min((activeCaption.length / meta.charLimit) * 100, 100);
  const overLimit = activeCaption.length > meta.charLimit;

  const allHashtags = [
    ...(post.hashtags?.highReach ?? []),
    ...(post.hashtags?.niche ?? []),
    ...(post.hashtags?.branded ?? []),
  ];

  useEffect(() => {
    setActiveTab((current) => (post.platforms.includes(current) ? current : post.platforms[0] ?? "linkedin"));
    setScheduleDate(() => {
      if (post.scheduledDate) {
        const d = new Date(post.scheduledDate);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      return "";
    });
    setScheduleError("");
  }, [post.id, post.platforms, post.scheduledDate]);

  useEffect(() => {
    const handleResize = () => {
      setPanelPosition((current) => clampPanelPosition(current));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDraggingPanel) return;

    const handlePointerMove = (event: PointerEvent) => {
      setPanelPosition(
        clampPanelPosition({
          x: event.clientX - dragOffsetRef.current.x,
          y: event.clientY - dragOffsetRef.current.y,
        })
      );
    };

    const handlePointerUp = () => setIsDraggingPanel(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingPanel]);

  return (
    <div
      className="fixed z-40 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_24px_80px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col"
      style={{
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        width: `min(${PANEL_WIDTH}px, calc(100vw - 32px))`,
        height: `min(${PANEL_HEIGHT}px, calc(100vh - 32px))`,
      }}
    >
      <div
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("[data-editor-close]")) return;
          dragOffsetRef.current = {
            x: event.clientX - panelPosition.x,
            y: event.clientY - panelPosition.y,
          };
          setIsDraggingPanel(true);
        }}
        className={`shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/95 ${isDraggingPanel ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#0052FF] flex items-center justify-center shrink-0">
            <GripHorizontal size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Draft Details</p>
            <p className="text-[14px] font-black text-[#1A1D23] truncate">{post.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-[#F4F7FA] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {post.status}
          </span>
          <button
            type="button"
            data-editor-close
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#1A1D23] hover:bg-slate-50 transition-colors flex items-center justify-center"
            title="Close draft panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none] flex flex-col">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-[140px] object-cover shrink-0"
          />
        ) : (
          <div className="w-full h-[72px] bg-[#F4F7FA] border-b border-slate-100 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-slate-300">No image attached</span>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="bg-[#F4F7FA] rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Reach Forecaster
            </p>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <svg viewBox="0 0 100 100" className="w-[72px] h-[72px] transform -rotate-135">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 * 0.25}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={arcColor}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-[20px] font-black text-[#1A1D23] leading-none">
                    {score.total}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Impact
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  { label: "Keyword", value: score.keywordRelevance, color: "#0052FF" },
                  { label: "Sentiment", value: score.sentimentStrength, color: "#22C55E" },
                  { label: "Hook", value: score.hookVelocity, color: "#F59E0B" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] font-bold mb-0.5">
                      <span className="text-slate-500 uppercase tracking-widest">{label}</span>
                      <span className="text-[#1A1D23]">{value}</span>
                    </div>
                    <div className="h-1 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${value}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {score.hookVelocity < 50 && (
              <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold p-2 rounded-xl flex items-center gap-1.5">
                <AlertTriangle size={11} className="shrink-0" />
                <span>Low hook - add a question or bold claim in your first line</span>
              </div>
            )}
          </div>

          <div className="bg-[#F4F7FA] rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-200">
              {post.platforms.map((p) => {
                const currentMeta = PLATFORM_META[p];
                const Icon = PLATFORM_ICONS[p];
                const active = p === platform;

                return (
                  <button
                    key={p}
                    onClick={() => setActiveTab(p)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all relative",
                      active
                        ? "bg-white text-[#1A1D23]"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                    ].join(" ")}
                  >
                    <Icon size={11} color={active ? currentMeta.color : "#94A3B8"} />
                    <span>{currentMeta.shortLabel}</span>
                    {active && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                        style={{ backgroundColor: currentMeta.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <PlatformIcon size={11} color={meta.color} />
                  <span className="text-[11px] font-bold text-[#1A1D23]">{meta.label}</span>
                </div>
                <button
                  onClick={handleCopyCaption}
                  className={[
                    "flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
                    copiedCaption
                      ? "bg-[#F3FFE5] text-[#4D8C00]"
                      : "bg-white text-slate-500 hover:text-[#0052FF] hover:bg-[#EEF3FF]",
                  ].join(" ")}
                >
                  {copiedCaption ? <FaCheck size={9} /> : <FaCopy size={9} />}
                  {copiedCaption ? "Copied!" : "Copy"}
                </button>
              </div>

              <textarea
                value={activeCaption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                className="w-full h-[150px] bg-white rounded-xl p-3 resize-none outline-none text-[12px] text-[#1A1D23] placeholder-slate-300 border border-transparent focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]/30 transition-all leading-relaxed"
                placeholder={`Write your ${meta.label} caption...`}
              />

              <div className="mt-2 space-y-1">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${charPercent}%`,
                      backgroundColor: overLimit
                        ? "#EF4444"
                        : charPercent > 80
                          ? "#F59E0B"
                          : "#0052FF",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className={overLimit ? "text-red-500" : "text-slate-400"}>
                    {activeCaption.length.toLocaleString()} chars
                  </span>
                  <span className="text-slate-300">
                    limit {meta.charLimit.toLocaleString()}
                  </span>
                </div>
                {overLimit && (
                  <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                    <AlertTriangle size={10} className="shrink-0" />
                    Over {meta.label} character limit by {activeCaption.length - meta.charLimit} chars
                  </p>
                )}
              </div>
            </div>
          </div>

          {allHashtags.length > 0 && (
            <div className="bg-[#F4F7FA] rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FaHashtag size={9} />
                  Hashtag Strategy
                </p>
                <button
                  onClick={handleCopyAllHashtags}
                  className={[
                    "flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
                    copiedAll
                      ? "bg-[#F3FFE5] text-[#4D8C00]"
                      : "bg-white text-slate-500 hover:text-[#0052FF] hover:bg-[#EEF3FF]",
                  ].join(" ")}
                >
                  {copiedAll ? <FaCheck size={9} /> : <FaCopy size={9} />}
                  {copiedAll ? "Copied!" : "Copy All"}
                </button>
              </div>

              <div className="space-y-2.5">
                {(post.hashtags?.highReach?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      High Reach
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.highReach.map((tag) => (
                        <HashtagPill key={tag} tag={tag} variant="reach" />
                      ))}
                    </div>
                  </div>
                )}

                {(post.hashtags?.niche?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Niche
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.niche.map((tag) => (
                        <HashtagPill key={tag} tag={tag} variant="niche" />
                      ))}
                    </div>
                  </div>
                )}

                {(post.hashtags?.branded?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Branded
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.branded.map((tag) => (
                        <HashtagPill key={tag} tag={tag} variant="branded" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-white shrink-0 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
            Publish to
          </p>
          {ALL_PLATFORMS.map((p) => {
            const currentMeta = PLATFORM_META[p];
            const Icon = PLATFORM_ICONS[p];
            const selected = post.platforms.includes(p);
            return (
              <button
                type="button"
                onClick={() => handlePlatformToggle(p)}
                key={p}
                className={[
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors",
                  selected
                    ? "text-white border-transparent"
                    : "text-slate-500 bg-white border-slate-200 hover:border-slate-300",
                ].join(" ")}
                style={selected ? { backgroundColor: currentMeta.color } : undefined}
              >
                <Icon size={10} />
                {currentMeta.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="bg-[#F4F7FA] p-3 rounded-2xl space-y-2.5">
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => {
              setScheduleDate(e.target.value);
              setScheduleError("");
            }}
            className="w-full bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-[#1A1D23] border border-slate-200 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 outline-none transition-all shadow-sm"
          />
          {scheduleError && (
            <p className="text-[10px] font-bold text-red-500 px-1">{scheduleError}</p>
          )}
          <button
            onClick={() => {
              if (!scheduleDate) {
                setScheduleError("Pick a date and time first");
                return;
              }
              const date = new Date(scheduleDate);
              if (date <= new Date()) {
                setScheduleError("Choose a future date");
                return;
              }
              setScheduleError("");
              onSchedule?.(post.id, date);
            }}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5"
          >
            <CalendarDays size={14} />
            Schedule Post
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSaveDraft?.(post)}
            className="flex-1 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-[12px] transition-colors"
          >
            Save Draft
          </button>
          {onPublishNow && (
            <button
              disabled={isPublishing}
              onClick={async () => {
                setIsPublishing(true);
                try {
                  if (onSaveDraft) {
                    await onSaveDraft(post);
                  }
                  const results = await onPublishNow(post.id);
                  setPublishResults(results);
                } finally {
                  setIsPublishing(false);
                }
              }}
              className="flex-1 py-3 rounded-2xl font-bold text-white bg-[#0052FF] hover:bg-[#003DD4] shadow-[0_4px_14px_rgba(0,82,255,0.3)] text-[12px] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isPublishing ? "Publishing..." : "Publish Now"}
            </button>
          )}
        </div>
      </div>

      {publishResults && (
        <PublishToast
          results={publishResults}
          onDismiss={() => setPublishResults(null)}
        />
      )}
    </div>
  );
}

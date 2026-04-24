"use client";

import React, { useState } from "react";
import {
  FaStopwatch,
  FaExclamationTriangle,
  FaCheck,
  FaCopy,
  FaCommentDots,
  FaQuestionCircle,
  FaLightbulb,
  FaFire,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { RetentionProps } from "@/lib/postAnalyzerTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRetentionConfig(level: string) {
  switch (level.toLowerCase()) {
    case "high":
      return {
        bar: "bg-[#B6FF33]",
        badge: "bg-[#B6FF33]/20 text-[#4D8C00] border-[#B6FF33]/40",
        border: "border-l-[#B6FF33]",
        label: "High",
      };
    case "medium":
      return {
        bar: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        border: "border-l-amber-400",
        label: "Med",
      };
    default:
      return {
        bar: "bg-red-400",
        badge: "bg-red-50 text-red-600 border-red-200",
        border: "border-l-red-400",
        label: "Low",
      };
  }
}

function getCommentSignal(comment: string): {
  dot: string;
  icon: React.ReactNode;
  label: string;
} {
  const lower = comment.toLowerCase();
  if (lower.includes("?") || lower.startsWith("how") || lower.startsWith("what") || lower.startsWith("why")) {
    return { dot: "bg-amber-400", icon: <FaQuestionCircle size={9} className="text-amber-500" />, label: "Question" };
  }
  if (lower.includes("love") || lower.includes("comparison") || lower.includes("learning") || lower.includes("scale")) {
    return { dot: "bg-[#0052FF]", icon: <FaLightbulb size={9} className="text-[#0052FF]" />, label: "Research" };
  }
  return { dot: "bg-[#B6FF33]", icon: <FaFire size={9} className="text-[#4D8C00]" />, label: "Engage" };
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative overflow-hidden shrink-0 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center min-w-[65px] active:scale-95 border ${
        copied
          ? "bg-[#B6FF33]/20 text-[#4D8C00] border-[#B6FF33]/50"
          : "bg-white text-slate-500 border-slate-200 hover:bg-[#0052FF] hover:text-white hover:border-[#0052FF]"
      }`}
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCheck size={9} /> Copied
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCopy size={9} /> Copy
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RetentionHook({ segments, seedComments }: RetentionProps) {
  const highCount = segments.filter((s) => s.retention.toLowerCase() === "high").length;
  const medCount = segments.filter((s) => s.retention.toLowerCase() === "medium").length;
  const lowCount = segments.filter((s) => s.retention.toLowerCase() === "low").length;
  const total = segments.length || 1;

  const retentionScore = Math.round((highCount / total) * 100);

  // Proportional widths for the tricolor bar
  const highPct = Math.round((highCount / total) * 100);
  const medPct = Math.round((medCount / total) * 100);
  const lowPct = 100 - highPct - medPct;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Drop-off Analysis
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Retention Flow
            </h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl">
              {segments.length} Segment{segments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaStopwatch size={16} />
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">Why this matters:</div>
            Predicts where readers drop off based on sentence length and cognitive load.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col gap-5">

        {/* ── Section 1: Top Metric ── */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
                Avg Retention
              </p>
              <div className="text-2xl font-black text-[#1A1D23] leading-none">
                {retentionScore}%{" "}
                <span className="text-lg font-bold text-slate-400">Flow</span>
              </div>
            </div>
            <div className="flex gap-1.5 text-[10px] font-bold">
              <span className="bg-[#B6FF33]/20 text-[#4D8C00] border border-[#B6FF33]/40 px-2 py-1 rounded-lg">
                {highCount} High
              </span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">
                {medCount} Med
              </span>
              <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg">
                {lowCount} Low
              </span>
            </div>
          </div>

          {/* Tricolor flow bar */}
          <div className="h-2 w-full rounded-full overflow-hidden flex gap-px bg-slate-100">
            {highPct > 0 && (
              <div
                className="bg-[#B6FF33] h-full rounded-full transition-all"
                style={{ width: `${highPct}%` }}
              />
            )}
            {medPct > 0 && (
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${medPct}%` }}
              />
            )}
            {lowPct > 0 && (
              <div
                className="bg-red-400 h-full rounded-full transition-all"
                style={{ width: `${lowPct}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Strong start</span>
            <span>Drop-off zone</span>
          </div>
        </div>

        {/* ── Section 2: Scroll-Stop Segments ── */}
        <div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
            Scroll-Stop Analysis
          </span>
          <div className="flex flex-col gap-2.5">
            {segments.map((seg, i) => {
              const cfg = getRetentionConfig(seg.retention);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className={`relative bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden pl-4 pr-3 py-3 border-l-4 ${cfg.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] text-slate-700 font-medium leading-snug flex-1">
                      {seg.text}
                    </p>
                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {seg.warning && seg.fix && (
                    <div className="mt-2 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-xl px-2.5 py-1.5">
                      <FaExclamationTriangle size={10} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-600 font-semibold leading-snug">
                        Drop-off Risk: {seg.fix}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Engagement Hijack Comments ── */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            Engagement Hijack Comments
          </span>
          <div className="space-y-2">
            {seedComments.map((comment, i) => {
              const signal = getCommentSignal(comment);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="bg-[#F4F7FA] border border-slate-100 rounded-2xl flex items-center gap-2.5 px-3 py-2.5 hover:border-slate-300 transition-colors group"
                >
                  {/* Signal dot */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${signal.dot}`} />
                    <span className="text-slate-300">
                      <FaCommentDots size={11} className="text-[#0052FF]" />
                    </span>
                  </div>
                  {/* Text */}
                  <p className="flex-1 text-[12px] text-slate-600 font-medium truncate min-w-0">
                    {comment}
                  </p>
                  {/* Signal badge */}
                  <span className="hidden group-hover:flex shrink-0 text-[9px] font-bold text-slate-400 uppercase tracking-wide items-center gap-1 mr-1">
                    {signal.icon} {signal.label}
                  </span>
                  <CopyButton text={comment} />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

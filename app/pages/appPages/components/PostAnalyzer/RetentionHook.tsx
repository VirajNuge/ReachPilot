import React, { useState } from "react";
import {
  FaStopwatch,
  FaExclamationTriangle,
  FaCheck,
  FaCopy,
  FaCommentDots,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { RetentionProps } from "@/lib/postAnalyzerTypes";

// ─── Components ───────────────────────────────────────────────────────────────

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
      className={`relative overflow-hidden px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all flex items-center justify-center min-w-[70px] active:scale-95 shadow-sm border ${
        copied
          ? "bg-[#B6FF33]/20 text-[#4D8C00] border-[#B6FF33]/50"
          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-[#0052FF] hover:text-white hover:border-[#0052FF]"
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
            className="flex items-center gap-1.5"
          >
            <FaCheck size={10} /> Copied
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <FaCopy size={10} /> Copy
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function RetentionHook({
  segments,
  seedComments,
}: RetentionProps) {
  const highCount = segments.filter((s) => s.retention === "high").length;
  const medCount = segments.filter((s) => s.retention === "medium").length;
  const lowCount = segments.filter((s) => s.retention === "low").length;

  const totalSegments = segments.length;
  const retentionScore = Math.round((highCount / totalSegments) * 100);

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
              {segments.length} Segments
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaStopwatch size={16} />
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Predicts where readers will drop off based on sentence length and
            cognitive load.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ── Top Metric ── */}
        <div>
          <div className="flex items-end justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
                Avg Retention
              </p>
              <div className="text-2xl font-bold text-[#1A1D23] leading-none flex items-baseline gap-1">
                {retentionScore}% Flow
              </div>
            </div>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="bg-[#B6FF33]/20 text-[#4D8C00] px-2 py-1 rounded-lg">
                {highCount} High
              </span>
              <span className="bg-amber-100/50 text-amber-700 px-2 py-1 rounded-lg">
                {medCount} Med
              </span>
              <span className="bg-red-100/50 text-red-700 px-2 py-1 rounded-lg">
                {lowCount} Low
              </span>
            </div>
          </div>
        </div>

        {/* ── Segment Layout (Flat & Minimal) ── */}
        <div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            Scroll-Stop Analysis
          </span>
          <div className="flex flex-col gap-3">
            {segments.map((seg, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      seg.retention === "high"
                        ? "bg-[#B6FF33]"
                        : seg.retention === "medium"
                          ? "bg-[#0052FF]"
                          : "bg-[#1A1D23]"
                    }`}
                  ></span>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-slate-700 font-medium">
                    {seg.text}
                  </p>
                  {seg.warning && (
                    <p className="text-[12px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <FaExclamationTriangle size={10} /> Drop-off Risk:{" "}
                      {seg.fix}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Engagement Seed Comments ── */}
        <div className="mt-auto pt-4">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            Engagement Hijack Comments
          </span>

          <div className="space-y-2.5">
            {seedComments.map((comment, i) => (
              <div
                key={i}
                className="bg-[#F4F7FA] border border-slate-100 p-2 pl-3 rounded-2xl flex justify-between items-center text-[12px] text-slate-600 font-medium transition-colors hover:border-slate-300"
              >
                <div className="truncate flex-1 mr-4">{comment}</div>
                <CopyButton text={comment} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

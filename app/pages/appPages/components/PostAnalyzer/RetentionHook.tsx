import React, { useState } from "react";
import {
  FaStopwatch,
  FaExclamationTriangle,
  FaCheck,
  FaCopy,
  FaLightbulb,
  FaCommentDots,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA = {
  segments: [
    { text: "Stop trying to build a 'Personal Brand'. 🛑", retention: "high" },
    {
      text: "Most people think it's about colors and logos.",
      retention: "high",
    },
    {
      text: "It's actually about the reputation you build when you solve...",
      retention: "low",
      warning: true,
      fix: "Shorten. Too wordy for line 3.",
    },
    { text: "Reputation > Brand.", retention: "medium" },
  ],
  seedComments: [
    "This is the exact mindset shift I needed. We often overcomplicate 'branding' when it really just comes down to trust. 🔥",
    "Agreed. Results are the only branding that matters in B2B. Everything else is just decoration.",
    "Bold take, but inaccurate? I'd argue design IS trust. You wouldn't eat at a dirty restaurant even if the food was good.",
  ],
};

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
      className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
      title="Copy"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCheck size={10} className="text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCopy size={10} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function RetentionHook() {
  const { segments, seedComments } = MOCK_DATA;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* ─── Header ─── */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <FaStopwatch size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Retention Flow
            </h3>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-rose-300">
                Why this matters:
              </div>
              Predicts where readers will drop off based on sentence length and
              cognitive load.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          Drop-off Analysis
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* ─── SECTION 1: Scroll-Stop Analysis ─── */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Scroll-Stop Analysis
          </span>
          <div className="font-mono text-xs space-y-1">
            {segments.map((seg, i) => (
              <div key={i} className="flex gap-3 items-stretch group">
                {/* Status Line */}
                <div
                  className={`w-1 rounded-full shrink-0 ${
                    seg.retention === "high"
                      ? "bg-emerald-400"
                      : seg.retention === "medium"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                  }`}
                />
                <div className="flex-1 py-1">
                  <p
                    className={`${
                      seg.warning ? "text-rose-700 font-bold" : "text-gray-600"
                    }`}
                  >
                    {seg.text}
                  </p>
                  {seg.warning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-1 flex items-center gap-2 text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded-md border border-rose-100"
                    >
                      <FaExclamationTriangle />
                      <span className="font-bold">Drop-off Risk:</span>{" "}
                      {seg.fix}
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 2: Engagement Seed Comments ─── */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FaCommentDots className="text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Engagement Hijack
            </span>
          </div>

          <div className="space-y-2">
            {seedComments.map((comment, i) => (
              <div
                key={i}
                className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-3 group hover:border-violet-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                  You
                </div>
                <p className="text-xs text-gray-700 leading-snug flex-1">
                  {comment}
                </p>
                <CopyButton text={comment} />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Post these to siphon traffic back to your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

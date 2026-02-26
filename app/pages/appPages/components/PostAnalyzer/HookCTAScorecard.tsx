import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBullseye,
  FaBolt,
  FaBrain,
  FaSkull,
  FaUsers,
  FaQuestionCircle,
  FaCopy,
  FaCheck,
  FaComments,
  FaLightbulb,
} from "react-icons/fa";

import { HookCTAProps } from "@/lib/postAnalyzerTypes";

// ─── Trigger Metadata ───────────────────────────────────────────────────────

const TRIGGER_META: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    explanation: string;
  }
> = {
  "Curiosity Gap": {
    icon: <FaQuestionCircle />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    explanation:
      "Creates an information void the reader must fill. The brain hates incomplete loops — this forces the click.",
  },
  "Negativity Bias": {
    icon: <FaSkull />,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    explanation:
      "Triggers loss aversion. Readers are wired to pay more attention to threats than opportunities.",
  },
  "Social Proof": {
    icon: <FaUsers />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    explanation:
      "Leverages authority or crowd behavior. If others validated it, the reader's guard drops.",
  },
  "Pattern Interrupt": {
    icon: <FaBrain />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    explanation:
      "Breaks the scroll with a counterintuitive statement. The brain flags the unexpected as important.",
  },
};

// ─── Shared Components ───────────────────────────────────────────────────────

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
      className="shrink-0 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all"
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FaCheck size={11} className="text-green-500" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FaCopy size={11} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

const PIVOT_STYLES = {
  A: {
    label: "The Challenger",
    accent: "border-l-red-400",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
    letter: "A",
  },
  B: {
    label: "The Result",
    accent: "border-l-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
    letter: "B",
  },
  C: {
    label: "The Question",
    accent: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    letter: "C",
  },
};

function PivotCard({
  option,
  text,
}: {
  option: keyof typeof PIVOT_STYLES;
  text: string;
}) {
  const style = PIVOT_STYLES[option];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 items-start p-3 bg-white rounded-xl border border-gray-100 border-l-4 ${style.accent} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
        <span
          className={`w-5 h-5 rounded-full ${style.dot} text-white text-[9px] font-black flex items-center justify-center`}
        >
          {style.letter}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md mb-1 ${style.badge}`}
        >
          {style.label}
        </span>
        <p className="text-xs text-gray-700 leading-relaxed">"{text}"</p>
      </div>
      <CopyButton text={text} />
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HookCTAScorecard({
  trigger,
  skeleton,
  pivotA,
  pivotB,
  pivotC,
  ctaType,
  ctaTip,
}: HookCTAProps) {
  const triggerMeta = TRIGGER_META[trigger] || TRIGGER_META["Curiosity Gap"];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* ── Header ── */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
            <FaBullseye size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Hook &amp; CTA Insight
            </h3>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-violet-300">
                Why this matters:
              </div>
              Your hook determines if they stop scrolling, and your CTA
              determines if they convert. This deconstructs the psychology
              behind what made it work.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          Psychological Blueprint
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* ── SECTION 1: Structural Blueprint ── */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Structural Blueprint
          </span>

          {/* Trigger Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 border ${triggerMeta.bg} ${triggerMeta.border}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-base ${triggerMeta.color}`}>
                {triggerMeta.icon}
              </span>
              <span className={`font-black text-sm ${triggerMeta.color}`}>
                {trigger}
              </span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-white/60 px-2 py-0.5 rounded-full border border-gray-200">
                Primary Trigger
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {triggerMeta.explanation}
            </p>
          </motion.div>

          {/* Skeleton */}
          <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <FaBolt className="text-amber-400 shrink-0 mt-0.5" size={12} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Post Skeleton
              </p>
              <p className="text-xs font-mono text-gray-700 leading-relaxed">
                {skeleton}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: 3-Option Pivot ── */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            3-Option Pivot
          </span>
          <div className="space-y-2.5">
            <PivotCard option="A" text={pivotA} />
            <PivotCard option="B" text={pivotB} />
            <PivotCard option="C" text={pivotC} />
          </div>
        </div>

        {/* ── SECTION 3: CTA (Simplified) ── */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Call to Action
          </span>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="p-1.5 bg-white rounded-lg border border-gray-200 shrink-0">
              <FaComments className="text-blue-500" size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5">
                {ctaType}
              </p>
              <p className="text-[11px] text-gray-500 leading-snug flex gap-1.5 items-start">
                <FaLightbulb
                  className="text-amber-400 shrink-0 mt-0.5"
                  size={10}
                />
                {ctaTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

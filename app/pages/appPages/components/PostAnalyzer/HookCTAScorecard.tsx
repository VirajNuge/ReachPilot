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
    color: "text-[#0052FF]",
    bg: "bg-[#F4F7FA]",
    border: "border-slate-100",
    explanation:
      "Creates an information void the reader must fill. The brain hates incomplete loops — this forces the click.",
  },
  "Negativity Bias": {
    icon: <FaSkull />,
    color: "text-red-500",
    bg: "bg-[#FFF4F4]",
    border: "border-red-100",
    explanation:
      "Triggers loss aversion. Readers are wired to pay more attention to threats than opportunities.",
  },
  "Social Proof": {
    icon: <FaUsers />,
    color: "text-[#0052FF]",
    bg: "bg-[#F4F7FA]",
    border: "border-slate-100",
    explanation:
      "Leverages authority or crowd behavior. If others validated it, the reader's guard drops.",
  },
  "Pattern Interrupt": {
    icon: <FaBrain />,
    color: "text-[#B6FF33]",
    bg: "bg-[#1A1D23]",
    border: "border-[#1A1D23]",
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

const PIVOT_STYLES = {
  A: {
    label: "The Challenger",
    dot: "bg-red-400",
    letter: "A",
  },
  B: {
    label: "The Result",
    dot: "bg-[#B6FF33]",
    letter: "B",
  },
  C: {
    label: "The Question",
    dot: "bg-[#0052FF]",
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
    <div className="flex gap-3 items-center p-3 bg-white rounded-2xl border border-slate-100 hover:border-[#0052FF]/30 transition-colors">
      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
        <span
          className={`w-6 h-6 rounded-full ${style.dot} text-[#1A1D23] text-[10px] font-black flex items-center justify-center`}
        >
          {style.letter}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {style.label}
          </span>
        </div>
        <p className="text-[13px] font-medium text-[#1A1D23] leading-snug">
          "{text}"
        </p>
      </div>
      <CopyButton text={text} />
    </div>
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Psychological Blueprint
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Hook &amp; CTA Insight
            </h3>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaBullseye size={16} />
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Your hook determines if they stop scrolling, and your CTA determines
            if they convert. This deconstructs the psychology behind what made
            it work.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ── SECTION 1: Structural Blueprint ── */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
                Primary Trigger
              </p>
              <div className="text-2xl font-bold text-[#1A1D23] leading-none flex items-baseline gap-2">
                {trigger}
              </div>
            </div>
            <div
              className={`flex items-center gap-1.5 text-[12px] font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100`}
            >
              <span
                className={`w-2 h-2 rounded-full ${triggerMeta.color.replace("text", "bg")}`}
              ></span>
              {triggerMeta.icon}
            </div>
          </div>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
            {triggerMeta.explanation}
          </p>

          {/* Skeleton */}
          <div className="mt-3 p-3 bg-[#F4F7FA] rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <FaBolt className="text-[#0052FF]" /> Post Skeleton
            </p>
            <p className="text-[12px] font-mono font-medium text-slate-600 leading-relaxed">
              {skeleton}
            </p>
          </div>
        </div>

        {/* ── SECTION 2: 3-Option Pivot ── */}
        <div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            3-Option Pivot
          </span>
          <div className="space-y-2.5">
            <PivotCard option="A" text={pivotA} />
            <PivotCard option="B" text={pivotB} />
            <PivotCard option="C" text={pivotC} />
          </div>
        </div>

        {/* ── SECTION 3: CTA ── */}
        <div className="mt-auto pt-4">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            Call to Action Analysis
          </span>
          <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
            <div className="mt-0.5 text-[#0052FF]">
              <FaComments size={16} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1A1D23] mb-0.5">
                {ctaType}
              </p>
              <p className="text-[12px] text-slate-500 leading-snug flex gap-1.5 items-start font-medium">
                <FaLightbulb
                  className="text-[#B6FF33] shrink-0 mt-0.5"
                  size={12}
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

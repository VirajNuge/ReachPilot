"use client";

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
  FaMagic,
  FaSpinner,
  FaExclamationTriangle,
  FaLayerGroup,
  FaExternalLinkAlt,
  FaTimes,
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
  engagement,
}: {
  option: keyof typeof PIVOT_STYLES;
  text: string;
  engagement: string;
}) {
  const style = PIVOT_STYLES[option];
  
  // Parse engagement type and assign icon + color
  const getEngagementMeta = (engagementType: string) => {
    const type = engagementType.toLowerCase();
    if (type.includes("comment")) {
      return { icon: <FaComments size={9} />, color: "bg-blue-500", label: "Comments" };
    } else if (type.includes("share") || type.includes("repost")) {
      return { icon: <FaBolt size={9} />, color: "bg-green-500", label: "Shares" };
    } else if (type.includes("like")) {
      return { icon: <FaMagic size={9} />, color: "bg-red-500", label: "Likes" };
    } else {
      return { icon: <FaBullseye size={9} />, color: "bg-purple-500", label: "Balanced" };
    }
  };
  
  const engagementMeta = getEngagementMeta(engagement);
  
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
          <span className={`flex items-center gap-1 px-2 py-0.5 ${engagementMeta.color} text-white text-[9px] font-bold rounded-md`}>
            {engagementMeta.icon}
            {engagementMeta.label}
          </span>
        </div>
        <p className="text-[13px] font-medium text-[#1A1D23] leading-snug">
          &quot;{text}&quot;
        </p>
      </div>
      <CopyButton text={text} />
    </div>
  );
}

// ─── Saved template shape ─────────────────────────────────────────────────────

interface SavedTemplate {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  platform: string;
  structure: string;
  examplePost: string;
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({
  template,
  onClose,
}: {
  template: SavedTemplate;
  onClose: () => void;
}) {
  const structureLines = template.structure.split("\n").filter(Boolean);
  const previewLines = structureLines.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between sticky top-0 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF33] flex items-center justify-center shrink-0">
              <FaCheck className="text-[#1A1D23]" size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Template Saved
              </p>
              <h3 className="text-lg font-black text-[#1A1D23] leading-tight">
                {template.templateName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 pt-4">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#EEF3FF] text-[#0052FF] text-[10px] font-bold uppercase tracking-widest rounded-lg border border-[#C7D8FF]">
              {template.platform}
            </span>
            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">
              {template.category.replace(/_/g, " ")}
            </span>
          </div>

          {/* Description */}
          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
            {template.description}
          </p>

          {/* Structure preview */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaLayerGroup size={10} /> Template Structure
            </p>
            <div className="bg-[#F4F7FA] rounded-2xl border border-slate-100 p-4 space-y-1.5">
              {previewLines.map((line, i) => (
                <p key={i} className="text-[12px] font-mono text-slate-600 leading-snug">
                  {line}
                </p>
              ))}
              {structureLines.length > 8 && (
                <p className="text-[11px] text-slate-400 font-medium pt-1">
                  + {structureLines.length - 8} more lines…
                </p>
              )}
            </div>
          </div>

          {/* Example post */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaBolt size={10} className="text-[#0052FF]" /> Example Post
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5">
              <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                {template.examplePost}
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href="/pages/appPages/admin/captionTemplates"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm transition-colors shadow-[0_4px_14px_0_rgba(7,78,213,0.3)]"
          >
            View in Admin Templates <FaExternalLinkAlt size={11} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface HookCTAScorecardProps extends HookCTAProps {
  analysisId?: string;
  postContent?: string;
}

export default function HookCTAScorecard({
  trigger,
  skeleton,
  pivotA,
  pivotAEngagement,
  pivotB,
  pivotBEngagement,
  pivotC,
  pivotCEngagement,
  ctaType,
  ctaTip,
  analysisId,
  postContent,
}: HookCTAScorecardProps) {
  const triggerMeta = TRIGGER_META[trigger] || TRIGGER_META["Curiosity Gap"];

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [savedTemplate, setSavedTemplate] = useState<SavedTemplate | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSave = async () => {
    if (saveStatus === "loading" || !analysisId) return;
    setSaveStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze-post/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate template");
      setSavedTemplate(data as SavedTemplate);
      setSaveStatus("success");
      setShowModal(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaveStatus("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && savedTemplate && (
          <SuccessModal template={savedTemplate} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

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
              <PivotCard option="A" text={pivotA} engagement={pivotAEngagement} />
              <PivotCard option="B" text={pivotB} engagement={pivotBEngagement} />
              <PivotCard option="C" text={pivotC} engagement={pivotCEngagement} />
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

          {/* ── SECTION 4: Save as Template ── */}
          {analysisId && (
            <div className="pt-2 border-t border-slate-100">
              {saveStatus === "success" && savedTemplate ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 bg-[#F2FFD9] text-[#4D8C00] border border-[#C5E88A] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8FAC8] transition-colors"
                >
                  <FaCheck size={12} /> Template Saved — View
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "loading"}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    saveStatus === "loading"
                      ? "bg-[#074ed5]/70 text-white cursor-not-allowed"
                      : "bg-[#074ed5] hover:bg-[#0041CC] text-white shadow-[0_4px_14px_0_rgba(7,78,213,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {saveStatus === "loading" ? (
                    <><FaSpinner className="animate-spin" size={13} /> Generating Template…</>
                  ) : (
                    <><FaMagic size={13} /> Save as Template</>
                  )}
                </button>
              )}

              {saveStatus === "error" && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
                >
                  <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={11} />
                  <p className="text-[11px] text-red-600 font-medium leading-snug">{errorMsg}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

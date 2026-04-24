"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaMagic,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaBolt,
  FaExternalLinkAlt,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";
import { HookCTAProps } from "@/lib/postAnalyzerTypes";

// ─── Trigger badge colours (matching HookCTAScorecard palette) ───────────────

const TRIGGER_COLORS: Record<string, { dot: string; badge: string }> = {
  "Curiosity Gap": { dot: "bg-[#0052FF]", badge: "text-[#0052FF] bg-[#EEF3FF] border-[#C7D8FF]" },
  "Negativity Bias": { dot: "bg-red-500", badge: "text-red-600 bg-red-50 border-red-200" },
  "Social Proof": { dot: "bg-[#4D8C00]", badge: "text-[#4D8C00] bg-[#F2FFD9] border-[#C5E88A]" },
  "Pattern Interrupt": { dot: "bg-[#B6FF33]", badge: "text-[#1A1D23] bg-[#1A1D23] border-[#1A1D23]" },
};

const DEFAULT_TRIGGER = { dot: "bg-slate-400", badge: "text-slate-600 bg-slate-50 border-slate-200" };

// ─── Types ───────────────────────────────────────────────────────────────────

interface PsychBlueprintProps {
  hookCTA: HookCTAProps;
  platform: string;
  analysisId: string;
  postContent: string;
}

interface SavedTemplate {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  platform: string;
  structure: string;
  examplePost: string;
}

// ─── Structure preview card ───────────────────────────────────────────────────

function StructurePreview({ structure }: { structure: string }) {
  const lines = structure.split("\n").filter(Boolean).slice(0, 8);
  return (
    <div className="bg-[#F4F7FA] rounded-2xl border border-slate-100 p-4 space-y-1.5">
      {lines.map((line, i) => (
        <p key={i} className="text-[12px] font-mono text-slate-600 leading-snug">
          {line}
        </p>
      ))}
      {structure.split("\n").filter(Boolean).length > 8 && (
        <p className="text-[11px] text-slate-400 font-medium pt-1">
          + {structure.split("\n").filter(Boolean).length - 8} more lines…
        </p>
      )}
    </div>
  );
}

// ─── Success modal ────────────────────────────────────────────────────────────

function SuccessModal({
  template,
  onClose,
}: {
  template: SavedTemplate;
  onClose: () => void;
}) {
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
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
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

        <div className="px-6 pb-6 space-y-4">
          {/* Meta row */}
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
              <FaLayerGroup size={10} />
              Template Structure
            </p>
            <StructurePreview structure={template.structure} />
          </div>

          {/* Example post */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaBolt size={10} className="text-[#0052FF]" />
              Example Post
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PsychBlueprint({
  hookCTA,
  platform,
  analysisId,
  postContent,
}: PsychBlueprintProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [savedTemplate, setSavedTemplate] = useState<SavedTemplate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const triggerStyle = TRIGGER_COLORS[hookCTA.trigger] ?? DEFAULT_TRIGGER;

  const handleSave = async () => {
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze-post/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate template");
      }

      setSavedTemplate(data as SavedTemplate);
      setStatus("success");
      setShowModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMsg(message);
      setStatus("error");
    }
  };

  const platformLabel =
    platform === "x" || platform === "twitter"
      ? "X (Twitter)"
      : platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <>
      <AnimatePresence>
        {showModal && savedTemplate && (
          <SuccessModal
            template={savedTemplate}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 flex justify-between items-start border-b border-slate-100">
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
              Post Analyzer · {platformLabel}
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0052FF] flex items-center justify-center shrink-0">
                <FaBrain className="text-white" size={13} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
                Psychological Blueprint
              </h3>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${triggerStyle.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${triggerStyle.dot}`} />
              {hookCTA.trigger}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* ── Hook Skeleton ── */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FaBolt className="text-[#0052FF]" size={10} />
              Post Skeleton
            </p>
            <div className="bg-[#F4F7FA] rounded-2xl border border-slate-100 p-3.5">
              <p className="text-[13px] font-mono font-medium text-slate-700 leading-relaxed">
                {hookCTA.skeleton}
              </p>
            </div>
          </div>

          {/* ── Pivot Options ── */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hook Pivots
            </p>
            <div className="space-y-1.5">
              {(
                [
                  { label: "A", text: hookCTA.pivotA, dot: "bg-red-400" },
                  { label: "B", text: hookCTA.pivotB, dot: "bg-[#B6FF33]" },
                  { label: "C", text: hookCTA.pivotC, dot: "bg-[#0052FF]" },
                ] as const
              ).map(({ label, text, dot }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-2.5 bg-[#F4F7FA] rounded-xl border border-slate-100"
                >
                  <span
                    className={`w-5 h-5 rounded-full ${dot} text-[#1A1D23] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {label}
                  </span>
                  <p className="text-[12px] font-medium text-slate-700 leading-snug">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA + Save button ── */}
          <div className="space-y-3 flex flex-col">
            <div className="space-y-2 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                CTA Analysis
              </p>
              <div className="bg-[#F4F7FA] rounded-2xl border border-slate-100 p-3.5 space-y-1">
                <p className="text-[12px] font-bold text-[#1A1D23]">{hookCTA.ctaType}</p>
                <p className="text-[12px] text-slate-500 leading-snug font-medium">
                  {hookCTA.ctaTip}
                </p>
              </div>
            </div>

            {/* Save as Template */}
            <div className="pt-1">
              {status === "success" && savedTemplate ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 bg-[#F2FFD9] text-[#4D8C00] border border-[#C5E88A] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8FAC8] transition-colors"
                >
                  <FaCheck size={12} />
                  Template Saved — View
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={status === "loading"}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-none ${
                    status === "loading"
                      ? "bg-[#074ed5]/70 text-white cursor-not-allowed"
                      : "bg-[#074ed5] hover:bg-[#0041CC] text-white shadow-[0_4px_14px_0_rgba(7,78,213,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {status === "loading" ? (
                    <>
                      <FaSpinner className="animate-spin" size={13} />
                      Generating Template…
                    </>
                  ) : (
                    <>
                      <FaMagic size={13} />
                      Save as Template
                    </>
                  )}
                </button>
              )}

              {status === "error" && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
                >
                  <FaExclamationTriangle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={11}
                  />
                  <p className="text-[11px] text-red-600 font-medium leading-snug">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

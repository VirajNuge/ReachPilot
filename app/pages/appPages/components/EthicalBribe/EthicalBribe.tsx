"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { LeadMagnetData } from "../../../../../lib/types/analysis";
import {
  FaMagnet,
  FaUnlockAlt,
  FaFilePdf,
  FaVideo,
  FaRocket,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaListUl,
  FaTimes,
  FaLightbulb,
} from "react-icons/fa";
import { TbArrowUpRight, TbBulb } from "react-icons/tb";

// --- Types ---

export type MagnetType =
  | "Checklist"
  | "Webinar"
  | "Free Trial"
  | "Discovery Call";
export type FrictionLevel = "Low" | "Medium" | "High";
export type LeadTemp = "Cold" | "Warm" | "Hot";

export interface BribeData {
  type: MagnetType;
  title: string;
  hook: string;
  friction: FrictionLevel;
  fields: string[];
  temp: LeadTemp;
  url: string;
}

interface OneUpResult {
  headline: string;
  outline: string[];
  positioning: string;
}

// --- Mock Data ---

const MOCK_BRIBE: BribeData = {
  type: "Checklist",
  title: "The Zero-To-Hero SaaS Launch Checklist",
  hook: "Go from 0 to 100 users in 30 days without ads.",
  friction: "Low",
  fields: ["Email Address"],
  temp: "Cold",
  url: "gumroad.com/l/launch-checklist",
};

interface EthicalBribeProps {
  data?: LeadMagnetData;
}

// --- Modal ---

type ModalState = "closed" | "loading" | "results" | "error";

function OneUpModal({
  modalState,
  result,
  error,
  onClose,
}: {
  modalState: ModalState;
  result: OneUpResult | null;
  error: string | null;
  onClose: () => void;
}) {
  if (modalState === "closed") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              One-Up Strategy
            </div>
            <h3 className="text-xl font-black text-[#000100] leading-tight">
              Your Better Lead Magnet
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated to objectively outperform the competitor&rsquo;s offer
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0 ml-4"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {modalState === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#074ed5] border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-500">
                Crafting your One-Up strategy...
              </p>
            </div>
          )}

          {modalState === "error" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <FaExclamationTriangle className="text-red-400" size={32} />
              <p className="text-sm font-bold text-slate-700">Generation failed</p>
              <p className="text-xs text-slate-400">{error ?? "Unknown error"}</p>
            </div>
          )}

          {modalState === "results" && result && (
            <div className="space-y-5">
              {/* Headline */}
              <div className="bg-[#000100] text-white rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TbArrowUpRight size={80} />
                </div>
                <div className="text-[10px] font-bold text-[#caee55] uppercase tracking-widest mb-2">
                  Your One-Up Headline
                </div>
                <p className="text-lg font-black leading-snug relative z-10">
                  {result.headline}
                </p>
              </div>

              {/* Positioning */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <TbBulb className="text-[#074ed5] shrink-0 mt-0.5" size={16} />
                <div>
                  <div className="text-[10px] font-bold text-[#074ed5] uppercase tracking-wider mb-1">
                    Why it wins
                  </div>
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    {result.positioning}
                  </p>
                </div>
              </div>

              {/* Outline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaListUl className="text-slate-400" size={12} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Content Outline
                  </span>
                </div>
                <div className="space-y-2">
                  {result.outline.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start p-3 bg-[#f4f8fb] border border-slate-100 rounded-xl"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#074ed5] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 font-medium leading-snug">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {modalState === "results" && (
          <div className="p-4 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl font-bold text-sm bg-[#000100] text-white hover:bg-black transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// --- Component ---

export default function EthicalBribe({ data: apiData }: EthicalBribeProps) {
  const [data, setData] = useState<BribeData>(MOCK_BRIBE);
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [oneUpResult, setOneUpResult] = useState<OneUpResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  React.useEffect(() => {
    if (apiData) {
      setData({
        type: (apiData.type as MagnetType) || "Checklist",
        title: apiData.title || apiData.suggestion || "Suggested Lead Magnet",
        hook: apiData.hook || apiData.whyItWorks || "High value, low friction.",
        friction: (apiData.friction as FrictionLevel) || "Low",
        fields: ["Email"],
        temp: (apiData.temp as LeadTemp) || "Warm",
        url: "#",
      });
    }
  }, [apiData]);

  const getIcon = (type: MagnetType) => {
    switch (type) {
      case "Checklist":
        return <FaFilePdf className="text-[#074ed5]" />;
      case "Webinar":
        return <FaVideo className="text-[#074ed5]" />;
      case "Free Trial":
        return <FaRocket className="text-[#074ed5]" />;
      case "Discovery Call":
        return <FaCalendarCheck className="text-[#074ed5]" />;
    }
  };

  const getFrictionColor = (level: FrictionLevel) => {
    switch (level) {
      case "Low":
        return "text-[#000100] bg-[#caee55]/20 border-[#caee55]/30";
      case "Medium":
        return "text-[#074ed5] bg-[#074ed5]/10 border-[#074ed5]/20";
      case "High":
        return "text-[#000100] bg-slate-200 border-slate-300";
    }
  };

  const getTempIcon = (temp: LeadTemp) => {
    switch (temp) {
      case "Cold":
        return "❄️";
      case "Warm":
        return "🌤️";
      case "Hot":
        return "🔥";
    }
  };

  const handleGenerateOneUp = async () => {
    setAiError(null);
    setModalState("loading");

    try {
      const res = await fetch("/api/analyze-extension/one-up-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorTitle: data.title,
          competitorType: data.type,
          competitorHook: data.hook,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? `Request failed (${res.status})`);
      }

      const json = await res.json() as OneUpResult;
      setOneUpResult(json);
      setModalState("results");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unknown error");
      setModalState("error");
    }
  };

  const handleCloseModal = () => {
    setModalState("closed");
  };

  return (
    <>
      <OneUpModal
        modalState={modalState}
        result={oneUpResult}
        error={aiError}
        onClose={handleCloseModal}
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Blueprint Intel
            </h4>
            <div className="relative group cursor-help inline-block">
              <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
                Ethical Bribe Decoder
              </h2>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Analyzes the competitor&rsquo;s &ldquo;Lead Magnet&rdquo; strategy. It checks the
                type (e.g., PDF, Webinar), the friction level (how many fields),
                and the temperature of the lead it attracts.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Analyzing competitor&rsquo;s entry point
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getFrictionColor(data.friction)} flex items-center gap-1.5 h-fit`}
            >
              <FaUnlockAlt size={10} />
              {data.friction} Friction
            </div>
            <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
              <FaMagnet size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden flex-1 relative gap-6">
          {/* The Lead Magnet Card */}
          <div className="bg-[#f4f8fb] rounded-xl p-5 border border-slate-100 relative group transition-all hover:shadow-md">
            <div
              className="absolute top-4 right-4 text-2xl"
              title={`${data.temp} Leads`}
            >
              {getTempIcon(data.temp)}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl opacity-90">{getIcon(data.type)}</div>
              <span className="font-bold text-sm uppercase tracking-wider text-gray-500">
                {data.type}
              </span>
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {data.title}
            </h4>

            <div className="bg-white p-3 rounded-lg border border-dashed border-[#074ed5]/20 text-sm text-gray-600 italic">
              <span className="not-italic font-bold text-[#074ed5] mr-2">
                🪝 THE HOOK:
              </span>
              {data.hook}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {data.fields.map((field) => (
                <span
                  key={field}
                  className="text-[10px] font-bold px-2 py-1 bg-[#f4f8fb] text-[#000100] border border-slate-200 rounded uppercase"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#f4f8fb] border border-slate-100">
              <div className="flex items-center gap-2 mb-1 text-[#074ed5] font-bold text-xs uppercase">
                <FaExclamationTriangle />
                Risk Factor
              </div>
              <p className="text-sm text-[#000100] font-medium leading-snug">
                Competitor creates <strong>Low Barriers</strong>. They will likely
                have a larger, less qualified list.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#f4f8fb] border border-slate-100">
              <div className="flex items-center gap-2 mb-1 text-[#074ed5] font-bold text-xs uppercase">
                <FaCheckCircle />
                Opportunity
              </div>
              <p className="text-sm text-[#000100] font-medium leading-snug">
                Checklist users are often <strong>looking for shortcuts</strong>.
                Offer a &ldquo;Done-For-You&rdquo; template.
              </p>
            </div>
          </div>

          {/* One-Up Button */}
          <div className="mt-auto">
            <button
              onClick={handleGenerateOneUp}
              disabled={modalState === "loading"}
              className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#000100] hover:bg-black text-white active:scale-[0.98]"
            >
              <FaLightbulb className="text-[#caee55]" size={14} />
              Option A: The &ldquo;One-Up&rdquo; Lead Magnet
            </button>
            {oneUpResult && modalState === "closed" && (
              <button
                onClick={() => setModalState("results")}
                className="w-full mt-2 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <TbArrowUpRight size={13} />
                View last result
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

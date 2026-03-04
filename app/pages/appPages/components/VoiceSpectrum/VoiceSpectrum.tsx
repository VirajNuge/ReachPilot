"use client";

import React, { useState } from "react";
import { FaFingerprint, FaRobot, FaPenFancy } from "react-icons/fa";
import { BsSoundwave, BsLightningChargeFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

// --- Types ---
export interface VoiceAxis {
  id: string;
  leftLabel: string;
  rightLabel: string;
  score: number; // -100 to 100
}

export interface VoiceData {
  personaName: string; // e.g., "The Scholarly Authority"
  axes: VoiceAxis[];
  signatureWords: string[];
  insight: string;
}

interface VoiceSpectrumProps {
  data?: VoiceData;
}

// --- Component ---
const VoiceSpectrum: React.FC<VoiceSpectrumProps> = ({ data }) => {
  const [isMimicking, setIsMimicking] = useState(false);
  const [mimicResult, setMimicResult] = useState("");

  const safeData: VoiceData = data || {
    personaName: "The Tech Philosopher",
    axes: [
      {
        id: "formal",
        leftLabel: "Formal",
        rightLabel: "Casual",
        score: -40,
      },
      {
        id: "tech",
        leftLabel: "Technical",
        rightLabel: "Simple",
        score: -60,
      },
      {
        id: "serious",
        leftLabel: "Serious",
        rightLabel: "Playful",
        score: -20,
      },
      {
        id: "data",
        leftLabel: "Data-driven",
        rightLabel: "Story-driven",
        score: 30,
      },
    ],
    signatureWords: [
      "Framework",
      "Analysis",
      "Deep-dive",
      "Nuance",
      "Strategic",
    ],
    insight:
      "This brand wins by being the 'smartest person in the room.' They use a highly Professional and Scientific tone. Opportunity: There is zero 'Relatable' content here; consider a friendlier approach.",
  };

  const handleMimic = () => {
    setIsMimicking(true);
    setTimeout(() => {
      setIsMimicking(false);
      setMimicResult(
        "Generate content with parameters:\n- Tone: Professional (8/10)\n- Logic: Scientific (7/10)\n- Keywords: 'Framework', 'Analysis'\n\nAI Generator Loaded.",
      );
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Tone & Personality Analysis
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Brand Voice Spectrum
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#074ed5]/10 text-[#074ed5] border border-[#074ed5]/20 rounded-full mt-2 inline-flex w-fit">
            <BsSoundwave size={10} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {safeData.personaName}
            </span>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaFingerprint size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 pt-2 gap-8">
        {/* Left: Interactive Sliders */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          {safeData.axes.map((axis) => {
            const percentage = ((axis.score + 100) / 200) * 100;
            return (
              <div key={axis.id} className="relative">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span className={axis.score <= -30 ? "text-[#074ed5]" : ""}>
                    {axis.leftLabel}
                  </span>
                  <span className={axis.score >= 30 ? "text-[#074ed5]" : ""}>
                    {axis.rightLabel}
                  </span>
                </div>
                {/* Track */}
                <div className="h-2.5 w-full bg-[#f4f8fb] rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-300 transform -translate-x-1/2 z-10" />{" "}
                  {/* Center mark */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#074ed5]/50 to-[#074ed5] rounded-full opacity-80"
                  />
                </div>
                {/* Thumb / Marker */}
                <motion.div
                  initial={{ left: "50%" }}
                  animate={{ left: `${percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute top-5 h-5 w-5 bg-white border-2 border-[#074ed5] rounded-full shadow-md z-20 -mt-2 transform -translate-x-1/2 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                >
                  <div className="w-2 h-2 bg-[#074ed5] rounded-full" />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Right: Insights & Mimic */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4 justify-between">
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Signature Vocabulary
            </h5>
            {/* Signature Words */}
            <div className="flex flex-wrap gap-2">
              {safeData.signatureWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#f4f8fb] border border-slate-100 text-[#000100] text-xs font-bold rounded-xl"
                >
                  "{word}"
                </span>
              ))}
            </div>
          </div>

          {/* Insight Box */}
          <div className="bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <FaFingerprint className="text-[#074ed5]" size={10} />
              <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
                Lab Analysis
              </h5>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {safeData.insight}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            <button
              onClick={handleMimic}
              disabled={isMimicking}
              className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
            >
              {isMimicking ? (
                <BsLightningChargeFill className="animate-pulse text-[#caee55]" />
              ) : (
                <FaPenFancy />
              )}
              {isMimicking ? "Calibrating AI..." : "Write in this Voice"}
            </button>
          </div>
        </div>
      </div>

      {/* Mimic Notification Modal */}
      <AnimatePresence>
        {mimicResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#caee55] text-[#000100] rounded-2xl">
                  <FaRobot size={18} />
                </div>
                <h3 className="text-xl font-black text-[#000100]">
                  AI Persona Activated
                </h3>
              </div>
              <button
                onClick={() => setMimicResult("")}
                className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 bg-[#000100] border border-slate-800 rounded-2xl p-6 font-mono text-sm text-[#caee55] whitespace-pre-wrap overflow-y-auto custom-scroll shadow-inner">
              {mimicResult}
            </div>

            <button
              onClick={() => setMimicResult("")}
              className="mt-4 w-full py-4 bg-[#f4f8fb] hover:bg-slate-200 text-[#000100] rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            >
              Close Overlay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSpectrum;

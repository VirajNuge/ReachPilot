"use client";

import React, { useState } from "react";
import {
  FaFingerprint,
  FaRobot,
  FaPenFancy,
  FaQuoteRight,
} from "react-icons/fa";
import { BsSoundwave, BsLightningChargeFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <FaFingerprint size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Brand Voice Spectrum
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-indigo-300">
                  Why this matters:
                </div>
                Maps the personality and tone of the content. Matches you with
                the industry 'vibe' or helps you disrupt it.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Tone & Personality Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100/50 rounded-full border border-indigo-100 text-indigo-800">
          <BsSoundwave />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {safeData.personaName}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 pt-2 gap-8">
        {/* Left: Interactive Sliders */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {safeData.axes.map((axis) => {
            const percentage = ((axis.score + 100) / 200) * 100;
            return (
              <div key={axis.id} className="relative">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span className={axis.score <= -30 ? "text-indigo-600" : ""}>
                    {axis.leftLabel}
                  </span>
                  <span className={axis.score >= 30 ? "text-indigo-600" : ""}>
                    {axis.rightLabel}
                  </span>
                </div>
                {/* Track */}
                <div className="h-2 w-full bg-gray-100 rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2 z-10" />{" "}
                  {/* Center mark */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-300 to-indigo-500 rounded-full opacity-50"
                  />
                </div>
                {/* Thumb / Marker */}
                <motion.div
                  initial={{ left: "50%" }}
                  animate={{ left: `${percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute top-5 h-4 w-4 bg-white border-2 border-indigo-600 rounded-full shadow-md z-20 -mt-1.5 transform -translate-x-1/2 flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Right: Insights & Mimic */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4">
          {/* Signature Words */}
          <div className="flex flex-wrap gap-2">
            {safeData.signatureWords.map((word, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold rounded-lg"
              >
                "{word}"
              </span>
            ))}
          </div>

          {/* Insight */}
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-2">
              <FaQuoteRight className="text-indigo-400 text-xs" />
              <h5 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                Lab Analysis
              </h5>
            </div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed">
              {safeData.insight}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            <button
              onClick={handleMimic}
              disabled={isMimicking}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              {isMimicking ? (
                <BsLightningChargeFill className="animate-pulse" />
              ) : (
                <FaPenFancy />
              )}
              {isMimicking ? "Calibrating AI..." : "Write in this Voice"}
            </button>
          </div>
        </div>
      </div>

      {/* Mimic Notification */}
      <AnimatePresence>
        {mimicResult && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-xl z-30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-bold text-green-400">
                <FaRobot /> AI Persona Activated
              </span>
              <button
                onClick={() => setMimicResult("")}
                className="text-[10px] text-gray-400 font-bold hover:text-white"
              >
                DISMISS
              </button>
            </div>
            <p className="text-xs font-mono text-gray-300 whitespace-pre-line">
              {mimicResult}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSpectrum;

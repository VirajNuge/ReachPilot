"use client";

import React from "react";
import { FaFingerprint } from "react-icons/fa";
import { BsSoundwave, BsGraphUpArrow } from "react-icons/bs";
import { TbAlertTriangle, TbBulb, TbTargetArrow } from "react-icons/tb";
import { motion } from "framer-motion";

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

/** Returns the dominant label and intensity string for an axis score */
function axisReading(axis: VoiceAxis): { label: string; intensity: string; isLeft: boolean } {
  const abs = Math.abs(axis.score);
  const isLeft = axis.score <= 0;
  const label = isLeft ? axis.leftLabel : axis.rightLabel;
  const intensity =
    abs >= 70 ? "Very Strong" : abs >= 40 ? "Strong" : abs >= 15 ? "Moderate" : "Balanced";
  return { label, intensity, isLeft };
}

/** Returns a short implication sentence per axis */
function axisImplication(axis: VoiceAxis): string {
  const { label, intensity } = axisReading(axis);
  const id = axis.id.toLowerCase();
  if (id.includes("formal") || id.includes("casual")) {
    return axis.score <= -30
      ? "Structured, authoritative language builds credibility with professional audiences."
      : axis.score >= 30
      ? "Conversational tone lowers friction and feels approachable in feeds."
      : "Balanced register adapts well to mixed audience types.";
  }
  if (id.includes("tech") || id.includes("simple")) {
    return axis.score <= -30
      ? "High technical density signals expertise — but may alienate non-specialist readers."
      : axis.score >= 30
      ? "Plain language maximises reach and shareability across audience segments."
      : "Mid-range complexity hits the sweet spot for educated non-expert audiences.";
  }
  if (id.includes("serious") || id.includes("playful")) {
    return axis.score <= -30
      ? "Consistently serious framing reinforces authority but limits viral potential."
      : axis.score >= 30
      ? "Playful energy drives higher comment and share rates via emotional response."
      : "Tonal flexibility allows content to pivot between education and entertainment.";
  }
  if (id.includes("data") || id.includes("story")) {
    return axis.score <= -30
      ? "Data-heavy posts earn trust and perform well in thought-leadership niches."
      : axis.score >= 30
      ? "Narrative-first content generates stronger emotional connection and saves."
      : "Blending evidence with story creates high-credibility and high-engagement posts.";
  }
  // generic fallback
  return `${intensity} lean toward ${label} defines this dimension of the brand voice.`;
}

/** Returns an opportunity (gap) note per axis */
function axisOpportunity(axis: VoiceAxis): string | null {
  const abs = Math.abs(axis.score);
  if (abs < 20) return null; // balanced — no gap
  const opposite = axis.score <= 0 ? axis.rightLabel : axis.leftLabel;
  if (abs >= 60) {
    return `Opportunity: introducing occasional ${opposite.toLowerCase()} elements could expand reach without diluting the core persona.`;
  }
  return null;
}

// --- Component ---
const VoiceSpectrum: React.FC<VoiceSpectrumProps> = ({ data }) => {
  const safeData: VoiceData = data || {
    personaName: "The Tech Philosopher",
    axes: [
      { id: "formal", leftLabel: "Formal", rightLabel: "Casual", score: -40 },
      { id: "tech", leftLabel: "Technical", rightLabel: "Simple", score: -60 },
      { id: "serious", leftLabel: "Serious", rightLabel: "Playful", score: -20 },
      { id: "data", leftLabel: "Data-driven", rightLabel: "Story-driven", score: 30 },
    ],
    signatureWords: ["Framework", "Analysis", "Deep-dive", "Nuance", "Strategic"],
    insight:
      "This brand wins by being the 'smartest person in the room.' They use a highly Professional and Scientific tone. Opportunity: There is zero 'Relatable' content here; consider a friendlier approach.",
  };

  // Derive dominant trait (axis with highest abs score)
  const dominantAxis = [...safeData.axes].sort(
    (a, b) => Math.abs(b.score) - Math.abs(a.score)
  )[0];
  const dominant = dominantAxis ? axisReading(dominantAxis) : null;

  // Axes with a strong enough lean to flag as gap
  const gapAxes = safeData.axes.filter((a) => axisOpportunity(a) !== null);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
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
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaFingerprint size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-8 min-h-0">
        {/* Left: Spectrum Sliders */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          {safeData.axes.map((axis) => {
            const percentage = ((axis.score + 100) / 200) * 100;
            const reading = axisReading(axis);
            return (
              <div key={axis.id} className="relative pb-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span className={axis.score <= -30 ? "text-[#074ed5]" : ""}>{axis.leftLabel}</span>
                  <span className={axis.score >= 30 ? "text-[#074ed5]" : ""}>{axis.rightLabel}</span>
                </div>
                {/* Track */}
                <div className="h-2.5 w-full bg-[#f4f8fb] rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-300 transform -translate-x-1/2 z-10" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#074ed5]/50 to-[#074ed5] rounded-full opacity-80"
                  />
                </div>
                {/* Thumb */}
                <motion.div
                  initial={{ left: "50%" }}
                  animate={{ left: `${percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute top-5 h-5 w-5 bg-white border-2 border-[#074ed5] rounded-full shadow-md z-20 -mt-2 transform -translate-x-1/2 flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-[#074ed5] rounded-full" />
                </motion.div>
                {/* Reading label */}
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  <span className="text-[#074ed5] font-bold">{reading.intensity}</span>
                  {" · "}
                  {reading.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Lab Analysis Panel */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4 overflow-y-auto custom-scroll">

          {/* Signature Vocabulary */}
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Signature Vocabulary
            </h5>
            <div className="flex flex-wrap gap-2">
              {safeData.signatureWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#f4f8fb] border border-slate-100 text-[#000100] text-xs font-bold rounded-xl"
                >
                  &ldquo;{word}&rdquo;
                </span>
              ))}
            </div>
          </div>

          {/* Overall Insight */}
          <div className="bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <FaFingerprint className="text-[#074ed5]" size={10} />
              <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
                Lab Analysis
              </h5>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {safeData.insight}
            </p>
          </div>

          {/* Dominant Trait Callout */}
          {dominant && dominantAxis && (
            <div className="bg-[#074ed5]/5 border border-[#074ed5]/15 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <BsGraphUpArrow className="text-[#074ed5]" size={11} />
                <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
                  Dominant Trait
                </h5>
              </div>
              <p className="text-xs font-bold text-[#000100] mb-1">
                {dominant.intensity} {dominant.label}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {axisImplication(dominantAxis)}
              </p>
            </div>
          )}

          {/* Per-Axis Breakdown */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TbTargetArrow className="text-slate-400" size={12} />
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Axis Breakdown
              </h5>
            </div>
            <div className="flex flex-col gap-2">
              {safeData.axes.map((axis) => {
                const reading = axisReading(axis);
                const implication = axisImplication(axis);
                return (
                  <div
                    key={axis.id}
                    className="bg-[#f4f8fb] rounded-xl px-3 py-2.5 border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#000100] uppercase tracking-wide">
                        {axis.leftLabel} / {axis.rightLabel}
                      </span>
                      <span className="text-[10px] font-bold text-[#074ed5]">
                        {reading.intensity} {reading.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{implication}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gap / Opportunity Flags */}
          {gapAxes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TbAlertTriangle className="text-amber-500" size={12} />
                <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  Growth Gaps
                </h5>
              </div>
              <div className="flex flex-col gap-2">
                {gapAxes.map((axis) => {
                  const opp = axisOpportunity(axis);
                  if (!opp) return null;
                  return (
                    <div
                      key={axis.id}
                      className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex gap-2"
                    >
                      <TbBulb className="text-amber-500 shrink-0 mt-0.5" size={13} />
                      <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        {opp}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VoiceSpectrum;

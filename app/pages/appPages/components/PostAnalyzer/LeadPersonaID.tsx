"use client";

import React from "react";
import {
  FaUserTie,
  FaUserFriends,
  FaCheckCircle,
  FaFire,
  FaBolt,
  FaUser,
  FaCommentDots,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { LeadPersonaProps } from "@/lib/postAnalyzerTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const brandColors = ["#0052FF", "#B6FF33", "#1A1D23", "#64748B"];

/** AI sometimes returns values as fractions (0.5) instead of percentages (50).
 *  If all values are ≤ 1, assume fractions and multiply × 100. */
function normalizeValues(
  data: { label: string; value: number; color: string }[]
): { label: string; value: number; color: string }[] {
  const max = Math.max(...data.map((d) => d.value));
  const factor = max <= 1 ? 100 : 1;
  return data.map((d) => ({ ...d, value: Math.round(d.value * factor) }));
}

/** AI sometimes returns score as fraction (0.75) instead of percentage (75). */
function normalizeScore(score: number): number {
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
}

/** ICP zone label based on score threshold */
function getIcpZone(score: number): { label: string; color: string } {
  if (score >= 66) return { label: "Perfect Fit", color: "text-[#4D8C00]" };
  if (score >= 33) return { label: "Well Aligned", color: "text-[#0052FF]" };
  return { label: "Still Learning", color: "text-amber-600" };
}

/** Intent chip style by content */
function getIntentChip(intent: string): {
  bg: string;
  icon: React.ReactNode;
} {
  const lower = intent.toLowerCase();
  if (
    lower.includes("high") ||
    lower.includes("shar") ||
    lower.includes("knowledge")
  ) {
    return {
      bg: "bg-[#B6FF33]/20 border-[#B6FF33]/40 text-[#4D8C00]",
      icon: <FaFire size={9} />,
    };
  }
  if (
    lower.includes("discuss") ||
    lower.includes("debate") ||
    lower.includes("draw")
  ) {
    return {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <FaBolt size={9} />,
    };
  }
  return {
    bg: "bg-[#EEF3FF] border-[#C7D8FF] text-[#0052FF]",
    icon: <FaUser size={9} />,
  };
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({
  data,
  centerLabel,
}: {
  data: { label: string; value: number; color: string }[];
  centerLabel: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.33
  let accumulated = 0;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="transform -rotate-90 w-full h-full"
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#F1F5F9"
          strokeWidth="12"
        />
        {data.map((seg, i) => {
          const dashLen = (seg.value / 100) * circumference;
          const offset = -(accumulated / 100) * circumference;
          accumulated += seg.value;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dashLen} ${circumference}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
        <span className="text-xl font-black text-[#1A1D23] leading-none">
          {centerLabel}
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          reach
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadPersonaID({
  audienceData,
  highIntentLeads,
  icpAlignment,
}: LeadPersonaProps) {
  // Normalize values from AI fractions → percentages, override with brand colors
  const normalizedData = normalizeValues(audienceData).map((d, idx) => ({
    ...d,
    color: brandColors[idx % brandColors.length],
  }));

  const icpScore = normalizeScore(icpAlignment.score);
  const icpZone = getIcpZone(icpScore);

  // Donut center label: largest segment % is the "primary reach"
  const largestSegment = normalizedData.reduce(
    (max, d) => (d.value > max.value ? d : max),
    normalizedData[0] ?? { label: "", value: 0, color: "" }
  );
  const centerLabel = `${largestSegment?.value ?? 0}%`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Audience Intelligence
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Lead Persona ID
            </h3>
            <span className="text-[11px] font-semibold bg-[#B6FF33]/20 text-[#4D8C00] px-3 py-1 rounded-xl flex items-center gap-1">
              <FaCheckCircle className="text-[#0052FF]" size={10} />{" "}
              {highIntentLeads.length} Hot Leads
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaUserFriends size={16} />
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">Why this matters:</div>
            Break down who engaged with this post. Focus your outreach on
            "High-Intent" leads.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-5 flex-1 flex flex-col">
        {/* ── Section 1: Audience Chart + Legend ── */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-5">
          <DonutChart data={normalizedData} centerLabel={centerLabel} />

          <div className="flex-1 space-y-2.5">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-1">
              Audience Breakdown
            </span>
            {normalizedData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium truncate">
                    {item.label}
                  </span>
                </div>
                {/* Mini bar + percentage */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="font-bold text-[#1A1D23] w-8 text-right">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: ICP Alignment Score ── */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">
                ICP Alignment
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#1A1D23] leading-none">
                  {icpScore}%
                </span>
                <span className={`text-[11px] font-bold ${icpZone.color}`}>
                  {icpZone.label}
                </span>
              </div>
            </div>
            <div className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5 max-w-[140px] truncate">
              <FaUserTie className="text-[#0052FF] shrink-0" />
              <span className="truncate">{icpAlignment.title}</span>
            </div>
          </div>

          {/* Progress bar with zone threshold lines */}
          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div
              className="absolute inset-y-0 left-0 bg-[#0052FF] rounded-full transition-all duration-700"
              style={{ width: `${icpScore}%` }}
            />
            {/* threshold lines */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/70"
              style={{ left: "33%" }}
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-white/70"
              style={{ left: "66%" }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Learning</span>
            <span>Aligned</span>
            <span>Perfect</span>
          </div>
        </div>

        {/* ── Section 3: High-Intent Targets ── */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 mb-3">
            <FaCommentDots size={10} className="text-[#0052FF]" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              High-Intent Targets
            </span>
          </div>
          <div className="space-y-2 flex-1">
            {highIntentLeads.map((lead, i) => {
              const chip = getIntentChip(lead.intent);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-[#0052FF]/30 hover:shadow-sm transition-all group cursor-pointer"
                >
                  {/* Avatar */}
                  {lead.avatar ? (
                    <img
                      src={lead.avatar}
                      alt={lead.name}
                      className="w-8 h-8 rounded-full bg-slate-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#EEF3FF] flex items-center justify-center shrink-0">
                      <FaUser size={12} className="text-[#0052FF]" />
                    </div>
                  )}

                  {/* Name + Role */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-[#1A1D23] truncate leading-tight">
                      {lead.name}
                    </h4>
                    <p className="text-[11px] text-[#0052FF] font-medium truncate mt-0.5">
                      {lead.role}
                    </p>
                  </div>

                  {/* Intent chip */}
                  <div
                    className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${chip.bg}`}
                  >
                    {chip.icon}
                    <span className="hidden sm:inline">{lead.intent}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

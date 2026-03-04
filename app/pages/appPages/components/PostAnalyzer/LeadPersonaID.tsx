import React from "react";
import {
  FaUserTie,
  FaExternalLinkAlt,
  FaUserFriends,
  FaCheckCircle,
} from "react-icons/fa";
import { LeadPersonaProps } from "@/lib/postAnalyzerTypes";

export default function LeadPersonaID({
  audienceData,
  highIntentLeads,
  icpAlignment,
}: LeadPersonaProps) {
  const hotLeadPercent =
    audienceData.find((a) => a.label.includes("High-Intent"))?.value || 0;
  let accumulatedAngle = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Enforce specific color scheme for the donut chart matching our spec
  const brandColors = ["#0052FF", "#B6FF33", "#1A1D23", "#64748B"];
  const themedAudienceData = audienceData.map((data, idx) => ({
    ...data,
    color: brandColors[idx % brandColors.length],
  }));

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
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Break down who engaged with this post. Focus your outreach on
            "High-Intent" leads.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ── Audience Chart & Legend ── */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="transform -rotate-90 w-full h-full"
            >
              {themedAudienceData.map((segment, i) => {
                const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -(
                  (accumulatedAngle / 100) *
                  circumference
                );
                accumulatedAngle += segment.value;
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
              <span className="text-xl font-black text-[#1A1D23]">
                {hotLeadPercent}%
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-1">
              Audience Breakdown
            </span>
            {themedAudienceData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-slate-600 font-medium">
                    {item.label}
                  </span>
                </div>
                <span className="font-bold text-[#1A1D23]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ICP Alignment Metric ── */}
        <div className="flex justify-between items-end border-b border-slate-100 pb-5">
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
              ICP Alignment
            </p>
            <div className="text-2xl font-bold text-[#1A1D23] leading-none flex items-baseline gap-2">
              {icpAlignment.score}% Match
              <FaCheckCircle className="text-[#0052FF]" size={12} />
            </div>
          </div>
          <div className="text-[12px] font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
            <FaUserTie className="text-[#0052FF]" /> {icpAlignment.title}
          </div>
        </div>

        {/* ── Outreach List (Hot Leads) ── */}
        <div className="flex-1 flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
            High-Intent Targets
          </span>
          <div className="space-y-2 flex-1">
            {highIntentLeads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-[#0052FF]/30 hover:shadow-sm transition-colors group cursor-pointer"
              >
                <img
                  src={lead.avatar}
                  alt={lead.name}
                  className="w-8 h-8 rounded-full bg-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-[#1A1D23] truncate leading-tight">
                    {lead.name}
                  </h4>
                  <p className="text-[11px] text-[#0052FF] font-medium truncate mt-0.5">
                    {lead.role}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-[#F4F7FA] text-slate-500 px-2 py-1 flex items-center gap-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF33]"></span>
                    {lead.intent}
                  </span>
                </div>
                <FaExternalLinkAlt className="text-slate-300 group-hover:text-[#0052FF] text-[10px] ml-1 transition-colors" />
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button className="w-full mt-3 py-3 border border-slate-200 text-[#1A1D23] rounded-2xl text-[13px] font-bold hover:bg-slate-50 transition-colors">
              Export Prospects (.CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

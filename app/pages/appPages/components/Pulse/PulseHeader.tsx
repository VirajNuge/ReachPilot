"use client";

import React from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";
import { FaUsers, FaChartLine, FaMedal, FaUser } from "react-icons/fa";

interface PulseHeaderProps {
  profile: RawAnalysisData["profile"];
  profileScore?: number;
}

export default function PulseHeader({
  profile,
  profileScore,
}: PulseHeaderProps) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toLocaleString();
  };

  const score = profileScore ?? profile.profileScore ?? 72;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden mb-6 relative">
      <div className="px-6 py-6 relative">
        {/* Profile picture + name row */}
        <div className="flex items-end gap-4 mb-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-[0_4px_16px_rgba(0,82,255,0.15)] overflow-hidden bg-white">
              {profile.pfp ? (
                <img
                  src={profile.pfp}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F5F6FA] flex items-center justify-center">
                  <FaUser className="text-3xl text-slate-300" />
                </div>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#0052FF] border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-xl font-black text-[#1A1D23] tracking-tight leading-none mb-1">
              {profile.name}
            </h1>
            <p className="text-xs font-medium text-slate-500 leading-snug max-w-md line-clamp-2">
              {profile.headline || profile.bio}
            </p>
          </div>

          {/* Profile Score Badge (top-right style blue icon badge) */}
          <div className="p-2.5 bg-[#0052FF] text-white rounded-2xl shadow-sm shrink-0 flex flex-col items-center justify-center min-w-[52px]">
            <span className="text-xl font-black leading-none">{score}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-80 mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Inline stat pills row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-[#F5F6FA] px-3 py-1.5 rounded-full border border-slate-100">
            <FaUsers className="text-[#0052FF] text-[10px]" />
            <span className="text-[11px] font-black text-[#1A1D23] uppercase tracking-wider">
              {formatFollowers(profile.followers)}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Followers
            </span>
          </div>

          {profile.projects && (
            <div className="inline-flex items-center gap-1.5 bg-[#F5F6FA] px-3 py-1.5 rounded-full border border-slate-100">
              <FaChartLine className="text-[#0052FF] text-[10px]" />
              <span className="text-[11px] font-black text-[#1A1D23] uppercase tracking-wider">
                {profile.projects}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Projects
              </span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 bg-[#B6FF33]/20 px-3 py-1.5 rounded-full border border-[#B6FF33]/30">
            <FaMedal className="text-[#1A1D23] text-[10px]" />
            <span className="text-[11px] font-black text-[#1A1D23] uppercase tracking-wider">
              {score >= 80
                ? "Elite"
                : score >= 65
                  ? "Strong"
                  : score >= 50
                    ? "Active"
                    : "Growing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

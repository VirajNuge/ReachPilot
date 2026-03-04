"use client";

import React from "react";
import { AudienceTemperature } from "../../../../../lib/types/analysis";
import {
  FaFire,
  FaSun,
  FaLeaf,
  FaSnowflake,
  FaCube,
  FaLightbulb,
  FaThermometerHalf,
} from "react-icons/fa";

interface AudienceTempProps {
  data: AudienceTemperature;
}

export default function AudienceTemp({ data }: AudienceTempProps) {
  const getTempDetails = (s: number) => {
    if (s >= 80)
      return {
        label: "Hot",
        color: "#EF4444",
        bgClass: "bg-[#EF4444]/10",
        textClass: "text-[#EF4444]",
        icon: <FaFire />,
      };
    if (s >= 60)
      return {
        label: "Warm",
        color: "#0052FF",
        bgClass: "bg-[#0052FF]/10",
        textClass: "text-[#0052FF]",
        icon: <FaSun />,
      };
    if (s >= 40)
      return {
        label: "Cool",
        color: "#0052FF",
        bgClass: "bg-[#0052FF]/10",
        textClass: "text-[#0052FF]",
        icon: <FaLeaf />,
      };
    if (s >= 20)
      return {
        label: "Cold",
        color: "#1A1D23",
        bgClass: "bg-[#1A1D23]/10",
        textClass: "text-[#1A1D23]",
        icon: <FaSnowflake />,
      };
    return {
      label: "Freezing",
      color: "#1A1D23",
      bgClass: "bg-[#1A1D23]/10",
      textClass: "text-[#1A1D23]",
      icon: <FaCube />,
    };
  };

  const tempDetails = getTempDetails(data.tempScore);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6">
      {/* Section Label */}
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        Audience Temperature
      </h3>

      {/* Temperature Label Row */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${tempDetails.bgClass} ${tempDetails.textClass}`}
        >
          {tempDetails.icon}
        </div>
        <div>
          <div className="text-2xl font-black text-[#1A1D23] leading-none mb-0.5">
            {tempDetails.label}
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Driven by {data.dominantEmotion}
          </div>
        </div>
      </div>

      {/* Stats Row (3-column grid) */}
      <div className="grid grid-cols-3 gap-4 py-5 border-y border-slate-100 my-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Score
          </span>
          <span className="text-2xl font-black text-[#1A1D23]">
            {data.tempScore}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Fanboys
          </span>
          <span className="text-2xl font-black text-[#1A1D23]">
            {data.fanboyPercent}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Critics
          </span>
          <span className="text-2xl font-black text-[#1A1D23]">
            {data.criticPercent}%
          </span>
        </div>
      </div>

      {/* Recommendation Box */}
      <div className="bg-[#F5F6FA] rounded-2xl border border-slate-100 p-4 mt-4">
        <div className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <FaLightbulb className="text-[#0052FF]" />
          Insight
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {data.recommendation}
        </p>
      </div>
    </div>
  );
}

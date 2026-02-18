"use client";

import React, { useEffect, useState } from "react";
import { AudienceTemperature } from "../../../../../lib/types/analysis";

interface AudienceTempProps {
  data: AudienceTemperature;
}

export default function AudienceTemp({ data }: AudienceTempProps) {
  const [fillHeight, setFillHeight] = useState(0);

  useEffect(() => {
    // Delay animation slightly
    const timer = setTimeout(() => setFillHeight(data.tempScore), 200);
    return () => clearTimeout(timer);
  }, [data.tempScore]);

  // Color mapping based on score
  const getColor = (s: number) => {
    if (s >= 80)
      return {
        main: "#EF4444",
        bg: "bg-red-500",
        text: "text-red-600",
        emoji: "🔥",
      };
    if (s >= 60)
      return {
        main: "#F97316",
        bg: "bg-orange-500",
        text: "text-orange-600",
        emoji: "☀️",
      };
    if (s >= 40)
      return {
        main: "#10B981",
        bg: "bg-emerald-500",
        text: "text-emerald-600",
        emoji: "🌿",
      };
    if (s >= 20)
      return {
        main: "#06B6D4",
        bg: "bg-cyan-500",
        text: "text-cyan-600",
        emoji: "❄️",
      };
    return {
      main: "#3B82F6",
      bg: "bg-blue-500",
      text: "text-blue-600",
      emoji: "🧊",
    };
  };

  const theme = getColor(data.tempScore);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex items-center gap-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.main }}
      />

      {/* Thermometer Visual */}
      <div className="relative h-[120px] w-8 bg-slate-100 rounded-full flex items-end justify-center p-1 shadow-inner shrink-0">
        {/* Bulb */}
        <div
          className={`absolute -bottom-1 w-10 h-10 rounded-full border-4 border-white shadow-md z-10 ${theme.bg}`}
        />

        {/* Stem Fill */}
        <div
          className={`w-full rounded-t-full transition-all duration-1000 ease-out relative z-0 ${theme.bg}`}
          style={{ height: `${fillHeight}%` }}
        >
          {/* Bubbles animation */}
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full animate-[float_2s_infinite]" />
            <div className="absolute bottom-2 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-[float_3s_infinite_delay-100ms]" />
          </div>
        </div>

        {/* Tick marks */}
        <div className="absolute right-0 top-0 h-full w-full flex flex-col justify-between py-2 px-2 pointer-events-none opacity-30">
          <div className="w-1.5 h-[1px] bg-slate-400 self-end" />
          <div className="w-2.5 h-[1px] bg-slate-400 self-end" />
          <div className="w-1.5 h-[1px] bg-slate-400 self-end" />
          <div className="w-2.5 h-[1px] bg-slate-400 self-end" />
          <div className="w-1.5 h-[1px] bg-slate-400 self-end" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
          Audience Temp
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{theme.emoji}</span>
          <div>
            <div className={`text-2xl font-black tracking-tight ${theme.text}`}>
              {data.label}
            </div>
            <div className="text-xs font-semibold text-slate-400 opacity-80">
              Driven by {data.dominantEmotion}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">
              {data.fanboyPercent}%
            </span>
            <span className="text-slate-400 scale-90 origin-left">Fanboys</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-100" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">
              {data.criticPercent}%
            </span>
            <span className="text-slate-400 scale-90 origin-left">Critics</span>
          </div>
        </div>
      </div>
    </div>
  );
}

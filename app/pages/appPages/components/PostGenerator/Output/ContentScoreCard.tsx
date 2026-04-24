"use client";

import React from "react";
import { motion } from "framer-motion";
import { ContentScore } from "@/lib/types/postGeneration";
import { Target, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

interface ContentScoreCardProps {
  score: ContentScore;
}

const getScoreColor = (value: number) => {
  if (value >= 80) return "#A5E338"; // bright green
  if (value >= 60) return "#0047FF"; // bright blue
  return "#111827"; // dark gray
};

const CircularGauge = ({ value, label, icon: Icon, size = 80, strokeWidth = 8 }: { value: number, label: string, icon: React.ElementType, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = getScoreColor(value);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-gray-900 tracking-tight" style={{ fontSize: size > 80 ? '2.5rem' : '1.25rem' }}>{value}</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-gray-500 tracking-wide text-center">{label}</span>
      </div>
    </div>
  );
};

export const ContentScoreCard: React.FC<ContentScoreCardProps> = ({ score }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0047FF] flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-white" />
          </div>
          Content Score
        </h3>
        <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[11px] font-semibold text-gray-500">
          AI Analysis
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 px-1">
        <CircularGauge value={score.overall} label="OVERALL SCORE" icon={CheckCircle2} size={100} strokeWidth={10} />
        <div className="flex items-center justify-between w-full">
          <CircularGauge value={score.hookStrength} label="HOOK" icon={Zap} size={60} strokeWidth={6} />
          <CircularGauge value={score.clarity} label="CLARITY" icon={Target} size={60} strokeWidth={6} />
          <CircularGauge value={score.virality} label="VIRALITY" icon={TrendingUp} size={60} strokeWidth={6} />
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-200">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em] block mb-2">
          Feedback
        </span>
        <p className="text-[14px] font-medium text-gray-800 leading-relaxed">
          {score.feedback}
        </p>
      </div>
    </motion.div>
  );
};

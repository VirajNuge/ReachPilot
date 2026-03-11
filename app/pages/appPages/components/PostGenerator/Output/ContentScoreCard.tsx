"use client";

import React from "react";
import { motion } from "framer-motion";
import { ContentScore } from "@/lib/types/postGeneration";
import { Target, Zap, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

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
      className="bg-white p-7 rounded-[32px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0047FF] flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          Content Score
        </h3>
        <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
          AI Analysis
        </span>
      </div>

      <div className="flex items-center justify-between gap-6 px-4">
        <CircularGauge value={score.overall} label="OVERALL SCORE" icon={CheckCircle2} size={130} strokeWidth={14} />
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1 justify-items-center">
          <CircularGauge value={score.hookStrength} label="HOOK" icon={Zap} size={70} strokeWidth={8} />
          <CircularGauge value={score.clarity} label="CLARITY" icon={Target} size={70} strokeWidth={8} />
          <CircularGauge value={score.engagementPotential} label="ENGAGEMENT" icon={Sparkles} size={70} strokeWidth={8} />
          <CircularGauge value={score.virality} label="VIRALITY" icon={TrendingUp} size={70} strokeWidth={8} />
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-gray-100/50">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
          Feedback
        </span>
        <p className="text-[15px] font-medium text-gray-700 leading-relaxed">
          {score.feedback}
        </p>
      </div>
    </motion.div>
  );
};

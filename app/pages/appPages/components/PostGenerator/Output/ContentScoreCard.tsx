"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ContentScore } from "@/lib/types/postGeneration";

interface ContentScoreCardProps {
  score: ContentScore;
}

export const ContentScoreCard: React.FC<ContentScoreCardProps> = ({ score }) => {
  const metrics = [
    { label: "Hook", value: score.hookStrength, color: "bg-purple-500" },
    { label: "Clarity", value: score.clarity, color: "bg-blue-500" },
    { label: "Virality", value: score.virality, color: "bg-green-500" },
    { label: "Engagement", value: score.engagementPotential, color: "bg-orange-500" },
  ];

  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const strokeDasharray = 2 * Math.PI * 36;
  const strokeDashoffset = strokeDasharray - (score.overall / 100) * strokeDasharray;

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="transparent" stroke="#F3F4F6" strokeWidth="6" />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={getScoreColor(score.overall)}
                initial={{ strokeDashoffset: strokeDasharray, strokeDasharray }}
                animate={{ strokeDashoffset, strokeDasharray }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold tracking-tight ${getScoreColor(score.overall)}`}>
                {score.overall}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {metrics.map((metric, i) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#4B5563]">{metric.label}</span>
                  <span className="text-[11px] font-bold text-[#111827]">{metric.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <motion.div
                    className={`h-full rounded-full ${metric.color}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.max(4, metric.value)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 + i * 0.08 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </motion.section>
  );
};

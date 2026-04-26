"use client";

import React from "react";
import type { ContentScore } from "@/lib/types/postGeneration";

interface ContentScoreCardProps {
  score: ContentScore;
}

export const ContentScoreCard: React.FC<ContentScoreCardProps> = ({ score }) => {
  const metrics = [
    { label: "Hook", value: score.hookStrength },
    { label: "Clarity", value: score.clarity },
    { label: "Virality", value: score.virality },
    { label: "Engagement", value: score.engagementPotential },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Score</p>
          <h3 className="mt-1 text-sm font-semibold text-[#111827]">AI content read</h3>
        </div>
        <span className="rounded-full border border-[#D1D5DB] px-3 py-1 text-sm font-semibold text-[#111827]">
          {score.overall}/100
        </span>
      </div>

      <div className="grid gap-2 rounded-[22px] border border-[#E5E7EB] bg-white p-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="grid grid-cols-[72px_1fr_40px] items-center gap-3">
            <span className="text-xs font-medium text-[#6B7280]">{metric.label}</span>
            <div className="h-2 rounded-full bg-[#F3F4F6]">
              <div
                className="h-2 rounded-full bg-[#111827]"
                style={{ width: `${Math.max(6, metric.value)}%` }}
              />
            </div>
            <span className="text-right text-xs font-semibold text-[#111827]">{metric.value}</span>
          </div>
        ))}
      </div>

      <p className="text-sm leading-6 text-[#4B5563]">{score.feedback}</p>
    </section>
  );
};

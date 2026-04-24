"use client";

import React from "react";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Video,
  Image as ImageIcon,
  AlignLeft,
} from "lucide-react";
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { ContentInsight } from "@/lib/analytics/types";
import { CONTENT_INSIGHTS } from "./mockData";

interface ContentDNATableProps {
  platform: PlatformKey;
  insights?: ContentInsight[];
}

export default function ContentDNATable({ platform, insights }: ContentDNATableProps) {
  // Get data or fallback to 'all'
  const data = insights ?? (CONTENT_INSIGHTS[platform] || CONTENT_INSIGHTS["all"]);

  const getIcon = (format: string) => {
    if (format.includes("Carousel") || format.includes("PDF"))
      return <Layers size={16} />;
    if (format.includes("Video") || format.includes("Reel"))
      return <Video size={16} />;
    if (format.includes("Image")) return <ImageIcon size={16} />;
    return <AlignLeft size={16} />;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
            <Sparkles className="text-[#0052FF]" size={18} />
            Content Intelligence
          </h3>
          <p className="text-sm text-slate-500">
            Which formats are driving your growth?
          </p>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/60 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <div className="col-span-3">Format</div>
        <div className="col-span-4">Performance Score</div>
        <div className="col-span-3">AI Insight</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {data.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 items-center hover:bg-slate-50/60 transition-colors group"
          >
            {/* 1. Format Name */}
            <div className="col-span-3 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-[#0052FF] group-hover:shadow-sm transition-all">
                {getIcon(item.format)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#000100]">{item.format}</p>
                <p className="text-[10px] text-slate-400">
                  {item.engagement} Avg. Eng
                </p>
              </div>
            </div>

            {/* 2. Performance Bar */}
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    {item.performance}/100
                  </span>
                </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.performance >= 90
                      ? "bg-green-500"
                    : item.performance >= 70
                      ? "bg-[#0052FF]"
                      : "bg-orange-400"
                  }`}
                  style={{ width: `${item.performance}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Insight Text */}
            <div className="col-span-3">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.insight}
              </p>
            </div>

            {/* 4. Action Button */}
            <div className="col-span-2 text-right">
              <button className="font-bold flex items-center gap-1 ml-auto group/btn bg-[#000100] hover:bg-black text-white px-3 py-2 rounded-lg">
                {item.action}
                <ArrowRight
                  size={12}
                  className="transform group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          Data based on last 30 days of posting history
        </p>
      </div>
    </div>
  );
}

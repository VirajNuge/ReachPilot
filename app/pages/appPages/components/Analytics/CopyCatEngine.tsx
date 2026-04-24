"use client";

import React from "react";
import { Sparkles, Trophy, Zap, Eye, MousePointer2 } from "lucide-react";
import type { TopPost } from "@/lib/analytics/types";
import { TOP_POSTS_DATA } from "./mockData";

interface CopyCatEngineProps {
  posts?: TopPost[];
}

export default function CopyCatEngine({ posts }: CopyCatEngineProps) {
  const data = posts ?? TOP_POSTS_DATA;
  return (
    // ⭐ STYLE UPDATE: Changed to White Background + Gray Borders to match app theme
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] mt-8 mb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-yellow-50 border border-yellow-100 rounded-xl">
              <Trophy size={16} className="text-yellow-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Hall of Fame
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#000100]">
            The Copy-Cat Engine
          </h3>
          <p className="text-slate-500 text-sm mt-2 max-w-lg leading-relaxed">
            AI identified your top 1% content. Clone their structure to
            replicate viral success instantly.
          </p>
        </div>

        {/* Badge */}
        <div className="hidden md:block">
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-wider bg-[#0052FF]/10 px-3 py-1 rounded-full border border-[#0052FF]/20">
              AI Analysis Active
            </span>
          </div>
        </div>

      {/* Grid of Top Posts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.map((post) => (
          <div
            key={post.id}
            className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-[#0052FF]/30 hover:shadow-md transition-all group flex flex-col"
          >
            {/* Card Header: Format & Score */}
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {post.format}
              </span>
              <div className="flex items-center gap-1 text-green-700 text-xs font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <Zap size={12} fill="currentColor" />
                {post.score}/100
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-6 flex-1">
              <h4 className="font-bold text-[#000100] text-lg leading-tight mb-3 group-hover:text-[#0052FF] transition-colors">
                "{post.headline}"
              </h4>
              <div className="pl-3 border-l-2 border-[#0052FF]/20">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700">
                    Why it worked:
                  </span>{" "}
                  {post.whyItWorked}
                </p>
              </div>
            </div>

            {/* Footer: Stats & Action */}
            <div className="mt-auto">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <Eye size={12} />{" "}
                  <span className="text-slate-700 font-bold">
                    {post.stats.views}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer2 size={12} />{" "}
                  <span className="text-slate-700 font-bold">
                    {post.stats.engagement}
                  </span>
                </div>
              </div>

              {/* ⭐ CLONE BUTTON (Clean Style) */}
              <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-[#000100] hover:bg-black text-white">
                <Sparkles size={14} />
                Generate 5 Variations
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

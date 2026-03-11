"use client";

import React from "react";
import { TrendingUp, Twitter, Linkedin, Zap, ArrowRight } from "lucide-react";

export default function TrendFeed() {
  // Mock Data
  const trends = [
    {
      id: 1,
      source: "twitter",
      topic: "DeepSeek vs OpenAI",
      volume: "125K posts",
      relevance: 98,
      headline:
        "Developers are switching to DeepSeek locally for cost savings.",
    },
    {
      id: 2,
      source: "linkedin",
      topic: "Remote Work 2025",
      volume: "Trending in Tech",
      relevance: 85,
      headline: "New data shows hybrid models are failing mid-sized startups.",
    },
    {
      id: 3,
      source: "twitter",
      topic: "NextJS 15",
      volume: "45K posts",
      relevance: 92,
      headline: "Vercel announces new caching strategies for App Router.",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">Live Trend Radar</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-white"
          >
            {/* Top Row: Source & Score */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    trend.source === "twitter"
                      ? "bg-black text-white"
                      : "bg-[#0077B5] text-white"
                  }`}
                >
                  {trend.source === "twitter" ? (
                    <Twitter size={12} />
                  ) : (
                    <Linkedin size={12} />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {trend.topic}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                <Zap size={10} fill="currentColor" />
                {trend.relevance}% Match
              </div>
            </div>

            {/* Headline */}
            <p className="text-sm font-medium text-gray-800 leading-snug mb-3">
              {trend.headline}
            </p>

            {/* Footer Action */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-medium">
                {trend.volume}
              </span>
              <button className="flex items-center gap-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline bg-[#000100] hover:bg-black text-white">
                Draft Post <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

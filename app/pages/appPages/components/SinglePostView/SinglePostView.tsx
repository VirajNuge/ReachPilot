"use client";

import React from "react";
import {
  Clock,
  Hash,
  Eye,
  Sparkles,
  Target,
  MessageCircle,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";

import {
  getPlatformDetails,
  TextContentBox,
  PostVisualCard,
} from "../SharedPostComponents/SharedPostComponents";

import { SinglePostContent } from "../../[id]/postGenerator/GeneratorResults";

interface SinglePostViewProps {
  data: SinglePostContent;
}

export default function SinglePostView({ data }: SinglePostViewProps) {
  const platformInfo = getPlatformDetails("IG");

  // ⭐ FIX — Ensure width/height always exist
  const imgW = data.image_width || 1080;
  const imgH = data.image_height || 1350;
  const safeAspectRatio = `${imgW} / ${imgH}`;

  // ⭐ FIX — Ensure strategy object always exists
  const strategy = {
    best_posting_day: data.strategy?.best_posting_day ?? "",
    best_posting_time: data.strategy?.best_posting_time ?? "",
    why_this_works: data.strategy?.why_this_works ?? "",
    engagement_tips: data.strategy?.engagement_tips ?? [],
    visual_tips: data.strategy?.visual_tips ?? [],
    caption_tips: data.strategy?.caption_tips ?? [],
  };

  return (
    <article className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden mb-8">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shadow-sm ${platformInfo.bg} text-white`}
          >
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              Post Preview
            </h3>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Generated Content
            </p>
          </div>
        </div>

        {/* Engagement Score */}
        {data.engagement_score && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <Sparkles size={12} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-700">
              {data.engagement_score.score_value}/100
            </span>
            <span className="w-px h-3 bg-slate-200 mx-1"></span>
            <span className="text-[10px] font-medium text-slate-400">
              Predicted Score
            </span>
          </div>
        )}
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT — VISUAL */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={12} /> Visual Asset
              </span>
            </div>

            <div className="relative group/visual">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl blur opacity-50 group-hover/visual:opacity-75 transition duration-500"></div>

              <div className="relative">
                {/* ⭐ FIX — Prevent distortion */}
                {data.generated_image ? (
                  <div
                    style={{
                      aspectRatio: safeAspectRatio,
                    }}
                    className="w-full rounded-2xl overflow-hidden bg-slate-100"
                  >
                    <img
                      src={data.generated_image}
                      alt="Generated visual"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <PostVisualCard
                    title={data.headline}
                    subTitle={data.content}
                    visualPrompt={data.visual_description}
                  />
                )}
              </div>
            </div>

            {/* PROMPT META */}
            <div className="mt-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Midjourney / DALL-E Prompt
              </p>

              <p className="text-[11px] leading-relaxed text-slate-600 font-mono break-words opacity-80">
                {data.visual_description}
              </p>
            </div>
          </div>

          {/* RIGHT — COPY & STRATEGY */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Headline */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {data.headline}
              </h1>

              {data.content && (
                <p className="text-sm text-slate-600 leading-relaxed mb-6 border-l-2 border-slate-200 pl-4">
                  {data.content}
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Caption Copy
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-right">
                  {data.caption.length} chars
                </span>
              </div>

              <TextContentBox text={data.caption} />
            </div>

            {/* Strategy & Posting Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50">
                <div className="flex items-center gap-2 mb-2 text-indigo-900/70">
                  <Clock size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Posting Window
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {strategy.best_posting_day}
                </p>
                <p className="text-xs text-slate-500">
                  {strategy.best_posting_time}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <Target size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    The Hook
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {strategy.why_this_works}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <TrendingUp size={14} className="text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Performance Strategy
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Engagement",
                    tips: strategy.engagement_tips,
                    icon: MessageCircle,
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                  },
                  {
                    title: "Visuals",
                    tips: strategy.visual_tips,
                    icon: Eye,
                    color: "text-purple-500",
                    bg: "bg-purple-50",
                  },
                  {
                    title: "Caption",
                    tips: strategy.caption_tips,
                    icon: Hash,
                    color: "text-pink-500",
                    bg: "bg-pink-50",
                  },
                ].map((section) => (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`p-1 rounded ${section.bg} ${section.color}`}
                      >
                        <section.icon size={10} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">
                        {section.title} Tips
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      {/* ⭐ FIX — Prevent slice crash */}
                      {(section.tips ?? []).slice(0, 2).map((tip, i) => (
                        <li
                          key={i}
                          className="text-[10px] leading-4 text-slate-500 pl-2 border-l border-slate-200"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Tags */}
            {(data.hashtags || data.seo_keywords) && (
              <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                {data.hashtags?.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
                  >
                    #{tag}
                  </span>
                ))}

                {data.seo_keywords?.slice(0, 3).map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] font-medium text-indigo-500 bg-indigo-50/50 px-2 py-1 rounded-md border border-indigo-100/50"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

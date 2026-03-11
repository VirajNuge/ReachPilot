"use client";

import React from "react";
import { motion } from "framer-motion";
import { PostPackage, RemixStyle, HookOption } from "@/lib/types/postGeneration";
import { CaptionCard } from "./CaptionCard";
import { ContentScoreCard } from "./ContentScoreCard";
import { HookSelector } from "./HookSelector";
import { HashtagPanel } from "./HashtagPanel";
import { ImagePreview } from "./ImagePreview";
import { Sparkles, BarChart3 } from "lucide-react";

interface OutputDashboardProps {
  postPackage: PostPackage;
  onRemix: (caption: string, platform: string, style: RemixStyle) => void;
  onSelectHook: (hook: HookOption) => void;
  onScoreRequest: (platform: string) => void;
  isRemixing?: boolean;
  isScoring?: boolean;
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({
  postPackage,
  onRemix,
  onSelectHook,
  onScoreRequest,
  isRemixing = false,
  isScoring = false,
}) => {
  const platforms = Object.keys(postPackage.captions);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#0052FF]" />
            Generated Content
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">
            Review, remix, and export your posts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Captions */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Platform Variations
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
              {platforms.length} Platforms
            </span>
          </div>
          
          <div className="flex flex-col gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CaptionCard
                  platform={platform}
                  caption={postPackage.captions[platform]}
                  onCopy={() => navigator.clipboard.writeText(postPackage.captions[platform])}
                  onRemix={(style) => onRemix(postPackage.captions[platform], platform, style)}
                  isRemixing={isRemixing}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Dashboard Stats & Assets */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Content Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {postPackage.contentScore ? (
              <ContentScoreCard score={postPackage.contentScore} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[#0052FF]" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Content Score</h3>
                    <p className="text-xs text-slate-400">Analyze your content quality with AI</p>
                  </div>
                </div>
                <button
                  onClick={() => platforms[0] && onScoreRequest(platforms[0])}
                  disabled={isScoring}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Score Content
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {postPackage.hooks && postPackage.hooks.length > 0 && (
              <HookSelector
                hooks={postPackage.hooks}
                onSelect={onSelectHook}
              />
            )}

            {postPackage.hashtags && (
              <HashtagPanel hashtags={postPackage.hashtags} />
            )}

            <ImagePreview
              imagePrompt={postPackage.imagePrompt}
              headline={postPackage.headline}
              subtext={postPackage.subtext}
              cta={postPackage.cta}
              imageUrl={postPackage.imageUrl}
              imageVariations={postPackage.imageVariations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

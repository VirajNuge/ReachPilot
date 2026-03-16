"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import type {
  PostPlatform,
  PostPackage,
  ContentScore,
  HookOption,
  RemixStyle,
  PostGenerationInput,
  ContentStrategyOutput,
} from "@/lib/types/postGeneration";
import { CaptionCard } from "./CaptionCard";
import { ContentScoreCard } from "./ContentScoreCard";
import { HookSelector } from "./HookSelector";
import { HashtagPanel } from "./HashtagPanel";
import { LinkedInOutput } from "./LinkedInOutput";
import { XOutput } from "./XOutput";
import { InstagramOutput } from "./InstagramOutput";
import { FacebookOutput } from "./FacebookOutput";
import type { InstagramPostType } from "@/lib/types/postGeneration";

interface PlatformTabProps {
  platform: PostPlatform;
  caption: string;
  hashtags: { highReach: string[]; niche: string[]; branded: string[] };
  contentScore?: ContentScore;
  hooks?: HookOption[];
  linkedInRefined?: PostPackage["linkedInRefined"];
  xRefined?: PostPackage["xRefined"];
  instagramRefined?: PostPackage["instagramRefined"];
  facebookRefined?: PostPackage["facebookRefined"];
  input: PostGenerationInput;
  strategy?: ContentStrategyOutput;
  accountId?: string;
  onRemix: (style: RemixStyle) => void;
  onScoreRequest: () => void;
  onSelectHook: (hook: HookOption) => void;
  selectedHookId?: string;
  onRefinedCaption?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onXRefined?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onInstagramRefined?: (newCaption: string, newScore: number, newFlags: string[], newPostType?: InstagramPostType) => void;
  onFacebookRefined?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onCaptionChange?: (newCaption: string) => void;
  isRemixing?: boolean;
  isScoring?: boolean;
}

export const PlatformTab: React.FC<PlatformTabProps> = ({
  platform,
  caption,
  hashtags,
  contentScore,
  hooks,
  linkedInRefined,
  xRefined,
  instagramRefined,
  facebookRefined,
  input,
  strategy,
  accountId,
  onRemix,
  onScoreRequest,
  onSelectHook,
  selectedHookId,
  onRefinedCaption,
  onXRefined,
  onInstagramRefined,
  onFacebookRefined,
  onCaptionChange,
  isRemixing = false,
  isScoring = false,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Caption Card */}
      <CaptionCard
        platform={platform}
        caption={caption}
        onCopy={() => navigator.clipboard.writeText(caption)}
        onRemix={onRemix}
        isRemixing={isRemixing}
      />

      {/* Hashtag Strategy */}
      <HashtagPanel hashtags={hashtags} />

      {/* Content Score */}
      {contentScore ? (
        <ContentScoreCard score={contentScore} />
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
            onClick={onScoreRequest}
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

      {/* Hook Selector */}
      {hooks && hooks.length > 0 && (
        <HookSelector hooks={hooks} onSelect={onSelectHook} selectedHookId={selectedHookId} />
      )}

      {/* LinkedIn Performance (LinkedIn tab only) */}
      {platform === "linkedin" && linkedInRefined && strategy && (
        <LinkedInOutput
          viralityScore={linkedInRefined.viralityScore}
          qualityFlags={linkedInRefined.qualityFlags}
          styleProfile={linkedInRefined.styleProfile}
          postType={linkedInRefined.postType}
          caption={caption}
          input={input}
          strategy={strategy}
          accountId={accountId}
          onRefinedCaption={(newCaption, newScore, newFlags) => {
            onRefinedCaption?.(newCaption, newScore, newFlags);
            onCaptionChange?.(newCaption);
          }}
        />
      )}

      {/* X Engagement Score (X tab only) */}
      {platform === "x" && xRefined && strategy && (
        <XOutput
          xRefined={xRefined}
          caption={caption}
          input={input}
          strategy={strategy}
          accountId={accountId}
          onRefined={(newCaption, newScore, newFlags) => {
            onXRefined?.(newCaption, newScore, newFlags);
            onCaptionChange?.(newCaption);
          }}
        />
      )}

      {/* Instagram Engagement Score (Instagram tab only) */}
      {platform === "instagram_post" && instagramRefined && strategy && (
        <InstagramOutput
          instagramRefined={instagramRefined}
          caption={caption}
          input={input}
          strategy={strategy}
          accountId={accountId}
          onRefined={(newCaption, newScore, newFlags, newPostType) => {
            onInstagramRefined?.(newCaption, newScore, newFlags, newPostType);
            onCaptionChange?.(newCaption);
          }}
        />
      )}

      {/* Facebook Engagement Score (Facebook tab only) */}
      {platform === "facebook" && facebookRefined && strategy && (
        <FacebookOutput
          facebookRefined={facebookRefined}
          caption={caption}
          input={input}
          strategy={strategy}
          accountId={accountId}
          onRefined={(newCaption, newScore, newFlags) => {
            onFacebookRefined?.(newCaption, newScore, newFlags);
            onCaptionChange?.(newCaption);
          }}
        />
      )}
    </div>
  );
};

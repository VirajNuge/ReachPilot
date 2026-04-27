"use client";

import React from "react";
import type {
  PostPlatform,
  PostPackage,
  ContentScore,
  RemixStyle,
  PostGenerationInput,
  ContentStrategyOutput,
} from "@/lib/types/postGeneration";
import { CaptionCard } from "./CaptionCard";
import { LinkedInOutput } from "./LinkedInOutput";
import { XOutput } from "./XOutput";
import { InstagramOutput } from "./InstagramOutput";
import { FacebookOutput } from "./FacebookOutput";
import type { InstagramPostType } from "@/lib/types/postGeneration";

interface PlatformTabProps {
  platform: PostPlatform;
  caption: string;
  captionOptions?: string[];
  selectedCaptionIndex?: number;
  onSelectCaptionIndex?: (index: number) => void;
  hashtags: { highReach: string[]; niche: string[]; branded: string[] };
  contentScore?: ContentScore;
  linkedInRefined?: PostPackage["linkedInRefined"];
  xRefined?: PostPackage["xRefined"];
  instagramRefined?: PostPackage["instagramRefined"];
  facebookRefined?: PostPackage["facebookRefined"];
  input: PostGenerationInput;
  strategy?: ContentStrategyOutput;
  accountId?: string;
  onRemix: (style: RemixStyle) => void;
  onRefinedCaption?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onXRefined?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onInstagramRefined?: (newCaption: string, newScore: number, newFlags: string[], newPostType?: InstagramPostType) => void;
  onFacebookRefined?: (newCaption: string, newScore: number, newFlags: string[]) => void;
  onCaptionChange?: (newCaption: string) => void;
  isRemixing?: boolean;
}

export const PlatformTab: React.FC<PlatformTabProps> = ({
  platform,
  caption,
  captionOptions,
  selectedCaptionIndex = 0,
  onSelectCaptionIndex,
  hashtags,
  contentScore,
  linkedInRefined,
  xRefined,
  instagramRefined,
  facebookRefined,
  input,
  strategy,
  accountId,
  onRemix: _onRemix,
  onRefinedCaption,
  onXRefined,
  onInstagramRefined,
  onFacebookRefined,
  onCaptionChange,
  isRemixing: _isRemixing = false,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Caption Card */}
      <CaptionCard
        platform={platform}
        caption={caption}
        options={captionOptions}
        selectedOptionIndex={selectedCaptionIndex}
        onSelectOption={onSelectCaptionIndex}
        onCopy={() => navigator.clipboard.writeText(caption)}
      />

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

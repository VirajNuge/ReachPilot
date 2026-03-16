"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type {
  PostPackage,
  RemixStyle,
  HookOption,
  PostPlatform,
  PostGenerationInput,
  ContentStrategyOutput,
  InstagramPostType,
} from "@/lib/types/postGeneration";
import { PLATFORM_DISPLAY } from "@/lib/types/postGeneration";
import { ImagePreview } from "./ImagePreview";
import { PlatformTab } from "./PlatformTab";

interface OutputDashboardProps {
  postPackage: PostPackage;
  input?: PostGenerationInput;
  strategy?: ContentStrategyOutput;
  accountId?: string;
  onRemix: (caption: string, platform: string, style: RemixStyle) => void;
  onSelectHook?: (hook: HookOption) => void;
  onScoreRequest: (platform: string) => void;
  onRefinedCaption?: (platform: string, newCaption: string, newScore: number, newFlags: string[]) => void;
  isRemixing?: boolean;
  isScoring?: boolean;
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({
  postPackage,
  input,
  strategy,
  accountId,
  onRemix,
  onSelectHook,
  onScoreRequest,
  onRefinedCaption,
  isRemixing = false,
  isScoring = false,
}) => {
  const platforms = Object.keys(postPackage.captions) as PostPlatform[];
  const [activeTab, setActiveTab] = useState<string>(platforms[0] ?? "linkedin");
  const [selectedHookId, setSelectedHookId] = useState<string | undefined>(undefined);

  // Local state for captions + linkedInRefined + xRefined + instagramRefined so re-refine updates reflect immediately
  const [localCaptions, setLocalCaptions] = useState<Record<string, string>>(postPackage.captions);
  const [localLinkedInRefined, setLocalLinkedInRefined] = useState(postPackage.linkedInRefined);
  const [localXRefined, setLocalXRefined] = useState(postPackage.xRefined);
  const [localInstagramRefined, setLocalInstagramRefined] = useState(postPackage.instagramRefined);
  const [localFacebookRefined, setLocalFacebookRefined] = useState(postPackage.facebookRefined);

  // Sync if postPackage changes (e.g. remix updates)
  React.useEffect(() => {
    setLocalCaptions(postPackage.captions);
  }, [postPackage.captions]);

  React.useEffect(() => {
    setLocalLinkedInRefined(postPackage.linkedInRefined);
  }, [postPackage.linkedInRefined]);

  React.useEffect(() => {
    setLocalXRefined(postPackage.xRefined);
  }, [postPackage.xRefined]);

  React.useEffect(() => {
    setLocalInstagramRefined(postPackage.instagramRefined);
  }, [postPackage.instagramRefined]);

  React.useEffect(() => {
    setLocalFacebookRefined(postPackage.facebookRefined);
  }, [postPackage.facebookRefined]);

  const activeCaption = localCaptions[activeTab] ?? "";

  const handleRefinedCaption = (newCaption: string, newScore: number, newFlags: string[]) => {
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: newCaption }));
    setLocalLinkedInRefined((prev) => ({
      viralityScore: newScore,
      qualityFlags: newFlags,
      styleProfile: prev?.styleProfile,
      postType: prev?.postType,
    }));
    onRefinedCaption?.(activeTab, newCaption, newScore, newFlags);
  };

  const handleXRefined = (newCaption: string, newScore: number, newFlags: string[]) => {
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: newCaption }));
    setLocalXRefined({ engagementScore: newScore, qualityFlags: newFlags });
    onRefinedCaption?.(activeTab, newCaption, newScore, newFlags);
  };

  const handleInstagramRefined = (
    newCaption: string,
    newScore: number,
    newFlags: string[],
    newPostType?: InstagramPostType
  ) => {
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: newCaption }));
    setLocalInstagramRefined((prev) => ({
      engagementScore: newScore,
      qualityFlags: newFlags,
      postType: newPostType ?? prev?.postType,
    }));
    onRefinedCaption?.(activeTab, newCaption, newScore, newFlags);
  };

  const handleFacebookRefined = (newCaption: string, newScore: number, newFlags: string[]) => {
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: newCaption }));
    setLocalFacebookRefined({ engagementScore: newScore, qualityFlags: newFlags });
    onRefinedCaption?.(activeTab, newCaption, newScore, newFlags);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">

      {/* Image Preview — full width at top */}
      <ImagePreview
        imagePrompt={postPackage.imagePrompt}
        headline={postPackage.headline}
        subtext={postPackage.subtext}
        cta={postPackage.cta}
        imageUrl={postPackage.imageUrl}
        imageVariations={postPackage.imageVariations}
      />

      {/* Platform Tab Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex gap-0 border-b border-gray-100">
          {platforms.map((platform) => {
            const { label, color } = PLATFORM_DISPLAY[platform] ?? { label: platform, color: "#0052FF", shortLabel: platform };
            const isActive = activeTab === platform;
  const handleSelectHook = (hook: HookOption) => {
    setSelectedHookId(hook.id);
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: hook.text }));
    onSelectHook?.(hook);
  };

  return (
              <button
                key={platform}
                onClick={() => setActiveTab(platform)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[12px] font-bold transition-all duration-200 relative ${
                  isActive
                    ? "text-gray-900 bg-white"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50/60"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? color : "#CBD5E1",
                  }}
                />
                {label}
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: color }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {platforms.map((platform) =>
            platform === activeTab ? (
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <PlatformTab
                  platform={platform}
                  caption={activeCaption}
                  hashtags={postPackage.hashtags}
                  contentScore={postPackage.contentScore}
                  hooks={postPackage.hooks}
                  linkedInRefined={platform === "linkedin" ? localLinkedInRefined : undefined}
                  xRefined={platform === "x" ? localXRefined : undefined}
                  input={input ?? ({} as PostGenerationInput)}
                  strategy={strategy}
                  accountId={accountId}
                  onRemix={(style) => onRemix(activeCaption, platform, style)}
                  onScoreRequest={() => onScoreRequest(platform)}
                  onSelectHook={handleSelectHook}
                  selectedHookId={selectedHookId}
                   onRefinedCaption={handleRefinedCaption}
                  onXRefined={handleXRefined}
                  instagramRefined={platform === "instagram_post" ? localInstagramRefined : undefined}
                  onInstagramRefined={handleInstagramRefined}
                  facebookRefined={platform === "facebook" ? localFacebookRefined : undefined}
                  onFacebookRefined={handleFacebookRefined}
                  onCaptionChange={(newCaption) =>
                    setLocalCaptions((prev) => ({ ...prev, [platform]: newCaption }))
                  }
                  isRemixing={isRemixing}
                  isScoring={isScoring}
                />
              </motion.div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

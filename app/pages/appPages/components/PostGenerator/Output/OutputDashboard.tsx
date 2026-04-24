"use client";

import React, { useMemo, useState } from "react";
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
import { ImagePreview } from "./ImagePreview";
import { PlatformTab } from "./PlatformTab";
import { HashtagPanel } from "./HashtagPanel";
import { ContentScoreCard } from "./ContentScoreCard";
import { HookSelector } from "./HookSelector";
import { RemixPanel } from "./RemixPanel";
import { PlatformNav } from "./PlatformNav";

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
  const platforms = useMemo(() => Object.keys(postPackage.captions) as PostPlatform[], [postPackage.captions]);
  const [activeTab, setActiveTab] = useState<PostPlatform>(platforms[0] ?? "linkedin");
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
    if (!platforms.includes(activeTab)) {
      setActiveTab(platforms[0] ?? "linkedin");
    }
  }, [activeTab, platforms]);

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

  const handleSelectHook = (hook: HookOption) => {
    setSelectedHookId(hook.id);
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: hook.text }));
    onSelectHook?.(hook);
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
    <div className="w-full max-w-6xl mx-auto">
      {/* Bento layout */}
      <div className="grid gap-5 md:grid-cols-12 lg:grid-cols-12">
        {/* Platform nav (desktop) */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-6">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-2 pt-1 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]">Platforms</p>
              </div>
              <PlatformNav
                platforms={platforms}
                activePlatform={activeTab}
                onChange={setActiveTab}
                variant="vertical"
              />
            </div>
          </div>
        </div>

        {/* Center Content Column: Poster + Editor */}
        <div className="md:col-span-6 lg:col-span-6 flex flex-col gap-5">
          <ImagePreview
            imagePrompt={postPackage.imagePrompt}
            headline={postPackage.headline}
            subtext={postPackage.subtext}
            cta={postPackage.cta}
            imageUrl={postPackage.imageUrl}
            imageVariations={postPackage.imageVariations}
          />

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-[#F8FAFD]">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Platform Output</h3>
                <p className="text-[11px] text-gray-500">Switch tabs to review and iterate</p>
              </div>
            </div>
            {/* Platform nav (mobile/tablet) */}
            <div className="lg:hidden px-4 py-3 border-b border-gray-100">
              <PlatformNav
                platforms={platforms}
                activePlatform={activeTab}
                onChange={setActiveTab}
                variant="horizontal"
              />
            </div>

            {/* Quick Remix actions (global) */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Quick Remix</p>
                  <p className="text-[11px] text-gray-500 mt-1">Applies to the active platform caption</p>
                </div>
              </div>
              <div className="mt-3">
                <RemixPanel
                  onRemix={(style) => onRemix(activeCaption, activeTab, style)}
                  isRemixing={isRemixing}
                />
              </div>
            </div>

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
                      linkedInRefined={platform === "linkedin" ? localLinkedInRefined : undefined}
                      xRefined={platform === "x" ? localXRefined : undefined}
                      input={input ?? ({} as PostGenerationInput)}
                      strategy={strategy}
                      accountId={accountId}
                      onRemix={(style) => onRemix(activeCaption, platform, style)}
                      onScoreRequest={() => onScoreRequest(platform)}
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

        {/* Right Sidebar Column: Metrics, Hooks, Hashtags */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col gap-5">
          {postPackage.contentScore ? (
            <ContentScoreCard score={postPackage.contentScore} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Content Score</h3>
                  <p className="text-[11px] text-gray-500">Run AI scoring for the active platform</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#EEF3FF] text-[10px] font-bold text-[#0052FF]">
                  {platforms.length} platforms
                </div>
              </div>
              <button
                onClick={() => onScoreRequest(activeTab)}
                disabled={isScoring}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0052FF] text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>Score active platform</>
                )}
              </button>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                This score reflects hook strength, clarity, and virality. It updates the dashboard once complete.
              </p>
            </motion.div>
          )}

          <HashtagPanel hashtags={postPackage.hashtags} />

          {postPackage.hooks && postPackage.hooks.length > 0 ? (
            <HookSelector
              hooks={postPackage.hooks}
              onSelect={handleSelectHook}
              selectedHookId={selectedHookId}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3"
            >
              <h3 className="text-sm font-bold text-gray-900">Alternative Hooks</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Generate hooks in step 2 to unlock quick hook switching.
              </p>
            </motion.div>
          )}
        </div>

        {/* Replaced by Center Column */}
      </div>
    </div>
  );
};

"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import type { PlatformPublishResult } from "../../Publishing/PublishToast";
import { PublishToast } from "../../Publishing/PublishToast";
import type {
  ContentStrategyOutput,
  HookOption,
  InstagramPostType,
  PostGenerationInput,
  PostPackage,
  PostPlatform,
  RemixStyle,
} from "@/lib/types/postGeneration";
import { ContentScoreCard } from "./ContentScoreCard";
import { HashtagPanel } from "./HashtagPanel";
import { HookSelector } from "./HookSelector";
import { ImagePreview } from "./ImagePreview";
import { PlatformNav } from "./PlatformNav";
import { PlatformTab } from "./PlatformTab";
import { RemixPanel } from "./RemixPanel";

interface OutputDashboardProps {
  postPackage: PostPackage;
  input?: PostGenerationInput;
  strategy?: ContentStrategyOutput;
  accountId?: string;
  onRemix: (caption: string, platform: string, style: RemixStyle) => void;
  onSelectHook?: (hook: HookOption) => void;
  onRefinedCaption?: (platform: string, newCaption: string, newScore: number, newFlags: string[]) => void;
  onSaveToQueue?: (updatedPackage: PostPackage) => void;
  isSavingToQueue?: boolean;
  onSchedulePost?: (scheduledIso: string, updatedPackage: PostPackage) => Promise<void>;
  isScheduling?: boolean;
  onPublishNow?: (updatedPackage: PostPackage) => Promise<PlatformPublishResult[]>;
  isPublishingNow?: boolean;
  suggestedScheduleIso?: string | null;
  isRemixing?: boolean;
  onSelectImageVariation?: (variationId: number) => void;
}

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({
  postPackage,
  input,
  strategy,
  accountId,
  onRemix,
  onSelectHook,
  onRefinedCaption,
  onSaveToQueue,
  isSavingToQueue = false,
  onSchedulePost,
  isScheduling = false,
  onPublishNow,
  isPublishingNow = false,
  suggestedScheduleIso,
  isRemixing = false,
  onSelectImageVariation,
}) => {
  const platforms = useMemo(() => Object.keys(postPackage.captions) as PostPlatform[], [postPackage.captions]);
  const [activeTab, setActiveTab] = useState<PostPlatform>(platforms[0] ?? "linkedin");
  const [selectedCaptionIndices, setSelectedCaptionIndices] = useState<Record<string, number>>({});
  const [selectedHookId, setSelectedHookId] = useState<string | undefined>(undefined);
  const [utilityOpen, setUtilityOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(
    suggestedScheduleIso ? toLocalInputValue(suggestedScheduleIso) : ""
  );
  const [publishResults, setPublishResults] = useState<PlatformPublishResult[] | null>(null);

  const [localCaptions, setLocalCaptions] = useState<Record<string, string>>(postPackage.captions);
  const [localLinkedInRefined, setLocalLinkedInRefined] = useState(postPackage.linkedInRefined);
  const [localXRefined, setLocalXRefined] = useState(postPackage.xRefined);
  const [localInstagramRefined, setLocalInstagramRefined] = useState(postPackage.instagramRefined);
  const [localFacebookRefined, setLocalFacebookRefined] = useState(postPackage.facebookRefined);

  React.useEffect(() => {
    setLocalCaptions(postPackage.captions);
    setLocalLinkedInRefined(postPackage.linkedInRefined);
    setLocalXRefined(postPackage.xRefined);
    setLocalInstagramRefined(postPackage.instagramRefined);
    setLocalFacebookRefined(postPackage.facebookRefined);
    setSelectedCaptionIndices(
      Object.fromEntries(
        Object.entries(postPackage.captionOptions ?? {}).map(([platform, options]) => {
          const selectedIndex = Math.max(0, options?.findIndex((option) => option === postPackage.captions[platform]) ?? 0);
          return [platform, selectedIndex];
        })
      )
    );
  }, [postPackage]);

  React.useEffect(() => {
    if (!platforms.includes(activeTab)) {
      setActiveTab(platforms[0] ?? "linkedin");
    }
  }, [activeTab, platforms]);

  React.useEffect(() => {
    if (suggestedScheduleIso) {
      setScheduleValue(toLocalInputValue(suggestedScheduleIso));
    }
  }, [suggestedScheduleIso]);

  const activeCaption = localCaptions[activeTab] ?? "";

  const getCurrentPackage = (): PostPackage => {
    return {
      ...postPackage,
      captions: localCaptions,
      linkedInRefined: localLinkedInRefined,
      xRefined: localXRefined,
      instagramRefined: localInstagramRefined,
      facebookRefined: localFacebookRefined,
    };
  };

  const handleSelectHook = (hook: HookOption) => {
    setSelectedHookId(hook.id);
    setLocalCaptions((prev) => ({ ...prev, [activeTab]: hook.text }));
    onSelectHook?.(hook);
  };

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

  const handleSelectCaptionIndex = (platform: PostPlatform, index: number) => {
    const options = postPackage.captionOptions?.[platform] ?? [];
    const nextCaption = options[index];
    if (!nextCaption) return;

    setSelectedCaptionIndices((prev) => ({ ...prev, [platform]: index }));
    setLocalCaptions((prev) => ({ ...prev, [platform]: nextCaption }));
  };

  const hasImage = !!postPackage.imageUrl || (postPackage.imageVariations?.length ?? 0) > 0;

  return (
    <>
      <div className="w-full max-w-[1320px] mx-auto">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(0,82,255,0.90))] px-5 py-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Generated post</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Review, remix, publish</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                    Move through each platform version, keep the best hook, and push the finished draft into your calendar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PlatformNav
                    platforms={platforms}
                    activePlatform={activeTab}
                    onChange={setActiveTab}
                    variant="horizontal"
                  />
                  <button
                    type="button"
                    onClick={() => setUtilityOpen((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    {utilityOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                    Utilities
                  </button>
                </div>
              </div>
            </div>

            {hasImage && input?.generateImage !== false && (
              <ImagePreview
                imagePrompt={postPackage.imagePrompt}
                headline={postPackage.headline}
                subtext={postPackage.subtext}
                cta={postPackage.cta}
                imageUrl={postPackage.imageUrl}
                imageVariations={postPackage.imageVariations}
                selectedImageVariationId={postPackage.selectedImageVariationId}
                onSelectVariation={onSelectImageVariation}
              />
            )}

            <div className="overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(252,252,253,0.88))] shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Caption</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#111827]">Platform-ready copy</h3>
                </div>
                <RemixPanel onRemix={(style) => onRemix(activeCaption, activeTab, style)} isRemixing={isRemixing} />
              </div>

              <div className="px-2 py-2 sm:px-3 sm:py-3">
                {platforms.map((platform) =>
                  platform === activeTab ? (
                    <PlatformTab
                      key={platform}
                      platform={platform}
                      caption={activeCaption}
                      captionOptions={postPackage.captionOptions?.[platform]}
                      selectedCaptionIndex={selectedCaptionIndices[platform] ?? 0}
                      onSelectCaptionIndex={(index) => handleSelectCaptionIndex(platform, index)}
                      hashtags={postPackage.hashtags}
                      contentScore={postPackage.contentScore}
                      linkedInRefined={platform === "linkedin" ? localLinkedInRefined : undefined}
                      xRefined={platform === "x" ? localXRefined : undefined}
                      instagramRefined={platform === "instagram_post" ? localInstagramRefined : undefined}
                      facebookRefined={platform === "facebook" ? localFacebookRefined : undefined}
                      input={input ?? ({} as PostGenerationInput)}
                      strategy={strategy}
                      accountId={accountId}
                      onRemix={(style) => onRemix(activeCaption, platform, style)}
                      onRefinedCaption={handleRefinedCaption}
                      onXRefined={handleXRefined}
                      onInstagramRefined={handleInstagramRefined}
                      onFacebookRefined={handleFacebookRefined}
                      onCaptionChange={(newCaption) =>
                        setLocalCaptions((prev) => ({ ...prev, [platform]: newCaption }))
                      }
                      isRemixing={isRemixing}
                    />
                  ) : null
                )}
              </div>
            </div>
          </section>

          {utilityOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 border-l border-white/70 pl-0 xl:pl-8"
            >
              <section className="relative overflow-hidden rounded-[30px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex flex-col gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Distribution</p>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">Publishing Actions</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {onPublishNow && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        disabled={isPublishingNow}
                        onClick={async () => {
                          const results = await onPublishNow(getCurrentPackage());
                          setPublishResults(results);
                        }}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(110deg,#1e293b,45%,#0f172a,55%,#1e293b)] bg-[length:200%_100%] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.15)] transition-all hover:shadow-[0_10px_30px_rgba(15,23,42,0.25)] hover:bg-[position:-100%_0] disabled:opacity-50"
                      >
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span>{isPublishingNow ? "Publishing..." : "Publish Now"}</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setScheduleOpen(true)}
                      disabled={!onSchedulePost}
                      className="group flex w-full flex-col items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-700 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                        <span>Schedule Post</span>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => onSaveToQueue?.(getCurrentPackage())}
                      disabled={isSavingToQueue}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-gray-50/80 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
                      <span>{isSavingToQueue ? "Saving..." : "Save to Queue"}</span>
                    </motion.button>
                  </div>

                  {suggestedScheduleIso && (
                    <div className="mt-1 flex items-center justify-center rounded-2xl bg-indigo-50/50 py-2.5 px-3 border border-indigo-100/50">
                      <p className="text-[11px] text-indigo-800 font-medium">
                        <span className="opacity-70 mr-1">Smart slot:</span>
                        <span className="font-bold">{new Date(suggestedScheduleIso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {postPackage.contentScore ? (
                <ContentScoreCard score={postPackage.contentScore} />
              ) : (
                <section className="relative overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Analytics</p>
                  <h3 className="mt-1 text-[15px] font-semibold text-gray-900 leading-tight">
                    Analytics unavailable
                  </h3>
                  <p className="mt-2 text-xs text-[#64748B]">
                    Auto analytics could not be generated for this run.
                  </p>
                </section>
              )}

              <HashtagPanel hashtags={postPackage.hashtags} />

              {postPackage.hooks && postPackage.hooks.length > 0 && (
                <HookSelector
                  hooks={postPackage.hooks}
                  onSelect={handleSelectHook}
                  selectedHookId={selectedHookId}
                />
              )}
            </motion.aside>
          )}
        </div>
      </div>

      {scheduleOpen && onSchedulePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/30 p-4"
          onClick={() => setScheduleOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Schedule</p>
                <h3 className="mt-1 text-lg font-semibold text-[#111827]">Pick a publish time</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="rounded-full border border-[#D8E4F8] p-2 text-[#6B7280]"
              >
                <ChevronRight className="h-4 w-4 rotate-45" />
              </button>
            </div>

            {suggestedScheduleIso && (
              <button
                type="button"
                onClick={() => setScheduleValue(toLocalInputValue(suggestedScheduleIso))}
                className="mt-5 w-full rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3 text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Suggested slot</p>
                <p className="mt-2 text-sm font-semibold text-[#111827]">
                  {new Date(suggestedScheduleIso).toLocaleString()}
                </p>
              </button>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                Publish at
              </label>
              <input
                type="datetime-local"
                value={scheduleValue}
                onChange={(event) => setScheduleValue(event.target.value)}
                className="w-full rounded-[18px] border border-[#D1D5DB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#111827]"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="flex-1 rounded-full border border-[#D8E4F8] px-4 py-2.5 text-sm font-semibold text-[#374151]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!scheduleValue || isScheduling}
                onClick={async () => {
                  const iso = new Date(scheduleValue).toISOString();
                  await onSchedulePost(iso, getCurrentPackage());
                  setScheduleOpen(false);
                }}
                className="flex-1 rounded-full bg-[linear-gradient(135deg,#2563EB,#60A5FA)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)] disabled:opacity-50"
              >
                {isScheduling ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

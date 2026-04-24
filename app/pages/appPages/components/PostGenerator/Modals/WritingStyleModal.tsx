"use client";

import React, { useState, useEffect } from "react";
import { PenLine, Layers, Search, X } from "lucide-react";

import type { PostGenerationInput } from "@/lib/types/postGeneration";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WritingPlatform = "linkedin" | "x" | "instagram_post" | "facebook";

export interface WritingStyleModalProps {
  open: boolean;
  onClose: () => void;
  formInput: PostGenerationInput;
  updateInput: (updates: Partial<PostGenerationInput>) => void;
}

export interface DbCaptionTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  platforms: string[];
  platformVariants: { platform: string; structure: string; examplePost?: string }[];
  isBundle: boolean;
  matchKeywords: string[];
  bestForObjectives: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORY_EMOJI: Record<string, string> = {
  how_to: "📖",
  listicle: "📋",
  thought_leadership: "💡",
  product_launch: "🚀",
  behind_the_scenes: "🎬",
  testimonial: "⭐",
  engagement_question: "💬",
  personal_story: "📝",
  announcement: "📢",
  myth_busting: "⚡",
  motivational: "🔥",
  promotional: "📣",
};

export const PLATFORM_SHORT: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram_post: "Instagram",
  facebook: "Facebook",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function WritingStyleModal({
  open,
  onClose,
  formInput,
  updateInput,
}: WritingStyleModalProps) {
  const [activePlatform, setActivePlatform] = useState<WritingPlatform>("linkedin");
  const [templateTab, setTemplateTab] = useState<"all" | "bundles" | "singles">("all");
  const [search, setSearch] = useState("");
  const [dbTemplates, setDbTemplates] = useState<DbCaptionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingTemplates(true);
    fetch("/api/caption-templates", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { templates: [] }))
      .then((data) => setDbTemplates(data.templates ?? []))
      .catch(() => setDbTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [open]);

  if (!open) return null;

  const platformTabs: { key: WritingPlatform; label: string }[] = [
    { key: "linkedin", label: "LinkedIn" },
    { key: "x", label: "X (Twitter)" },
    { key: "instagram_post", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
  ];

  const searchLower = search.toLowerCase();

  // Main filtering logic
  const visibleTemplates = dbTemplates.filter((t) => {
    // Search filter
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower);

    // Tab filter
    const matchesTab =
      templateTab === "all" ||
      (templateTab === "bundles" && t.isBundle) ||
      (templateTab === "singles" && !t.isBundle);

    // Platform filter — only applied for "all" and "singles" tabs (bundles are cross-platform)
    const matchesPlatform =
      templateTab === "bundles" ||
      (t.isBundle && templateTab === "all") ||
      t.platforms.length === 0 ||
      t.platforms.includes(activePlatform);

    return matchesSearch && matchesTab && matchesPlatform;
  });

  const templateTabCounts = {
    all: dbTemplates.length,
    bundles: dbTemplates.filter((t) => t.isBundle).length,
    singles: dbTemplates.filter((t) => !t.isBundle).length,
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
              <PenLine className="w-4 h-4 text-[#0052FF]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1A1D23]">Choose Caption Template</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {formInput.selectedTemplateId
                  ? `Active: ${
                      dbTemplates.find((t) => t._id === formInput.selectedTemplateId)?.name ??
                      "Template selected"
                    }`
                  : "Select a template to guide your post structure — or let AI choose"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F4F6FA] hover:bg-[#EEF3FF] hover:text-[#0052FF] text-[#64748B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 pt-4 pb-3 border-b border-[#E2E8F0] bg-white flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-8 pr-8 py-2 text-[13px] bg-[#F8F9FC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 text-[#1A1D23] placeholder:text-[#94A3B8] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#94A3B8] flex items-center justify-center hover:bg-[#64748B] transition-colors"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* All | Bundles | Singles tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-[#E2E8F0] overflow-x-auto flex-shrink-0 bg-[#F4F6FA]">
          {(["all", "bundles", "singles"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTemplateTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-[12px] font-bold whitespace-nowrap transition-all border-b-2 -mb-px capitalize ${
                templateTab === tab
                  ? "border-[#0052FF] text-[#0052FF] bg-white"
                  : "border-transparent text-[#64748B] hover:text-[#1A1D23] hover:bg-white/60"
              }`}
            >
              {tab === "all" ? "All" : tab === "bundles" ? "Bundles" : "Singles"}
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  templateTab === tab
                    ? "bg-[#0052FF]/10 text-[#0052FF]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {templateTabCounts[tab]}
              </span>
            </button>
          ))}

          {/* Platform sub-tabs — only shown for "all" and "singles" */}
          {templateTab !== "bundles" && (
            <>
              <div className="w-px bg-[#E2E8F0] mx-1 my-1.5 self-stretch" />
              {platformTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActivePlatform(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-[12px] font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
                    activePlatform === tab.key
                      ? "border-[#0052FF] text-[#0052FF] bg-white"
                      : "border-transparent text-[#64748B] hover:text-[#1A1D23] hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Template Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F4F6FA]">
          {loadingTemplates ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : visibleTemplates.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-[13px] font-semibold text-gray-400">
                {search ? "No templates match your search" : "No templates available"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {search
                  ? "Try a different keyword."
                  : "Add templates in the admin panel to see them here."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
                {visibleTemplates.length} template{visibleTemplates.length !== 1 ? "s" : ""}
                {templateTab !== "bundles" && !search && ` for ${PLATFORM_SHORT[activePlatform]}`}
              </p>

              {visibleTemplates.map((template) => {
                const isSelected = formInput.selectedTemplateId === template._id;
                const emoji = CATEGORY_EMOJI[template.category] ?? "📄";
                // For singles or "all" non-bundle view: show the active platform variant
                const variant = !template.isBundle
                  ? template.platformVariants.find((v) => v.platform === activePlatform)
                  : undefined;

                return (
                  <button
                    key={template._id}
                    type="button"
                    onClick={() => {
                      updateInput({
                        selectedTemplateId: isSelected ? undefined : template._id,
                      });
                    }}
                    className={`relative w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-[#0052FF] bg-white shadow-sm"
                        : "bg-white border-[#E2E8F0] hover:border-gray-300 hover:shadow-md shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl leading-none mt-0.5 flex-shrink-0">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={`text-[13px] font-bold ${
                                isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"
                              }`}
                            >
                              {template.name}
                            </p>
                            {template.isBundle && (
                              <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold rounded-full">
                                Bundle
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">
                            {template.description}
                          </p>

                          {/* Platform coverage pills */}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {template.platforms.map((p) => (
                              <span
                                key={p}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                  p === activePlatform && !template.isBundle
                                    ? "bg-[#0052FF]/10 text-[#0052FF]"
                                    : template.isBundle
                                    ? "bg-[#0052FF]/10 text-[#0052FF]"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {PLATFORM_SHORT[p] ?? p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center shadow-sm shadow-blue-200">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Single template: show platform-specific structure preview */}
                    {!template.isBundle && variant?.structure && (
                      <div className="mt-3 p-3 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0]">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide mb-1">
                          {PLATFORM_SHORT[activePlatform]} structure
                        </p>
                        <p className="text-[11px] text-[#1A1D23] leading-relaxed line-clamp-4">
                          {variant.structure}
                        </p>
                      </div>
                    )}

                    {/* Bundle template: show all platform variants as a package */}
                    {template.isBundle && template.platformVariants.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {template.platformVariants.map((v) => (
                          <div
                            key={v.platform}
                            className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0]"
                          >
                            <p className="text-[10px] font-bold text-[#0052FF] mb-1">
                              {PLATFORM_SHORT[v.platform] ?? v.platform}
                            </p>
                            <p className="text-[10px] text-[#1A1D23] leading-relaxed line-clamp-3">
                              {v.structure}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white">
          <button
            onClick={() => updateInput({ selectedTemplateId: undefined })}
            className="text-[12px] font-semibold text-[#64748B] hover:text-red-500 transition-colors"
          >
            Let AI choose
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0052FF] text-white rounded-xl text-[13px] font-extrabold hover:bg-[#003ECC] shadow-md shadow-blue-200 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

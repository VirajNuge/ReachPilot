"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, PenLine, Search, X } from "lucide-react";

import type { PostGenerationInput, PostPlatform } from "@/lib/types/postGeneration";
import { POSTGEN_PLATFORM_WRITING_STYLE_MAP } from "@/lib/postGeneration/featureFlags";

export interface WritingStyleModalProps {
  open: boolean;
  onClose: () => void;
  formInput: PostGenerationInput;
  updateInput: (updates: Partial<PostGenerationInput>) => void;
}

interface WritingStyleOption {
  _id: string;
  name: string;
  description: string;
}

interface TemplateOption {
  _id: string;
  name: string;
  description: string;
  platforms: string[];
}

const PLATFORM_LABELS: Record<PostPlatform, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram_post: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
  threads: "Threads",
};

function withoutKey<T extends string>(record: Partial<Record<T, string>> | undefined, key: T) {
  const next = { ...(record ?? {}) };
  delete next[key];
  return next;
}

export default function WritingStyleModal({
  open,
  onClose,
  formInput,
  updateInput,
}: WritingStyleModalProps) {
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState<PostPlatform>(formInput.platforms[0] ?? "linkedin");
  const [styles, setStyles] = useState<WritingStyleOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPlatforms = useMemo<PostPlatform[]>(() => {
    const base = formInput.platforms.length > 0 ? formInput.platforms : ["linkedin"];
    if (!POSTGEN_PLATFORM_WRITING_STYLE_MAP) return [base[0]];
    return base;
  }, [formInput.platforms]);

  useEffect(() => {
    if (!open) return;
    if (!selectedPlatforms.includes(activePlatform)) {
      setActivePlatform(selectedPlatforms[0]);
    }
  }, [activePlatform, open, selectedPlatforms]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch("/api/writing-styles", { credentials: "include" }),
      fetch("/api/caption-templates", { credentials: "include" }),
    ])
      .then(async ([stylesRes, templatesRes]) => {
        const stylesJson = stylesRes.ok ? await stylesRes.json() : { styles: [] };
        const templatesJson = templatesRes.ok ? await templatesRes.json() : { templates: [] };
        setStyles(stylesJson.styles ?? []);
        setTemplates(templatesJson.templates ?? []);
      })
      .catch(() => {
        setStyles([]);
        setTemplates([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const lowerSearch = search.trim().toLowerCase();
  const filteredStyles = styles.filter((style) => {
    if (!lowerSearch) return true;
    return (
      style.name.toLowerCase().includes(lowerSearch) ||
      style.description.toLowerCase().includes(lowerSearch)
    );
  });
  const filteredTemplates = templates.filter((template) => {
    const platformMatch =
      template.platforms.length === 0 || template.platforms.includes(activePlatform);
    if (!platformMatch) return false;
    if (!lowerSearch) return true;
    return (
      template.name.toLowerCase().includes(lowerSearch) ||
      template.description.toLowerCase().includes(lowerSearch)
    );
  });

  const activeStyleId = POSTGEN_PLATFORM_WRITING_STYLE_MAP
    ? formInput.platformWritingStyleIds?.[activePlatform] ?? formInput.writingStyleId
    : formInput.writingStyleId;
  const activeTemplateId = POSTGEN_PLATFORM_WRITING_STYLE_MAP
    ? formInput.platformTemplateIds?.[activePlatform] ?? formInput.selectedTemplateId
    : formInput.selectedTemplateId;

  const assignStyle = (styleId?: string) => {
    if (!styleId) {
      if (!POSTGEN_PLATFORM_WRITING_STYLE_MAP) {
        updateInput({ writingStyleId: undefined });
      } else {
        updateInput({
          writingStyleId: undefined,
          platformWritingStyleIds: withoutKey(formInput.platformWritingStyleIds, activePlatform),
        });
      }
      return;
    }
    if (!POSTGEN_PLATFORM_WRITING_STYLE_MAP) {
      updateInput({ writingStyleId: styleId, platformWritingStyleIds: undefined });
    } else {
      updateInput({
        writingStyleId: styleId,
        platformWritingStyleIds: {
          ...(formInput.platformWritingStyleIds ?? {}),
          [activePlatform]: styleId,
        },
      });
    }
  };

  const assignTemplate = (templateId?: string) => {
    if (!templateId) {
      if (!POSTGEN_PLATFORM_WRITING_STYLE_MAP) {
        updateInput({ selectedTemplateId: undefined });
      } else {
        updateInput({
          selectedTemplateId: undefined,
          platformTemplateIds: withoutKey(formInput.platformTemplateIds, activePlatform),
        });
      }
      return;
    }
    if (!POSTGEN_PLATFORM_WRITING_STYLE_MAP) {
      updateInput({ selectedTemplateId: templateId, platformTemplateIds: undefined });
    } else {
      updateInput({
        selectedTemplateId: templateId,
        platformTemplateIds: {
          ...(formInput.platformTemplateIds ?? {}),
          [activePlatform]: templateId,
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3FF]">
              <PenLine className="h-4 w-4 text-[#0052FF]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1A1D23]">Platform Writing Setup</h2>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                Pick writing style and caption template per selected platform.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6FA] text-[#64748B] transition-colors hover:bg-[#EEF3FF] hover:text-[#0052FF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto border-b border-[#E2E8F0] bg-[#F8FAFD] px-4 pt-3">
          <div className="flex gap-2">
            {selectedPlatforms.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => setActivePlatform(platform)}
                className={`rounded-t-xl border-b-2 px-3 py-2 text-[12px] font-bold transition-all ${
                  activePlatform === platform
                    ? "border-[#0052FF] bg-white text-[#0052FF]"
                    : "border-transparent text-[#64748B] hover:bg-white/80 hover:text-[#1A1D23]"
                }`}
              >
                {PLATFORM_LABELS[platform]}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-[#E2E8F0] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search styles and templates..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FC] py-2 pl-8 pr-3 text-[13px] text-[#1A1D23] outline-none transition-all focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10"
            />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto bg-[#F4F6FA] p-5 md:grid-cols-2">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase tracking-wide text-[#1A1D23]">Writing Style</h3>
              <button
                type="button"
                onClick={() => assignStyle(undefined)}
                className="text-[11px] font-bold text-[#64748B] hover:text-red-500"
              >
                Clear
              </button>
            </div>

            {POSTGEN_PLATFORM_WRITING_STYLE_MAP && (
              <button
                type="button"
                disabled={!activeStyleId}
                onClick={() => {
                  if (!activeStyleId) return;
                  updateInput({
                    writingStyleId: activeStyleId,
                    platformWritingStyleIds: Object.fromEntries(
                      selectedPlatforms.map((platform) => [platform, activeStyleId]),
                    ) as Partial<Record<PostPlatform, string>>,
                  });
                }}
                className="mb-3 w-full rounded-xl border border-[#D5E2FF] bg-[#EEF3FF] px-3 py-2 text-[11px] font-bold text-[#0052FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply to all selected platforms
              </button>
            )}

            <div className="space-y-2">
              {loading ? (
                <p className="text-[12px] text-[#64748B]">Loading styles...</p>
              ) : filteredStyles.length === 0 ? (
                <p className="text-[12px] text-[#64748B]">No writing styles match your search.</p>
              ) : (
                filteredStyles.map((style) => {
                  const selected = activeStyleId === style._id;
                  return (
                    <button
                      key={style._id}
                      type="button"
                      onClick={() => assignStyle(selected ? undefined : style._id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? "border-[#0052FF] bg-[#EEF3FF]"
                          : "border-[#E2E8F0] bg-white hover:border-[#BFD2FF]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-bold text-[#1A1D23]">{style.name}</p>
                          <p className="mt-1 text-[11px] text-[#64748B] line-clamp-2">{style.description}</p>
                        </div>
                        {selected && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0052FF] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase tracking-wide text-[#1A1D23]">Caption Template</h3>
              <button
                type="button"
                onClick={() => assignTemplate(undefined)}
                className="text-[11px] font-bold text-[#64748B] hover:text-red-500"
              >
                Let AI choose
              </button>
            </div>

            {POSTGEN_PLATFORM_WRITING_STYLE_MAP && (
              <button
                type="button"
                disabled={!activeTemplateId}
                onClick={() => {
                  if (!activeTemplateId) return;
                  updateInput({
                    selectedTemplateId: activeTemplateId,
                    platformTemplateIds: Object.fromEntries(
                      selectedPlatforms.map((platform) => [platform, activeTemplateId]),
                    ) as Partial<Record<PostPlatform, string>>,
                  });
                }}
                className="mb-3 w-full rounded-xl border border-[#D5E2FF] bg-[#EEF3FF] px-3 py-2 text-[11px] font-bold text-[#0052FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply to all selected platforms
              </button>
            )}

            <div className="space-y-2">
              {loading ? (
                <p className="text-[12px] text-[#64748B]">Loading templates...</p>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-[12px] text-[#64748B]">No templates available for {PLATFORM_LABELS[activePlatform]}.</p>
              ) : (
                filteredTemplates.map((template) => {
                  const selected = activeTemplateId === template._id;
                  return (
                    <button
                      key={template._id}
                      type="button"
                      onClick={() => assignTemplate(selected ? undefined : template._id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? "border-[#0052FF] bg-[#EEF3FF]"
                          : "border-[#E2E8F0] bg-white hover:border-[#BFD2FF]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-bold text-[#1A1D23]">{template.name}</p>
                          <p className="mt-1 text-[11px] text-[#64748B] line-clamp-2">{template.description}</p>
                        </div>
                        {selected && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0052FF] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end border-t border-[#E2E8F0] bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#0052FF] px-6 py-2.5 text-[13px] font-extrabold text-white transition-all hover:bg-[#003ECC]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

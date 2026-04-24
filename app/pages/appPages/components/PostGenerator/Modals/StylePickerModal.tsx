"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Sun,
  Droplets,
  Grid3X3,
  Type,
  Palette,
  X,
} from "lucide-react";

import type {
  PostGenerationInput,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  CompositionPreference,
  TextStylePreference,
  ColorThemePreset,
} from "@/lib/types/postGeneration";
import {
  IMAGE_STYLE_LABELS,
  LIGHTING_DIRECTION_LABELS,
  SHADING_STYLE_LABELS,
  COMPOSITION_PREFERENCE_LABELS,
  TEXT_STYLE_PREFERENCE_LABELS,
  COLOR_THEME_PRESET_LABELS,
} from "@/lib/types/postGeneration";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StyleTab =
  | "templates"
  | "imageStyle"
  | "lighting"
  | "shading"
  | "composition"
  | "textStyle"
  | "colorTheme";

export interface StylePickerModalProps {
  open: boolean;
  onClose: () => void;
  formInput: PostGenerationInput;
  updateInput: (updates: Partial<PostGenerationInput>) => void;
}

export interface DbVisualStylePreset {
  _id: string;
  name: string;
  description: string;
  colorPalette: string[];
  primaryColor: string;
  imageStyle: string;
  lightingDirection: string;
  shadingStyle: string;
  compositionPreference: string;
  textStylePreference: string;
  colorThemePreset: string;
  mood: string;
  tags: string[];
  thumbnailBg: string;
}

export interface DbStyleOption {
  _id: string;
  tab: "imageStyle" | "lighting" | "shading" | "composition" | "textStyle" | "colorTheme";
  value: string;
  label: string;
  description: string;
  referenceImageUrl: string;
  sortOrder: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const STYLE_TAB_TO_FIELD: Record<
  Exclude<StyleTab, "templates">,
  keyof PostGenerationInput
> = {
  imageStyle: "imageStyle",
  lighting: "lightingDirection",
  shading: "shadingStyle",
  composition: "compositionPreference",
  textStyle: "textStylePreference",
  colorTheme: "colorThemePreset",
};

export const STYLE_TAB_FALLBACK_LABELS: Record<
  Exclude<StyleTab, "templates">,
  Record<string, { label: string; desc: string }>
> = {
  imageStyle: IMAGE_STYLE_LABELS,
  lighting: LIGHTING_DIRECTION_LABELS,
  shading: SHADING_STYLE_LABELS,
  composition: COMPOSITION_PREFERENCE_LABELS,
  textStyle: TEXT_STYLE_PREFERENCE_LABELS,
  colorTheme: COLOR_THEME_PRESET_LABELS,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function StylePickerModal({
  open,
  onClose,
  formInput,
  updateInput,
}: StylePickerModalProps) {
  const [activeTab, setActiveTab] = useState<StyleTab>("templates");
  const [presets, setPresets] = useState<DbVisualStylePreset[]>([]);
  const [dbOptions, setDbOptions] = useState<DbStyleOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(
    formInput.visualStylePresetId ?? null
  );

  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    Promise.all([
      fetch("/api/visual-styles").then((r) => (r.ok ? r.json() : { styles: [] })),
      fetch("/api/visual-styles/options").then((r) =>
        r.ok ? r.json() : { options: [] }
      ),
    ])
      .then(([presetsData, optionsData]) => {
        setPresets(presetsData.styles ?? []);
        setDbOptions(optionsData.options ?? []);
      })
      .catch(() => {
        setPresets([]);
        setDbOptions([]);
      })
      .finally(() => setLoadingData(false));
  }, [open]);

  if (!open) return null;

  const tabs: { key: StyleTab; label: string; icon: React.ReactNode }[] = [
    { key: "templates", label: "Templates", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: "imageStyle", label: "Image Style", icon: <Layers className="w-3.5 h-3.5" /> },
    { key: "lighting", label: "Lighting", icon: <Sun className="w-3.5 h-3.5" /> },
    { key: "shading", label: "Shading", icon: <Droplets className="w-3.5 h-3.5" /> },
    { key: "composition", label: "Composition", icon: <Grid3X3 className="w-3.5 h-3.5" /> },
    { key: "textStyle", label: "Text Style", icon: <Type className="w-3.5 h-3.5" /> },
    { key: "colorTheme", label: "Color Theme", icon: <Palette className="w-3.5 h-3.5" /> },
  ];

  // Count how many style fields are set
  const activeCount = [
    formInput.imageStyle,
    formInput.lightingDirection,
    formInput.shadingStyle,
    formInput.compositionPreference,
    formInput.textStylePreference,
    formInput.colorThemePreset,
  ].filter(Boolean).length;

  // Build option entries for individual tabs: use DB if available, fallback to hardcoded
  const getOptionEntries = (
    tabKey: Exclude<StyleTab, "templates">
  ): { value: string; label: string; desc: string; imageUrl?: string }[] => {
    const tabOptions = dbOptions.filter((o) => o.tab === tabKey);
    if (tabOptions.length > 0) {
      return tabOptions.map((o) => ({
        value: o.value,
        label: o.label,
        desc: o.description,
        imageUrl: o.referenceImageUrl || undefined,
      }));
    }
    // Fallback to hardcoded constants
    const fallback = STYLE_TAB_FALLBACK_LABELS[tabKey];
    return Object.entries(fallback).map(([value, info]) => ({
      value,
      label: info.label,
      desc: info.desc,
    }));
  };

  const handlePresetClick = (preset: DbVisualStylePreset) => {
    setActivePresetId(preset._id);
    updateInput({
      imageStyle: preset.imageStyle as ImageStyle,
      lightingDirection: preset.lightingDirection as LightingDirection,
      shadingStyle: preset.shadingStyle as ShadingStyle,
      compositionPreference: preset.compositionPreference as CompositionPreference,
      textStylePreference: preset.textStylePreference as TextStylePreference,
      colorThemePreset: preset.colorThemePreset as ColorThemePreset,
      visualStylePresetId: preset._id,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#AAFF50]/20 flex items-center justify-center flex-shrink-0">
              <Palette className="w-4 h-4 text-[#0052FF]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1A1D23]">Choose Visual Style</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {activePresetId
                  ? `Template applied • ${activeCount} style${activeCount > 1 ? "s" : ""} set`
                  : activeCount > 0
                  ? `${activeCount} style${activeCount > 1 ? "s" : ""} selected`
                  : "Select styles to guide image generation"}
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

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-[#E2E8F0] overflow-x-auto pb-0 flex-shrink-0 bg-[#F4F6FA]">
          {tabs.map((tab) => {
            const isTemplatesTab = tab.key === "templates";
            const isSet = isTemplatesTab
              ? Boolean(activePresetId)
              : Boolean(
                  formInput[
                    STYLE_TAB_TO_FIELD[tab.key as Exclude<StyleTab, "templates">]
                  ] as string | undefined
                );
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-[12px] font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-[#0052FF] text-[#0052FF] bg-white"
                    : "border-transparent text-[#64748B] hover:text-[#1A1D23] hover:bg-white/60"
                }`}
              >
                <span className="flex items-center">{tab.icon}</span>
                <span>{tab.label}</span>
                {isSet && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF50] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#F4F6FA]">
          {loadingData ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : activeTab === "templates" ? (
            /* ── Templates Tab ── */
            presets.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-gray-400">
                  No style templates available yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Templates can be created from the admin panel
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => {
                  const isSelected = activePresetId === preset._id;
                  return (
                    <button
                      key={preset._id}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`relative text-left rounded-2xl border transition-all overflow-hidden ${
                        isSelected
                          ? "border-[#0052FF] bg-white shadow-sm"
                          : "bg-white border-[#E2E8F0] hover:border-gray-300 hover:shadow-md shadow-sm"
                      }`}
                    >
                      {/* Color strip */}
                      <div
                        className="h-8 flex"
                        style={{ backgroundColor: preset.thumbnailBg }}
                      >
                        {preset.colorPalette.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="p-3.5">
                        {isSelected && (
                          <div className="absolute top-10 right-3 w-5 h-5 rounded-full bg-[#0052FF] flex items-center justify-center shadow-sm shadow-blue-200">
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
                          </div>
                        )}
                        <p
                          className={`text-[13px] font-bold ${
                            isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"
                          }`}
                        >
                          {preset.name}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">
                          {preset.description}
                        </p>
                        {(preset.mood || preset.tags.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {preset.mood && (
                              <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[10px] font-bold capitalize">
                                {preset.mood}
                              </span>
                            )}
                            {preset.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            /* ── Individual option tabs ── */
            (() => {
              const field = STYLE_TAB_TO_FIELD[activeTab as Exclude<StyleTab, "templates">];
              const current = formInput[field] as string | undefined;
              const entries = getOptionEntries(activeTab as Exclude<StyleTab, "templates">);
              return (
                <div className="grid grid-cols-2 gap-3">
                  {entries.map(({ value, label, desc, imageUrl }) => {
                    const isSelected = current === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateInput({ [field]: undefined });
                          } else {
                            updateInput({ [field]: value });
                            setActivePresetId(null);
                          }
                        }}
                        className={`relative text-left rounded-2xl border transition-all overflow-hidden ${
                          isSelected
                            ? "border-[#0052FF] bg-white shadow-sm"
                            : "bg-white border-[#E2E8F0] hover:border-gray-300 hover:shadow-md shadow-sm"
                        }`}
                      >
                        {imageUrl && (
                          <div className="h-20 bg-gray-100 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={imageUrl ? "p-3" : "p-4"}>
                          {isSelected && (
                            <div
                              className={`absolute ${
                                imageUrl ? "top-[5.5rem]" : "top-3"
                              } right-3 w-4 h-4 rounded-full bg-[#0052FF] flex items-center justify-center`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF50]" />
                            </div>
                          )}
                          <p
                            className={`text-[13px] font-bold ${
                              isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"
                            }`}
                          >
                            {label}
                          </p>
                          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white">
          <button
            onClick={() => {
              updateInput({
                imageStyle: undefined,
                lightingDirection: undefined,
                shadingStyle: undefined,
                compositionPreference: undefined,
                textStylePreference: undefined,
                colorThemePreset: undefined,
                visualStylePresetId: undefined,
              });
              setActivePresetId(null);
            }}
            className="text-[12px] font-semibold text-[#64748B] hover:text-red-500 transition-colors"
          >
            Clear all
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

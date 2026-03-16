"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
  SlidersHorizontal,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Wand2,
  Palette,
  Layers,
  Sun,
  Droplets,
  Grid3X3,
  Type,
  PenLine,
  Search,
} from "lucide-react";

import type {
  PostGenerationInput,
  PostObjective,
  TargetAudience,
  ContentAngle,
  PostPlatform,
  BrandType,
  VisualStyle,
  ImageGenType,
  GeminiImageModel,
  ToneType,
  CTAType,
  IntensityLevel,
  ContentStrategyOutput,
  CaptionGeneratorOutput,
  PosterPromptOutput,
  ImageVariation,
  PostPackage,
  ContentScore,
  HookOption,
  RemixStyle,
  PostTextBlock,
  ReferenceImage,
  NicheCategory,
  PostIntent,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  CompositionPreference,
  TextStylePreference,
  ColorThemePreset,
  CaptionStylePreference,
} from "@/lib/types/postGeneration";
import {
  POST_OBJECTIVE_LABELS,
  TARGET_AUDIENCE_LABELS,
  CONTENT_ANGLE_LABELS,
  BRAND_TYPE_LABELS,
  VISUAL_STYLE_LABELS,
  IMAGE_GEN_TYPE_LABELS,
  IMAGE_MODEL_LABELS,
  TONE_LABELS,
  CTA_LABELS,
  PLATFORM_DISPLAY,
  PLATFORM_INTELLIGENCE,
  POST_IMAGE_SIZES,
  NICHE_CATEGORY_LABELS,
  POST_INTENT_LABELS,
  LIGHTING_DIRECTION_LABELS,
  SHADING_STYLE_LABELS,
  IMAGE_STYLE_LABELS,
  COMPOSITION_PREFERENCE_LABELS,
  TEXT_STYLE_PREFERENCE_LABELS,
  COLOR_THEME_PRESET_LABELS,
  CAPTION_STYLE_LABELS,
} from "@/lib/types/postGeneration";

import { GenerationPipeline, PipelineStage } from "./Pipeline/GenerationPipeline";
import { OutputDashboard } from "./Output/OutputDashboard";

// ── Constants ────────────────────────────────────────────────────────────────

type ViewState = "idle" | "generating" | "output";

const ALL_PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram_post", "facebook"];

const FONTS = [
  "Montserrat",
  "Inter",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Space Grotesk",
];

const INITIAL_STAGES: PipelineStage[] = [
  {
    name: "Content Strategist",
    description: "Analyzing your brief and creating a content strategy",
    status: "pending",
  },
  {
    name: "Caption Generator",
    description: "Writing platform-optimized captions",
    status: "pending",
  },
  {
    name: "Image Prompt Generator",
    description: "Designing visual concepts for your post",
    status: "pending",
  },
  {
    name: "Image Render",
    description: "Generating your social media image with AI",
    status: "pending",
  },
];

function buildPipelineStages(platforms: PostPlatform[]): PipelineStage[] {
  const stages: PipelineStage[] = [
    { name: "Content Strategist", description: "Analyzing your brief and creating a content strategy", status: "pending" },
    { name: "Caption Generator", description: "Writing platform-optimized captions", status: "pending" },
  ];
  if (platforms.includes("linkedin")) {
    stages.push({ name: "LinkedIn Optimizer", description: "Refining your LinkedIn post for maximum virality", status: "pending" });
  }
  if (platforms.includes("x")) {
    stages.push({ name: "X Optimizer", description: "Refining your X post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("instagram_post")) {
    stages.push({ name: "Instagram Optimizer", description: "Refining your Instagram post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("facebook")) {
    stages.push({ name: "Facebook Optimizer", description: "Refining your Facebook post for maximum discussion and reach", status: "pending" });
  }
  stages.push({ name: "Image Prompt Generator", description: "Designing visual concepts for your post", status: "pending" });
  stages.push({ name: "Image Render", description: "Generating your social media image with AI", status: "pending" });
  return stages;
}

const DEFAULT_INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "",
  platforms: ["linkedin"],
  generationFocus: "balanced",
  brandType: "personal_brand",
  visualStyles: ["minimal"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: ["#0052FF", "#1A1D23"], watermark: false },
  tones: ["professional"],
  ctas: ["none"],
  emojiLevel: "medium",
  hashtagIntensity: "medium",
  textBlocks: [],
  referenceImages: [],
};

// ── Persona → Wizard mapping helpers ─────────────────────────────────────────

function deriveBrandType(userRole: string, industry: string): BrandType {
  if (["Agency"].includes(industry)) return "agency";
  if (["E-commerce"].includes(industry)) return "ecommerce";
  if (["Founder", "Executive"].includes(userRole) && ["SaaS", "Fintech", "EdTech"].includes(industry)) return "startup_saas";
  if (["Creator", "Coach", "Freelancer"].includes(userRole)) return "creator";
  if (["Marketer", "Sales Rep", "Consultant"].includes(userRole)) return "personal_brand";
  return "personal_brand";
}

function deriveTargetAudience(
  audienceRole: string | string[] | undefined,
  audienceSegments: string[] | undefined
): TargetAudience {
  const roleStr = Array.isArray(audienceRole) ? audienceRole.join(" ") : (audienceRole ?? "");
  const combined = (roleStr + " " + (audienceSegments ?? []).join(" ")).toLowerCase();
  if (combined.includes("founder") || combined.includes("startup")) return "startup_founders";
  if (combined.includes("developer") || combined.includes("engineer")) return "developers";
  if (combined.includes("marketing") || combined.includes("agency")) return "marketing_agencies";
  if (combined.includes("real estate")) return "real_estate_buyers";
  if (roleStr || (audienceSegments && audienceSegments.length > 0)) return "custom";
  return "general_audience";
}

function deriveTone(
  sliders: { formalCasual: number; seriousPlayful: number; inspiringInformative: number; dataDriven: number } | undefined
): ToneType {
  if (!sliders) return "professional";
  if (sliders.formalCasual < 30) return "authority";
  if (sliders.formalCasual > 70) return sliders.seriousPlayful > 60 ? "witty" : "friendly";
  if (sliders.inspiringInformative < 40) return "inspirational";
  if (sliders.dataDriven > 60) return "professional";
  return "professional";
}

function deriveVisualStyle(
  brandArchetype: string | string[] | undefined,
  toneSliders: { formalCasual: number } | undefined
): VisualStyle {
  const a = (Array.isArray(brandArchetype) ? brandArchetype.join(" ") : (brandArchetype ?? "")).toLowerCase();
  if (a.includes("luxury") || a.includes("sage")) return "luxury";
  if (a.includes("rebel") || a.includes("outlaw")) return "bold";
  if (a.includes("tech") || a.includes("magician")) return "tech";
  if (a.includes("caregiver") || a.includes("everyman")) return "friendly";
  if (toneSliders && toneSliders.formalCasual < 35) return "corporate";
  return "minimal";
}

function deriveEmojiLevel(emojiUsage: string | undefined): IntensityLevel {
  if (!emojiUsage || emojiUsage.includes("None") || emojiUsage.includes("Strict")) return "low";
  if (emojiUsage.includes("Minimal")) return "low";
  if (emojiUsage.includes("Moderate")) return "medium";
  if (emojiUsage.includes("Heavy")) return "high";
  return "medium";
}

function deriveCTA(conversionGoal: string | string[] | undefined): CTAType {
  if (!conversionGoal || (Array.isArray(conversionGoal) && conversionGoal.length === 0)) return "none";
  const goal = Array.isArray(conversionGoal) ? conversionGoal.join(" ") : conversionGoal;
  if (goal.includes("call")) return "visit_link";
  if (goal.includes("newsletter") || goal.includes("lead magnet")) return "sign_up";
  if (goal.includes("Buy") || goal.includes("product")) return "visit_link";
  if (goal.includes("Follow")) return "follow_for_more";
  if (goal.includes("community") || goal.includes("Join")) return "comment_cta";
  return "none";
}

function deriveContentAngle(contentMix: string[] | undefined): ContentAngle | undefined {
  if (!contentMix?.length) return undefined;
  if (contentMix.includes("How-to Guides")) return "step_by_step_guide";
  if (contentMix.includes("Thought Leadership")) return "contrarian_opinion";
  if (contentMix.includes("Personal Stories") || contentMix.includes("Behind-the-Scenes")) return "story";
  if (contentMix.includes("Case Studies")) return "data_insight";
  return undefined;
}

function deriveObjective(primaryObjective: string[] | undefined): PostObjective {
  if (!primaryObjective?.length) return "educational";
  if (primaryObjective.includes("Generate Leads")) return "lead_generation";
  if (primaryObjective.includes("Sell Products")) return "promotional";
  if (primaryObjective.includes("Build Authority")) return "thought_leadership";
  if (primaryObjective.includes("Grow Community")) return "engagement";
  return "educational";
}

// ── Dropdown component helper ─────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

function SelectField({ label, value, onChange, options, className }: SelectFieldProps) {
  return (
    <div className={`mb-4 ${className ?? ""}`}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 shadow-sm outline-none transition-all text-[13px] font-semibold text-[#1A1D23] appearance-none cursor-pointer pr-10 hover:border-gray-300"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none group-focus-within:text-[#0052FF] transition-colors" />
      </div>
    </div>
  );
}

// ── Multi-select pill component ───────────────────────────────────────────────

interface MultiSelectPillsProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectPills({ label, options, selected, onChange }: MultiSelectPillsProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
          {label}
        </label>
        {selected.length > 0 && (
          <span className="text-[10px] font-bold text-[#0052FF] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
            {selected.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border shadow-sm ${
                isSelected
                  ? "bg-[#0052FF] text-white border-[#0052FF] shadow-blue-100"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0052FF]/40 hover:text-[#0052FF] hover:bg-[#EEF3FF]"
              }`}
            >
              {opt.label}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF50] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── StylePickerModal (DB-driven with Templates tab) ──────────────────────────

type StyleTab = "templates" | "imageStyle" | "lighting" | "shading" | "composition" | "textStyle" | "colorTheme";

interface StylePickerModalProps {
  open: boolean;
  onClose: () => void;
  formInput: PostGenerationInput;
  updateInput: (updates: Partial<PostGenerationInput>) => void;
}

interface DbVisualStylePreset {
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

interface DbStyleOption {
  _id: string;
  tab: "imageStyle" | "lighting" | "shading" | "composition" | "textStyle" | "colorTheme";
  value: string;
  label: string;
  description: string;
  referenceImageUrl: string;
  sortOrder: number;
}

const STYLE_TAB_TO_FIELD: Record<Exclude<StyleTab, "templates">, keyof PostGenerationInput> = {
  imageStyle: "imageStyle",
  lighting: "lightingDirection",
  shading: "shadingStyle",
  composition: "compositionPreference",
  textStyle: "textStylePreference",
  colorTheme: "colorThemePreset",
};

const STYLE_TAB_FALLBACK_LABELS: Record<Exclude<StyleTab, "templates">, Record<string, { label: string; desc: string }>> = {
  imageStyle: IMAGE_STYLE_LABELS,
  lighting: LIGHTING_DIRECTION_LABELS,
  shading: SHADING_STYLE_LABELS,
  composition: COMPOSITION_PREFERENCE_LABELS,
  textStyle: TEXT_STYLE_PREFERENCE_LABELS,
  colorTheme: COLOR_THEME_PRESET_LABELS,
};

function StylePickerModal({ open, onClose, formInput, updateInput }: StylePickerModalProps) {
  const [activeTab, setActiveTab] = useState<StyleTab>("templates");
  const [presets, setPresets] = useState<DbVisualStylePreset[]>([]);
  const [dbOptions, setDbOptions] = useState<DbStyleOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(formInput.visualStylePresetId ?? null);

  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    Promise.all([
      fetch("/api/visual-styles").then(r => r.ok ? r.json() : { styles: [] }),
      fetch("/api/visual-styles/options").then(r => r.ok ? r.json() : { options: [] }),
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
  const getOptionEntries = (tabKey: Exclude<StyleTab, "templates">): { value: string; label: string; desc: string; imageUrl?: string }[] => {
    const tabOptions = dbOptions.filter(o => o.tab === tabKey);
    if (tabOptions.length > 0) {
      return tabOptions.map(o => ({ value: o.value, label: o.label, desc: o.description, imageUrl: o.referenceImageUrl || undefined }));
    }
    // Fallback to hardcoded constants
    const fallback = STYLE_TAB_FALLBACK_LABELS[tabKey];
    return Object.entries(fallback).map(([value, info]) => ({ value, label: info.label, desc: info.desc }));
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
              : Boolean(formInput[STYLE_TAB_TO_FIELD[tab.key as Exclude<StyleTab, "templates">]] as string | undefined);
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
                <div key={i} className="h-24 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeTab === "templates" ? (
            /* ── Templates Tab ── */
            presets.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-gray-400">No style templates available yet</p>
                <p className="text-[11px] text-gray-400 mt-1">Templates can be created from the admin panel</p>
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
                      <div className="h-8 flex" style={{ backgroundColor: preset.thumbnailBg }}>
                        {preset.colorPalette.slice(0, 6).map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div className="p-3.5">
                        {isSelected && (
                          <div className="absolute top-10 right-3 w-5 h-5 rounded-full bg-[#0052FF] flex items-center justify-center shadow-sm shadow-blue-200">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <p className={`text-[13px] font-bold ${isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>{preset.name}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{preset.description}</p>
                        {(preset.mood || preset.tags.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {preset.mood && (
                              <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[10px] font-bold capitalize">{preset.mood}</span>
                            )}
                            {preset.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">{tag}</span>
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
                            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className={imageUrl ? "p-3" : "p-4"}>
                          {isSelected && (
                            <div className={`absolute ${imageUrl ? "top-[5.5rem]" : "top-3"} right-3 w-4 h-4 rounded-full bg-[#0052FF] flex items-center justify-center`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF50]" />
                            </div>
                          )}
                          <p className={`text-[13px] font-bold ${isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>{label}</p>
                          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{desc}</p>
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

// ── WritingStyleModal ─────────────────────────────────────────────────────────

type WritingPlatform = "linkedin" | "x" | "instagram_post" | "facebook";

interface WritingStyleModalProps {
  open: boolean;
  onClose: () => void;
  formInput: PostGenerationInput;
  updateInput: (updates: Partial<PostGenerationInput>) => void;
}

interface DbCaptionTemplate {
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

const CATEGORY_EMOJI: Record<string, string> = {
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

const PLATFORM_SHORT: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram_post: "Instagram",
  facebook: "Facebook",
};

function WritingStyleModal({ open, onClose, formInput, updateInput }: WritingStyleModalProps) {
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                  ? `Active: ${dbTemplates.find((t) => t._id === formInput.selectedTemplateId)?.name ?? "Template selected"}`
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
                  templateTab === tab ? "bg-[#0052FF]/10 text-[#0052FF]" : "bg-gray-200 text-gray-500"
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
                <div key={i} className="h-20 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : visibleTemplates.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-[13px] font-semibold text-gray-400">
                {search ? "No templates match your search" : "No templates available"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {search ? "Try a different keyword." : "Add templates in the admin panel to see them here."}
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
                const variant =
                  !template.isBundle
                    ? template.platformVariants.find((v) => v.platform === activePlatform)
                    : undefined;

                return (
                  <button
                    key={template._id}
                    type="button"
                    onClick={() => {
                      updateInput({ selectedTemplateId: isSelected ? undefined : template._id });
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
                            <p className={`text-[13px] font-bold ${isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>
                              {template.name}
                            </p>
                            {template.isBundle && (
                              <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold rounded-full">
                                Bundle
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{template.description}</p>

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
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
                        <p className="text-[11px] text-[#1A1D23] leading-relaxed line-clamp-4">{variant.structure}</p>
                      </div>
                    )}

                    {/* Bundle template: show all platform variants as a package */}
                    {template.isBundle && template.platformVariants.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {template.platformVariants.map((v) => (
                          <div key={v.platform} className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0]">
                            <p className="text-[10px] font-bold text-[#0052FF] mb-1">
                              {PLATFORM_SHORT[v.platform] ?? v.platform}
                            </p>
                            <p className="text-[10px] text-[#1A1D23] leading-relaxed line-clamp-3">{v.structure}</p>
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

// ── Main Component ────────────────────────────────────────────────────────────

export function PostGeneratorPage() {
  const params = useParams();
  const accountId = params?.id as string;
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImgInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formInput, setFormInput] = useState<PostGenerationInput>(DEFAULT_INPUT);

  // Pre-populate selectedTemplateId from URL ?templateId= query param
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("templateId");
    if (templateIdFromUrl) {
      setFormInput((prev) => ({ ...prev, selectedTemplateId: templateIdFromUrl }));
    }
  }, [searchParams]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Modal state
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [writingStyleModalOpen, setWritingStyleModalOpen] = useState(false);

  // Persona import state
  const [usePersonaImport, setUsePersonaImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generation state machine
  const [view, setView] = useState<ViewState>("idle");
  const [lastInput, setLastInput] = useState<PostGenerationInput | null>(null);
  const [strategy, setStrategy] = useState<ContentStrategyOutput | null>(null);
  const [captionOutput, setCaptionOutput] = useState<CaptionGeneratorOutput | null>(null);
  const [usedTemplateName, setUsedTemplateName] = useState<string | undefined>(undefined);
  const [templateAICurated, setTemplateAICurated] = useState(false);
  const [imagePrompt, setImagePrompt] = useState<PosterPromptOutput | null>(null);
  const [postPackage, setPostPackage] = useState<PostPackage | null>(null);
  const [contentScore, setContentScore] = useState<ContentScore | null>(null);
  const [hooks, setHooks] = useState<HookOption[] | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [error, setError] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const updateInput = (updates: Partial<PostGenerationInput>) => {
    setFormInput((prev) => ({ ...prev, ...updates }));
  };

  const handlePlatformToggle = (platform: PostPlatform) => {
    const current = formInput.platforms;
    if (current.includes(platform)) {
      updateInput({ platforms: current.filter((p) => p !== platform) });
    } else {
      updateInput({ platforms: [...current, platform] });
    }
  };

  // ── Color palette helpers ─────────────────────────────────────────────────

  const handleAddColor = () => {
    if (formInput.brandAssets.colorPalette.length < 5) {
      updateInput({
        brandAssets: {
          ...formInput.brandAssets,
          colorPalette: [...formInput.brandAssets.colorPalette, "#000000"],
        },
      });
    }
  };

  const handleUpdateColor = (index: number, color: string) => {
    const newPalette = [...formInput.brandAssets.colorPalette];
    newPalette[index] = color;
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  const handleRemoveColor = (index: number) => {
    const newPalette = formInput.brandAssets.colorPalette.filter((_, i) => i !== index);
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  // ── Logo upload ───────────────────────────────────────────────────────────

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInput({
          brandAssets: { ...formInput.brandAssets, logoUrl: reader.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Persona import ────────────────────────────────────────────────────────

  const handlePersonaImport = async (enabled: boolean) => {
    setUsePersonaImport(enabled);
    if (!enabled) {
      setImportStatus(null);
      return;
    }
    if (!accountId) {
      setImportStatus("No account ID provided");
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const res = await fetch(`/api/persona?accountId=${accountId}`);
      if (!res.ok) {
        setImportStatus("No persona found for this account");
        return;
      }
      const data = await res.json();
      const p = data.persona;
      if (!p) {
        setImportStatus("No persona found — set up your Persona Builder first");
        return;
      }

      const updates: Partial<PostGenerationInput> = {};

      updates.objective = deriveObjective(p.primaryObjective);
      const audience = deriveTargetAudience(p.audienceRole, p.audienceSegments);
      updates.targetAudiences = [audience];
      if (audience === "custom") {
        updates.customAudience = [
          ...(Array.isArray(p.audienceRole) ? p.audienceRole : p.audienceRole ? [p.audienceRole] : []),
          ...(p.audienceSegments ?? [])
        ].filter(Boolean).join(", ");
      }
      const angle = deriveContentAngle(p.contentMix);
      if (angle) updates.contentAngles = [angle];

      updates.brandType = deriveBrandType(p.userRole ?? "", p.industry ?? "");
      updates.visualStyles = [deriveVisualStyle(p.brandArchetype, p.toneSliders)];
      const personaColors =
        p.colorPalette?.length ? p.colorPalette : p.brandColorHex ? [p.brandColorHex] : [];
      updates.brandAssets = {
        watermark: formInput.brandAssets.watermark,
        colorPalette: personaColors.length ? personaColors : formInput.brandAssets.colorPalette,
        fontFamily: p.fontFamily || formInput.brandAssets.fontFamily,
        logoUrl: p.logoUrl || formInput.brandAssets.logoUrl,
      };

      updates.tones = [deriveTone(p.toneSliders)];
      updates.ctas = [deriveCTA(p.conversionGoal)];
      updates.emojiLevel = deriveEmojiLevel(p.emojiUsage);

      updateInput(updates);
      setImportStatus(`Imported ${Object.keys(updates).length} fields from persona`);
    } catch {
      setImportStatus("Failed to import persona");
    } finally {
      setIsImporting(false);
    }
  };

  // ── Pipeline helpers ──────────────────────────────────────────────────────

  const updateStageStatus = (index: number, status: PipelineStage["status"]) => {
    setPipelineStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, status } : stage))
    );
  };

  const getCurrentStageIndex = () => {
    const activeIndex = pipelineStages.findIndex((s) => s.status === "active");
    if (activeIndex !== -1) return activeIndex;
    const errorIndex = pipelineStages.findIndex((s) => s.status === "error");
    if (errorIndex !== -1) return errorIndex;
    const allCompleted = pipelineStages.every((s) => s.status === "completed");
    if (allCompleted) return pipelineStages.length;
    return 0;
  };

  // ── Generation ────────────────────────────────────────────────────────────

  const handleGenerate = async (wizardInput: PostGenerationInput) => {
    setLastInput(wizardInput);
    setView("generating");
    setError(null);
    setUsedTemplateName(undefined);
    setTemplateAICurated(false);

    const hasLinkedIn = wizardInput.platforms.includes("linkedin");
    const hasX = wizardInput.platforms.includes("x");
    const hasInstagram = wizardInput.platforms.includes("instagram_post");
    const hasFacebook = wizardInput.platforms.includes("facebook");
    const dynamicStages = buildPipelineStages(wizardInput.platforms);
    setPipelineStages(dynamicStages.map((s, i) => i === 0 ? { ...s, status: "active" } : s));

    // Dynamic stage indices
    let offset = 2; // after strategist + captions
    const stageIdx = {
      strategist: 0,
      captions: 1,
      linkedInOptimizer: hasLinkedIn ? offset++ : -1,
      xOptimizer: hasX ? offset++ : -1,
      instagramOptimizer: hasInstagram ? offset++ : -1,
      facebookOptimizer: hasFacebook ? offset++ : -1,
      imagePrompt: offset++,
      imageRender: offset,
    };

    try {
      // Stage 1: Strategist
      const strategyRes = await fetch("/api/post-generation/strategist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, accountId, includePersona: usePersonaImport }),
      });

      if (!strategyRes.ok) {
        const errBody = await strategyRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Strategy failed (${strategyRes.status})`);
      }
      const strategyJson = await strategyRes.json();
      const strategyData: ContentStrategyOutput = strategyJson.strategy;
      setStrategy(strategyData);

      updateStageStatus(stageIdx.strategist, "completed");
      updateStageStatus(stageIdx.captions, "active");

      // Stage 2: Captions
      const captionsRes = await fetch("/api/post-generation/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      });

      if (!captionsRes.ok) {
        const errBody = await captionsRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Captions failed (${captionsRes.status})`);
      }
      const captionsJson = await captionsRes.json();
      const captionsData: CaptionGeneratorOutput = captionsJson.captions;
      setCaptionOutput(captionsData);
      if (captionsJson.usedTemplateName) setUsedTemplateName(captionsJson.usedTemplateName as string);
      setTemplateAICurated(captionsJson.templateAICurated === true);

      // Build captions record early so we can refine LinkedIn before image prompt
      const captionsRecord: Record<string, string> = Object.fromEntries(
        captionsData.captions.map((c) => [c.platform, c.caption])
      );

      updateStageStatus(stageIdx.captions, "completed");

      // Stage 2.5: LinkedIn Optimizer (conditional)
      let linkedInRefinedData: PostPackage["linkedInRefined"] | undefined = undefined;
      if (hasLinkedIn && captionsRecord["linkedin"]) {
        updateStageStatus(stageIdx.linkedInOptimizer, "active");
        try {
          const linkedInRefineRes = await fetch("/api/post-generation/linkedin-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["linkedin"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (linkedInRefineRes.ok) {
            const refineJson = await linkedInRefineRes.json();
            captionsRecord["linkedin"] = refineJson.refinedCaption;
            linkedInRefinedData = {
               viralityScore: refineJson.viralityScore,
               qualityFlags: refineJson.qualityFlags,
             };
          }
        } catch (err) {
          console.warn("LinkedIn refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.linkedInOptimizer, "completed");
      }

      // Stage 2.6: X Optimizer (conditional)
      let xRefinedData: PostPackage["xRefined"] | undefined = undefined;
      if (hasX && captionsRecord["x"]) {
        updateStageStatus(stageIdx.xOptimizer, "active");
        try {
          const xRefineRes = await fetch("/api/post-generation/x-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["x"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (xRefineRes.ok) {
            const refineJson = await xRefineRes.json();
            captionsRecord["x"] = refineJson.refinedPost;
            xRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("X refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.xOptimizer, "completed");
      }

      // Stage 2.7: Instagram Optimizer (conditional)
      let instagramRefinedData: PostPackage["instagramRefined"] | undefined = undefined;
      if (hasInstagram && captionsRecord["instagram_post"]) {
        updateStageStatus(stageIdx.instagramOptimizer, "active");
        try {
          const igRefineRes = await fetch("/api/post-generation/instagram-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["instagram_post"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (igRefineRes.ok) {
            const refineJson = await igRefineRes.json();
            captionsRecord["instagram_post"] = refineJson.refinedCaption;
            instagramRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
              postType: refineJson.postType,
            };
          }
        } catch (err) {
          console.warn("Instagram refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.instagramOptimizer, "completed");
      }

      // Stage 2.8: Facebook Optimizer (conditional)
      let facebookRefinedData: PostPackage["facebookRefined"] | undefined = undefined;
      if (hasFacebook && captionsRecord["facebook"]) {
        updateStageStatus(stageIdx.facebookOptimizer, "active");
        try {
          const fbRefineRes = await fetch("/api/post-generation/facebook-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["facebook"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (fbRefineRes.ok) {
            const refineJson = await fbRefineRes.json();
            captionsRecord["facebook"] = refineJson.refinedPost;
            facebookRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("Facebook refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.facebookOptimizer, "completed");
      }

      updateStageStatus(stageIdx.imagePrompt, "active");

      // Stage 3: Image Prompt
      const imagePromptRes = await fetch("/api/post-generation/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      });

      if (!imagePromptRes.ok) {
        const errBody = await imagePromptRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Image prompt failed (${imagePromptRes.status})`);
      }
      const imagePromptJson = await imagePromptRes.json();
      const imagePromptData: PosterPromptOutput = imagePromptJson.imagePrompt;
      setImagePrompt(imagePromptData);

      updateStageStatus(stageIdx.imagePrompt, "completed");
      updateStageStatus(stageIdx.imageRender, "active");

      // Stage 4: Generate poster variations
      let generatedVariations: ImageVariation[] = [];
      try {
        const generateImageRes = await fetch("/api/post-generation/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            posterOutput: imagePromptData,
            input: wizardInput,
            imageModel: wizardInput.imageModel,
            accountId,
          }),
        });

        if (generateImageRes.ok) {
          const imageGenJson = await generateImageRes.json();
          generatedVariations = imageGenJson.images ?? [];
        } else {
          console.warn("Image generation failed, continuing without images");
        }
      } catch (imageGenError) {
        console.warn("Image generation error (non-fatal):", imageGenError);
      }

      updateStageStatus(stageIdx.imageRender, "completed");

      const sizesRecord = Object.fromEntries(
        wizardInput.platforms.map((p) => [
          p,
          `${PLATFORM_INTELLIGENCE[p].imageSizes[0].width}x${PLATFORM_INTELLIGENCE[p].imageSizes[0].height}`,
        ])
      );

      const newPostPackage: PostPackage = {
        imagePrompt: imagePromptData.posterPrompt,
        imageUrl: generatedVariations[0]?.imageUrl,
        imageVariations: generatedVariations,
        captions: captionsRecord,
        hashtags: captionsData.hashtags,
        sizes: sizesRecord,
        headline: imagePromptData.headline,
        subtext: imagePromptData.subtext,
        cta: imagePromptData.cta,
        designStyle: wizardInput.visualStyles[0] ?? "minimal",
        linkedInRefined: linkedInRefinedData,
        xRefined: xRefinedData,
        instagramRefined: instagramRefinedData,
        facebookRefined: facebookRefinedData,
      };

      setPostPackage(newPostPackage);
      setView("output");

      // Fire Hooks generation in background
      fetch("/api/post-generation/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      })
        .then((res) => res.json())
        .then((data) => setHooks(data.hooks))
        .catch((err) => console.error("Failed to generate hooks:", err));
    } catch (err: unknown) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during generation.");
      setView("idle");
      setPipelineStages((prev) =>
        prev.map((stage) => (stage.status === "active" ? { ...stage, status: "error" } : stage))
      );
    }
  };

  const handleRemix = async (caption: string, platform: string, style: RemixStyle) => {
    if (!postPackage) return;
    setIsRemixing(true);
    try {
      const res = await fetch("/api/post-generation/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, remixStyle: style, accountId }),
      });
      if (!res.ok) throw new Error("Failed to remix caption");
      const data = await res.json();
      setPostPackage((prev) => {
        if (!prev) return prev;
        return { ...prev, captions: { ...prev.captions, [platform]: data.remixedCaption } };
      });
    } catch (err) {
      console.error("Remix error:", err);
    } finally {
      setIsRemixing(false);
    }
  };

  const handleScoreRequest = async (platform: string) => {
    if (!postPackage) return;
    setIsScoring(true);
    try {
      const caption = postPackage.captions[platform];
      const res = await fetch("/api/post-generation/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, headline: postPackage.headline }),
      });
      if (!res.ok) throw new Error("Failed to score content");
      const scoreJson = await res.json();
      const data: ContentScore = scoreJson.score;
      setContentScore(data);
      setPostPackage((prev) => {
        if (!prev) return prev;
        return { ...prev, contentScore: data };
      });
    } catch (err) {
      console.error("Score error:", err);
    } finally {
      setIsScoring(false);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    } else {
      setView("idle");
    }
  };

  const handleNewPost = () => {
    setView("idle");
    setPostPackage(null);
    setHooks(null);
    setContentScore(null);
    setError(null);
    setStrategy(null);
    setCaptionOutput(null);
    setImagePrompt(null);
    setLastInput(null);
    setUsedTemplateName(undefined);
    setTemplateAICurated(false);
    setPipelineStages(INITIAL_STAGES);
    setFormInput(DEFAULT_INPUT);
  };

  const canGenerate = formInput.coreMessage.trim().length > 0 && formInput.platforms.length > 0;

  // ── Text block helpers ────────────────────────────────────────────────────

  const addTextBlock = () => {
    const newBlock: PostTextBlock = {
      id: Date.now().toString(),
      label: "Title",
      text: "",
    };
    updateInput({ textBlocks: [...(formInput.textBlocks ?? []), newBlock] });
  };

  const updateTextBlock = (id: string, changes: Partial<PostTextBlock>) => {
    updateInput({
      textBlocks: (formInput.textBlocks ?? []).map((b) =>
        b.id === id ? { ...b, ...changes } : b
      ),
    });
  };

  const removeTextBlock = (id: string) => {
    updateInput({ textBlocks: (formInput.textBlocks ?? []).filter((b) => b.id !== id) });
  };

  // ── Reference image helpers ───────────────────────────────────────────────

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ReferenceImage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          label: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl: reader.result as string,
        };
        updateInput({ referenceImages: [...(formInput.referenceImages ?? []), newImg] });
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added
    if (e.target) e.target.value = "";
  };

  const updateReferenceImageLabel = (id: string, label: string) => {
    updateInput({
      referenceImages: (formInput.referenceImages ?? []).map((img) =>
        img.id === id ? { ...img, label } : img
      ),
    });
  };

  const removeReferenceImage = (id: string) => {
    updateInput({ referenceImages: (formInput.referenceImages ?? []).filter((img) => img.id !== id) });
  };

  // ── Options arrays for dropdowns ──────────────────────────────────────────

  const objectiveOptions = (
    Object.entries(POST_OBJECTIVE_LABELS) as [PostObjective, { label: string; emoji: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const audienceOptions = (
    Object.entries(TARGET_AUDIENCE_LABELS) as [TargetAudience, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const contentAngleOptions = [
    { value: "", label: "— None —" },
    ...(Object.entries(CONTENT_ANGLE_LABELS) as [ContentAngle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const toneOptions = (
    Object.entries(TONE_LABELS) as [ToneType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const ctaOptions = (
    Object.entries(CTA_LABELS) as [CTAType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const intensityOptions: { value: IntensityLevel; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const brandTypeOptions = (
    Object.entries(BRAND_TYPE_LABELS) as [BrandType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const visualStyleOptions = (
    Object.entries(VISUAL_STYLE_LABELS) as [VisualStyle, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageGenTypeOptions = (
    Object.entries(IMAGE_GEN_TYPE_LABELS) as [ImageGenType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageModelOptions = (
    Object.entries(IMAGE_MODEL_LABELS) as [GeminiImageModel, { label: string; desc: string; badge: string }][]
  ).map(([key, { label, badge }]) => ({ value: key, label: `${label} (${badge})` }));

  const fontOptions = FONTS.map((f) => ({ value: f, label: f }));

  // Creative Engine option arrays
  const nicheOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(NICHE_CATEGORY_LABELS) as [NicheCategory, { label: string; emoji: string }][]).map(
      ([key, { label, emoji }]) => ({ value: key, label: `${emoji} ${label}` })
    ),
  ];

  const postIntentOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(POST_INTENT_LABELS) as [PostIntent, { label: string; desc: string; emoji: string }][]).map(
      ([key, { label, emoji }]) => ({ value: key, label: `${emoji} ${label}` })
    ),
  ];

  const lightingOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(LIGHTING_DIRECTION_LABELS) as [LightingDirection, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const shadingOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(SHADING_STYLE_LABELS) as [ShadingStyle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const imageStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(IMAGE_STYLE_LABELS) as [ImageStyle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const compositionOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(COMPOSITION_PREFERENCE_LABELS) as [CompositionPreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const textStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(TEXT_STYLE_PREFERENCE_LABELS) as [TextStylePreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const colorThemeOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(COLOR_THEME_PRESET_LABELS) as [ColorThemePreset, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const captionStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(CAPTION_STYLE_LABELS) as [CaptionStylePreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#E8ECF2]">
      {/* ── Left Panel: Input Form ── */}
      <div className="w-[420px] flex-shrink-0 flex flex-col bg-[#F4F6FA] border-r border-[#E2E8F0] overflow-hidden shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
        
        {/* New Post banner — shown when output is visible */}
        {view === "output" && (
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E2E8F0] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#AAFF50]" />
              <span className="text-[12px] font-bold text-[#1A1D23]">Content generated</span>
            </div>
            <button
              type="button"
              onClick={handleNewPost}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F6FA] hover:bg-[#EEF3FF] border border-[#E2E8F0] hover:border-[#0052FF]/30 text-[#1A1D23] hover:text-[#0052FF] text-[12px] font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          </div>
        )}

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Persona Import */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden border-l-4 border-l-[#0052FF]">
            <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#0052FF]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Import from Persona</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Auto-fill fields from your Persona Builder</p>
                </div>
              </div>
              <button
                onClick={() => handlePersonaImport(!usePersonaImport)}
                disabled={isImporting}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                  usePersonaImport ? "bg-[#0052FF]" : "bg-gray-200"
                } ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    usePersonaImport ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {isImporting && (
                <p className="text-[12px] font-semibold text-gray-500 mt-3 flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                Importing from persona...
              </p>
            )}
            {importStatus && !isImporting && (
                <p className={`text-[12px] mt-3 font-semibold ${
                importStatus.startsWith("Imported") ? "text-green-600" :
                importStatus.includes("found") || importStatus.includes("first") ? "text-amber-600" :
                "text-red-500"
              }`}>
                {importStatus}
              </p>
            )}
            {usePersonaImport && !isImporting && importStatus?.startsWith("Imported") && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-white/60 rounded-xl flex-wrap border border-white">
                {formInput.brandAssets.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formInput.brandAssets.logoUrl}
                    alt="Brand logo"
                    className="w-8 h-8 object-contain rounded-lg bg-white border border-gray-200 p-1"
                  />
                )}
                <div className="flex items-center gap-1">
                  {formInput.brandAssets.colorPalette.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                {formInput.brandAssets.fontFamily && (
                  <span className="text-[11px] font-semibold text-gray-500" style={{ fontFamily: formInput.brandAssets.fontFamily }}>
                    {formInput.brandAssets.fontFamily}
                  </span>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Creative Style Buttons */}
          {(() => {
            const styleCount = [
              formInput.imageStyle,
              formInput.lightingDirection,
              formInput.shadingStyle,
              formInput.compositionPreference,
              formInput.textStylePreference,
              formInput.colorThemePreset,
            ].filter(Boolean).length;
            const hasWritingStyle = (formInput.captionStyle && formInput.captionStyle !== "auto") || !!formInput.selectedTemplateId;
            return (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Enhance with AI Styles
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStyleModalOpen(true)}
                    className={`relative flex flex-col items-start gap-2 bg-white rounded-2xl border shadow-sm hover:shadow-md p-4 transition-all ${
                      styleCount > 0
                        ? "border-[#0052FF] bg-[#EEF3FF]"
                        : "border-[#E2E8F0] hover:border-gray-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#AAFF50]/20 flex items-center justify-center mb-1">
                      <Palette className="w-4 h-4 text-[#0052FF]" />
                    </div>
                    <span className={`text-[13px] font-bold ${styleCount > 0 ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>
                      Visual Style
                    </span>
                    {styleCount > 0 && (
                      <>
                        <span className="absolute top-4 right-4 bg-[#0052FF] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {styleCount}
                        </span>
                        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#AAFF50]" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setWritingStyleModalOpen(true)}
                    className={`relative flex flex-col items-start gap-2 bg-white rounded-2xl border shadow-sm hover:shadow-md p-4 transition-all ${
                      hasWritingStyle
                        ? "border-[#0052FF] bg-[#EEF3FF]"
                        : "border-[#E2E8F0] hover:border-gray-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] flex items-center justify-center mb-1">
                      <PenLine className="w-4 h-4 text-[#0052FF]" />
                    </div>
                    <span className={`text-[13px] font-bold ${hasWritingStyle ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>
                      Writing Style
                    </span>
                    {hasWritingStyle && (
                      <>
                        <span className="absolute top-4 right-4 bg-[#0052FF] flex items-center justify-center w-5 h-5 rounded-full shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#AAFF50]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Core Message */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 focus-within:ring-2 focus-within:ring-[#0052FF]/20 focus-within:border-[#0052FF] transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Core Message <span className="text-red-500 normal-case">*</span>
              </label>
              <div className="bg-[#F4F6FA] rounded-full px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                {formInput.coreMessage.length} chars
              </div>
            </div>
            <textarea
              value={formInput.coreMessage}
              onChange={(e) => updateInput({ coreMessage: e.target.value })}
              placeholder="Describe your post idea... e.g., Launching our AI scheduler that helps agencies manage content faster"
              className="w-full h-28 border-0 outline-none bg-transparent resize-none text-sm text-[#1A1D23] placeholder-gray-400 p-0"
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Platforms <span className="text-red-500 normal-case">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PLATFORMS.map((platform) => {
                const isSelected = formInput.platforms.includes(platform);
                const { label, color } = PLATFORM_DISPLAY[platform];
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? "border-[#0052FF] bg-[#EEF3FF] shadow-sm"
                        : "bg-white border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 inset-y-2 w-[3px] bg-[#AAFF50] rounded-r-xl" />
                    )}
                    <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                    <span className={`text-[13px] font-bold ${isSelected ? "text-[#0052FF]" : "text-[#1A1D23]"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objective */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <SelectField
              label="Objective"
              value={formInput.objective}
              onChange={(v) => updateInput({ objective: v as PostObjective })}
              options={objectiveOptions}
              className="!mb-0"
            />
          </div>

          {/* Generation Focus */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Generation Focus
            </label>
            <div className="bg-[#F4F6FA] p-1.5 rounded-xl flex items-center gap-1">
              {(["caption", "balanced", "image"] as const).map((focus) => {
                const isActive = (formInput.generationFocus ?? "balanced") === focus;
                const icons = {
                  caption: <FileText className="w-3.5 h-3.5" />,
                  balanced: <LayoutGrid className="w-3.5 h-3.5" />,
                  image: <ImageIcon className="w-3.5 h-3.5" />,
                };
                const labels = {
                  caption: "Caption",
                  balanced: "Balanced",
                  image: "Image",
                };
                return (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => updateInput({ generationFocus: focus })}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                      isActive
                        ? "bg-white text-[#0052FF] shadow-sm"
                        : "text-[#64748B] hover:text-[#1A1D23]"
                    }`}
                  >
                    <span className={isActive ? "text-[#0052FF]" : "text-[#64748B]"}>{icons[focus]}</span>
                    {labels[focus]}
                    {isActive && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#AAFF50]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post Text Blocks */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-1">
              Post Text
            </label>
            <p className="text-[11px] text-[#64748B] mb-4">Add text blocks for your image. Each block can be labeled.</p>
            
            <div className="space-y-3">
              {(formInput.textBlocks ?? []).map((block) => (
                <div key={block.id} className="flex flex-col gap-2 p-3.5 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0] relative group">
                  <div className="flex items-center justify-between">
                    <select
                      value={block.label}
                      onChange={(e) => updateTextBlock(block.id, { label: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[11px] font-bold text-[#1A1D23] shadow-sm focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none w-32 appearance-none"
                    >
                      {["Title", "Subtitle", "Caption", "Body", "Tagline", "CTA Text"].map((lbl) => (
                        <option key={lbl} value={lbl}>{lbl}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTextBlock(block.id)}
                      className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {block.label === "Caption" || block.label === "Body" ? (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                      placeholder={`Enter ${block.label.toLowerCase()}...`}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#1A1D23] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none resize-none h-20 placeholder-gray-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={block.text}
                      onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                      placeholder={`Enter ${block.label.toLowerCase()}...`}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#1A1D23] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none placeholder-gray-400"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addTextBlock}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#0052FF]/30 bg-[#EEF3FF]/50 text-[12px] font-bold text-[#0052FF] hover:border-[#AAFF50] hover:bg-[#AAFF50]/10 hover:text-[#1A1D23] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Text Block
            </button>
          </div>

          {/* Image Concept */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 focus-within:ring-2 focus-within:ring-[#0052FF]/20 focus-within:border-[#0052FF] transition-all">
            <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-2">
              Image Concept
            </label>
            <textarea
              value={formInput.imageConcept ?? ""}
              onChange={(e) => updateInput({ imageConcept: e.target.value || undefined })}
              placeholder="Describe the visual you have in mind..."
              className="w-full h-[72px] border-0 outline-none bg-transparent resize-none text-sm text-[#1A1D23] placeholder-gray-400 p-0"
            />
          </div>

          {/* Reference Images */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-1">
              Reference Images
            </label>
            <p className="text-[11px] text-[#64748B] mb-4">Add people, products, or objects to include in the image.</p>
            <input
              ref={refImgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleReferenceImageUpload}
            />
            
            {(formInput.referenceImages ?? []).length > 0 && (
              <div className="space-y-3 mb-3">
                {(formInput.referenceImages ?? []).map((img) => (
                  <div key={img.id} className="flex items-center gap-3 p-2 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={img.label}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0] shadow-sm flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={img.label}
                      onChange={(e) => updateReferenceImageLabel(img.id, e.target.value)}
                      placeholder="Label this image... (e.g. 'CEO')"
                      className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#1A1D23] focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(img.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors mr-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => refImgInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#E2E8F0] bg-white text-[12px] font-bold text-[#64748B] hover:border-[#AAFF50] hover:bg-[#AAFF50]/10 hover:text-[#1A1D23] transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reference Image
            </button>
          </div>

          {/* Brand Identity */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E2E8F0] border-dashed">
              <div className="w-6 h-6 rounded-lg bg-[#AAFF50]/20 flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-[#0052FF]" />
              </div>
              <h3 className="text-[13px] font-bold text-[#1A1D23]">Brand Identity</h3>
            </div>
            
            <div className="space-y-5">
              {/* Logo */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Brand Logo</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {formInput.brandAssets.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-[#E2E8F0] bg-[#F4F6FA] flex items-center justify-center overflow-hidden shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formInput.brandAssets.logoUrl} alt="Brand logo" className="max-w-full max-h-full object-contain p-1.5" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0052FF] bg-[#EEF3FF] hover:bg-[#E0E7FF] transition-all w-24"
                      >
                        <Upload className="w-3 h-3" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => updateInput({ brandAssets: { ...formInput.brandAssets, logoUrl: undefined } })}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-all w-24 border border-[#E2E8F0]"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-[#E2E8F0] bg-white hover:border-[#0052FF] hover:bg-[#EEF3FF] transition-all text-[#64748B] hover:text-[#0052FF] gap-1.5 shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[12px] font-bold">Upload Brand Logo</span>
                  </button>
                )}
              </div>

              {/* Color Palette */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Color Palette</label>
                  <span className="text-[10px] font-bold text-[#64748B] bg-[#F4F6FA] px-1.5 py-0.5 rounded-md">Max 5</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F4F6FA] rounded-xl border border-[#E2E8F0] inset-shadow-sm">
                  {formInput.brandAssets.colorPalette.map((color, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="w-10 h-10 rounded-full border border-white shadow-sm overflow-hidden relative cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleUpdateColor(index, e.target.value)}
                          className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                        />
                      </div>
                      {formInput.brandAssets.colorPalette.length > 1 && (
                        <button
                          onClick={() => handleRemoveColor(index)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#64748B] hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formInput.brandAssets.colorPalette.length < 5 && (
                    <button
                      onClick={handleAddColor}
                      className="w-10 h-10 rounded-full border border-dashed border-[#A0AABF] bg-white flex items-center justify-center text-[#64748B] hover:text-[#0052FF] hover:border-[#0052FF] hover:bg-[#EEF3FF] shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <SelectField
                  label="Primary Font"
                  value={formInput.brandAssets.fontFamily ?? "Montserrat"}
                  onChange={(v) => updateInput({ brandAssets: { ...formInput.brandAssets, fontFamily: v } })}
                  options={fontOptions}
                  className="!mb-0"
                />
              </div>

              {/* Watermark */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Brand Watermark</label>
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ brandAssets: { ...formInput.brandAssets, watermark: !formInput.brandAssets.watermark } })
                  }
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    formInput.brandAssets.watermark ? "bg-[#0052FF]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      formInput.brandAssets.watermark ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* AI Image Model — shown when imageGenType is ai_background */}
          {formInput.imageGenType === "ai_background" && (
            <SelectField
              label="AI Image Model"
              value={formInput.imageModel ?? "gemini-2.5-flash-image"}
              onChange={(v) => updateInput({ imageModel: v as GeminiImageModel })}
              options={imageModelOptions}
            />
          )}

          {/* Image Size Picker */}
          {formInput.imageGenType === "ai_background" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Image Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {POST_IMAGE_SIZES.map((size) => {
                  const isSelected = (formInput.imageSize ?? "1080x1080") === size.id;
                  // Scale the aspect ratio preview box — max 36px on the longer side
                  const MAX = 36;
                  const previewW = size.width >= size.height ? MAX : Math.round(MAX * (size.width / size.height));
                  const previewH = size.height >= size.width ? MAX : Math.round(MAX * (size.height / size.width));
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => updateInput({ imageSize: size.id })}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-[#0052FF] bg-blue-50/50 shadow-[0_0_0_1px_#0052FF]"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {/* Aspect ratio preview box */}
                      <div className="flex items-center justify-center" style={{ width: MAX, height: MAX }}>
                        <div
                          className={`rounded-sm border-2 transition-colors ${
                            isSelected ? "border-[#0052FF] bg-[#0052FF]/10" : "border-gray-300 bg-gray-100"
                          }`}
                          style={{ width: previewW, height: previewH }}
                        />
                      </div>
                      {/* Label */}
                      <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? "text-[#0052FF]" : "text-gray-600"}`}>
                        {size.label}
                      </span>
                      {/* Pixel dims */}
                      <span className={`text-[9px] leading-tight ${isSelected ? "text-[#0052FF]/70" : "text-gray-400"}`}>
                        {size.width}×{size.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Advanced Settings Accordion */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-[#F4F6FA] hover:bg-[#EEF3FF] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#1A1D23] flex items-center justify-center flex-shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[13px] font-bold text-[#1A1D23]">Advanced Settings</span>
              </div>
              <div className="flex items-center gap-2">
                {advancedOpen && (
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                    Open
                  </span>
                )}
                {advancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                )}
              </div>
            </button>

            {advancedOpen && (
              <div className="px-4 py-5 space-y-0 border-t border-[#E2E8F0]">

                {/* Target Audience — multi-select pills */}
                <MultiSelectPills
                  label="Target Audience"
                  options={audienceOptions}
                  selected={formInput.targetAudiences}
                  onChange={(v) => updateInput({ targetAudiences: v as TargetAudience[] })}
                />
                {formInput.targetAudiences.includes("custom") && (
                  <div className="mb-4 -mt-2">
                    <input
                      type="text"
                      placeholder="Describe your specific audience..."
                      value={formInput.customAudience || ""}
                      onChange={(e) => updateInput({ customAudience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all bg-[#F4F6FA] text-sm font-medium text-[#1A1D23] placeholder-gray-400"
                    />
                  </div>
                )}

                {/* Content Angle — multi-select pills */}
                <MultiSelectPills
                  label="Content Angle"
                  options={contentAngleOptions.filter(o => o.value !== "")}
                  selected={formInput.contentAngles ?? []}
                  onChange={(v) => updateInput({ contentAngles: v.length ? v as ContentAngle[] : undefined })}
                />

                {/* Tone — multi-select pills */}
                <MultiSelectPills
                  label="Tone"
                  options={toneOptions}
                  selected={formInput.tones}
                  onChange={(v) => updateInput({ tones: v as ToneType[] })}
                />

                {/* CTA — multi-select pills */}
                <MultiSelectPills
                  label="Call to Action"
                  options={ctaOptions}
                  selected={formInput.ctas}
                  onChange={(v) => updateInput({ ctas: v as CTAType[] })}
                />

                {/* Emoji Level */}
                <SelectField
                  label="Emoji Level"
                  value={formInput.emojiLevel}
                  onChange={(v) => updateInput({ emojiLevel: v as IntensityLevel })}
                  options={intensityOptions}
                />

                {/* Hashtag Density */}
                <SelectField
                  label="Hashtag Density"
                  value={formInput.hashtagIntensity}
                  onChange={(v) => updateInput({ hashtagIntensity: v as IntensityLevel })}
                  options={intensityOptions}
                />

                {/* Brand Type */}
                <SelectField
                  label="Brand Type"
                  value={formInput.brandType}
                  onChange={(v) => updateInput({ brandType: v as BrandType })}
                  options={brandTypeOptions}
                />

                {/* Visual Style — multi-select pills */}
                <MultiSelectPills
                  label="Visual Style"
                  options={visualStyleOptions}
                  selected={formInput.visualStyles}
                  onChange={(v) => updateInput({ visualStyles: v as VisualStyle[] })}
                />

                {/* Image Gen Type */}
                <SelectField
                  label="Image Generation"
                  value={formInput.imageGenType}
                  onChange={(v) => updateInput({ imageGenType: v as ImageGenType })}
                  options={imageGenTypeOptions}
                />

              </div>
            )}
          </div>
        </div>

        {/* Generate Button — sticky at bottom */}
        <div className="px-5 py-5 border-t border-[#E2E8F0] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
          <button
            type="button"
            disabled={!canGenerate || view === "generating"}
            onClick={() => handleGenerate(formInput)}
            className={`relative overflow-hidden w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[14px] transition-all duration-300 ${
              canGenerate && view !== "generating"
                ? "bg-[#0052FF] text-white hover:bg-blue-700 shadow-[0_8px_20px_rgba(0,82,255,0.24)] hover:shadow-[0_12px_24px_rgba(0,82,255,0.32)] hover:-translate-y-0.5 group"
                : "bg-[#F4F6FA] text-[#A0AABF] cursor-not-allowed border border-[#E2E8F0]"
            }`}
          >
            {canGenerate && view !== "generating" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <Sparkles className={`w-4 h-4 ${canGenerate && view !== "generating" ? "text-[#AAFF50]" : ""}`} />
            <span>{view === "generating" ? "Generating Magic..." : "Generate Content"}</span>
            {canGenerate && view !== "generating" && (
              <div className="ml-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                <span className="translate-x-[0.5px]">→</span>
              </div>
            )}
          </button>
          {!canGenerate && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] font-semibold text-[#64748B]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A0AABF]" />
              <p>
                {formInput.coreMessage.trim().length === 0 
                  ? "Add a core message to enable generation" 
                  : "Select at least one platform"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Output ── */}
      <div className="flex-1 overflow-y-auto bg-[#E8ECF2]">
        {view === "idle" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
            {error ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0052FF] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Generation
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-5 shadow-sm">
                  <Wand2 className="w-8 h-8 text-[#0052FF]/40" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Ready when you are</h2>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  Configure your post brief on the left and hit Generate to create platform-optimized content.
                </p>
              </>
            )}
          </div>
        )}

        {view === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-8">
            <GenerationPipeline
              currentStage={getCurrentStageIndex()}
              stages={pipelineStages}
            />
          </div>
        )}

        {view === "output" && postPackage && (
          <div className="p-6">
            {(usedTemplateName || templateAICurated) && (
              <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
                <span className="text-base">📋</span>
                {usedTemplateName && (
                  <span className="text-sm font-bold text-[#1A1D23]">Used: {usedTemplateName}</span>
                )}
                {templateAICurated && (
                  <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[11px] font-bold rounded-full">✨ AI curated</span>
                )}
              </div>
            )}
            <OutputDashboard
              postPackage={{
                ...postPackage,
                hooks: hooks || undefined,
                contentScore: contentScore || undefined,
              }}
              input={lastInput ?? formInput}
              strategy={strategy ?? undefined}
              accountId={accountId}
              onRemix={handleRemix}
              onScoreRequest={handleScoreRequest}
              isRemixing={isRemixing}
              isScoring={isScoring}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <StylePickerModal
        open={styleModalOpen}
        onClose={() => setStyleModalOpen(false)}
        formInput={formInput}
        updateInput={updateInput}
      />
      <WritingStyleModal
        open={writingStyleModalOpen}
        onClose={() => setWritingStyleModalOpen(false)}
        formInput={formInput}
        updateInput={updateInput}
      />
    </div>
  );
}

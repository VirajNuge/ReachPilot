"use client";

import React, { useState } from "react";
import { Target, MessageSquare, LayoutGrid, User, FileText, Image, SlidersHorizontal, Type } from "lucide-react";
import type { 
  PostGenerationInput, 
  PostObjective, 
  TargetAudience, 
  ContentAngle, 
  PostPlatform,
  BrandType,
  VisualStyle,
  ToneType,
  CTAType,
  IntensityLevel,
} from "@/lib/types/postGeneration";
import { 
  POST_OBJECTIVE_LABELS, 
  TARGET_AUDIENCE_LABELS, 
  CONTENT_ANGLE_LABELS, 
  PLATFORM_DISPLAY 
} from "@/lib/types/postGeneration";

interface StepStrategyProps {
  input: PostGenerationInput;
  onChange: (updates: Partial<PostGenerationInput>) => void;
  accountId?: string;
}

const ALL_PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram_post", "facebook"];

// ── Persona → Wizard mapping helpers ────────────────────────────────────────

function deriveBrandType(userRole: string, industry: string): BrandType {
  if (["Agency"].includes(industry)) return "agency";
  if (["E-commerce"].includes(industry)) return "ecommerce";
  if (["Founder", "Executive"].includes(userRole) && ["SaaS", "Fintech", "EdTech"].includes(industry)) return "startup_saas";
  if (["Creator", "Coach", "Freelancer"].includes(userRole)) return "creator";
  if (["Marketer", "Sales Rep", "Consultant"].includes(userRole)) return "personal_brand";
  return "personal_brand";
}

function deriveTargetAudience(
  audienceRole: string | undefined,
  audienceSegments: string[] | undefined
): TargetAudience {
  const combined = ((audienceRole ?? "") + " " + (audienceSegments ?? []).join(" ")).toLowerCase();
  if (combined.includes("founder") || combined.includes("startup")) return "startup_founders";
  if (combined.includes("developer") || combined.includes("engineer")) return "developers";
  if (combined.includes("marketing") || combined.includes("agency")) return "marketing_agencies";
  if (combined.includes("real estate")) return "real_estate_buyers";
  if (audienceRole || (audienceSegments && audienceSegments.length > 0)) return "custom";
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
  brandArchetype: string | undefined,
  toneSliders: { formalCasual: number } | undefined
): VisualStyle {
  const a = (brandArchetype ?? "").toLowerCase();
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

function deriveCTA(conversionGoal: string | undefined): CTAType {
  if (!conversionGoal) return "none";
  if (conversionGoal.includes("call")) return "visit_link";
  if (conversionGoal.includes("newsletter") || conversionGoal.includes("lead magnet")) return "sign_up";
  if (conversionGoal.includes("Buy") || conversionGoal.includes("product")) return "visit_link";
  if (conversionGoal.includes("Follow")) return "follow_for_more";
  if (conversionGoal.includes("community") || conversionGoal.includes("Join")) return "comment_cta";
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

// ── Component ────────────────────────────────────────────────────────────────

export function StepStrategy({ input, onChange, accountId }: StepStrategyProps) {
  const [usePersonaImport, setUsePersonaImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handlePlatformToggle = (platform: PostPlatform) => {
    const current = input.platforms;
    if (current.includes(platform)) {
      onChange({ platforms: current.filter((p) => p !== platform) });
    } else {
      onChange({ platforms: [...current, platform] });
    }
  };

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

      // Step 1 fields
      updates.objective = deriveObjective(p.primaryObjective);
      const audience = deriveTargetAudience(p.audienceRole, p.audienceSegments);
      updates.targetAudience = audience;
      if (audience === "custom") {
        updates.customAudience = [p.audienceRole, ...(p.audienceSegments ?? [])]
          .filter(Boolean)
          .join(", ");
      }
      const angle = deriveContentAngle(p.contentMix);
      if (angle) updates.contentAngle = angle;

      // Step 2 fields
      updates.brandType = deriveBrandType(p.userRole ?? "", p.industry ?? "");
      updates.visualStyle = deriveVisualStyle(p.brandArchetype, p.toneSliders);
      const personaColors =
        p.colorPalette?.length ? p.colorPalette : p.brandColorHex ? [p.brandColorHex] : [];
      updates.brandAssets = {
        watermark: input.brandAssets.watermark,
        colorPalette: personaColors.length ? personaColors : input.brandAssets.colorPalette,
        fontFamily: p.fontFamily || input.brandAssets.fontFamily,
        logoUrl: p.logoUrl || input.brandAssets.logoUrl,
      };

      // Step 3 fields
      updates.tone = deriveTone(p.toneSliders);
      updates.cta = deriveCTA(p.conversionGoal);
      updates.emojiLevel = deriveEmojiLevel(p.emojiUsage);

      onChange(updates);
      setImportStatus(`Imported ${Object.keys(updates).length} fields from persona`);
    } catch {
      setImportStatus("Failed to import persona");
    } finally {
      setIsImporting(false);
    }
  };

  const postText = input.postText ?? {};

  return (
    <div className="space-y-8">

      {/* Persona Import — top of Step 1 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-[#0052FF]/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#0052FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Import from Persona</h3>
              <p className="text-xs text-gray-500 mt-0.5">Auto-fill all fields from your saved Persona Builder</p>
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
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
            Importing from persona...
          </p>
        )}
        {importStatus && !isImporting && (
          <p className={`text-xs mt-3 font-medium ${
            importStatus.startsWith("Imported") ? "text-green-600" :
            importStatus.includes("found") || importStatus.includes("first") ? "text-amber-600" :
            "text-red-500"
          }`}>
            {importStatus}
          </p>
        )}
        {/* Preview imported brand assets */}
        {usePersonaImport && !isImporting && importStatus?.startsWith("Imported") && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-white/60 rounded-xl flex-wrap">
            {input.brandAssets.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={input.brandAssets.logoUrl}
                alt="Brand logo"
                className="w-9 h-9 object-contain rounded-lg bg-white border border-gray-200 p-1"
              />
            )}
            <div className="flex items-center gap-1.5">
              {input.brandAssets.colorPalette.map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            {input.brandAssets.fontFamily && (
              <span
                className="text-xs font-semibold text-gray-500"
                style={{ fontFamily: input.brandAssets.fontFamily }}
              >
                {input.brandAssets.fontFamily}
              </span>
            )}
          </div>
        )}
      </section>

      {/* Post Objective */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">What is the goal of this post?</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(POST_OBJECTIVE_LABELS) as [PostObjective, { label: string; emoji: string }][]).map(([key, { label, emoji }]) => {
            const isSelected = input.objective === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ objective: key })}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className="text-2xl mb-2">{emoji}</span>
                <span className={`text-xs font-bold text-center ${isSelected ? "text-[#0052FF]" : "text-gray-700"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target Audience */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Who are you talking to?</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(TARGET_AUDIENCE_LABELS) as [TargetAudience, string][]).map(([key, label]) => {
            const isSelected = input.targetAudience === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ targetAudience: key })}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                  isSelected
                    ? "bg-gray-800 text-white border-gray-800 shadow-md transform scale-105"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        
        {input.targetAudience === "custom" && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <input
              type="text"
              placeholder="Describe your specific audience..."
              value={input.customAudience || ""}
              onChange={(e) => onChange({ customAudience: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white shadow-sm text-sm"
            />
          </div>
        )}
      </section>

      {/* Core Message */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0052FF]" />
            <h3 className="text-sm font-bold text-gray-800">What is the core message? <span className="text-red-500">*</span></h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {input.coreMessage.length} chars
          </span>
        </div>
        <textarea
          value={input.coreMessage}
          onChange={(e) => onChange({ coreMessage: e.target.value })}
          placeholder="Describe your post idea... e.g., Launching our AI scheduler that helps agencies manage Twitter faster"
          className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white shadow-sm resize-none text-sm"
        />
      </section>

      {/* Post Text Overrides */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Post Text <span className="text-xs font-normal text-gray-400 ml-1">— Optional. Specify exact text to include.</span></h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
            <input
              type="text"
              placeholder="Main headline..."
              value={postText.title ?? ""}
              onChange={(e) => onChange({ postText: { ...postText, title: e.target.value || undefined } })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Subtitle</label>
            <input
              type="text"
              placeholder="Supporting line..."
              value={postText.subtitle ?? ""}
              onChange={(e) => onChange({ postText: { ...postText, subtitle: e.target.value || undefined } })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Caption</label>
            <textarea
              placeholder="The social caption to use or base on..."
              value={postText.caption ?? ""}
              onChange={(e) => onChange({ postText: { ...postText, caption: e.target.value || undefined } })}
              className="w-full h-20 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Body Text</label>
            <textarea
              placeholder="Longer body copy, key points, or paragraphs to include..."
              value={postText.bodyText ?? ""}
              onChange={(e) => onChange({ postText: { ...postText, bodyText: e.target.value || undefined } })}
              className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm resize-none"
            />
          </div>
        </div>
      </section>

      {/* Image Brief */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Image Brief <span className="text-xs font-normal text-gray-400 ml-1">— Optional. Guide the image generation.</span></h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image Concept</label>
            <textarea
              placeholder="Describe the visual you have in mind... e.g., A professional woman looking at a glowing dashboard in a modern office"
              value={input.imageConcept ?? ""}
              onChange={(e) => onChange({ imageConcept: e.target.value || undefined })}
              className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image References / Subjects</label>
            <input
              type="text"
              placeholder="Names, objects, people, or elements to include... e.g., John Smith CEO, Acme logo, Tesla Model S"
              value={input.imageReferences ?? ""}
              onChange={(e) => onChange({ imageReferences: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm"
            />
          </div>
        </div>
      </section>

      {/* Generation Focus */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Generation Focus</h3>
        </div>
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1">
          {(["caption", "balanced", "image"] as const).map((focus) => {
            const isActive = (input.generationFocus ?? "balanced") === focus;
            const icons = {
              caption: <FileText className="w-4 h-4" />,
              balanced: <LayoutGrid className="w-4 h-4" />,
              image: <Image className="w-4 h-4" />,
            };
            const labels = {
              caption: "Caption First",
              balanced: "Balanced",
              image: "Image First",
            };
            const descriptions = {
              caption: "Prioritize text quality",
              balanced: "Equal weight to both",
              image: "Prioritize visual output",
            };
            return (
              <button
                key={focus}
                type="button"
                onClick={() => onChange({ generationFocus: focus })}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-[#0052FF] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className={isActive ? "text-[#0052FF]" : "text-gray-400"}>{icons[focus]}</span>
                <span className="text-[12px] font-bold">{labels[focus]}</span>
                <span className="text-[10px] font-normal text-gray-400 hidden sm:block">{descriptions[focus]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Content Angle */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Content Angle <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        <div className="flex overflow-x-auto pb-4 -mx-2 px-2 hide-scrollbar gap-2">
          {(Object.entries(CONTENT_ANGLE_LABELS) as [ContentAngle, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.contentAngle === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ contentAngle: isSelected ? undefined : key })}
                title={desc}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                  isSelected
                    ? "bg-gray-800 text-white border-gray-800 shadow-md transform scale-105"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Platforms */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Where are you posting? <span className="text-red-500">*</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_PLATFORMS.map((platform) => {
            const isSelected = input.platforms.includes(platform);
            const { label, color } = PLATFORM_DISPLAY[platform];
            return (
              <button
                key={platform}
                onClick={() => handlePlatformToggle(platform)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: color }}
                />
                <span className={`text-sm font-bold ${isSelected ? "text-[#0052FF]" : "text-gray-700"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

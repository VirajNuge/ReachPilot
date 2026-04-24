"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, AlertTriangle, CheckCircle2, Settings2, Palette, PenLine, Target, Layers, Linkedin, Eye, FileText, Zap } from "lucide-react";
import type { PostGenerationInput, PostObjective, TargetAudience, PostPlatform, BrandType, VisualStyle, ImageGenType, ToneType, CTAType, IntensityLevel, CaptionStylePreference, LinkedInPostType, LinkedInStyleProfile, ContentAngle } from "@/lib/types/postGeneration";
import { POST_OBJECTIVE_LABELS, TARGET_AUDIENCE_LABELS, BRAND_TYPE_LABELS, VISUAL_STYLE_LABELS, IMAGE_GEN_TYPE_LABELS, TONE_LABELS, CTA_LABELS, CAPTION_STYLE_LABELS, PLATFORM_DISPLAY, LINKEDIN_POST_TYPE_LABELS, LINKEDIN_STYLE_PROFILE_LABELS, CONTENT_ANGLE_LABELS } from "@/lib/types/postGeneration";
import { validatePostSeed } from "@/lib/ideaFinder/postSeedValidation";

interface PostSeedPanelProps {
  postSeed: PostGenerationInput;
  onChange: (updated: PostGenerationInput) => void;
  onReset: () => void;
}

// ── Tiny pill selector ───────────────────────────────────────────────
function PillSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${value === o.value ? "bg-[#0052FF] text-white border-[#0052FF]" : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/40 hover:text-[#0052FF]"}`}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function MultiPill<T extends string>({ label, selected, options, onChange }: { label: string; selected: T[]; options: { value: T; label: string }[]; onChange: (v: T[]) => void }) {
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => toggle(o.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${selected.includes(o.value) ? "bg-[#0052FF] text-white border-[#0052FF]" : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/40 hover:text-[#0052FF]"}`}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-[#0052FF]" strokeWidth={2.5} />
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}

export default function PostSeedPanel({ postSeed, onChange, onReset }: PostSeedPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const validation = validatePostSeed(postSeed);
  const errorCount = validation.errors.filter((e) => e.severity === "error").length;
  const warnCount = validation.errors.filter((e) => e.severity === "warning").length;

  const update = (patch: Partial<PostGenerationInput>) => onChange({ ...postSeed, ...patch });
  const updateAssets = (patch: Partial<PostGenerationInput["brandAssets"]>) => onChange({ ...postSeed, brandAssets: { ...postSeed.brandAssets, ...patch } });

  const showLinkedIn = postSeed.platforms?.includes("linkedin");

  return (
    <div className="space-y-1">
      {/* Validation Status */}
      <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 border ${validation.valid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        {validation.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
        <span className={`text-[12px] font-bold ${validation.valid ? "text-emerald-700" : "text-amber-700"}`}>
          {validation.valid ? "All required fields present" : `${errorCount} required field${errorCount !== 1 ? "s" : ""} missing${warnCount > 0 ? `, ${warnCount} warning${warnCount !== 1 ? "s" : ""}` : ""}`}
        </span>
        <button type="button" onClick={onReset} className="ml-auto text-[10px] font-bold text-slate-400 hover:text-[#0052FF] flex items-center gap-1 transition-colors" title="Reset to derived defaults">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Strategy Core */}
      <Section icon={Target} title="Strategy Core">
        <PillSelect<PostObjective> label="Objective" value={postSeed.objective} onChange={(v) => update({ objective: v })}
          options={Object.entries(POST_OBJECTIVE_LABELS).map(([k, v]) => ({ value: k as PostObjective, label: `${v.emoji} ${v.label}` }))} />
        <MultiPill<TargetAudience> label="Target Audiences" selected={postSeed.targetAudiences} onChange={(v) => update({ targetAudiences: v })}
          options={Object.entries(TARGET_AUDIENCE_LABELS).map(([k, v]) => ({ value: k as TargetAudience, label: v }))} />
        <div className="mb-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Core Message</label>
          <textarea value={postSeed.coreMessage} onChange={(e) => update({ coreMessage: e.target.value })} rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-medium text-slate-700 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none resize-none" />
        </div>
        <MultiPill<PostPlatform> label="Platforms" selected={postSeed.platforms} onChange={(v) => update({ platforms: v })}
          options={Object.entries(PLATFORM_DISPLAY).map(([k, v]) => ({ value: k as PostPlatform, label: v.label }))} />
      </Section>

      {/* Creative Base */}
      <Section icon={Palette} title="Creative Base">
        <PillSelect<BrandType> label="Brand Type" value={postSeed.brandType} onChange={(v) => update({ brandType: v })}
          options={Object.entries(BRAND_TYPE_LABELS).map(([k, v]) => ({ value: k as BrandType, label: v }))} />
        <MultiPill<VisualStyle> label="Visual Styles" selected={postSeed.visualStyles} onChange={(v) => update({ visualStyles: v })}
          options={Object.entries(VISUAL_STYLE_LABELS).map(([k, v]) => ({ value: k as VisualStyle, label: v.label }))} />
        <PillSelect<ImageGenType> label="Image Type" value={postSeed.imageGenType} onChange={(v) => update({ imageGenType: v })}
          options={Object.entries(IMAGE_GEN_TYPE_LABELS).map(([k, v]) => ({ value: k as ImageGenType, label: v.label }))} />
        <div className="mb-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand Colors</label>
          <div className="flex items-center gap-2">
            {postSeed.brandAssets.colorPalette.map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: c }} title={c} />
            ))}
            <label className="flex items-center gap-1.5 ml-3 text-[11px] font-bold text-slate-500">
              <input type="checkbox" checked={postSeed.brandAssets.watermark} onChange={(e) => updateAssets({ watermark: e.target.checked })} className="rounded" />
              Watermark
            </label>
          </div>
        </div>
        {/* Font selection */}
        <div className="mb-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Font Family</label>
          <select
            value={postSeed.brandAssets.fontFamily ?? "Inter"}
            onChange={(e) => updateAssets({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-medium text-slate-700 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none bg-white"
          >
            <option value="Inter">Inter (Sans-serif)</option>
            <option value="Montserrat">Montserrat (Sans-serif)</option>
            <option value="Poppins">Poppins (Sans-serif)</option>
            <option value="Roboto">Roboto (Sans-serif)</option>
            <option value="Playfair Display">Playfair Display (Serif)</option>
            <option value="Space Grotesk">Space Grotesk (Display)</option>
            <option value="Open Sans">Open Sans (Sans-serif)</option>
            <option value="Lato">Lato (Sans-serif)</option>
          </select>
        </div>
      </Section>

      {/* Writing Controls */}
      <Section icon={PenLine} title="Writing Controls">
        <MultiPill<ToneType> label="Tones" selected={postSeed.tones} onChange={(v) => update({ tones: v })}
          options={Object.entries(TONE_LABELS).map(([k, v]) => ({ value: k as ToneType, label: v.label }))} />
        <MultiPill<CTAType> label="Call to Action" selected={postSeed.ctas} onChange={(v) => update({ ctas: v })}
          options={Object.entries(CTA_LABELS).map(([k, v]) => ({ value: k as CTAType, label: v }))} />
        <div className="flex gap-4">
          <PillSelect<IntensityLevel> label="Emoji Level" value={postSeed.emojiLevel} onChange={(v) => update({ emojiLevel: v })}
            options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
          <PillSelect<IntensityLevel> label="Hashtag Intensity" value={postSeed.hashtagIntensity} onChange={(v) => update({ hashtagIntensity: v })}
            options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
        </div>
      </Section>

      {/* Text Blocks (Content derived from idea) */}
      {postSeed.textBlocks && postSeed.textBlocks.length > 0 && (
        <Section icon={FileText} title="Text Blocks">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {postSeed.textBlocks.map((block) => (
              <div key={block.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black text-[#0052FF] uppercase tracking-wider bg-[#0052FF]/10 px-1.5 py-0.5 rounded">{block.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{block.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Content Angles (detected from idea) */}
      {postSeed.contentAngles && postSeed.contentAngles.length > 0 && (
        <Section icon={Zap} title="Content Angles">
          <div className="flex flex-wrap gap-1.5">
            {postSeed.contentAngles.map((angle, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20">
                {angle}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Generation Focus - NOT in advanced anymore */}
      <Section icon={Zap} title="Generation Priority">
        <PillSelect<"caption" | "balanced" | "image"> label="Focus" value={postSeed.generationFocus ?? "balanced"} onChange={(v) => update({ generationFocus: v })}
          options={[
            { value: "caption", label: "Caption Writing" },
            { value: "balanced", label: "Balanced" },
            { value: "image", label: "Image Generation" },
          ]} />
      </Section>

      {/* LinkedIn (conditional) */}
      {showLinkedIn && (
        <Section icon={Linkedin} title="LinkedIn Optimization">
          <PillSelect<LinkedInPostType> label="Post Type" value={postSeed.linkedInPostType ?? "insight"} onChange={(v) => update({ linkedInPostType: v })}
            options={Object.entries(LINKEDIN_POST_TYPE_LABELS).map(([k, v]) => ({ value: k as LinkedInPostType, label: `${v.emoji} ${v.label}` }))} />
          <PillSelect<LinkedInStyleProfile> label="Style Profile" value={postSeed.linkedInStyleProfile ?? "startup_founder"} onChange={(v) => update({ linkedInStyleProfile: v })}
            options={Object.entries(LINKEDIN_STYLE_PROFILE_LABELS).map(([k, v]) => ({ value: k as LinkedInStyleProfile, label: v.label }))} />
        </Section>
      )}

      {/* Advanced (collapsible) */}
      <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-colors mb-3">
        <span className="flex items-center gap-2"><Settings2 size={12} /> Advanced Inputs</span>
        {advancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {advancedOpen && (
        <div className="pl-1 space-y-1">
          <PillSelect<CaptionStylePreference> label="Caption Style" value={postSeed.captionStyle ?? "auto"} onChange={(v) => update({ captionStyle: v })}
            options={Object.entries(CAPTION_STYLE_LABELS).map(([k, v]) => ({ value: k as CaptionStylePreference, label: v.label }))} />
          <div className="mb-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Image Concept</label>
            <textarea value={postSeed.imageConcept ?? ""} onChange={(e) => update({ imageConcept: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-medium text-slate-700 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 outline-none resize-none" placeholder="Describe the visual concept..." />
          </div>
        </div>
      )}
    </div>
  );
}

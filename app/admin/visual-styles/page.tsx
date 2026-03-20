"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Palette, X, Shield, Upload, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Inline types (no lib imports) ──────────────────────────────────────── */

interface VisualStyle {
  _id: string;
  name: string;
  description: string;
  colorPalette: string[];
  primaryColor: string;
  fontFamily: string;
  fontHeadingWeight: string;
  imageStyle: string;
  lightingDirection: string;
  shadingStyle: string;
  compositionPreference: string;
  textStylePreference: string;
  colorThemePreset: string;
  layoutStyle: string;
  brandType: string;
  mood: string;
  tags: string[];
  thumbnailBg: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VisualStyleOption {
  _id: string;
  tab: "imageStyle" | "lighting" | "shading" | "composition" | "textStyle" | "colorTheme";
  value: string;
  label: string;
  description: string;
  referenceImageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

type PageTab = "presets" | "options";

const IMAGE_STYLES = ["photorealistic","minimalist","3d_render","flat_illustration","watercolor","cyberpunk","retro_vintage","pop_art","abstract","line_art","collage"];
const LIGHTING_DIRECTIONS = ["natural","studio","dramatic","golden_hour","neon_glow","backlit","soft_diffused","rim_light","low_key"];
const COMPOSITION_PREFS = ["rule_of_thirds","centered","asymmetric","diagonal","frame_within_frame","leading_lines","golden_ratio","negative_space"];
const LAYOUT_STYLES = ["hero_center","top_headline","split_layout","bottom_overlay","minimal_card"];
const BRAND_TYPES = ["personal_brand","startup_saas","agency","ecommerce","corporate","creator"];
const FONT_WEIGHTS = ["400","600","700","800","900"];
const SHADING_STYLES = ["soft","hard","flat","gradient","cel_shaded","painterly","none"];
const TEXT_STYLE_PREFS = ["clean_sans","serif_editorial","handwritten","bold_display","mono_tech","none"];
const COLOR_THEME_PRESETS = ["brand_colors","monochrome","earth_tones","neon_vibrant","pastel_soft","dark_dramatic","none"];
const OPTION_TABS: VisualStyleOption["tab"][] = ["imageStyle","lighting","shading","composition","textStyle","colorTheme"];
const TAB_LABELS: Record<VisualStyleOption["tab"], string> = {
  imageStyle: "Image Style",
  lighting: "Lighting",
  shading: "Shading",
  composition: "Composition",
  textStyle: "Text Style",
  colorTheme: "Color Theme",
};

const EMPTY_PRESET_FORM = {
  name: "", description: "",
  primaryColor: "#0052FF", colorPalette: ["#0052FF"] as string[], thumbnailBg: "#F8F9FC",
  fontFamily: "Inter", fontHeadingWeight: "700",
  imageStyle: "minimalist", lightingDirection: "natural", shadingStyle: "soft",
  compositionPreference: "rule_of_thirds", textStylePreference: "clean_sans",
  colorThemePreset: "brand_colors", layoutStyle: "hero_center",
  brandType: "personal_brand", mood: "", tags: [] as string[],
  sortOrder: 0, isActive: true,
};

const EMPTY_OPTION_FORM = {
  tab: "imageStyle" as VisualStyleOption["tab"],
  value: "", label: "", description: "",
  referenceImageUrl: "", sortOrder: 0, isActive: true,
};

/* ─── Shared components ──────────────────────────────────────────────────── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${checked ? "bg-[#0052FF]" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0" style={{ backgroundColor: value }}>
        <input
          type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors uppercase"
        maxLength={7}
      />
    </div>
  );
}

function prettify(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function VisualStylesPage() {
  const router = useRouter();
  const [pageTab, setPageTab] = useState<PageTab>("presets");

  /* --- Presets state --- */
  const [styles, setStyles] = useState<VisualStyle[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [presetError, setPresetError] = useState("");
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<VisualStyle | null>(null);
  const [presetForm, setPresetForm] = useState(EMPTY_PRESET_FORM);
  const [tagInput, setTagInput] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetFormError, setPresetFormError] = useState("");

  /* --- Style Options state --- */
  const [options, setOptions] = useState<VisualStyleOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionError, setOptionError] = useState("");
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<VisualStyleOption | null>(null);
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION_FORM);
  const [savingOption, setSavingOption] = useState(false);
  const [optionFormError, setOptionFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterTab, setFilterTab] = useState<VisualStyleOption["tab"] | "all">("all");

  /* ─── Fetch Presets ─────────────────────────────────────────────────────── */

  const fetchPresets = useCallback(async () => {
    setLoadingPresets(true);
    setPresetError("");
    try {
      const res = await fetch("/api/admin/visual-styles", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load visual styles");
      const data = await res.json();
      setStyles(data.styles);
    } catch (e) {
      setPresetError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoadingPresets(false);
    }
  }, [router]);

  /* ─── Fetch Options ─────────────────────────────────────────────────────── */

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionError("");
    try {
      const res = await fetch("/api/admin/visual-style-options", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load style options");
      const data = await res.json();
      setOptions(data.options);
    } catch (e) {
      setOptionError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoadingOptions(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPresets();
    fetchOptions();
  }, [fetchPresets, fetchOptions]);

  /* ─── Preset CRUD helpers ──────────────────────────────────────────────── */

  const openAddPreset = () => {
    setEditingPreset(null);
    setPresetForm(EMPTY_PRESET_FORM);
    setTagInput("");
    setPresetFormError("");
    setPresetModalOpen(true);
  };

  const openEditPreset = (style: VisualStyle) => {
    setEditingPreset(style);
    setPresetForm({
      name: style.name,
      description: style.description,
      primaryColor: style.primaryColor,
      colorPalette: [...style.colorPalette],
      thumbnailBg: style.thumbnailBg,
      fontFamily: style.fontFamily,
      fontHeadingWeight: style.fontHeadingWeight,
      imageStyle: style.imageStyle,
      lightingDirection: style.lightingDirection,
      shadingStyle: style.shadingStyle || "soft",
      compositionPreference: style.compositionPreference,
      textStylePreference: style.textStylePreference || "clean_sans",
      colorThemePreset: style.colorThemePreset || "brand_colors",
      layoutStyle: style.layoutStyle,
      brandType: style.brandType,
      mood: style.mood,
      tags: [...style.tags],
      sortOrder: style.sortOrder ?? 0,
      isActive: style.isActive,
    });
    setTagInput("");
    setPresetFormError("");
    setPresetModalOpen(true);
  };

  const handleDeletePreset = async (id: string, name: string) => {
    if (!window.confirm(`Delete visual style "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/visual-styles/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      fetchPresets();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSubmitPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreset(true);
    setPresetFormError("");
    try {
      const url = editingPreset ? `/api/admin/visual-styles/${editingPreset._id}` : "/api/admin/visual-styles";
      const method = editingPreset ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(presetForm),
      });
      const data = await res.json();
      if (!res.ok) { setPresetFormError(data.error || "Save failed"); return; }
      setPresetModalOpen(false);
      fetchPresets();
    } catch (e) {
      setPresetFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingPreset(false);
    }
  };

  const addColor = () => {
    if (presetForm.colorPalette.length < 6) setPresetForm(f => ({ ...f, colorPalette: [...f.colorPalette, "#000000"] }));
  };
  const removeColor = (idx: number) => setPresetForm(f => ({ ...f, colorPalette: f.colorPalette.filter((_, i) => i !== idx) }));
  const updateColor = (idx: number, val: string) => setPresetForm(f => ({ ...f, colorPalette: f.colorPalette.map((c, i) => i === idx ? val : c) }));

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!presetForm.tags.includes(tagInput.trim())) setPresetForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => setPresetForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  /* ─── Option CRUD helpers ──────────────────────────────────────────────── */

  const openAddOption = () => {
    setEditingOption(null);
    setOptionForm(EMPTY_OPTION_FORM);
    setOptionFormError("");
    setOptionModalOpen(true);
  };

  const openEditOption = (opt: VisualStyleOption) => {
    setEditingOption(opt);
    setOptionForm({
      tab: opt.tab,
      value: opt.value,
      label: opt.label,
      description: opt.description,
      referenceImageUrl: opt.referenceImageUrl,
      sortOrder: opt.sortOrder,
      isActive: opt.isActive,
    });
    setOptionFormError("");
    setOptionModalOpen(true);
  };

  const handleDeleteOption = async (id: string, label: string) => {
    if (!window.confirm(`Delete style option "${label}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/visual-style-options/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      fetchOptions();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOption(true);
    setOptionFormError("");
    try {
      const url = editingOption ? `/api/admin/visual-style-options/${editingOption._id}` : "/api/admin/visual-style-options";
      const method = editingOption ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(optionForm),
      });
      const data = await res.json();
      if (!res.ok) { setOptionFormError(data.error || "Save failed"); return; }
      setOptionModalOpen(false);
      fetchOptions();
    } catch (e) {
      setOptionFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingOption(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/visual-styles/upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setOptionForm(f => ({ ...f, referenceImageUrl: data.url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ─── Filtered options ─────────────────────────────────────────────────── */

  const filteredOptions = filterTab === "all" ? options : options.filter(o => o.tab === filterTab);

  /* ─── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Top Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Visual Styles</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">Visual Styles</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={pageTab === "presets" ? openAddPreset : openAddOption}
            className="flex items-center gap-2 px-4 py-2 bg-[#0052FF] hover:bg-[#0047FF] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer border-none shadow-[0_4px_14px_rgba(0,82,255,0.2)]"
          >
            <Plus size={15} /> {pageTab === "presets" ? "Add Preset" : "Add Option"}
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Shield size={14} className="text-[#0052FF]" />
            <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
          </div>
        </div>
      </header>

      {/* Page Tabs */}
      <div className="flex gap-1 px-8 pt-4 bg-[#F8F9FC] border-b border-slate-100 flex-shrink-0">
        {([
          { key: "presets" as PageTab, label: "Presets", count: styles.length },
          { key: "options" as PageTab, label: "Style Options", count: options.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setPageTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-[13px] font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
              pageTab === t.key
                ? "border-[#0052FF] text-[#0052FF] bg-white"
                : "border-transparent text-slate-500 hover:text-[#1A1D23] hover:bg-white/60"
            }`}
          >
            {t.label}
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              pageTab === t.key ? "bg-[#0052FF]/10 text-[#0052FF]" : "bg-slate-200 text-slate-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────── PRESETS TAB ──────────────────────────── */}
      {pageTab === "presets" && (
        <div className="flex-1 overflow-y-auto p-8">
          <p className="text-[15px] text-slate-500 font-medium mb-8">Manage visual style presets for AI image generation</p>

          {presetError ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-semibold">{presetError}</p>
              <button onClick={fetchPresets} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">Retry</button>
            </div>
          ) : loadingPresets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                  <div className="h-16 bg-slate-200" />
                  <div className="p-5">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : styles.length === 0 ? (
            <div className="text-center py-20">
              <Palette size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-[16px] font-bold text-slate-400">No visual styles yet</p>
              <p className="text-[13px] text-slate-400 mt-1">Create your first visual style preset</p>
              <button onClick={openAddPreset} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white text-[14px] font-bold rounded-xl mx-auto cursor-pointer border-none hover:bg-[#0047FF] transition-colors">
                <Plus size={16} /> Add Style
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((style) => (
                <div key={style._id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="h-14 flex" style={{ backgroundColor: style.thumbnailBg }}>
                    {style.colorPalette.slice(0, 6).map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-black text-[#1A1D23]">{style.name}</h3>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        </div>
                        <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{style.description}</p>
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button onClick={() => openEditPreset(style)} className="p-1.5 text-slate-400 hover:text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"><Pencil size={14} /></button>
                        <button onClick={() => handleDeletePreset(style._id, style.name)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {style.mood && (
                        <span className="px-2.5 py-1 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[11px] font-bold capitalize">{style.mood}</span>
                      )}
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">{prettify(style.imageStyle)}</span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold">{style.fontFamily}</span>
                      {style.sortOrder > 0 && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[11px] font-bold">#{style.sortOrder}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────── OPTIONS TAB ─────────────────────────── */}
      {pageTab === "options" && (
        <div className="flex-1 overflow-y-auto p-8">
          <p className="text-[15px] text-slate-500 font-medium mb-4">Manage individual style options shown in the visual style picker</p>

          {/* Filter by tab */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                filterTab === "all"
                  ? "bg-[#0052FF] text-white border-[#0052FF]"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/40 hover:text-[#0052FF]"
              }`}
            >
              All ({options.length})
            </button>
            {OPTION_TABS.map(t => {
              const count = options.filter(o => o.tab === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setFilterTab(t)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                    filterTab === t
                      ? "bg-[#0052FF] text-white border-[#0052FF]"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/40 hover:text-[#0052FF]"
                  }`}
                >
                  {TAB_LABELS[t]} ({count})
                </button>
              );
            })}
          </div>

          {optionError ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-semibold">{optionError}</p>
              <button onClick={fetchOptions} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">Retry</button>
            </div>
          ) : loadingOptions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse h-32" />
              ))}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-[16px] font-bold text-slate-400">No style options yet</p>
              <p className="text-[13px] text-slate-400 mt-1">Create your first style option with a reference image</p>
              <button onClick={openAddOption} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white text-[14px] font-bold rounded-xl mx-auto cursor-pointer border-none hover:bg-[#0047FF] transition-colors">
                <Plus size={16} /> Add Option
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOptions.map((opt) => (
                <div key={opt._id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                  {/* Reference image thumbnail */}
                  {opt.referenceImageUrl ? (
                    <div className="h-32 bg-slate-100 overflow-hidden">
                      <img src={opt.referenceImageUrl} alt={opt.label} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                      <ImageIcon size={24} className="text-slate-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[10px] font-bold">
                          {TAB_LABELS[opt.tab]}
                        </span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEditOption(opt)} className="p-1.5 text-slate-400 hover:text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteOption(opt._id, opt.label)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <h3 className="text-[14px] font-black text-[#1A1D23]">{opt.label}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{opt.description}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1.5">{opt.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────── PRESET MODAL ────────────────────────── */}
      <AnimatePresence>
        {presetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setPresetModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
                <h2 className="text-[20px] font-black text-[#1A1D23]">
                  {editingPreset ? "Edit Visual Style" : "Add Visual Style"}
                </h2>
                <button onClick={() => setPresetModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-xl hover:bg-slate-50"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmitPreset} className="px-8 py-6 space-y-6">
                {presetFormError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-[13px] font-semibold text-red-600">{presetFormError}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Style Name *</label>
                  <input type="text" required value={presetForm.name} onChange={(e) => setPresetForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Dark Luxury, Minimal Corporate..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
                  <textarea required rows={2} value={presetForm.description} onChange={(e) => setPresetForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Briefly describe this visual style..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors resize-none"
                  />
                </div>

                {/* Primary Color */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Color</label>
                  <ColorInput value={presetForm.primaryColor} onChange={(v) => setPresetForm(f => ({ ...f, primaryColor: v }))} />
                </div>

                {/* Color Palette */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Color Palette (up to 6)</label>
                    {presetForm.colorPalette.length < 6 && (
                      <button type="button" onClick={addColor} className="text-[12px] font-bold text-[#0052FF] hover:text-[#0047FF] bg-transparent border-none cursor-pointer">+ Add</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {presetForm.colorPalette.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <ColorInput value={c} onChange={(v) => updateColor(i, v)} />
                        <button type="button" onClick={() => removeColor(i)} className="p-1.5 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer rounded-lg hover:bg-red-50 transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Bg */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Card Background Color</label>
                  <ColorInput value={presetForm.thumbnailBg} onChange={(v) => setPresetForm(f => ({ ...f, thumbnailBg: v }))} />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sort Order</label>
                  <input type="number" value={presetForm.sortOrder} onChange={(e) => setPresetForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="block w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Font */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Font Family</label>
                    <input type="text" value={presetForm.fontFamily} onChange={(e) => setPresetForm(f => ({ ...f, fontFamily: e.target.value }))}
                      placeholder="Inter, Montserrat..."
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Heading Weight</label>
                    <select value={presetForm.fontHeadingWeight} onChange={(e) => setPresetForm(f => ({ ...f, fontHeadingWeight: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                {/* Style Selects */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Image Style</label>
                    <select value={presetForm.imageStyle} onChange={(e) => setPresetForm(f => ({ ...f, imageStyle: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {IMAGE_STYLES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lighting</label>
                    <select value={presetForm.lightingDirection} onChange={(e) => setPresetForm(f => ({ ...f, lightingDirection: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {LIGHTING_DIRECTIONS.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Shading Style</label>
                    <select value={presetForm.shadingStyle} onChange={(e) => setPresetForm(f => ({ ...f, shadingStyle: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {SHADING_STYLES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Composition</label>
                    <select value={presetForm.compositionPreference} onChange={(e) => setPresetForm(f => ({ ...f, compositionPreference: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {COMPOSITION_PREFS.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Text Style</label>
                    <select value={presetForm.textStylePreference} onChange={(e) => setPresetForm(f => ({ ...f, textStylePreference: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {TEXT_STYLE_PREFS.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Color Theme</label>
                    <select value={presetForm.colorThemePreset} onChange={(e) => setPresetForm(f => ({ ...f, colorThemePreset: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {COLOR_THEME_PRESETS.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Layout Style</label>
                    <select value={presetForm.layoutStyle} onChange={(e) => setPresetForm(f => ({ ...f, layoutStyle: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {LAYOUT_STYLES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Brand Type</label>
                    <select value={presetForm.brandType} onChange={(e) => setPresetForm(f => ({ ...f, brandType: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      {BRAND_TYPES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mood</label>
                    <input type="text" value={presetForm.mood} onChange={(e) => setPresetForm(f => ({ ...f, mood: e.target.value }))}
                      placeholder="e.g. professional, bold..."
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {presetForm.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[12px] font-bold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="bg-transparent border-none cursor-pointer text-[#0052FF] hover:text-red-500 p-0 ml-0.5"><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                    placeholder="Type a tag and press Enter..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1D23]">Active</p>
                    <p className="text-[12px] text-slate-400">Make this style available for selection</p>
                  </div>
                  <Toggle checked={presetForm.isActive} onChange={(v) => setPresetForm(f => ({ ...f, isActive: v }))} />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPresetModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={savingPreset}
                    className="flex-1 py-3 bg-[#0052FF] hover:bg-[#0047FF] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {savingPreset ? "Saving..." : editingPreset ? "Save Changes" : "Create Style"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────── OPTION MODAL ────────────────────────── */}
      <AnimatePresence>
        {optionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOptionModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
                <h2 className="text-[20px] font-black text-[#1A1D23]">
                  {editingOption ? "Edit Style Option" : "Add Style Option"}
                </h2>
                <button onClick={() => setOptionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-xl hover:bg-slate-50"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmitOption} className="px-8 py-6 space-y-5">
                {optionFormError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-[13px] font-semibold text-red-600">{optionFormError}</p>
                  </div>
                )}

                {/* Tab */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tab Category *</label>
                  <select value={optionForm.tab} onChange={(e) => setOptionForm(f => ({ ...f, tab: e.target.value as VisualStyleOption["tab"] }))}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                  >
                    {OPTION_TABS.map(t => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Value (machine key) *</label>
                  <input type="text" required value={optionForm.value} onChange={(e) => setOptionForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="e.g. photorealistic, neon_glow..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-mono font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display Label *</label>
                  <input type="text" required value={optionForm.label} onChange={(e) => setOptionForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Photorealistic, Neon Glow..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea rows={2} value={optionForm.description} onChange={(e) => setOptionForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this option..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors resize-none"
                  />
                </div>

                {/* Reference Image Upload */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reference Image</label>
                  {optionForm.referenceImageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-2">
                      <img src={optionForm.referenceImageUrl} alt="Reference" className="w-full h-40 object-cover" />
                      <button
                        type="button"
                        onClick={() => setOptionForm(f => ({ ...f, referenceImageUrl: "" }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 hover:border-[#0052FF] text-slate-600 hover:text-[#0052FF] text-[13px] font-bold rounded-xl transition-colors cursor-pointer w-full justify-center"
                  >
                    <Upload size={14} />
                    {uploading ? "Uploading..." : optionForm.referenceImageUrl ? "Replace Image" : "Upload Image"}
                  </button>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sort Order</label>
                  <input type="number" value={optionForm.sortOrder} onChange={(e) => setOptionForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="block w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1D23]">Active</p>
                    <p className="text-[12px] text-slate-400">Show this option to users</p>
                  </div>
                  <Toggle checked={optionForm.isActive} onChange={(v) => setOptionForm(f => ({ ...f, isActive: v }))} />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOptionModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={savingOption}
                    className="flex-1 py-3 bg-[#0052FF] hover:bg-[#0047FF] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {savingOption ? "Saving..." : editingOption ? "Save Changes" : "Create Option"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

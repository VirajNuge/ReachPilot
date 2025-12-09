"use client";

import React, { useState } from "react";
import {
  Layout,
  Type,
  Palette,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  ImageIcon,
  X,
  Tag,
  Wand2,
  ChevronDown,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  AtSign,
} from "lucide-react";

import {
  GeneratorFormState,
  PostType,
  TextElement,
  BrandColor,
  UploadedImage,
  PlatformFormat,
} from "./page";

interface GeneratorFormProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function GeneratorForm({
  formState,
  setFormState,
  onGenerate,
  isGenerating,
}: GeneratorFormProps) {
  // ----------------------------------------------------------------
  // INTERNAL STATE + HELPERS
  // ----------------------------------------------------------------
  const [newSegment, setNewSegment] = useState("");
  const [isAddingSegment, setIsAddingSegment] = useState(false);

  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // ----------------------------------------------------------------
  // SECTION HEADER COMPONENT
  // ----------------------------------------------------------------
  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <div className="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4 mb-6">
      <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
        <Icon size={18} />
      </div>
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 select-none">
        {title}
      </h3>
    </div>
  );

  // ----------------------------------------------------------------
  // AUDIENCE TAG LOGIC
  // ----------------------------------------------------------------
  const [audienceTags, setAudienceTags] = useState<string[]>(
    formState.targetAudience ? formState.targetAudience.split(", ") : []
  );

  const addAudienceTag = (tag: string) => {
    if (!tag.trim()) return;
    const updated = [...audienceTags, tag.trim()];
    setAudienceTags(updated);
    updateState("targetAudience", updated.join(", "));
    setNewSegment("");
    setIsAddingSegment(false);
  };

  const removeAudienceTag = (tagToRemove: string) => {
    const updated = audienceTags.filter((t) => t !== tagToRemove);
    setAudienceTags(updated);
    updateState("targetAudience", updated.join(", "));
  };

  // ----------------------------------------------------------------
  // COLOR LOGIC
  // ----------------------------------------------------------------
  const addColor = () => {
    const newColor: BrandColor = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Color",
      value: "#6366f1",
    };
    updateState("colors", [...formState.colors, newColor]);
  };

  const removeColor = (id: string) => {
    updateState(
      "colors",
      formState.colors.filter((c) => c.id !== id)
    );
  };

  const updateColorField = (
    id: string,
    field: keyof BrandColor,
    value: string
  ) => {
    updateState(
      "colors",
      formState.colors.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // ----------------------------------------------------------------
  // IMAGE HANDLING
  // ----------------------------------------------------------------
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      description: "",
    }));

    updateState("images", [...formState.images, ...newImages]);
  };

  const removeImage = (id: string) => {
    updateState(
      "images",
      formState.images.filter((i) => i.id !== id)
    );
  };

  const updateImageDescription = (id: string, text: string) => {
    updateState(
      "images",
      formState.images.map((i) =>
        i.id === id ? { ...i, description: text } : i
      )
    );
  };

  // ----------------------------------------------------------------
  // TEXT BLOCKS
  // ----------------------------------------------------------------
  const addTextElement = () => {
    const el: TextElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: "BODY",
      content: "",
    };
    updateState("textElements", [...formState.textElements, el]);
  };

  const removeTextElement = (id: string) => {
    updateState(
      "textElements",
      formState.textElements.filter((t) => t.id !== id)
    );
  };

  const updateTextElement = (
    id: string,
    field: keyof TextElement,
    value: string
  ) => {
    updateState(
      "textElements",
      formState.textElements.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  // ----------------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------------
  return (
    <>
      <div className="space-y-12 pb-40">
        {/* -------------------------------------------------- */}
        {/* SECTION 1: FORMAT & STRATEGY */}
        {/* -------------------------------------------------- */}
        <section>
          <SectionHeader icon={Layout} title="Format & Strategy" />

          {/* Post Type Toggle */}
          <div className="bg-slate-100/80 p-1.5 rounded-xl flex gap-1 mb-6 border border-slate-200">
            {(["SINGLE", "CAROUSEL"] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => updateState("postType", type)}
                className={`flex-1 py-3 text-[11px] font-bold rounded-lg transition-all duration-300 ${
                  formState.postType === type
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <div className="relative mb-6 group">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 z-10">
              Platform
            </label>
            <select
              value={formState.platform}
              onChange={(e) =>
                updateState("platform", e.target.value as PlatformFormat)
              }
              className="w-full p-4 pl-4 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer hover:border-indigo-300 shadow-sm"
            >
              <optgroup label="Instagram">
                <option value="IG_SQUARE">Instagram Square (1:1)</option>
                <option value="IG_PORTRAIT">Instagram Portrait (4:5)</option>
                <option value="IG_STORY">Instagram Story (9:16)</option>
              </optgroup>
              <optgroup label="LinkedIn">
                <option value="LINKEDIN_LANDSCAPE">LinkedIn Landscape</option>
                <option value="LINKEDIN_PORTRAIT">LinkedIn Portrait</option>
                <option value="LINKEDIN_SQUARE">LinkedIn Square</option>
              </optgroup>
              <optgroup label="Twitter">
                <option value="TWITTER_POST">Twitter/X Post</option>
              </optgroup>
              <optgroup label="Facebook">
                <option value="FB_POST">Facebook Post</option>
              </optgroup>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors"
            />
          </div>

          {/* PLATFORM ICONS */}
          <div className="flex gap-2 justify-between px-1 mb-8">
            {[
              {
                id: "IG",
                icon: Instagram,
                activeClass:
                  "text-pink-600 bg-pink-50 ring-pink-200 shadow-pink-100",
              },
              {
                id: "LINKEDIN",
                icon: Linkedin,
                activeClass:
                  "text-blue-700 bg-blue-50 ring-blue-200 shadow-blue-100",
              },
              {
                id: "FB",
                icon: Facebook,
                activeClass:
                  "text-blue-600 bg-blue-50 ring-blue-200 shadow-blue-100",
              },
              {
                id: "TWITTER",
                icon: Twitter,
                activeClass:
                  "text-slate-800 bg-slate-100 ring-slate-300 shadow-slate-200",
              },
              {
                id: "THREADS",
                icon: AtSign,
                activeClass:
                  "text-slate-900 bg-slate-100 ring-slate-300 shadow-slate-200",
              },
            ].map((p) => {
              const active = formState.platform.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-full transition-all duration-300 ${
                    active
                      ? `${p.activeClass} ring-2 scale-110 shadow-md`
                      : "text-slate-300 grayscale opacity-40 hover:opacity-70 hover:scale-105"
                  }`}
                >
                  <p.icon size={18} />
                </div>
              );
            })}
          </div>

          {/* CONTEXT TEXTAREA */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-xs font-bold text-slate-700">
                Core Topic / Context
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Required
              </span>
            </div>
            <textarea
              value={formState.postIdea}
              onChange={(e) => updateState("postIdea", e.target.value)}
              className="w-full h-28 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm hover:border-slate-300"
              placeholder="What is this post about? (e.g. '5 tips for remote work productivity')"
            />
          </div>

          {/* AUDIENCE TAGS */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-3 px-1">
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl border-dashed min-h-[60px]">
              {audienceTags.map((tag) => (
                <div
                  key={tag}
                  className="animate-in fade-in zoom-in duration-200 flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-indigo-100 shadow-sm rounded-lg text-[11px] font-semibold text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeAudienceTag(tag)}
                    className="p-0.5 text-indigo-300 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {isAddingSegment ? (
                <input
                  autoFocus
                  type="text"
                  className="w-32 px-3 py-1.5 text-[11px] bg-white border-2 border-indigo-500 rounded-lg outline-none shadow-sm"
                  placeholder="Type & Enter"
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addAudienceTag(newSegment)
                  }
                  onBlur={() => addAudienceTag(newSegment)}
                />
              ) : (
                <button
                  onClick={() => setIsAddingSegment(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 border-dashed hover:border-indigo-400 hover:text-indigo-600 text-slate-400 rounded-lg text-[11px] font-medium transition-all hover:shadow-sm"
                >
                  <Plus size={12} /> Add Audience
                </button>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECTION 2: CONTENT BLOCKS */}
        {/* -------------------------------------------------- */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
                <Type size={18} />
              </div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 select-none">
                Content Blocks
              </h3>
            </div>

            <button
              onClick={addTextElement}
              className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={12} /> Add Block
            </button>
          </div>

          <div className="space-y-4">
            {formState.textElements.map((element) => (
              <div
                key={element.id}
                className="group p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="relative">
                    <select
                      value={element.type}
                      onChange={(e) =>
                        updateTextElement(
                          element.id,
                          "type",
                          e.target.value as any
                        )
                      }
                      className="appearance-none bg-slate-50 border border-slate-200 hover:border-indigo-300 text-[10px] font-bold uppercase tracking-wide rounded-lg pl-3 pr-8 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                      <option value="HEADLINE">Headline</option>
                      <option value="SUBHEAD">Sub-headline</option>
                      <option value="BODY">Body Text</option>
                      <option value="CTA">Call to Action</option>
                      <option value="QUOTE">Quote</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>

                  <button
                    onClick={() => removeTextElement(element.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  value={element.content}
                  onChange={(e) =>
                    updateTextElement(element.id, "content", e.target.value)
                  }
                  placeholder={`Enter ${element.type.toLowerCase()} text...`}
                  className="w-full text-sm border-b border-transparent bg-transparent focus:border-indigo-500 pb-2 placeholder-slate-300 focus:outline-none transition-colors"
                />
              </div>
            ))}

            {formState.textElements.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-xs">
                No content blocks added yet.
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECTION 3: STYLE & BRAND */}
        {/* -------------------------------------------------- */}
        <section>
          <SectionHeader icon={Palette} title="Style & Brand" />

          {/* BRAND KIT TOGGLE */}
          <div
            onClick={() => updateState("useBrandKit", !formState.useBrandKit)}
            className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer mb-8 transition-all duration-300 group ${
              formState.useBrandKit
                ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-indigo-200 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2.5 rounded-full transition-colors ${
                  formState.useBrandKit
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <span
                  className={`text-xs font-bold block mb-0.5 ${
                    formState.useBrandKit ? "text-indigo-900" : "text-slate-700"
                  }`}
                >
                  Use Brand Kit
                </span>
                <span className="text-[10px] text-slate-500">
                  Auto-apply brand colors
                </span>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                formState.useBrandKit
                  ? "bg-indigo-600"
                  : "bg-slate-200 group-hover:bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  formState.useBrandKit ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </div>
          </div>

          {/* COLOR LIST */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 px-1">
              <label className="text-xs font-bold text-slate-700">
                Brand Colors
              </label>
              <button
                onClick={addColor}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-3">
              {formState.colors.map((color) => (
                <div
                  key={color.id}
                  className="group flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) =>
                        updateColorField(color.id, "value", e.target.value)
                      }
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                    />
                  </div>

                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) =>
                      updateColorField(color.id, "name", e.target.value)
                    }
                    className="flex-1 text-xs font-medium text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-200 transition-colors py-1"
                    placeholder="Color Name"
                  />

                  <button
                    onClick={() => removeColor(color.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BACKGROUND STYLE */}
          <div>
            <label className="text-xs font-bold block mb-3 px-1 text-slate-700">
              Background Style
            </label>
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl border border-slate-200">
              {["Minimal", "Gradient", "Texture"].map((style) => (
                <button
                  key={style}
                  onClick={() => updateState("backgroundStyle", style)}
                  className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all duration-200 ${
                    formState.backgroundStyle === style
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECTION 4: MEDIA ASSETS */}
        {/* -------------------------------------------------- */}
        <section>
          <SectionHeader icon={ImageIcon} title="Media Assets" />

          <div className="space-y-4">
            {/* Upload Area */}
            <label className="group flex flex-col items-center justify-center w-full py-10 bg-slate-50/30 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all duration-300">
              <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all text-indigo-500 ring-1 ring-indigo-50">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                Click to Upload Media
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Supports JPG, PNG
              </span>

              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </label>

            {formState.images.map((img) => (
              <div
                key={img.id}
                className="flex gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                  <img
                    src={img.previewUrl}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    AI Context
                  </span>

                  <input
                    type="text"
                    placeholder="e.g. Product on table"
                    className="w-full text-xs font-medium border-b border-slate-100 focus:border-indigo-500 pb-1 outline-none transition-colors bg-transparent placeholder-slate-300"
                    value={img.description}
                    onChange={(e) =>
                      updateImageDescription(img.id, e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={() => removeImage(img.id)}
                  className="self-center p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECTION 5: AI DIRECTION */}
        {/* -------------------------------------------------- */}
        <section>
          <SectionHeader icon={Wand2} title="AI Direction" />

          <div className="space-y-6">
            {/* Typography Mood */}
            <div>
              <label className="text-xs font-bold block mb-2 px-1 text-slate-700">
                Typography Mood
              </label>
              <div className="relative group">
                <select
                  value={formState.typographyMood}
                  onChange={(e) =>
                    updateState("typographyMood", e.target.value)
                  }
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 appearance-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 hover:border-indigo-300 transition-all cursor-pointer shadow-sm"
                >
                  <option value="MODERN">Modern & Minimal</option>
                  <option value="ELEGANT">Elegant & Trustworthy</option>
                  <option value="BOLD">Bold & Loud</option>
                  <option value="FRIENDLY">Friendly</option>
                  <option value="TECH">Tech & Futuristic</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Design Keywords */}
            <div>
              <label className="text-xs font-bold mb-2 px-1 flex gap-1 text-slate-700">
                Design Keywords{" "}
                <span className="text-[10px] text-slate-400 font-normal">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-indigo-400 pointer-events-none">
                  <Tag size={14} />
                </div>
                <input
                  type="text"
                  value={formState.designKeywords}
                  onChange={(e) =>
                    updateState("designKeywords", e.target.value)
                  }
                  placeholder="e.g. Neon, Corporate, Summer"
                  className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder-slate-300 hover:border-slate-300"
                />
              </div>
            </div>

            {/* Layout Density */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-4">
                <label className="text-xs font-bold text-slate-700">
                  Layout Density
                </label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  {formState.layoutDensity === 1
                    ? "Minimal"
                    : formState.layoutDensity === 2
                    ? "Balanced"
                    : "Packed"}
                </span>
              </div>

              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={formState.layoutDensity}
                  onChange={(e) =>
                    updateState("layoutDensity", parseInt(e.target.value))
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all z-10"
                />
                {/* Track ticks visually */}
                <div className="absolute w-full flex justify-between px-1 pointer-events-none">
                  <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
                  <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
                  <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-2 px-0.5">
                <span>Clean</span>
                <span>Standard</span>
                <span>Dense</span>
              </div>
            </div>
          </div>
        </section>

        {/* GENERATE BUTTON */}
        <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-4 -mx-4 px-4">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 cursor-pointer w-full py-4 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="animate-pulse">Designing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-indigo-200" />
                Generate Canvas
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

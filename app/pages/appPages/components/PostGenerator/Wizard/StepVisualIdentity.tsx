"use client";

import React, { useRef } from "react";
import { Palette, Layers, Image as ImageIcon, Plus, X, Cpu, Upload, Sun, Droplets, Sparkles, Grid3X3, Type } from "lucide-react";
import type { 
  PostGenerationInput, 
  BrandType, 
  VisualStyle, 
  ImageGenType,
  GeminiImageModel,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  CompositionPreference,
  TextStylePreference,
  ColorThemePreset,
} from "@/lib/types/postGeneration";
import { 
  BRAND_TYPE_LABELS, 
  VISUAL_STYLE_LABELS, 
  IMAGE_GEN_TYPE_LABELS,
  IMAGE_MODEL_LABELS,
  LIGHTING_DIRECTION_LABELS,
  SHADING_STYLE_LABELS,
  IMAGE_STYLE_LABELS,
  COMPOSITION_PREFERENCE_LABELS,
  TEXT_STYLE_PREFERENCE_LABELS,
  COLOR_THEME_PRESET_LABELS,
} from "@/lib/types/postGeneration";

interface StepVisualIdentityProps {
  input: PostGenerationInput;
  onChange: (updates: Partial<PostGenerationInput>) => void;
}

const FONTS = [
  "Montserrat",
  "Inter",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Space Grotesk",
];

export function StepVisualIdentity({ input, onChange }: StepVisualIdentityProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddColor = () => {
    if (input.brandAssets.colorPalette.length < 5) {
      onChange({
        brandAssets: {
          ...input.brandAssets,
          colorPalette: [...input.brandAssets.colorPalette, "#000000"],
        },
      });
    }
  };

  const handleUpdateColor = (index: number, color: string) => {
    const newPalette = [...input.brandAssets.colorPalette];
    newPalette[index] = color;
    onChange({
      brandAssets: {
        ...input.brandAssets,
        colorPalette: newPalette,
      },
    });
  };

  const handleRemoveColor = (index: number) => {
    const newPalette = input.brandAssets.colorPalette.filter((_, i) => i !== index);
    onChange({
      brandAssets: {
        ...input.brandAssets,
        colorPalette: newPalette,
      },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          brandAssets: {
            ...input.brandAssets,
            logoUrl: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand Type */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">What type of brand is this?</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(BRAND_TYPE_LABELS) as [BrandType, string][]).map(([key, label]) => {
            const isSelected = input.brandType === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ brandType: key })}
                className={`p-4 rounded-2xl border transition-all duration-200 text-center ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold ${isSelected ? "text-[#0052FF]" : "text-gray-700"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Visual Style */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Choose a visual style</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(VISUAL_STYLE_LABELS) as [VisualStyle, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.visualStyles?.[0] === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ visualStyles: [key] })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Image Generation Type */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">How should we generate images?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.entries(IMAGE_GEN_TYPE_LABELS) as [ImageGenType, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.imageGenType === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ imageGenType: key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI Image Model Selector */}
      {input.imageGenType === "ai_background" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-[#0052FF]" />
            <h3 className="text-sm font-bold text-gray-800">AI Image Model</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(IMAGE_MODEL_LABELS) as [GeminiImageModel, { label: string; desc: string; badge: string }][]).map(([key, { label, desc, badge }]) => {
              const isSelected = (input.imageModel || "gemini-2.5-flash-image") === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ imageModel: key as GeminiImageModel })}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left relative ${
                    isSelected
                      ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`text-sm font-bold ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                      {label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      badge === "Free" ? "bg-green-100 text-green-700" :
                      badge === "Stable" ? "bg-green-100 text-green-700" :
                      badge === "Preview" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {badge}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Lighting Direction */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Lighting Direction <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(LIGHTING_DIRECTION_LABELS) as [LightingDirection, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.lightingDirection === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ lightingDirection: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Shading Style */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Shading Style <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(SHADING_STYLE_LABELS) as [ShadingStyle, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.shadingStyle === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ shadingStyle: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Image Style */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Image Style <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Object.entries(IMAGE_STYLE_LABELS) as [ImageStyle, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.imageStyle === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ imageStyle: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Composition Preference */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Grid3X3 className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Composition <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(COMPOSITION_PREFERENCE_LABELS) as [CompositionPreference, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.compositionPreference === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ compositionPreference: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Text Style Preference */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Text Style <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(TEXT_STYLE_PREFERENCE_LABELS) as [TextStylePreference, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.textStylePreference === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ textStylePreference: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Color Theme Preset */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Color Theme <span className="text-xs font-normal text-gray-400 ml-1">— Optional</span></h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(COLOR_THEME_PRESET_LABELS) as [ColorThemePreset, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.colorThemePreset === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ colorThemePreset: isSelected ? undefined : key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Brand Assets */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-5">Brand Assets</h3>
        
        <div className="space-y-8">
          {/* Logo Upload */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Brand Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {input.brandAssets.logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={input.brandAssets.logoUrl} alt="Brand logo" className="max-w-full max-h-full object-contain p-2" />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-[#0052FF] bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    <Upload className="w-3 h-3" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ brandAssets: { ...input.brandAssets, logoUrl: undefined } })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#0052FF] hover:bg-blue-50/30 transition-all text-gray-400 hover:text-[#0052FF] gap-2 group"
              >
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Upload Brand Logo</span>
                <span className="text-[10px] font-medium text-gray-400">PNG, JPG, SVG</span>
              </button>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Color Palette (Max 5)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {input.brandAssets.colorPalette.map((color, index) => (
                <div key={index} className="relative group">
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden relative cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleUpdateColor(index, e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                    />
                  </div>
                  {input.brandAssets.colorPalette.length > 1 && (
                    <button
                      onClick={() => handleRemoveColor(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {input.brandAssets.colorPalette.length < 5 && (
                <button
                  onClick={handleAddColor}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#0052FF] hover:border-[#0052FF] hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Font Family */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                Primary Font
              </label>
              <select
                value={input.brandAssets.fontFamily || "Montserrat"}
                onChange={(e) => onChange({
                  brandAssets: { ...input.brandAssets, fontFamily: e.target.value }
                })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white shadow-sm text-sm font-medium text-gray-800 appearance-none cursor-pointer"
                style={{ fontFamily: input.brandAssets.fontFamily || "Montserrat" }}
              >
                {FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Watermark Toggle */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                Brand Watermark
              </label>
              <button
                onClick={() => onChange({
                  brandAssets: { ...input.brandAssets, watermark: !input.brandAssets.watermark }
                })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  input.brandAssets.watermark ? "bg-[#0052FF]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    input.brandAssets.watermark ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700 align-middle">
                {input.brandAssets.watermark ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

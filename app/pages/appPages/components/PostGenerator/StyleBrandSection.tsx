"use client";

import React from "react";
import {
  Palette,
  Sparkles,
  Trash2,
  Plus,
  Check,
  Maximize,
  Layers,
  LayoutTemplate,
} from "lucide-react";

import { GeneratorFormState, BrandColor } from "../../[id]/postGenerator/page";

interface StyleBrandSectionProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 text-slate-800 pb-4 mb-2">
    <div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
  </div>
);

export default function StyleBrandSection({
  formState,
  setFormState,
}: StyleBrandSectionProps) {
  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addColor = () => {
    const newColor: BrandColor = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Color",
      value: "#6366f1",
    };
    updateState("colors", [...formState.colors, newColor]);
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

  const removeColor = (id: string) => {
    updateState(
      "colors",
      formState.colors.filter((c) => c.id !== id)
    );
  };

  return (
    <section className="bg-slate-50/50 p-1 rounded-xl">
      <div className="px-2">
        <SectionHeader icon={Palette} title="Style & Aesthetics" />
      </div>

      <div className="space-y-4">
        {/* --- BRAND KIT TOGGLE (FIXED) --- */}
        <button
          type="button" // Prevents form submission and ensures click registration
          onClick={(e) => {
            e.preventDefault(); // Good practice to prevent bubbling issues
            updateState("useBrandKit", !formState.useBrandKit);
          }}
          className={`w-full group relative overflow-hidden flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 select-none text-left ${
            formState.useBrandKit
              ? "bg-white border-indigo-200 shadow-md shadow-indigo-100"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          {/* Active Background Glow Effect - Added pointer-events-none */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 transition-opacity duration-500 pointer-events-none ${
              formState.useBrandKit ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="relative flex items-center gap-3 z-10">
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                formState.useBrandKit
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              }`}
            >
              <Sparkles
                size={16}
                fill={formState.useBrandKit ? "currentColor" : "none"}
              />
            </div>

            <div>
              <span
                className={`text-xs font-bold block ${
                  formState.useBrandKit ? "text-indigo-900" : "text-slate-700"
                }`}
              >
                Brand Kit Logic
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Auto-apply saved brand colors
              </span>
            </div>
          </div>

          {/* Custom Toggle Switch */}
          <div
            className={`relative z-10 w-10 h-6 rounded-full transition-colors duration-300 ${
              formState.useBrandKit ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                formState.useBrandKit ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {/* --- BACKGROUND STYLE VISUAL SELECTOR --- */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">
            Background Style
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Minimal", icon: Maximize, bgClass: "bg-slate-50" },
              {
                id: "Gradient",
                icon: LayoutTemplate,
                bgClass:
                  "bg-gradient-to-br from-indigo-100 via-white to-purple-100",
              },
              {
                id: "Texture",
                icon: Layers,
                bgClass: "bg-slate-50 opacity-100",
                style: {
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                },
              },
            ].map((option) => {
              const isActive = formState.backgroundStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button" // Added type="button" here too
                  onClick={() => updateState("backgroundStyle", option.id)}
                  className={`relative h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "border-indigo-600 ring-1 ring-indigo-600/20"
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${option.bgClass}`}
                    style={option.style}
                  />

                  <div className="relative z-10 bg-white/80 backdrop-blur-[2px] p-1.5 rounded-full shadow-sm">
                    <option.icon
                      size={14}
                      className={
                        isActive ? "text-indigo-600" : "text-slate-500"
                      }
                    />
                  </div>
                  <span
                    className={`relative z-10 text-[10px] font-bold ${
                      isActive ? "text-indigo-900" : "text-slate-500"
                    }`}
                  >
                    {option.id}
                  </span>

                  {isActive && (
                    <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- COLOR PALETTE --- */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Palette
            </label>
            <button
              type="button"
              onClick={addColor}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {formState.colors.map((color) => (
              <div
                key={color.id}
                className="group flex items-center gap-3 p-2 border border-slate-100 rounded-lg hover:border-indigo-100 hover:shadow-sm transition-all bg-slate-50/50 hover:bg-white"
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-md shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: color.value }}
                  />
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) =>
                      updateColorField(color.id, "value", e.target.value)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) =>
                      updateColorField(color.id, "name", e.target.value)
                    }
                    className="block w-full text-xs font-semibold text-slate-700 bg-transparent border-none p-0 focus:ring-0 placeholder-slate-400"
                    placeholder="Color Name"
                  />
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                    {color.value}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeColor(color.id)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {formState.colors.length === 0 && (
              <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-lg">
                <p className="text-[10px] text-slate-400">
                  No brand colors added.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

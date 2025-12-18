"use client";

import React from "react";
import { Wand2, Tag, ChevronDown } from "lucide-react";
import { GeneratorFormState } from "../../[id]/postGenerator/page";

interface AIDirectionSectionProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
}

// Reusable section header
const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4 mb-6">
    <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
      <Icon size={18} />
    </div>
    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 select-none">
      {title}
    </h3>
  </div>
);

export default function AIDirectionSection({
  formState,
  setFormState,
}: AIDirectionSectionProps) {
  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section>
      <SectionHeader icon={Wand2} title="AI Direction" />

      <div className="space-y-6">
        {/* -------------------------------------------------- */}
        {/* TYPOGRAPHY MOOD */}
        {/* -------------------------------------------------- */}
        <div>
          <label className="text-xs font-bold block mb-2 px-1 text-slate-700">
            Typography Mood
          </label>

          <div className="relative group">
            <select
              value={formState.typographyMood}
              onChange={(e) => updateState("typographyMood", e.target.value)}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 appearance-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 hover:border-indigo-300 transition-all cursor-pointer shadow-sm"
            >
              <option value="MODERN">Modern & Minimal</option>
              <option value="ELEGANT">Elegant & Trustworthy</option>
              <option value="BOLD">Bold & Loud</option>
              <option value="FRIENDLY">Friendly & Approachable</option>
              <option value="TECH">Tech & Futuristic</option>
            </select>

            <ChevronDown
              size={16}
              className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* DESIGN KEYWORDS */}
        {/* -------------------------------------------------- */}
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
              onChange={(e) => updateState("designKeywords", e.target.value)}
              placeholder="e.g. Neon, Cinematic, Corporate, Minimalist"
              className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder-slate-300 hover:border-slate-300"
            />
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* LAYOUT DENSITY SLIDER */}
        {/* -------------------------------------------------- */}
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

          {/* Slider */}
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

            {/* Decorative ticks */}
            <div className="absolute w-full flex justify-between px-1 pointer-events-none">
              <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
              <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
              <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
            </div>
          </div>

          {/* Slider labels */}
          <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-2 px-0.5">
            <span>Clean</span>
            <span>Standard</span>
            <span>Dense</span>
          </div>
        </div>
      </div>
    </section>
  );
}

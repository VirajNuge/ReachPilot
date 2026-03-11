"use client";

import React from "react";
import { ReachPilotTemplate } from "../../../../../lib/mockdata/templatedata";
import {
  Linkedin,
  Twitter,
  Facebook,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  Layout,
  Lock,
  Zap,
  Eye,
} from "lucide-react";

interface SmartTemplateCardProps {
  template: ReachPilotTemplate;
  onPreview: (template: ReachPilotTemplate) => void;
}

// --- Helper: Platform Icons ---
const PlatformIcon = ({ platform }: { platform: string }) => {
  const size = "w-3.5 h-3.5";
  switch (platform) {
    case "LinkedIn":
      return (
        <Linkedin className={`${size} text-[#0077b5]`} fill="currentColor" />
      );
    case "X":
      return <Twitter className={`${size} text-black`} fill="currentColor" />;
    case "Facebook":
      return (
        <Facebook className={`${size} text-[#1877F2]`} fill="currentColor" />
      );
    case "Instagram":
      return (
        <div
          className={`${size} rounded-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600`}
        />
      );
    default:
      return <MoreHorizontal className={`${size} text-slate-400`} />;
  }
};

// ==========================================
// 1. VISUAL CARD (Fixed: Buttons Moved to Center)
// ==========================================
const VisualCard = ({ template, onPreview }: SmartTemplateCardProps) => (
  <div
    className="group relative w-full h-[340px] rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 isolate"
    onClick={() => onPreview(template)}
  >
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
      style={{ backgroundImage: `url(${template.coverImage})` }}
    />

    {/* Gradient Overlay (Darker at bottom for text readability) */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

    {/* Top Badges */}
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
      <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white border border-white/10">
        <Layout size={14} />
      </div>
      {template.isPremium && (
        <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
          <Lock size={10} strokeWidth={3} /> PRO
        </span>
      )}
    </div>

    {/* --- HOVER ACTIONS (Centered - No longer blocking text) --- */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 bg-black/40 backdrop-blur-[2px]">
      {/* Primary Action */}

      {/* Secondary Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPreview(template);
        }}
        className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs text-white bg-black/50 hover:bg-black/70 border border-white/20 transition-colors"
      >
        <Eye size={14} /> Preview
      </button>
    </div>

    {/* Bottom Content (Safe Zone - No Buttons Here) */}
    <div className="absolute bottom-0 left-0 right-0 p-5 z-10 pointer-events-none group-hover:translate-y-[-4px] transition-transform duration-300">
      <h3 className="text-white font-bold text-lg leading-snug mb-2 drop-shadow-md line-clamp-2">
        {template.title}
      </h3>

      <div className="flex items-center justify-between text-white/80">
        <div className="flex gap-2 items-center">
          {template.platforms.map((p) => (
            <div
              key={p}
              className="bg-white/10 p-1 rounded-md backdrop-blur-sm shadow-sm"
            >
              <PlatformIcon platform={p} />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
          Visual
        </span>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. TEXT CARD (Fixed: Alignment & Layout)
// ==========================================
const TextCard = ({ template, onPreview }: SmartTemplateCardProps) => (
  <div
    className="
      group flex flex-col h-[295px]
      bg-white rounded-2xl border border-slate-200 p-6
      hover:border-violet-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]
      transition-all duration-300 cursor-pointer relative
    "
    onClick={() => onPreview(template)}
  >
    {/* Body Section - Grows to push footer down */}
    <div className="flex-grow">
      <div className="flex justify-between items-start mb-4">
        {/* Icon Box */}
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
          <Layout size={20} />
        </div>

        {/* Stats Badge */}
        {template.performance && (
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <TrendingUp size={12} /> {template.performance.value}
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-900 text-xl mb-2 leading-tight group-hover:text-violet-700 transition-colors">
        {template.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
        {template.description ||
          "A professional text template optimized for engagement."}
      </p>
    </div>

    {/* Footer Section - Fixed Flex Layout */}
    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10">
      {/* LEFT: Platforms (Allowed to shrink if needed) */}
      <div className="flex -space-x-2 overflow-hidden py-1">
        {template.platforms.slice(0, 4).map((p, i) => (
          <div
            key={p}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0"
            style={{ zIndex: 10 - i }}
          >
            <PlatformIcon platform={p} />
          </div>
        ))}
        {template.platforms.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 relative z-0 shrink-0">
            +{template.platforms.length - 4}
          </div>
        )}
      </div>

      {/* RIGHT: Buttons (Fixed width grouping, NO shrinking) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Preview Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="
                hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-lg
                bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200
                hover:bg-slate-200 hover:border-slate-300 transition-all
            "
        >
          <Eye size={14} /> Preview
        </button>
        {/* Mobile/Tablet Icon-only Preview Fallback */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="xl:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  </div>
);

// --- Main Switcher ---
const SmartTemplateCard: React.FC<SmartTemplateCardProps> = (props) => {
  return props.template.coverImage ? (
    <VisualCard {...props} />
  ) : (
    <TextCard {...props} />
  );
};

export default SmartTemplateCard;

import React from "react";
import {
  FaArrowUp,
  FaExclamationTriangle,
  FaDollarSign,
  FaBoxOpen,
} from "react-icons/fa";

import { LadderData, LadderRung, ProductNode } from "@/lib/types/analysis";

// --- Mock Data ---
const MOCK_LADDER: LadderData = {
  products: {
    Bait: {
      name: "SaaS Launch Checklist",
      price: "Free",
      type: "PDF",
      intensity: "Low",
    },
    // Tripwire is missing
    Core: {
      name: "SaaS Academy Pro",
      price: "$497",
      type: "Course",
      intensity: "Low",
    },
    "High-Ticket": {
      name: "1-on-1 Scale Coaching",
      price: "$2,500",
      type: "Coaching",
      intensity: "High",
    },
  },
  gap: "The Price Jump Gap",
  insight:
    "Competitor jumps from Free to $497. They are losing the 60% of leads who aren't ready for a big commitment but would pay $27.",
};

// --- Component ---
export default function ValueLadder({
  data = MOCK_LADDER,
}: {
  data?: LadderData;
}) {
  const renderRung = (
    rung: LadderRung,
    label: string,
    priceRange: string,
    product?: ProductNode,
  ) => {
    const isMissing = !product;

    return (
      <div className="relative pl-8 pb-8 last:pb-0 border-l-2 border-slate-100 last:border-l-0">
        {/* Connector Circle */}
        <div
          className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
            isMissing
              ? "bg-slate-100 border-slate-300"
              : "bg-white border-[#074ed5]"
          }`}
        >
          {!isMissing && (
            <div className="w-1.5 h-1.5 bg-[#074ed5] rounded-full absolute top-[3px] left-[3px]" />
          )}
        </div>

        <div
          className={`p-4 rounded-xl border ${isMissing ? "border-dashed border-slate-200 bg-[#f4f8fb]/50" : "border-slate-100 bg-white"}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {label}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {priceRange}
              </div>
            </div>
            {product && (
              <div
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${product.intensity === "High" ? "bg-[#caee55]/20 text-[#000100] border-[#caee55]/30" : "bg-[#074ed5]/10 text-[#074ed5] border-[#074ed5]/20"}`}
              >
                {product.intensity} Intensity
              </div>
            )}
          </div>

          {product ? (
            <div>
              <div className="font-bold text-[#000100]">{product.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#074ed5] font-bold bg-[#074ed5]/10 px-1.5 rounded text-xs">
                  {product.price}
                </span>
                <span className="text-xs text-slate-500">{product.type}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic text-sm">
              <FaBoxOpen />
              <span>Opportunity Gap</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Blueprint Intel
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Value Ladder
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Visualizes the competitor's revenue strategy. Maps their products
              from 'Free' to 'High Ticket' to find pricing gaps you can exploit.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Revenue Ecosystem Map
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaDollarSign size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row flex-1 gap-6 overflow-y-auto custom-scrollbar pr-2 relative">
        {/* The Ladder Visualization */}
        <div className="flex-1 pt-2 shrink-0">
          {renderRung(
            "High-Ticket",
            "Level 4: Profit Maximizer",
            "$2k+",
            data.products["High-Ticket"],
          )}
          {renderRung(
            "Core",
            "Level 3: Core Offer",
            "$197 - $997",
            data.products["Core"],
          )}
          {renderRung(
            "Tripwire",
            "Level 2: Tripwire",
            "$7 - $47",
            data.products["Tripwire"],
          )}
          {renderRung(
            "Bait",
            "Level 1: The Bait",
            "Free",
            data.products["Bait"],
          )}
        </div>

        {/* Strategic Insight Panel */}
        <div className="w-full xl:w-[40%] flex xl:flex-col gap-4 shrink-0">
          <div className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-xl flex-1 xl:flex-none">
            <div className="flex items-center gap-2 mb-2 text-[#074ed5] font-bold text-xs uppercase">
              <FaExclamationTriangle />
              Detected Gap
            </div>
            <div className="font-bold text-[#000100] leading-tight mb-1">
              {data.gap}
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Missing the <strong>Tripwire</strong> ($7-$47) tier.
            </p>
          </div>

          <div className="p-4 bg-[#000100] text-white rounded-xl xl:mt-auto relative overflow-hidden flex-1 xl:flex-none">
            <FaArrowUp className="absolute top-4 right-4 text-[#caee55]/20 text-4xl" />
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-[#caee55] uppercase mb-2">
                Recommended Move
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Launch a <strong>$27 "Quick-Start" Template</strong>. You will
                capture the leads they are losing at the $497 jump.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

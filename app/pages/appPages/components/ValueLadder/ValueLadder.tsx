import React from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDollarSign,
  FaBoxOpen,
} from "react-icons/fa";
import { motion } from "framer-motion";

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
      <div className="relative pl-8 pb-8 last:pb-0 border-l-2 border-gray-100 last:border-l-0">
        {/* Connector Circle */}
        <div
          className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
            isMissing
              ? "bg-gray-100 border-gray-300"
              : "bg-white border-indigo-500"
          }`}
        >
          {!isMissing && (
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full absolute top-[3px] left-[3px]" />
          )}
        </div>

        <div
          className={`p-4 rounded-xl border ${isMissing ? "border-dashed border-gray-200 bg-gray-50/50" : "border-gray-100 bg-white shadow-sm"}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                {label}
              </div>
              <div className="text-xs text-gray-400 font-medium">
                {priceRange}
              </div>
            </div>
            {product && (
              <div
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${product.intensity === "High" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
              >
                {product.intensity} Intensity
              </div>
            )}
          </div>

          {product ? (
            <div>
              <div className="font-bold text-gray-900">{product.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded text-xs">
                  {product.price}
                </span>
                <span className="text-xs text-gray-500">{product.type}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 italic text-sm">
              <FaBoxOpen />
              <span>Opportunity Gap</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl h-fit">
            <FaDollarSign size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 text-lg border-b border-dashed border-gray-300 inline-block">
                Value Ladder
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Visualizes the competitor's revenue strategy. Maps their
                products from 'Free' to 'High Ticket' to find pricing gaps you
                can exploit.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Revenue Ecosystem Map</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 flex-1 flex gap-6 overflow-y-auto custom-scrollbar">
        {/* The Ladder Visualization */}
        <div className="flex-1 pt-2">
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
        <div className="w-[40%] flex flex-col gap-4">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold text-xs uppercase">
              <FaExclamationTriangle />
              Detected Gap
            </div>
            <div className="font-bold text-orange-900 leading-tight mb-1">
              {data.gap}
            </div>
            <p className="text-xs text-orange-800 opacity-80 leading-snug">
              Missing the <strong>Tripwire</strong> ($7-$47) tier.
            </p>
          </div>

          <div className="p-4 bg-indigo-600 text-white rounded-xl mt-auto relative overflow-hidden">
            <FaArrowUp className="absolute top-4 right-4 text-indigo-400 opacity-20 text-4xl" />
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-indigo-200 uppercase mb-2">
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

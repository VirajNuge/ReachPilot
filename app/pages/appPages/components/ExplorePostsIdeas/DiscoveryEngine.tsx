"use client";

import React from "react";
import { Telescope } from "lucide-react";

// --- Import Sub-Components ---
import TrendFilters from "./TrendFilters";
import PlatformMatrix from "./PlatformMatrix";
import ViralityThresholds from "./ViralityThresholds";

export default function DiscoveryEngine() {
  return (
    <div className="space-y-10 pb-40">
      {/* 1. Context & Search (The "What") */}
      <section>
        <TrendFilters />
      </section>

      {/* 2. Platform Selection (The "Where") */}
      <section>
        <PlatformMatrix />
      </section>

      {/* 3. Signal Filters (The "Quality") */}
      <section>
        <ViralityThresholds />
      </section>

      {/* === PRIMARY TRIGGER === */}
      <div className="pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4">
        <button className="w-full py-4 px-6 font-bold uppercase tracking-wide rounded-xl transition-all transform flex items-center justify-center gap-3 group bg-[#000100] hover:bg-black text-white">
          <Telescope
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          Start Trend Scout
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
          Scouting analyzes live data. This consumes ~50 AI tokens.
        </p>
      </div>
    </div>
  );
}

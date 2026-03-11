"use client";

import React from "react";
import { Play } from "lucide-react";

// --- Import the Sub-Components ---
import PersonaSummaryCard from "./PersonaSummaryCard";
import TargetPlatformSelector from "./TargetPlatformSelector";
import TrendSourceSelector from "./TrendSourceSelector";
import SafetyControls from "./SafetyControls";

export default function ThreadPilotConfig() {
  return (
    <div className="space-y-12 pb-40">
      {/* Section 1: Identity (Who is speaking?) */}
      <section className="space-y-4">
        <PersonaSummaryCard />
      </section>

      {/* Section 2: Output Channels (Where does it go?) */}
      <section className="space-y-4">
        <TargetPlatformSelector />
      </section>

      {/* Section 3: Input Intelligence (Where do ideas come from?) */}
      <section className="space-y-4">
        <TrendSourceSelector />
      </section>

      {/* Section 4: Guardrails (Safety & Limits) */}
      <section className="space-y-4">
        <SafetyControls />
      </section>

      {/* === PRIMARY ACTION === */}
      <div className="pt-6 border-t border-gray-100">
        <button className="w-full py-4 px-6 font-bold uppercase tracking-wide rounded-xl transition-all transform flex items-center justify-center gap-3 bg-[#000100] hover:bg-black text-white">
          <Play size={18} fill="currentColor" />
          Save Config & Start Engine
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          By starting, you agree to the daily posting limits configured above.
        </p>
      </div>
    </div>
  );
}

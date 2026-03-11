"use client";

import React from "react";
import { Sparkles } from "lucide-react";

// --- IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import ThreadPilotConfig from "../../components/ThreadPilot/ThreadPilotConfig";
import ThreadPilotDashboard from "../../components/ThreadPilot/ThreadPilotDashboard";

export default function ThreadPilotPage() {
  return (
    // CHANGE 1: Use 'h-screen' and 'overflow-hidden' to lock the viewport height
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      {/* 1. Global Navigation (Flex-shrink-0 ensures it keeps its size) */}
      <div className="flex-shrink-0">
        <TopMenu
          pageName="ThreadPilot Auto-Pilot"
          tokens={2000}
        />
      </div>

      {/* 2. Main Split Layout (Flex-1 makes it fill ALL remaining vertical space) */}
      <div className="flex-1 flex overflow-hidden">
        {/* === LEFT PANEL: CONFIGURATION WIZARD === */}
        {/* h-full ensures it fills the flex container. overflow-y-auto enables the scroll. */}
        <div className="w-[450px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Header / Context */}
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">
                    Auto-Pilot Setup
                  </h2>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-500">
                    Configuration Console
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Configure your digital twin to monitor specific trends and
                generate autonomous text content for X, LinkedIn, and Threads.
              </p>
            </div>

            {/* ⭐ CONFIG FORM COMPONENT */}
            <ThreadPilotConfig />
          </div>
        </div>

        {/* === RIGHT PANEL: COMMAND CENTER === */}
        {/* Independent scroll here too */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {/* ⭐ REAL DASHBOARD COMPONENT */}
            <ThreadPilotDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}

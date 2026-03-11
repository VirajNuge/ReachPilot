"use client";

import React, { useState } from "react";
import { BarChart3, Users, Eye, MousePointer2, Activity } from "lucide-react";

// --- COMPONENT IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import PlatformFilter from "../../components/Analytics/PlatformFilter";
import VelocityCard from "../../components/Analytics/VelocityCard";
import GrowthChart from "../../components/Analytics/GrowthChart";
import RadarInsight from "../../components/Analytics/RadarInsight";
import CopyCatEngine from "../../components/Analytics/CopyCatEngine"; // ⭐ NEW: Hall of Fame
import ContentDNATable from "../../components/Analytics/ContentDNATable";
import AudienceDeepDive from "../../components/Analytics/AudienceDeepDive";

// --- TYPE & DATA IMPORTS ---
import { PlatformKey } from "../../components/Analytics/types";
import { ANALYTICS_DATA } from "../../components/Analytics/mockData";

export default function AnalyticsPage() {
  // Global Dashboard State
  const [platform, setPlatform] = useState<PlatformKey>("all");
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D">("30D");

  // Get data for the selected platform (with safety fallback to 'all')
  const currentData = ANALYTICS_DATA[platform] || ANALYTICS_DATA["all"];

  return (
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      {/* 1. TOP NAVIGATION */}
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Analytics"
          tokens={2000}
        />
      </div>

      {/* 2. STICKY CONTROL DECK */}
      <div className="flex-shrink-0 z-20 shadow-sm relative">
        <PlatformFilter selected={platform} onSelect={setPlatform} />

        {/* Date Toggle (SaaS Minimal Style) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full shadow-sm">
          {["7D", "30D", "90D"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-full transition-all duration-300 ${
                dateRange === range
                  ? "bg-indigo-600 text-white shadow-md transform scale-105"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SCROLLABLE DASHBOARD AREA */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Dashboard Header Context */}

          {/* ROW 1: VELOCITY VITALS */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Live Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <VelocityCard
                data={currentData.audience}
                icon={<Users size={20} />}
              />
              <VelocityCard data={currentData.reach} icon={<Eye size={20} />} />
              <VelocityCard
                data={currentData.engagement}
                icon={<Activity size={20} />}
              />
              <VelocityCard
                data={currentData.clicks}
                icon={<MousePointer2 size={20} />}
              />
            </div>
          </div>

          {/* ROW 2: STRATEGIC CHARTS */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Strategic Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
              <div className="lg:col-span-2 h-full">
                <GrowthChart platform={platform} />
              </div>
              <div className="h-full">
                <RadarInsight platform={platform} />
              </div>
            </div>
          </div>

          {/* ⭐ ROW 3: THE COPY-CAT ENGINE (HALL OF FAME) */}
          <div className="pt-2">
            <CopyCatEngine />
          </div>

          {/* ROW 4: CONTENT DNA (THE ROI ENGINE) */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">
              Deep Dive Analysis
            </h3>
            <div className="h-[400px]">
              <ContentDNATable platform={platform} />
            </div>
          </div>

          {/* ROW 5: AUDIENCE INTELLIGENCE */}
          <div className="pb-20">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Audience Intelligence
            </h3>
            <div className="h-[350px]">
              <AudienceDeepDive platform={platform} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

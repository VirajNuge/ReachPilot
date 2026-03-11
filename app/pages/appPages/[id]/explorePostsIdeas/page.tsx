"use client";

import React, { useState } from "react";
import { Telescope } from "lucide-react";

// --- IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import DiscoveryEngine from "../../components/ExplorePostsIdeas/DiscoveryEngine";
import MasonryFeed from "../../components/ExplorePostsIdeas/Feed/MasonryFeed";
import RemixModal from "../../components/ExplorePostsIdeas/RemixModal";
import { TrendPost } from "../../components/ExplorePostsIdeas/Feed/TrendCard";

export default function TrendScoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<TrendPost | null>(null);

  const handleRemixClick = (post: TrendPost) => {
    setCurrentPost(post);
    setIsModalOpen(true);
  };

  return (
    // MAIN WRAPPER: Locks height to screen
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      {/* 1. GLOBAL NAVIGATION */}
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Trend Scout"
          tokens={2000}
        />
      </div>

      {/* 2. MAIN SPLIT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* === LEFT PANEL: DISCOVERY ENGINE === */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Telescope size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">
                    Trend Scout
                  </h2>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-500">
                    Discovery Engine
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Scan across X, Instagram, LinkedIn, and Pinterest to find
                high-velocity content you can remix.
              </p>
            </div>

            <DiscoveryEngine />
          </div>
        </div>

        {/* === RIGHT PANEL: VIRAL FEED === */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-[1600px] mx-auto h-full">
            <MasonryFeed onRemixRequest={handleRemixClick} />
          </div>
        </div>
      </div>

      {/* === 3. INTERACTION LAYER === */}
      <RemixModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originalPost={currentPost}
      />
    </div>
  );
}

"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { TrendPost } from "./TrendCard";

// --- INTERFACE ---
interface MasonryFeedProps {
  onRemixRequest: (post: TrendPost) => void;
}

export default function MasonryFeed({ onRemixRequest: _ }: MasonryFeedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[480px] text-gray-400 gap-4">
      <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
        <Sparkles size={28} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-700">Coming Soon</p>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Trending post discovery is in the works. Check back soon!
        </p>
      </div>
    </div>
  );
}

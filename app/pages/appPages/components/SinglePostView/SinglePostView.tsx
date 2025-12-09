"use client";

import React from "react";
import { SinglePostContent } from "../../[id]/postGenerator/GeneratorResults";
import {
  getPlatformDetails,
  TextContentBox,
  PostVisualCard,
} from "../SharedPostComponents/SharedPostComponents";
import { Clock, Heart } from "lucide-react";

interface SinglePostViewProps {
  data: SinglePostContent;
}

export default function SinglePostView({ data }: SinglePostViewProps) {
  // We don't have platform data in the 'data' object directly in the new strict types,
  // so we default or you can pass it as a prop if needed.
  const platformInfo = getPlatformDetails("IG");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-md p-1.5 ${platformInfo.bg}`}>
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Primary Concept</h3>
            <p className="text-[10px] text-gray-500">
              Optimized for High Engagement
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
            <Clock size={14} />
          </div>
          <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
            <Heart size={14} />
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: The Visual */}
        <div className="w-full">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Visual Preview
          </p>
          <PostVisualCard
            title={data.headline}
            subTitle={data.content}
            visualPrompt={data.visual_description}
          />
        </div>

        {/* Right: The Caption */}
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Caption & Strategy
          </p>
          <TextContentBox text={data.caption} />

          {/* AI Prompt Debug (Optional, looks pro) */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 mb-1">
              IMAGE PROMPT USED
            </p>
            <p className="text-[10px] text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100 line-clamp-2">
              {data.visual_description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

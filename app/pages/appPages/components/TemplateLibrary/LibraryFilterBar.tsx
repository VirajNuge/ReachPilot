"use client";

import React from "react";
import { Platform, AssetType } from "../../../../../lib/mockdata/templatedata"; // Adjust path as needed
import { Type, Image as ImageIcon, LayoutGrid } from "lucide-react";

interface LibraryFilterBarProps {
  selectedPlatform: Platform | "All" | "Threads" | "Pinterest";
  selectedType: AssetType | "All";
  onPlatformChange: (p: any) => void;
  onTypeChange: (t: AssetType | "All") => void;
}

const LibraryFilterBar: React.FC<LibraryFilterBarProps> = ({
  selectedPlatform,
  selectedType,
  onPlatformChange,
  onTypeChange,
}) => {
  // Platform List including Threads & Pinterest
  const platforms = [
    "All",
    "LinkedIn",
    "X",
    "Facebook",
    "Instagram",
    "Threads",
    "Pinterest",
  ];

  const types: { label: string; value: AssetType | "All"; icon: any }[] = [
    { label: "Everything", value: "All", icon: LayoutGrid },
    { label: "Text", value: "text", icon: Type },
    { label: "Visuals", value: "image", icon: ImageIcon },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* 1. LEFT SIDE: Asset Type Segmented Control */}
      <div className="flex-shrink-0">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex font-medium shadow-inner">
          {types.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.value;

            return (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200 ease-out
                  border-none outline-none focus:outline-none ring-0
                  ${
                    isActive
                      ? "bg-white text-violet-700 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }
                `}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT SIDE: Platform Filters */}
      {/* Pushed to the right via justify-between on parent */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {platforms.map((platform) => {
          const isActive = selectedPlatform === platform;
          return (
            <button
              key={platform}
              onClick={() => onPlatformChange(platform)}
              className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                  border-none outline-none focus:outline-none
                  ${
                    isActive
                      ? "bg-violet-100 text-violet-700 shadow-none ring-0"
                      : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }
                `}
            >
              {platform}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryFilterBar;

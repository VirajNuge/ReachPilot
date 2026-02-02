"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`flex w-max p-1.5 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-sm ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBubble"
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-md"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GlassTabs;

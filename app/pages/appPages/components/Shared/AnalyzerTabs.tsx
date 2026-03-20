"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnalyzerTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

const AnalyzerTabs: React.FC<AnalyzerTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`
        relative flex w-fit max-w-full items-center gap-3
        overflow-x-auto no-scrollbar py-2 ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 
              rounded-full text-[13px] font-bold tracking-wide
              transition-all duration-200 ease-out z-10 whitespace-nowrap border-none outline-none overflow-hidden
              ${isActive ? "text-white shadow-sm shadow-[#0052FF]/30" : "text-slate-500 hover:text-slate-800 bg-[#f4f8fb] hover:bg-slate-200"}
            `}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* The Animated "Pill" Background */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#0052FF] rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}

            {/* Icon — rendered directly, no cloneElement prop injection */}
            {tab.icon && (
              <span
                className={`text-[14px] transition-transform duration-200 flex items-center justify-center ${isActive ? "scale-110" : ""}`}
              >
                {tab.icon}
              </span>
            )}

            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export { AnalyzerTabs };

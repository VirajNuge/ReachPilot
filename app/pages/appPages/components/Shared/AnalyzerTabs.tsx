"use client";

import React from "react";
import { motion } from "framer-motion";
// Recommended: npm install lucide-react
import { Activity, Beaker, Users, Map } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  // Icon is now a component/element
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
        relative flex w-fit max-w-full items-center p-1 gap-2
        bg-gray-100/80 backdrop-blur-lg rounded-full 
        overflow-x-auto no-scrollbar ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-1.5 
              rounded-full text-xs font-semibold tracking-wide
              transition-all duration-200 ease-out z-10 whitespace-nowrap border-none outline-none ring-0
              ${isActive ? "text-white" : "text-slate-500 hover:text-slate-800"}
            `}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* The Animated "Pill" Background */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-indigo-600 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                style={{ zIndex: -1 }}
              />
            )}

            {/* Icon - Styled to be smaller and subtle */}
            {tab.icon && (
              <span
                className={`transition-transform duration-200 ${isActive ? "scale-110" : "opacity-70"}`}
              >
                {React.cloneElement(
                  tab.icon as React.ReactElement<{
                    size?: number;
                    strokeWidth?: number;
                  }>,
                  {
                    size: 14,
                    strokeWidth: 2.5,
                  },
                )}
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

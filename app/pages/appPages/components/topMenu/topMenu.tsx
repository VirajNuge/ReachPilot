"use client";

import React from "react";
import {
  ChevronDown,
  Coins,
  Bell,
  Search,
  Sparkles,
  LayoutGrid,
  Zap,
} from "lucide-react";

interface TopMenuProps {
  pageName: string;
  userName?: string;
  userTier?: string;
  tokens?: number;
}

/**
 * TopMenu Component
 * Logic: Fixed height with shrink-0 prevents flex-box overflow.
 * Styling: Soft depth and Mirum Labs branding for a high-end AI Architect feel.
 */
const TopMenu: React.FC<TopMenuProps> = ({
  pageName,
  userName = "Mirum Labs",
  userTier = "Agency Account",
  tokens = 2000,
}) => {
  return (
    <header className="w-full max-w-full h-[90px] flex items-center justify-between px-10 bg-[#F9F9FB]/80 backdrop-blur-md border-b border-gray-200/40 sticky top-0 z-40 shrink-0 overflow-hidden box-border">
      {/* 1. LEFT: ARCHITECTURAL HIERARCHY */}
      <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-500">
        <nav className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Overview
          </span>
          <span className="text-gray-300 text-[10px] font-bold">/</span>
          <span className="text-[10px] font-bold text-violet-500 uppercase tracking-[0.2em]">
            {pageName}
          </span>
        </nav>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          {pageName}
          <div className="flex items-center justify-center w-6 h-6 bg-violet-100 rounded-lg">
            <Sparkles size={14} className="text-violet-600" />
          </div>
        </h1>
      </div>
      <div className="">
        {/* 2. RIGHT: GLOBAL UTILITIES & MIRUM LABS IDENTITY */}
        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* GLOBAL SEARCH & ALERTS */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100 active:scale-95">
                <Bell size={18} strokeWidth={2.5} />
              </button>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-[#F9F9FB] rounded-full animate-pulse" />
            </div>
          </div>

          {/* CREDITS SYSTEM: Optimized for Viraj's SaaS Architecture */}
          <div className="group flex items-center gap-3.5 bg-white border border-gray-100/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-violet-500/5 transition-all cursor-pointer ring-1 ring-transparent hover:ring-violet-100">
            <div className="w-9 h-9 bg-gradient-to-tr from-violet-50 to-indigo-50 rounded-xl flex items-center justify-center text-violet-600 transition-transform group-hover:rotate-12">
              <Coins size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                Tokens
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black text-gray-900 tabular-nums">
                  {tokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* AGENCY ACCOUNT DROP DOWN */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200/60">
            <button className="flex items-center gap-3.5 px-1.5 py-1.5 rounded-2xl hover:bg-white hover:shadow-md hover:ring-1 hover:ring-gray-100 transition-all group">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 via-transparent to-transparent opacity-60" />
                  <span className="relative z-10 tracking-tighter">ML</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-50 flex items-center justify-center">
                  <LayoutGrid
                    size={10}
                    className="text-violet-500"
                    strokeWidth={3}
                  />
                </div>
              </div>

              <div className="text-left hidden xl:block">
                <p className="text-[13px] font-black text-gray-900 group-hover:text-violet-600 transition-colors leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                  {userTier}
                </p>
              </div>
              <ChevronDown
                size={14}
                strokeWidth={3}
                className="text-gray-300 group-hover:text-violet-500 transition-all group-hover:translate-y-0.5 ml-1"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopMenu;

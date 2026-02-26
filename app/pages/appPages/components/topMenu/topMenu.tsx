"use client";

import React from "react";
import { ChevronDown, Coins, Bell, Sparkles, LayoutGrid } from "lucide-react";

interface TopMenuProps {
  pageName: string;
  userName?: string;
  userTier?: string;
  tokens?: number;
}

/**
 * TopMenu Component — Bright Bento Shell Style
 */
const TopMenu: React.FC<TopMenuProps> = ({
  pageName,
  userName = "Mirum Labs",
  userTier = "Agency Account",
  tokens = 2000,
}) => {
  return (
    <header className="w-full max-w-full flex items-center justify-between px-6 py-3 bg-[#E8ECF2] sticky top-0 z-40 shrink-0 overflow-hidden box-border">
      {/* 1. LEFT: PAGE TITLE */}
      <div className="flex flex-col justify-center">
        <nav className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Overview
          </span>
          <span className="text-slate-300 text-[10px]">/</span>
          <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">
            {pageName}
          </span>
        </nav>
        <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight flex items-center gap-2.5">
          {pageName}
          <div className="flex items-center justify-center w-6 h-6 bg-[#0052FF]/10 rounded-lg">
            <Sparkles size={13} className="text-[#0052FF]" />
          </div>
        </h1>
      </div>

      {/* 2. RIGHT: GLOBAL UTILITIES */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <button className="p-2.5 text-slate-400 hover:text-[#1A1D23] bg-white hover:shadow-md rounded-xl transition-all border border-white/60 shadow-sm active:scale-95">
            <Bell size={17} strokeWidth={2.5} />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D4D] border-2 border-[#E8ECF2] rounded-full animate-pulse" />
        </div>

        {/* Tokens pill */}
        <div className="flex items-center gap-2.5 bg-white border border-white/60 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="w-7 h-7 bg-[#0052FF]/10 rounded-xl flex items-center justify-center text-[#0052FF]">
            <Coins size={14} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Tokens
            </span>
            <span className="text-[14px] font-black text-[#1A1D23] tabular-nums leading-none">
              {tokens.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-300/40" />

        {/* User */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white shadow-sm hover:shadow-md border border-white/60 transition-all group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#1A1D23] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0052FF]/30 to-transparent" />
              <span className="relative z-10">ML</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-md shadow-sm border border-slate-100 flex items-center justify-center">
              <LayoutGrid size={8} className="text-[#0052FF]" strokeWidth={3} />
            </div>
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-[13px] font-black text-[#1A1D23] group-hover:text-[#0052FF] transition-colors leading-tight">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {userTier}
            </p>
          </div>
          <ChevronDown
            size={13}
            strokeWidth={3}
            className="text-slate-300 group-hover:text-[#0052FF] transition-all ml-1"
          />
        </button>
      </div>
    </header>
  );
};

export default TopMenu;

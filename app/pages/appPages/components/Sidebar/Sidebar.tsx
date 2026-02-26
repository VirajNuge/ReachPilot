"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFlask,
  FaLightbulb,
  FaPaperPlane,
  FaChartBar,
  FaTachometerAlt,
  FaChevronDown,
  FaChevronRight,
  FaChrome,
  FaArrowRight,
  FaRegQuestionCircle,
  FaUserCog,
  FaUser,
} from "react-icons/fa";
import { BsBoxArrowRight, BsGear } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi2";

/**
 * ReachPilot Sidebar Component — Bright Bento Shell Style
 */
const Sidebar = () => {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    content: true,
    idea: false,
    publishing: false,
    client: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string) => pathname?.includes(path);

  // --- DESIGN SYSTEM TOKENS ---
  const activeMainLink =
    "bg-white text-[#0052FF] shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
  const inactiveMainLink =
    "text-slate-500 hover:bg-white/60 hover:text-[#1A1D23]";

  const sectionLabelStyle =
    "text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-6";
  const subLinkBase =
    "block ml-4 px-4 py-2.5 text-[12px] font-bold rounded-xl transition-all duration-200";

  return (
    <aside className="w-[260px] h-screen shrink-0 bg-[#E8ECF2] flex flex-col z-50 border-none font-sans antialiased">
      {/* 1. BRAND IDENTITY SECTION */}
      <div className="flex items-center gap-3 px-6 py-8 mb-2">
        <div className="w-10 h-10 bg-[#0052FF] rounded-[14px] flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(0,82,255,0.2)]">
          R
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl text-[#1A1D23] tracking-tight leading-none">
            ReachPilot
          </span>
          <span className="text-[9px] font-bold text-[#0052FF] tracking-widest uppercase mt-1">
            Creator Suite
          </span>
        </div>
      </div>

      {/* 3. SCROLLABLE NAVIGATION AREA */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4 space-y-1 pb-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-2">
          Overview
        </p>

        <Link
          href="/dashboard"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border-none no-underline outline-none ${
            isActive("/dashboard") ? activeMainLink : inactiveMainLink
          }`}
        >
          <FaTachometerAlt
            size={15}
            className={
              isActive("/dashboard") ? "text-[#0052FF]" : "text-slate-400"
            }
          />
          <span>Dashboard</span>
        </Link>

        {/* --- TOOLS: CONTENT LAB --- */}
        <p className={sectionLabelStyle}>Automation & AI</p>

        <div className="space-y-1">
          <button
            onClick={() => toggleMenu("content")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border-none outline-none ${
              openMenus.content
                ? "text-[#1A1D23] bg-white/40"
                : "text-slate-500 hover:bg-white/60"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaFlask
                size={15}
                className={
                  openMenus.content ? "text-[#0052FF]" : "text-slate-400"
                }
              />
              <span>Content Lab</span>
            </div>
            {openMenus.content ? (
              <FaChevronDown size={10} className="text-slate-400" />
            ) : (
              <FaChevronRight size={10} className="text-slate-400" />
            )}
          </button>

          {openMenus.content && (
            <div className="ml-5 mt-1 border-l-2 border-slate-200/50 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              {[
                { name: "Persona Builder", path: "accountPersona" },
                { name: "Profile Analyzer", path: "profileAnalyzer" },
                { name: "Post Analyzer", path: "postAnalyzer" },
                { name: "Post Generator", path: "postGenerator" },
                { name: "Template Library", path: "templateLibrary" },
                { name: "ThreadPilot", path: "threadPilot" },
              ].map((item) => (
                <Link
                  key={item.path}
                  href={`/pages/appPages/1/${item.path}`}
                  className={`${subLinkBase} border-none no-underline outline-none ${
                    isActive(item.path)
                      ? "text-[#0052FF] bg-white shadow-sm"
                      : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* --- TOOLS: IDEA FINDER --- */}
          <button
            onClick={() => toggleMenu("idea")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border-none outline-none mt-1 ${
              openMenus.idea
                ? "text-[#1A1D23] bg-white/40"
                : "text-slate-500 hover:bg-white/60"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaLightbulb
                size={15}
                className={openMenus.idea ? "text-[#FF8A00]" : "text-slate-400"}
              />
              <span>Idea Finder</span>
            </div>
            {openMenus.idea ? (
              <FaChevronDown size={10} className="text-slate-400" />
            ) : (
              <FaChevronRight size={10} className="text-slate-400" />
            )}
          </button>

          {openMenus.idea && (
            <div className="ml-5 mt-1 border-l-2 border-slate-200/50 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              <Link
                href="/pages/appPages/1/explorePostIdeas"
                className={`${subLinkBase} ${isActive("explorePostIdeas") ? "text-[#0052FF] bg-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"}`}
              >
                Explore Trending
              </Link>
              <Link
                href="/pages/appPages/1/generateIdeas"
                className={`${subLinkBase} ${isActive("generateIdeas") ? "text-[#0052FF] bg-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"}`}
              >
                Find Post Ideas
              </Link>
              <Link
                href="/pages/appPages/1/questionMine"
                className={`${subLinkBase} ${isActive("questionMine") ? "text-[#0052FF] bg-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"}`}
              >
                Question Mine
              </Link>
            </div>
          )}
        </div>

        {/* --- PERFORMANCE & ANALYTICS --- */}
        <p className={sectionLabelStyle}>Performance</p>

        <div className="space-y-1">
          <Link
            href="/pages/appPages/1/publishing"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all border-none no-underline outline-none ${
              isActive("publishing") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaPaperPlane
              size={15}
              className={
                isActive("publishing") ? "text-[#0052FF]" : "text-slate-400"
              }
            />
            <span>Publishing</span>
          </Link>

          <Link
            href="/pages/appPages/1/analytics"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all border-none no-underline outline-none ${
              isActive("analytics") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaChartBar
              size={15}
              className={
                isActive("analytics") ? "text-[#0052FF]" : "text-slate-400"
              }
            />
            <span>Analytics</span>
          </Link>

          <button
            onClick={() => toggleMenu("client")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border-none outline-none mt-1 ${
              openMenus.client
                ? "text-[#1A1D23] bg-white/40"
                : "text-slate-500 hover:bg-white/60"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaUserCog
                size={15}
                className={
                  openMenus.client ? "text-[#0052FF]" : "text-slate-400"
                }
              />
              <span>Client Manager</span>
            </div>
            {openMenus.client ? (
              <FaChevronDown size={10} className="text-slate-400" />
            ) : (
              <FaChevronRight size={10} className="text-slate-400" />
            )}
          </button>

          {openMenus.client && (
            <div className="ml-5 mt-1 border-l-2 border-slate-200/50 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              {/* Keep a few links for brevity */}
              <Link
                href="/crm-pipeline"
                className={`${subLinkBase} ${isActive("crm-pipeline") ? "text-[#0052FF] bg-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"}`}
              >
                CRM Pipeline
              </Link>
              <Link
                href="/client-workspace"
                className={`${subLinkBase} ${isActive("client-workspace") ? "text-[#0052FF] bg-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23] hover:bg-white/50"}`}
              >
                Client Workspace
              </Link>
            </div>
          )}

          <Link
            href="/account"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all border-none no-underline outline-none mt-1 ${
              isActive("/account") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaUser
              size={15}
              className={
                isActive("/account") ? "text-[#0052FF]" : "text-slate-400"
              }
            />
            <span>Account</span>
          </Link>
        </div>

        {/* --- UTILITY SECTION --- */}
        <p className={sectionLabelStyle}>Support</p>
        <Link
          href="/help"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-500 hover:bg-white/60 hover:text-[#1A1D23] transition-all border-none no-underline outline-none mb-1"
        >
          <FaRegQuestionCircle size={15} className="text-slate-400" />
          <span>Documentation</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-500 hover:bg-white/60 hover:text-[#1A1D23] transition-all border-none no-underline outline-none"
        >
          <BsGear size={15} className="text-slate-400" />
          <span>Workspace Settings</span>
        </Link>
      </div>

      {/* 4. PREMIUM FOOTER SECTION */}
      <div className="p-4 mt-auto">
        {/* PRO CARD: Bright Bento Style */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 group transition-all duration-300 shadow-sm hover:shadow-md border border-white/60">
          <div className="absolute -top-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-700 ease-out">
            <HiSparkles size={100} className="text-[#0052FF]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#1A1D23] text-[13px] font-black tracking-tight">
                PRO Active
              </span>
              <div className="px-2 py-0.5 bg-[#F3FFE5] text-[#4D8C00] rounded-full text-[10px] font-bold tracking-wide">
                100%
              </div>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed mb-4 font-medium pr-2">
              All advanced AI analysis and priority tools are enabled.
            </p>

            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0052FF] hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,82,255,0.2)] active:scale-95">
              <FaChrome size={14} />
              Extension
              <FaArrowRight
                size={10}
                className="ml-1 opacity-80 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

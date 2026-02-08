"use client";

import React, { useState, useEffect } from "react";
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
  FaSearch,
  FaUserCog,
  FaUser,
} from "react-icons/fa";
import { BsBoxArrowRight, BsGear } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi2";

/**
 * ReachPilot Sidebar Component
 * Architecture: Optimized for Next.js 15+
 * Focus: High-end UI with soft depth and consistent branding.
 */

const Sidebar = () => {
  const pathname = usePathname();

  // Advanced state management for independent menu toggles
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
    "bg-white text-violet-600 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-gray-100/80";
  const inactiveMainLink =
    "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900";

  const sectionLabelStyle =
    "text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-3 mt-8";
  const subLinkBase =
    "block ml-4 px-4 py-2.5 text-[12.5px] font-semibold rounded-xl transition-all duration-200";

  return (
    <aside className="w-[280px] h-screen shrink-0 bg-[#F9F9FB] flex flex-col z-50 border-r border-gray-200/40 font-sans antialiased">
      {/* 1. BRAND IDENTITY SECTION */}
      <div className="flex items-center gap-4 px-8 py-10 mb-2">
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gray-200">
            R
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-2xl text-gray-900 tracking-tight leading-none">
            ReachPilot
          </span>
          <span className="text-[10px] font-bold text-violet-500 tracking-widest uppercase mt-1">
            Creator Suite
          </span>
        </div>
      </div>

      {/* 3. SCROLLABLE NAVIGATION AREA */}
      <div className="flex-1 overflow-y-auto custom-scroll px-6 space-y-1.5 pb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">
          Overview
        </p>

        <Link
          href="/dashboard"
          className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 border-none no-underline outline-none focus:outline-none focus:ring-0 ${
            isActive("/dashboard") ? activeMainLink : inactiveMainLink
          }`}
        >
          <FaTachometerAlt
            size={16}
            className={
              isActive("/dashboard") ? "text-violet-600" : "text-gray-400"
            }
          />
          <span>Dashboard</span>
        </Link>

        {/* --- TOOLS: CONTENT LAB --- */}
        <p className={sectionLabelStyle}>Automation & AI</p>

        <div className="space-y-1.5">
          <button
            onClick={() => toggleMenu("content")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 border-none outline-none focus:outline-none focus:ring-0 ${
              openMenus.content
                ? "text-gray-900 bg-gray-50/50"
                : "text-gray-500 hover:bg-gray-100/70"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaFlask
                size={16}
                className={
                  openMenus.content ? "text-violet-500" : "text-gray-400"
                }
              />
              <span>Content Lab</span>
            </div>
            {openMenus.content ? (
              <FaChevronDown size={10} className="text-gray-300" />
            ) : (
              <FaChevronRight size={10} className="text-gray-300" />
            )}
          </button>

          {openMenus.content && (
            <div className="ml-5 mt-1 border-l border-gray-200/80 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
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
                  className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                    isActive(item.path)
                      ? "text-violet-600 bg-violet-50/50"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
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
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 border-none outline-none focus:outline-none focus:ring-0 ${
              openMenus.idea
                ? "text-gray-900 bg-gray-50/50"
                : "text-gray-500 hover:bg-gray-100/70"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaLightbulb
                size={16}
                className={openMenus.idea ? "text-amber-500" : "text-gray-400"}
              />
              <span>Idea Finder</span>
            </div>
            {openMenus.idea ? (
              <FaChevronDown size={10} className="text-gray-300" />
            ) : (
              <FaChevronRight size={10} className="text-gray-300" />
            )}
          </button>

          {openMenus.idea && (
            <div className="ml-5 mt-1 border-l border-gray-200/80 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              <Link
                href="/pages/appPages/1/explorePostIdeas"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${isActive("explorePostIdeas") ? "text-violet-600 bg-violet-50/50" : "text-gray-400 hover:text-gray-900"}`}
              >
                Explore Trending Posts
              </Link>
              <Link
                href="/pages/appPages/1/generateIdeas"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${isActive("generateIdeas") ? "text-violet-600 bg-violet-50/50" : "text-gray-400 hover:text-gray-900"}`}
              >
                Find Post Ideas
              </Link>
              <Link
                href="/pages/appPages/1/questionMine"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${isActive("questionMine") ? "text-violet-600 bg-violet-50/50" : "text-gray-400 hover:text-gray-900"}`}
              >
                Question Mine
              </Link>
            </div>
          )}
        </div>

        {/* --- PERFORMANCE & ANALYTICS --- */}
        <p className={sectionLabelStyle}>Performance</p>

        <div className="space-y-1.5 pt-1">
          <Link
            href="/pages/appPages/1/publishing"
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all border-none no-underline outline-none focus:outline-none focus:ring-0 ${
              isActive("publishing") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaPaperPlane size={16} />
            <span>Publishing & Scheduling</span>
          </Link>

          <Link
            href="/pages/appPages/1/analytics"
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all border-none no-underline outline-none focus:outline-none focus:ring-0 ${
              isActive("analytics") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaChartBar size={16} />
            <span>Analytics</span>
          </Link>

          <button
            onClick={() => toggleMenu("client")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 border-none outline-none focus:outline-none focus:ring-0 ${
              openMenus.client
                ? "text-gray-900 bg-gray-50/50"
                : "text-gray-500 hover:bg-gray-100/70"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FaUserCog
                size={16}
                className={
                  openMenus.client ? "text-violet-500" : "text-gray-400"
                }
              />
              <span>Client Manager</span>
            </div>
            {openMenus.client ? (
              <FaChevronDown size={10} className="text-gray-300" />
            ) : (
              <FaChevronRight size={10} className="text-gray-300" />
            )}
          </button>

          {openMenus.client && (
            <div className="ml-5 mt-1 border-l border-gray-200/80 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              <Link
                href="/crm-pipeline"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                  isActive("crm-pipeline")
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                CRM Pipeline
              </Link>
              <Link
                href="/client-workspace"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                  isActive("client-workspace")
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Client Workspace
              </Link>
              <Link
                href="/manage-meetings"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                  isActive("manage-meetings")
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Manage Meetings
              </Link>
              <Link
                href="/ai-inbox"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                  isActive("ai-inbox")
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                AI Powered Inbox
              </Link>
              <Link
                href="/ai-icebreakers"
                className={`${subLinkBase} border-none no-underline outline-none focus:outline-none focus:ring-0 ${
                  isActive("ai-icebreakers")
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                AI Icebreakers
              </Link>
            </div>
          )}

          <Link
            href="/account"
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all border-none no-underline outline-none focus:outline-none focus:ring-0 ${
              isActive("/account") ? activeMainLink : inactiveMainLink
            }`}
          >
            <FaUser size={16} />
            <span>Account</span>
          </Link>
        </div>

        {/* --- UTILITY SECTION --- */}
        <p className={sectionLabelStyle}>Support</p>
        <Link
          href="/help"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-gray-500 hover:bg-gray-100/50 transition-all border-none no-underline outline-none focus:outline-none focus:ring-0"
        >
          <FaRegQuestionCircle size={16} />
          <span>Documentation</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-gray-500 hover:bg-gray-100/50 transition-all border-none no-underline outline-none focus:outline-none focus:ring-0"
        >
          <BsGear size={16} />
          <span>Workspace Settings</span>
        </Link>
      </div>

      {/* 4. PREMIUM FOOTER & PROFILE AREA */}
      <div className="p-6 mt-auto bg-white/70 backdrop-blur-xl border-t border-gray-100">
        {/* PRO CARD: Elegant Dark Theme with Sparkle Micro-animation */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[28px] p-5 mb-6 group transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 active:scale-[0.98]">
          <div className="absolute -top-6 -right-6 opacity-30 group-hover:scale-125 transition-transform duration-1000 ease-out">
            <HiSparkles size={100} className="text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-white text-[13px] font-bold tracking-tight">
                PRO Mode Active
              </span>
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
              </div>
            </div>

            <p className="text-gray-400 text-[10px] leading-relaxed mb-4 font-medium pr-4">
              Viraj, your advanced AI analysis and priority tools are fully
              enabled.
            </p>

            <button className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 active:translate-y-0.5">
              <FaChrome size={12} />
              Open Extension
              <FaArrowRight
                size={10}
                className="ml-1 opacity-60 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* USER PROFILE: Refined typography and spacing */}
        <div className="flex items-center gap-3.5 px-1 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-violet-500 to-indigo-500 rounded-full blur-[2px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ashley"
              alt="User"
              className="relative w-11 h-11 rounded-full border-2 border-white shadow-md bg-white"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-900 truncate tracking-tight">
              Ashley Curtin
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Premium Member
            </p>
          </div>
          <button className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90">
            <BsBoxArrowRight size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

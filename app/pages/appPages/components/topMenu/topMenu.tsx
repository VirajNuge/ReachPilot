"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./topMenu.css";
import Link from "next/link";
import { BsGrid, BsCoin } from "react-icons/bs";
import {
  FaFlask,
  FaLightbulb,
  FaPaperPlane,
  FaChartBar,
  FaUserCog,
  FaUser,
  FaTachometerAlt,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaExchangeAlt,
  FaChrome,
  FaCheck,
} from "react-icons/fa";

// --- SSR-Safe Portal Tooltip ---
const InfoTooltip = ({ text }: { text: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
    setIsVisible(true);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="ml-2 inline-flex items-center cursor-help group"
      >
        <FaQuestionCircle className="text-gray-500 group-hover:text-white transition-colors text-[10px] opacity-60 group-hover:opacity-100" />
      </div>

      {mounted &&
        isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] bg-gray-900 text-white text-[10px] font-medium py-2 px-3 rounded-md shadow-xl pointer-events-none -translate-y-1/2 animate-in fade-in zoom-in-95 duration-150 max-w-[180px] leading-relaxed border border-gray-700"
            style={{ top: coords.top, left: coords.left }}
          >
            {text}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45" />
          </div>,
          document.body
        )}
    </>
  );
};

// --- Account Data ---
const AVAILABLE_ACCOUNTS = [
  { id: "acc1", name: "Mirum Labs", type: "Agency" },
  { id: "acc2", name: "Personal Brand", type: "Creator" },
  { id: "acc3", name: "Client: TechFlow", type: "Client" },
];

interface LayoutProps {
  pageName: string;
  userName: string;
  userTier: string;
  tokens: number;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  pageName,
  userName,
  userTier,
  tokens,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // --- Account Switcher State ---
  const [activeAccount, setActiveAccount] = useState(AVAILABLE_ACCOUNTS[0]);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <>
      {/* --- Top Bar --- */}
      <div className="appTopContainer">
        <div>
          <div className="appTitle">
            <BsGrid
              size={20}
              color="white"
              className="titleIcon"
              onClick={() => setIsOpen(true)}
            />
            <h3>{pageName}</h3>
          </div>
        </div>

        <div className="appUserDetails">
          <div className="appTockens">
            <BsCoin size={24} />
            <h4>{tokens}</h4>
          </div>

          <div className="appUserName">
            <img src="/images/app/pp.jpg" alt="user profile" />
            <div>
              <h3>{userName}</h3>
              <h4>{userTier}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sidebar Overlay --- */}
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}></div>
      )}

      {/* --- Sidebar --- */}
      {/* 'overflow-y-auto' on sidebar ensures the whole thing scrolls if needed */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="flex items-center">
            <img src="/images/logo.svg" alt="logo" />
            <h2>ReachPilot</h2>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* ⭐ ACCOUNT SWITCHER ⭐ */}
          <div className="mb-2" ref={switcherRef}>
            {/* Header - Solid Purple (Matches Screenshot) */}
            <div
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200
                 ${isSwitcherOpen ? "rounded-t-xl" : "rounded-xl"}
               `}
              style={{
                background: "#a66eff",
                color: "white",
                boxShadow: "0 4px 12px rgba(166, 110, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FaExchangeAlt className="text-white/80" size={14} />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-sm">
                    {activeAccount.name}
                  </span>
                  <span className="text-[10px] font-normal opacity-90">
                    {activeAccount.type}
                  </span>
                </div>
              </div>
              {isSwitcherOpen ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </div>

            {/* Dropdown Body */}
            {isSwitcherOpen && (
              <div
                className="bg-white rounded-b-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
                style={{
                  border: "1px solid #a66eff",
                  borderTop: "none",
                  marginTop: "-1px",
                }}
              >
                {AVAILABLE_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setActiveAccount(acc);
                      setIsSwitcherOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span
                      className={`text-xs ${
                        activeAccount.id === acc.id
                          ? "font-bold text-[#a66eff]"
                          : "text-gray-600"
                      }`}
                    >
                      {acc.name}
                    </span>
                    {activeAccount.id === acc.id && (
                      <FaCheck size={10} color="#a66eff" />
                    )}
                  </div>
                ))}
                <div className="px-4 py-3 text-center cursor-pointer hover:bg-purple-50 transition-colors border-t border-gray-100">
                  <span className="text-xs font-bold text-[#a66eff]">
                    + Add Account
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* DASHBOARD */}
          <div className="menu-section">
            <div className="menu-header flex items-center">
              <FaTachometerAlt className="menu-icon" />
              <Link href="/dashboard" className="flex-1">
                Dashboard
              </Link>
              <InfoTooltip text="Overview of your performance & stats" />
            </div>
          </div>

          {/* CONTENT LAB */}
          <div className="menu-section">
            <div
              className="menu-header flex items-center"
              onClick={() => toggleMenu("content")}
            >
              <FaFlask className="menu-icon" />
              <span className="flex-1">Content Lab</span>
              <InfoTooltip text="Tools to generate & optimize content" />
              <FaChevronDown
                className={`arrow ml-2 ${openMenu === "content" ? "open" : ""}`}
              />
            </div>
            {openMenu === "content" && (
              <div className="submenu space-y-1">
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/accountPersona/">
                    Persona Builder
                  </Link>
                  <InfoTooltip text="Define your unique brand voice" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/profileAnalyzer/">
                    Profile Analyzer
                  </Link>
                  <InfoTooltip text="Audit your profile strength" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/profileComparison/">
                    Profile Comparison
                  </Link>
                  <InfoTooltip text="Compare against competitors" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/postGenerator/">
                    Post Generator
                  </Link>
                  <InfoTooltip text="AI-powered writing assistant" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/templateLibrary/">
                    Templates Library
                  </Link>
                  <InfoTooltip text="Proven viral hooks & structures" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/threadPilot">ThreadPilot</Link>
                  <InfoTooltip text="Turn long-form text into Threads" />
                </div>
              </div>
            )}
          </div>

          {/* IDEA FINDER */}
          <div className="menu-section">
            <div
              className="menu-header flex items-center"
              onClick={() => toggleMenu("idea")}
            >
              <FaLightbulb className="menu-icon" />
              <span className="flex-1">Idea Finder</span>
              <InfoTooltip text="Discover what to post about next" />
              <FaChevronDown
                className={`arrow ml-2 ${openMenu === "idea" ? "open" : ""}`}
              />
            </div>
            {openMenu === "idea" && (
              <div className="submenu space-y-1">
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/explorePostIdeas">
                    Explore Trending Posts
                  </Link>
                  <InfoTooltip text="See what's viral on socials right now" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/generateIdeas">
                    Find Post Ideas
                  </Link>
                  <InfoTooltip text="Brainstorm concepts & strategies" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/pages/appPages/1/questionMine">
                    Question Mine
                  </Link>
                  <InfoTooltip text="Find user pain points on Reddit/Quora" />
                </div>
              </div>
            )}
          </div>

          {/* PUBLISHING */}
          <div className="menu-section">
            <div
              className="menu-header flex items-center"
              onClick={() => toggleMenu("publish")}
            >
              <FaPaperPlane className="menu-icon" />
              <span className="flex-1">Publishing & Scheduling</span>
              <InfoTooltip text="Schedule and auto-post content" />
            </div>
          </div>

          {/* ANALYTICS */}
          <div className="menu-section">
            <div
              className="menu-header flex items-center"
              onClick={() => toggleMenu("analytics")}
            >
              <FaChartBar className="menu-icon" />
              <span className="flex-1">Analytics</span>
              <InfoTooltip text="Track growth and engagement metrics" />
            </div>
          </div>

          {/* CLIENT MANAGER */}
          <div className="menu-section">
            <div
              className="menu-header flex items-center"
              onClick={() => toggleMenu("client")}
            >
              <FaUserCog className="menu-icon" />
              <span className="flex-1">Client Manager</span>
              <InfoTooltip text="Manage leads and client relationships" />
              <FaChevronDown
                className={`arrow ml-2 ${openMenu === "client" ? "open" : ""}`}
              />
            </div>
            {openMenu === "client" && (
              <div className="submenu space-y-1">
                <div className="flex items-center justify-between pr-2">
                  <Link href="/crm-pipeline">CRM Pipeline</Link>
                  <InfoTooltip text="Track deal stages" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/client-workspace">Client Workspace</Link>
                  <InfoTooltip text="Shared space for client collaboration" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/manage-meetings">Manage Meetings</Link>
                  <InfoTooltip text="Calendar and booking system" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/ai-inbox">AI Powered Inbox</Link>
                  <InfoTooltip text="Auto-draft replies to leads" />
                </div>
                <div className="flex items-center justify-between pr-2">
                  <Link href="/ai-icebreakers">AI Icebreakers</Link>
                  <InfoTooltip text="Generate cold outreach openers" />
                </div>
              </div>
            )}
          </div>

          {/* ACCOUNT */}
          <div className="menu-section">
            <div className="menu-header flex items-center">
              <FaUser className="menu-icon" />
              <Link href="/account" className="flex-1">
                Account
              </Link>
              <InfoTooltip text="Manage subscription & settings" />
            </div>
          </div>

          {/* ⭐ EXTENSION BUTTON (Scrollable, Highlighted) ⭐ */}
          <div className="mt-8 mb-4">
            <button
              className="w-full flex items-center justify-center gap-3 text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #a66eff 0%, #8035ff 100%)",
                boxShadow: "0 4px 14px 0 rgba(166, 110, 255, 0.39)",
              }}
            >
              <FaChrome size={18} />
              <span>Use Browser Extension</span>
            </button>
          </div>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <main className="pageContent">{children}</main>
    </>
  );
};

export default Layout;

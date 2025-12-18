"use client";
import React, { useState } from "react";
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
} from "react-icons/fa";

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
          <div className="menu-section">
            <div className="menu-header">
              <FaTachometerAlt className="menu-icon" />
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>

          <div className="menu-section">
            <div className="menu-header" onClick={() => toggleMenu("content")}>
              <FaFlask className="menu-icon" />
              <span>Content Lab</span>
              <FaChevronDown
                className={`arrow ${openMenu === "content" ? "open" : ""}`}
              />
            </div>
            {openMenu === "content" && (
              <div className="submenu">
                <Link href="/pages/appPages/1/accountPersona/">
                  Persona Builder
                </Link>
                <Link href="/pages/appPages/1/profileAnalyzer/">
                  Profile Analyzer
                </Link>
                <Link href="/pages/appPages/1/profileComparison/">
                  Profile Comparison
                </Link>
                <Link href="/pages/appPages/1/postGenerator/">
                  Post Generator
                </Link>
                <Link href="/pages/appPages/1/templateLibrary/">
                  Templates Library
                </Link>
                <Link href="/templates-library">ThreadPilot</Link>
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-header" onClick={() => toggleMenu("idea")}>
              <FaLightbulb className="menu-icon" />
              <span>Idea Finder</span>
              <FaChevronDown
                className={`arrow ${openMenu === "idea" ? "open" : ""}`}
              />
            </div>
            {openMenu === "idea" && (
              <div className="submenu">
                <Link href="/trending-posts">Explore Trending Posts</Link>
                <Link href="/post-ideas">Find Post Ideas</Link>
                <Link href="/hashtag-generator">AI Hashtag Generator</Link>
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-header" onClick={() => toggleMenu("publish")}>
              <FaPaperPlane className="menu-icon" />
              <span>Publishing & Scheduling</span>
            </div>
          </div>

          <div className="menu-section">
            <div
              className="menu-header"
              onClick={() => toggleMenu("analytics")}
            >
              <FaChartBar className="menu-icon" />
              <span>Analytics</span>
            </div>
          </div>

          <div className="menu-section">
            <div className="menu-header" onClick={() => toggleMenu("client")}>
              <FaUserCog className="menu-icon" />
              <span>Client Manager</span>
              <FaChevronDown
                className={`arrow ${openMenu === "client" ? "open" : ""}`}
              />
            </div>
            {openMenu === "client" && (
              <div className="submenu">
                <Link href="/crm-pipeline">CRM Pipeline</Link>
                <Link href="/client-workspace">Client Workspace</Link>
                <Link href="/manage-meetings">Manage Meetings</Link>
                <Link href="/ai-inbox">AI Powered Inbox</Link>
                <Link href="/ai-icebreakers">AI Icebreakers for Outreach</Link>
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-header">
              <FaUser className="menu-icon" />
              <Link href="/account">Account</Link>
            </div>
          </div>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <main className="pageContent">{children}</main>
    </>
  );
};

export default Layout;

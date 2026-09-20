"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  FaChartBar,
  FaChevronDown,
  FaChevronRight,
  FaFlask,
  FaLightbulb,
  FaPaperPlane,
  FaQuestionCircle,
  FaRocket,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { BsGear } from "react-icons/bs";
import { useAuth } from "../../../../contexts/AuthContext";

export interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const Sidebar = ({ collapsed = false, mobileOpen = false, onToggle, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";
  const { user, logout } = useAuth();
  const [contentOpen, setContentOpen] = useState(true);

  const isActive = (path: string) => {
    const target = `/${accountId}/${path.replace(/^\//, "")}`;
    return pathname === target || pathname?.startsWith(`${target}/`);
  };

  const navigate = (route: string) => {
    router.prefetch(route);
    onClose?.();
  };

  const linkClass = (active: boolean, nested = false) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      nested ? "ml-7 text-xs" : ""
    } ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`;

  return (
    <>
      {mobileOpen ? <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" /> : null}
      <aside className={`${mobileOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden lg:flex"} ${collapsed ? "lg:w-[72px]" : "lg:w-60"} h-dvh w-60 max-w-[85vw] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200`}>
        <header className={`relative flex shrink-0 border-b border-slate-100 py-4 ${collapsed ? "flex-col items-center justify-center gap-2 px-2" : "items-center justify-between px-4"}`}>
          <Link href={`/${accountId}/dashboard`} onClick={() => navigate(`/${accountId}/dashboard`)} className="flex min-w-0 items-center gap-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><FaRocket size={16} /></span>
            {!collapsed ? <span className="min-w-0"><span className="block truncate text-base font-bold tracking-tight text-slate-950">ReachPilot</span><span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-blue-700">Creator Suite</span></span> : null}
          </Link>
          {!mobileOpen && onToggle ? <button type="button" onClick={onToggle} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{collapsed ? <FaChevronRight size={12} /> : <FaChevronRight className="rotate-180" size={12} />}</button> : null}
          {mobileOpen ? <button type="button" onClick={onClose} aria-label="Close navigation" className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"><FaTimes size={16} /></button> : null}
        </header>

        <nav className="sidebar-nav no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label="Workspace navigation">
          {!collapsed ? <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Overview</p> : null}
          <Link href={`/${accountId}/dashboard`} onClick={() => navigate(`/${accountId}/dashboard`)} aria-current={isActive("dashboard") ? "page" : undefined} title={collapsed ? "Dashboard" : undefined} className={linkClass(isActive("dashboard"))}>
            <FaTachometerAlt size={14} className="shrink-0" />{!collapsed ? <span>Dashboard</span> : null}
          </Link>

          {!collapsed ? <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Automation & AI</p> : null}
          <button type="button" onClick={() => setContentOpen((value) => !value)} title={collapsed ? "Content Lab" : undefined} aria-expanded={contentOpen} className={`${linkClass(contentOpen)} w-full justify-between`}>
            <span className="flex items-center gap-3"><FaFlask size={14} className="shrink-0" />{!collapsed ? <span>Content Lab</span> : null}</span>
            {!collapsed ? (contentOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />) : null}
          </button>
          {contentOpen && !collapsed ? (
            <div className="mt-1 space-y-1">
              {[{ name: "Persona Builder", path: "accountPersona" }, { name: "Profile Analyzer", path: "profileAnalyzer" }, { name: "Post Analyzer", path: "postAnalyzer" }, { name: "Post Generator", path: "postGenerator" }].map((item) => (
                <Link key={item.path} href={`/${accountId}/${item.path}`} onClick={() => navigate(`/${accountId}/${item.path}`)} aria-current={isActive(item.path) ? "page" : undefined} className={linkClass(isActive(item.path), true)}>{item.name}</Link>
              ))}
            </div>
          ) : null}
          <Link href={`/${accountId}/generateIdeas`} onClick={() => navigate(`/${accountId}/generateIdeas`)} aria-current={isActive("generateIdeas") ? "page" : undefined} title={collapsed ? "Idea Finder" : undefined} className={`mt-1 ${linkClass(isActive("generateIdeas"))}`}>
            <FaLightbulb size={14} className="shrink-0" />{!collapsed ? <span>Idea Finder</span> : null}
          </Link>

          {!collapsed ? <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Performance</p> : null}
          {[{ name: "Publishing", path: "publishing", icon: FaPaperPlane }, { name: "Analytics", path: "analytics", icon: FaChartBar }, { name: "Account", path: "accountPersona", icon: FaUser }].map((item) => {
            const Icon = item.icon;
            return <Link key={item.path} href={`/${accountId}/${item.path}`} onClick={() => navigate(`/${accountId}/${item.path}`)} aria-current={isActive(item.path) ? "page" : undefined} title={collapsed ? item.name : undefined} className={linkClass(isActive(item.path))}><Icon size={14} className="shrink-0" />{!collapsed ? <span>{item.name}</span> : null}</Link>;
          })}

          {!collapsed ? <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Support</p> : null}
          <Link href="/help" onClick={onClose} title={collapsed ? "Documentation" : undefined} className={linkClass(false)}><FaQuestionCircle size={14} className="shrink-0" />{!collapsed ? <span>Documentation</span> : null}</Link>
          <Link href="/settings" onClick={onClose} title={collapsed ? "Settings" : undefined} className={linkClass(false)}><BsGear size={15} className="shrink-0" />{!collapsed ? <span>Workspace Settings</span> : null}</Link>
        </nav>

        <div className={`border-t border-slate-100 p-3 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" className="rounded-lg p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><FaSignOutAlt size={15} /></button>
          ) : (
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">{user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "?"}</div>
                <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</p><p className="truncate text-[11px] text-slate-500">{user?.email || "Not signed in"}</p></div>
              </div>
              <button type="button" onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><FaSignOutAlt size={12} />Sign out</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

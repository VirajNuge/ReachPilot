"use client";

import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import TopMenu from "../components/topMenu/topMenu";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getTitle = (path: string | null): string => {
    if (!path) return "Dashboard";
    if (path.includes("/postAnalyzer")) return "Post Analyzer";
    if (path.includes("/accountPersona")) return "Account Persona Builder";
    if (path.includes("/profileAnalyzer")) return "Profile Analyzer";
    if (path.includes("/publishing")) return "Scheduling & Publishing";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/generateIdeas")) return "Find Post Ideas";
    if (path.includes("/explorePostsIdeas")) return "Explore Trending";
    if (path.includes("/questionMine")) return "Question Mine";
    if (path.includes("/postGenerator")) return "Post Generator";
    return "Dashboard";
  };

  const title = getTitle(pathname);
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#E8ECF2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-[#E8ECF2]">
      {/* Sidebar - Fixed width, full height */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-hidden">
        {/* TopMenu - Pinned to the top of this container */}
        <TopMenu pageName={title} />

        {/* Scrollable Content Area — transparent so cards float on shell bg */}
        <main className="flex-1 overflow-y-auto [scrollbar-width:none] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

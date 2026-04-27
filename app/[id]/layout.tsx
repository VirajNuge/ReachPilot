"use client";

import React, { useEffect } from "react";
import Sidebar from "../pages/appPages/components/Sidebar/Sidebar";
import TopMenu from "../pages/appPages/components/topMenu/topMenu";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getTitle = (path: string | null): string => {
    if (!path) return "Dashboard";
    if (path.includes("/postAnalyzer")) return "Post Analyzer";
    if (path.includes("/accountPersona")) return "Account Persona Builder";
    if (path.includes("/profileAnalyzer")) return "Profile Analyzer";
    if (path.includes("/postGenerator")) return "Post Generator";
    if (path.includes("/publishing")) return "Scheduling & Publishing";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/generateIdeas")) return "Find Post Ideas";
    if (path.includes("/explorePostsIdeas")) return "Explore Trending";
    if (path.includes("/questionMine")) return "Question Mine";
    return "Dashboard";
  };

  const title = getTitle(pathname);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-[#E8ECF2]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-hidden">
        <TopMenu pageName={title} />
        <main className="flex-1 overflow-y-auto [scrollbar-width:none] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

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

  // Redirect to login when auth resolves and there is no user.
  // We do NOT block rendering — the shell paints immediately.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // ── INSTANT SHELL: render the sidebar + topbar right away.
  // While auth is resolving, the sidebar shows skeleton initials ("?") and
  // the topbar shows a pulse skeleton — both handled inside their own components.
  // This eliminates the blank-screen spinner that was blocking for ~4.6 s.
  return (
    <div className="flex h-screen w-full bg-[#E8ECF2]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-hidden">
        <TopMenu pageName={title} />
        <main className="flex-1 overflow-y-auto [scrollbar-width:none] w-full">
          {/* While auth is still loading AND there is no user yet, show a
              minimal content skeleton so pages don't flash with wrong data. */}
          {loading && !user ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-sm font-medium">
                  Loading...
                </span>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

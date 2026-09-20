"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppShell from "../components/AppShell/AppShell";

function getPageTitle(path: string | null): string {
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
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AppShell
      pageName={getPageTitle(pathname)}
      showPageTitle={!pathname?.endsWith("/dashboard")}
    >
      {children}
    </AppShell>
  );
}

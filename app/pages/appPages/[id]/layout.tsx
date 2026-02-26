"use client";

import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import TopMenu from "../components/topMenu/topMenu";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPostAnalyzer = pathname?.includes("/postAnalyzer");
  const title = isPostAnalyzer ? "Post Analyzer" : "Profile Analyzer";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#E8ECF2]">
      {/* Sidebar - Fixed width, full height */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

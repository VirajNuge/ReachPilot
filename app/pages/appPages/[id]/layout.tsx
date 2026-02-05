"use client";

import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import TopMenu from "../components/topMenu/topMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9F9FB]">
      {/* Sidebar - Fixed width, full height */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopMenu - Pinned to the top of this container */}
        <TopMenu pageName="Profile Analyzer" />

        {/* Scrollable Content Area */}
        <main className="flex overflow-y-auto [scrollbar-width:none] max-w-[1300px]">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Sidebar from "../Sidebar/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--sidebar-bg)] font-sans">
      <Sidebar />

      {/* Main Content Area */}
      {/* 
         The 'Modern Soft' look involves the main content area looking like a card 
         placed ON TOP of the siding background. 
         We achieve this with margin-left (for sidebar) and a top-left rounded corner.
      */}
      <main className="ml-[260px] min-h-screen bg-white rounded-tl-[40px] shadow-[-10px_-10px_30px_rgba(255,255,255,1),_5px_0_20px_rgba(0,0,0,0.02)] relative z-10 p-8 transition-all">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

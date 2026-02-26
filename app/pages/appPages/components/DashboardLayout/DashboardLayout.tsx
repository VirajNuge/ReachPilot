"use client";

import React from "react";
import Sidebar from "../Sidebar/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#E8ECF2] font-sans">
      <Sidebar />

      {/* Main Content Area — transparent, cards float on bg */}
      <main className="flex-1 min-h-screen overflow-y-auto [scrollbar-width:none] p-6 transition-all">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

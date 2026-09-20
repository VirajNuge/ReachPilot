"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../Sidebar/Sidebar";
import TopMenu from "../topMenu/topMenu";
import { useAuth } from "../../../../contexts/AuthContext";

export interface AppShellProps {
  children: React.ReactNode;
  pageName: string;
  showPageTitle?: boolean;
}

export default function AppShell({
  children,
  pageName,
  showPageTitle = true,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const reportOverflow = () => {
      const { documentElement } = document;
      if (documentElement.scrollWidth > documentElement.clientWidth) {
        console.warn("[ReachPilot UI] Horizontal overflow detected", {
          pathname,
          scrollWidth: documentElement.scrollWidth,
          clientWidth: documentElement.clientWidth,
        });
      }
    };

    const frame = window.requestAnimationFrame(reportOverflow);
    window.addEventListener("resize", reportOverflow);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", reportOverflow);
    };
  }, [pathname]);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopMenu
          pageName={pageName}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          showPageTitle={showPageTitle}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto [scrollbar-width:none]">
          {loading && !user ? (
            <div className="flex h-full min-h-48 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <span className="text-sm font-medium text-slate-400">Loading...</span>
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

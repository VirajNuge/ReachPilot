"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaRocket,
  FaTachometerAlt,
  FaUsers,
  FaPenNib,
  FaPalette,
  FaSignOutAlt,
  FaLayerGroup,
} from "react-icons/fa";
import { Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: FaTachometerAlt },
  { label: "Users", href: "/admin/users", icon: FaUsers },
  { label: "Writing Styles", href: "/admin/writing-styles", icon: FaPenNib },
  { label: "Visual Styles", href: "/admin/visual-styles", icon: FaPalette },
  { label: "Caption Templates", href: "/admin/caption-templates", icon: FaLayerGroup },
];

const activeLink =
  "bg-white text-[#0052FF] shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
const inactiveLink =
  "text-slate-500 hover:bg-white/60 hover:text-[#1A1D23]";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-[260px] h-screen shrink-0 bg-[#E8ECF2] flex flex-col z-50 border-none font-sans antialiased">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-8 mb-2">
        <div className="w-10 h-10 bg-[#0052FF] rounded-[14px] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,82,255,0.2)]">
          <FaRocket size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl text-[#1A1D23] tracking-tight leading-none">
            ReachPilot
          </span>
          <span className="text-[9px] font-bold text-[#0052FF] tracking-widest uppercase mt-1">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4 space-y-1 pb-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-2">
          Admin
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border-none no-underline outline-none ${
              isActive(href) ? activeLink : inactiveLink
            }`}
          >
            <Icon
              size={15}
              className={isActive(href) ? "text-[#0052FF]" : "text-slate-400"}
            />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 group transition-all duration-300 shadow-sm hover:shadow-md border border-white/60">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0052FF] rounded-xl flex items-center justify-center text-white text-[13px] font-black shrink-0">
                VA
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#1A1D23] text-[13px] font-black tracking-tight truncate">
                  VirajNugeAdmin
                </span>
                <span className="text-slate-400 text-[11px] font-medium truncate flex items-center gap-1">
                  <Shield size={10} className="text-[#0052FF]" />
                  Administrator
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 font-bold rounded-xl transition-all bg-[#F1F5F9] hover:bg-red-50 text-slate-500 hover:text-red-500 text-[13px] cursor-pointer border-none"
            >
              <FaSignOutAlt size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

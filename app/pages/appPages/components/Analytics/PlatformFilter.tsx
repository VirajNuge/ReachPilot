"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaAt,
} from "react-icons/fa";
import type { PlatformKey } from "@/lib/analytics/platforms";

interface PlatformFilterProps {
  selected: PlatformKey;
  onSelect: (platform: PlatformKey) => void;
}

export default function PlatformFilter({
  selected,
  onSelect,
}: PlatformFilterProps) {
  const platforms = [
    {
      id: "all",
      label: "Overview",
      icon: <LayoutGrid size={14} />,
      color: "text-gray-600",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <FaLinkedin size={14} />,
      color: "text-[#0077B5]",
    },
    {
      id: "twitter",
      label: "X / Twitter",
      icon: <FaTwitter size={14} />,
      color: "text-black",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: <FaInstagram size={14} />,
      color: "text-[#E1306C]",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <FaFacebook size={14} />,
      color: "text-[#1877F2]",
    },
    {
      id: "threads",
      label: "Threads",
      icon: <FaAt size={14} />,
      color: "text-black",
    },
    {
      id: "pinterest",
      label: "Pinterest",
      icon: <FaPinterest size={14} />,
      color: "text-[#E60023]",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 px-3 py-2 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {platforms.map((p) => {
        const isActive = selected === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id as PlatformKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              isActive
                ? "bg-[#000100] text-white border-[#000100] shadow-md transform scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={isActive ? "text-white" : p.color}>{p.icon}</span>
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Hash,
  Check,
} from "lucide-react";

export default function PlatformMatrix() {
  // Default to text-heavy platforms initially
  const [selected, setSelected] = useState<string[]>(["twitter", "linkedin"]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Platform Configuration
  const platforms = [
    {
      id: "twitter",
      name: "X / Twitter",
      icon: <Twitter size={18} />,
      activeColor: "bg-black text-white border-black",
      inactiveColor: "text-gray-600 bg-gray-100",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      activeColor: "bg-[#0077B5] text-white border-[#0077B5]",
      inactiveColor: "text-gray-600 bg-gray-100",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram size={18} />,
      activeColor:
        "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white border-purple-500",
      inactiveColor: "text-gray-600 bg-gray-100",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook size={18} />,
      activeColor: "bg-[#1877F2] text-white border-[#1877F2]",
      inactiveColor: "text-gray-600 bg-gray-100",
    },
    // {
    //   id: "pinterest",
    //   name: "Pinterest",
    //   icon: <Hash size={18} />,
    //   activeColor: "bg-[#E60023] text-white border-[#E60023]",
    //   inactiveColor: "text-gray-600 bg-gray-100",
    // },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-bold text-gray-800">
          Source Platforms
        </label>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {selected.length} Active
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {platforms.map((p) => {
          const isActive = selected.includes(p.id);

          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`
                relative flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all duration-200 group text-left
                ${
                  isActive
                    ? "bg-white border-indigo-100 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-gray-50"
                }
              `}
            >
              {/* Icon Badge */}
              <div
                className={`
                  p-2 rounded-lg transition-colors duration-300
                  ${isActive ? p.activeColor : p.inactiveColor}
                `}
              >
                {p.icon}
              </div>

              {/* Label */}
              <span
                className={`text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-500 group-hover:text-gray-700"
                }`}
              >
                {p.name}
              </span>

              {/* Active Indicator (Checkmark) */}
              <div
                className={`
                absolute right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                ${
                  isActive
                    ? "bg-green-500 scale-100 opacity-100"
                    : "bg-gray-200 scale-75 opacity-0"
                }
              `}
              >
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

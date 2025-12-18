"use client";

import React, { useState } from "react";
import { Twitter, Linkedin, AtSign, Check } from "lucide-react"; // AtSign often used for Threads icon replacement

export default function TargetPlatformSelector() {
  // Mock state: In real app, this would come from props or context
  const [selected, setSelected] = useState<string[]>(["twitter", "linkedin"]);

  const togglePlatform = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const platforms = [
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: <Twitter size={24} />,
      color: "bg-black text-white", // Brand color
      activeBorder: "ring-black",
      desc: "Short-form threads & rapid takes.",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin size={24} />,
      color: "bg-[#0077B5] text-white", // LinkedIn Blue
      activeBorder: "ring-[#0077B5]",
      desc: "Professional insights & networking.",
    },
    {
      id: "threads",
      name: "Threads",
      icon: <AtSign size={24} />,
      color: "bg-gray-900 text-white", // Threads Dark
      activeBorder: "ring-gray-900",
      desc: "Conversational & community focus.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Target Platforms</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Where will the Pilot post?
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {platforms.map((p) => {
          const isActive = selected.includes(p.id);

          return (
            <div
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? `border-transparent ring-2 ${p.activeBorder} bg-gray-50`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
            >
              {/* Icon Box */}
              <div className={`p-3 rounded-lg shadow-sm ${p.color}`}>
                {p.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1">
                <h4
                  className={`font-bold text-sm ${
                    isActive ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {p.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>

              {/* Checkmark Badge */}
              {isActive && (
                <div
                  className={`absolute top-4 right-4 p-1 rounded-full ${p.color}`}
                >
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

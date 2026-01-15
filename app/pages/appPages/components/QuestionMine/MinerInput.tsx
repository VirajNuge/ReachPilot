"use client";

import React, { useState } from "react";
import {
  Search,
  Pickaxe,
  MessageCircle,
  Globe,
  HelpCircle,
} from "lucide-react";

// --- TYPES ---
interface MinerInputProps {
  onSearch?: (term: string, sources: string[]) => void;
  isMining?: boolean;
}

export default function MinerInput({ onSearch, isMining }: MinerInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sources, setSources] = useState(["reddit", "quora", "google"]);

  const toggleSource = (id: string) => {
    if (sources.includes(id)) {
      setSources(sources.filter((s) => s !== id));
    } else {
      setSources([...sources, id]);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim().length > 2) {
      onSearch?.(searchTerm, sources);
    }
  };

  const platforms = [
    {
      id: "reddit",
      label: "Reddit",
      icon: <MessageCircle size={16} />,
      desc: "Raw, unfiltered user opinions",
    },
    {
      id: "quora",
      label: "Quora",
      icon: <HelpCircle size={16} />,
      desc: "Specific, long-form questions",
    },
    {
      id: "google",
      label: "Google PAA",
      icon: <Globe size={16} />,
      desc: "High SEO value queries",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Keyword Input */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          Target Keyword
        </label>
        <div className="relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            type="text"
            placeholder="e.g. 'Freelancing' or 'SaaS Churn'"
            className="w-[315px] pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 2. Source Selection */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-3 block">
          Mining Sources
        </label>
        <div className="space-y-2">
          {platforms.map((p) => {
            // TODO: Replace false with sources.includes(p.id)
            const isActive = sources.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSource(p.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-orange-50 border-orange-400 shadow-sm ring-1 ring-orange-400"
                      : "bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                  }
                `}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-400 group-hover:text-orange-600"
                  }`}
                >
                  {p.icon}
                </div>
                <div>
                  <span
                    className={`text-sm font-bold block ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {p.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {p.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Action Button */}
      <div className="pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-4 z-10">
        <button
          onClick={handleSearch}
          disabled={isMining || searchTerm.length < 3 || sources.length === 0}
          className={`w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all transform flex items-center justify-center gap-3 ${
            searchTerm.length >= 3 && sources.length > 0 && !isMining
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <Pickaxe size={20} />
          {isMining ? "Digging Deep..." : "Start Excavation"}
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
          Scans ~50 threads per source.
        </p>
      </div>
    </div>
  );
}

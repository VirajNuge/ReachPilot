"use client";

import React, { useState } from "react";
import { Search, UserCircle2, X } from "lucide-react";

export default function TrendFilters() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-5">
      {/* 1. Persona Context Card */}
      {/* This reminds the user WHO the AI is acting as when looking for trends */}
      <div className="bg-indigo-50/80 rounded-xl p-4 border border-indigo-100 flex items-start gap-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50">
        <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600 ring-1 ring-indigo-50">
          <UserCircle2 size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
            Active Scout Persona
          </span>
          <h4 className="text-sm font-bold text-indigo-900 leading-tight">
            Tech Founder
          </h4>
          <p className="text-xs text-indigo-700/80 mt-1 leading-snug">
            Scouting for:{" "}
            <span className="font-medium">
              SaaS Growth, AI Tools, Bootstrapping
            </span>
          </p>
        </div>
      </div>

      {/* 2. Deep Search Input */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Target Topic
        </label>

        <div className="relative group">
          {/* Input Field */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. 'AI Marketing' or paste a post URL..."
            className="w-[295px] pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:border-gray-300"
          />

          {/* Search Icon (Left) */}
          <Search
            size={18}
            className="absolute left-3 top-3.5 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
          />

          {/* Clear Button (Right) - Only shows when there is text */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Helper Text */}
        <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium">
          Supports keywords, hashtags (#), or direct profile links.
        </p>
      </div>
    </div>
  );
}

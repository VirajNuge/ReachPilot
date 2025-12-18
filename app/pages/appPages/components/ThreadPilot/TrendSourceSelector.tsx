"use client";

import React, { useState } from "react";
import { Globe, Rss, Hash, Search, Plus, X } from "lucide-react";

export default function TrendSourceSelector() {
  const [keywords, setKeywords] = useState(["SaaS", "NextJS", "AI Marketing"]);
  const [inputValue, setInputValue] = useState("");

  const addKeyword = () => {
    if (inputValue.trim() && !keywords.includes(inputValue)) {
      setKeywords([...keywords, inputValue]);
      setInputValue("");
    }
  };

  const removeKeyword = (tag: string) => {
    setKeywords(keywords.filter((k) => k !== tag));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Globe size={18} className="text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">
          Intelligence Sources
        </h3>
      </div>

      {/* Source Toggles */}
      <div className="grid grid-cols-1 gap-3">
        {/* Source 1 */}
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 cursor-pointer transition-all">
          <div className="flex gap-3">
            <div className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-md h-fit">
              <Search size={16} />
            </div>
            <div>
              <span className="block text-sm font-bold text-gray-900">
                Global Tech Trends
              </span>
              <span className="text-xs text-gray-500">
                Monitors viral topics on X (Twitter) & LinkedIn.
              </span>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>

        {/* Source 2 */}
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 cursor-pointer transition-all">
          <div className="flex gap-3">
            <div className="mt-1 p-1.5 bg-orange-50 text-orange-600 rounded-md h-fit">
              <Rss size={16} />
            </div>
            <div>
              <span className="block text-sm font-bold text-gray-900">
                Competitor Watchlist
              </span>
              <span className="text-xs text-gray-500">
                Watches top 5 voices in your niche for reaction opportunities.
              </span>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>
      </div>

      {/* Keyword Input System */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          <Hash size={12} />
          Focus Keywords
        </label>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add topic (e.g. #MicroSaaS)..."
            className="flex-1 text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <button
            onClick={addKeyword}
            className="p-2.5 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Active Tags */}
        <div className="flex flex-wrap gap-2">
          {keywords.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-sm font-medium text-gray-700 rounded-md border border-gray-200 shadow-sm"
            >
              {tag}
              <button
                onClick={() => removeKeyword(tag)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

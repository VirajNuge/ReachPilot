"use client";

import React from "react";
import { PenTool, Check, X, Clock, MoreHorizontal } from "lucide-react";

export default function DraftQueue() {
  // Mock Data
  const drafts = [
    {
      id: 101,
      platform: "linkedin",
      content:
        "Unpopular opinion: Hybrid work isn't failing because of the office. It's failing because we haven't updated our management style since 2019.\n\nHere are 3 distinct signals I'm seeing in the data...",
      timestamp: "Generated 2m ago",
      trigger: "Remote Work 2025",
    },
    {
      id: 102,
      platform: "twitter",
      content:
        "DeepSeek running locally is a game changer for indie devs. \n\nZero API costs. \nFull privacy. \n\nIs the OpenAI moat finally drying up? 🧵👇",
      timestamp: "Generated 15m ago",
      trigger: "DeepSeek vs OpenAI",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PenTool size={18} className="text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">Review Queue</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
          2 Pending
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Context Header */}
            <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    draft.platform === "linkedin" ? "bg-[#0077B5]" : "bg-black"
                  }`}
                ></span>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">
                  Based on: {draft.trigger}
                </span>
              </div>
              <button className="bg-[#000100] hover:bg-black text-white">
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Post Content Preview */}
            <div className="p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                {draft.content}
              </p>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-2 border-t border-gray-100 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-colors bg-[#000100] hover:bg-black text-white">
                <Check size={14} /> Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-colors bg-[#000100] hover:bg-black text-white">
                <Clock size={14} /> Edit
              </button>
              <button className="p-2 rounded-lg transition-colors bg-[#000100] hover:bg-black text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State Hint */}
        <div className="text-center py-8">
          <p className="text-xs text-gray-400">Waiting for new trends...</p>
        </div>
      </div>
    </div>
  );
}

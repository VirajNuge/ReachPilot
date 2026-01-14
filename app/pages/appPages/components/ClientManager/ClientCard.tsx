"use client";

import React from "react";
import { MoreHorizontal, Sparkles, DollarSign, BarChart } from "lucide-react";
import { Client } from "./crmTypes";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  // ⭐ DRAG START: This makes the JS work
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("clientId", client.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none relative mb-3"
    >
      {/* 1. Header: Avatar & Name */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600 border border-gray-200">
            {client.logo}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg leading-tight">
              {client.name}
            </h4>
            <p className="text-sm text-gray-500 font-medium">
              {client.tags[0] || "Client"}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-full transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 2. Badges Row */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-medium border border-orange-100">
          <BarChart size={12} className="text-orange-500" />
          <span>Match Score {client.sentimentScore}%</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100">
          <DollarSign size={12} className="text-blue-500" />
          <span>
            {client.currency}
            {client.contractValue.toLocaleString()}/m
          </span>
        </div>
      </div>

      {/* 3. AI Insights */}
      <div className="space-y-2.5 mb-5">
        <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2.5 border border-gray-100">
          <Sparkles
            size={14}
            className="text-indigo-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-gray-700 leading-snug font-medium">
            {client.nextTask || "AI suggests sending a follow-up email."}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2.5 border border-gray-100">
          <Sparkles
            size={14}
            className="text-indigo-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-gray-700 leading-snug font-medium">
            Meeting booked on 2025-12-03 at 15:00 for 15 mins.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          View Client Workspace
        </button>
        <button className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors border border-gray-200">
          Message
        </button>
        <button className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors border border-gray-200">
          Book Meeting
        </button>
      </div>
    </div>
  );
}

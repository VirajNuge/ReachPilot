"use client";

import React, { useState } from "react";
import { Shield, Video, MoreHorizontal, Zap } from "lucide-react";
import { Meeting } from "./meetingData";

interface SidebarProps {
  upcoming: Meeting[];
}

export default function MeetingSidebar({ upcoming }: SidebarProps) {
  const [deepWorkMode, setDeepWorkMode] = useState(false);

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col p-6 overflow-hidden">
      {/* Deep Work Toggle (unchanged) */}
      <div className="bg-gray-900 rounded-2xl p-4 text-white mb-8 shadow-xl shadow-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-indigo-400" />
            <span className="font-bold text-sm">Deep Work Defense</span>
          </div>
          <div
            onClick={() => setDeepWorkMode(!deepWorkMode)}
            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${
              deepWorkMode ? "bg-indigo-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                deepWorkMode ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {deepWorkMode ? "Morning slots blocked." : "Schedule is open."}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Zap size={16} className="text-orange-500" /> Upcoming
        </h3>
        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {upcoming.length}
        </span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {upcoming.map((meeting) => (
          <div
            key={meeting.id}
            className="group p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  meeting.type === "Urgent"
                    ? "bg-red-100 text-red-600"
                    : meeting.type === "Strategy"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {meeting.type}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {meeting.time}
              </span>
            </div>

            <h4 className="font-bold text-gray-800 text-sm mb-1">
              {meeting.title}
            </h4>
            <p className="text-xs text-gray-500 mb-3">{meeting.clientName}</p>

            {meeting.aiPrepNote && (
              <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 mb-3">
                <p className="text-[10px] text-indigo-800 font-medium leading-tight">
                  {meeting.aiPrepNote}
                </p>
              </div>
            )}

            {/* ⭐ JOIN BUTTONS: Styled by Platform */}
            <div className="flex gap-2">
              <button
                className={`flex-1 border text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  meeting.platform === "Zoom"
                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white"
                }`}
              >
                <Video size={12} /> Join {meeting.platform}
              </button>
              <button className="px-2 rounded-lg bg-[#000100] hover:bg-black text-white">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

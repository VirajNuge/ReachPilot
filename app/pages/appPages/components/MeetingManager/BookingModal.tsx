"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  User,
  List,
  Video,
  Monitor,
} from "lucide-react";
import { MeetingType, MeetingPlatform } from "./meetingData";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (data: any) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  onBook,
}: BookingModalProps) {
  const [client, setClient] = useState("");
  const [type, setType] = useState<MeetingType>("Check-in");
  const [platform, setPlatform] = useState<MeetingPlatform>("Google Meet"); // ⭐ Default
  const [agenda, setAgenda] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const generateAgenda = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const templates: Record<string, string> = {
        Strategy:
          "• Review Quarterly Goals\n• Budget Allocation\n• Competitor Analysis",
        "Check-in":
          "• Content Calendar Approval\n• Performance Metrics\n• Next Steps",
        Urgent:
          "• Incident Overview\n• Immediate Action Plan\n• Communication Strategy",
        Onboarding: "• Team Intro\n• Access Setup\n• Goal Setting",
      };
      setAgenda(templates[type] || "");
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={20} /> Book Session
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Client Select */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
              Client
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">Select a Client...</option>
                <option value="TechFlow Inc.">TechFlow Inc.</option>
                <option value="Urban Coffee">Urban Coffee</option>
              </select>
            </div>
          </div>

          {/* ⭐ PLATFORM SELECTOR */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform("Google Meet")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                  platform === "Google Meet"
                    ? "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Video size={16} /> Google Meet
              </button>
              <button
                onClick={() => setPlatform("Zoom")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                  platform === "Zoom"
                    ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Monitor size={16} /> Zoom
              </button>
            </div>
          </div>

          {/* Type & Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Type
              </label>
              <select
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
              >
                <option value="Check-in">Check-in</option>
                <option value="Strategy">Strategy</option>
                <option value="Urgent">Urgent</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
              Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
              />
              <div className="px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center border border-indigo-100 w-24">
                EST: 2pm
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Agenda
              </label>
              <button
                onClick={generateAgenda}
                className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
              >
                {isGenerating ? (
                  <Sparkles size={10} className="animate-spin" />
                ) : (
                  <Sparkles size={10} />
                )}
                AI Auto-Pilot
              </button>
            </div>
            <div className="relative">
              <List size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="What will you discuss?"
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={() => {
              onBook({ client, type, agenda, platform });
              onClose();
            }} // ⭐ Pass Platform
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Confirm & Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

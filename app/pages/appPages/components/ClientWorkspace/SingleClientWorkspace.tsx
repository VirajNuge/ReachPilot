"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  BrainCircuit,
  FileText,
  Image as ImageIcon,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Calendar,
  Mic2,
} from "lucide-react";
import { ClientWorkspace } from "./workspaceTypes";

interface WorkspaceProps {
  workspace: ClientWorkspace;
  onBack: () => void;
}

type Tab = "strategy" | "intelligence" | "production" | "vault";

export default function SingleClientWorkspace({
  workspace,
  onBack,
}: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>("strategy");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* ================= HEADER ================= */}
      <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full transition-colors bg-[#000100] hover:bg-black text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600 overflow-hidden relative">
              {workspace.logo}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: workspace.brand.primaryColor }}
              ></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {workspace.clientName}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-gray-500">AI Monitor Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          {[
            { id: "strategy", label: "Strategy", icon: Target },
            { id: "intelligence", label: "Intelligence", icon: BrainCircuit },
            { id: "production", label: "Production", icon: LayoutDashboard },
            { id: "vault", label: "Vault", icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 bg-[#FAFAFA] overflow-y-auto p-8 custom-scrollbar">
        {/* ---------------- TAB 1: STRATEGY (The Zero-Day Scan) ---------------- */}
        {activeTab === "strategy" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
            {/* LEFT: THE AUDIT REPORT */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Overall Score Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Zero-Day Scan
                    </span>
                    <span className="text-xs text-gray-400">
                      Updated 2h ago
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Brand Health Audit
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    AI analyzed {workspace.brand.socials.length} connected
                    accounts. The brand voice is strong, but visual consistency
                    needs attention.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600 bg-white shadow-sm">
                    {workspace.audit.overallScore}
                  </div>
                  <span className="text-xs font-bold text-gray-400 mt-2">
                    Overall Score
                  </span>
                </div>
              </div>

              {/* 2. Detailed Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Mic2 size={18} className="text-gray-400" />
                    <h4 className="font-bold text-gray-700">
                      Tone Consistency
                    </h4>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${workspace.audit.toneConsistency}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Score: {workspace.audit.toneConsistency}/100. Excellent
                    alignment across channels.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={18} className="text-gray-400" />
                    <h4 className="font-bold text-gray-700">
                      Visual Consistency
                    </h4>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{ width: `${workspace.audit.visualConsistency}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Score: {workspace.audit.visualConsistency}/100.{" "}
                    <span className="text-orange-600 font-bold">
                      Deviation detected.
                    </span>
                  </p>
                </div>
              </div>

              {/* 3. Strategic Insight Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Sparkles size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Strategic Advantage Detected
                    </h4>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      "{workspace.audit.strategicAdvantage}"
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-gray-300">
                        Target: {workspace.audit.topPerformingTopic}
                      </span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg text-xs font-bold">
                        Gap: {workspace.audit.contentGap}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: COMPETITOR WATCHTOWER */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-indigo-600" />{" "}
                    Watchtower
                  </h4>
                  <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full animate-pulse">
                    Live
                  </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {workspace.competitors?.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800">
                          {comp.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            comp.threatLevel === "High"
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {comp.threatLevel} Threat
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {comp.recentActivity}
                      </p>
                      <button className="w-full py-1.5 font-bold rounded-lg hover: transition-colors bg-[#000100] hover:bg-black text-white">
                        Generate Counter-Post
                      </button>
                    </div>
                  ))}

                  <button className="w-full py-3 rounded-xl font-bold hover: transition-all flex items-center justify-center gap-2 bg-[#000100] hover:bg-black text-white">
                    <Plus size={14} /> Track New Competitor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: INTELLIGENCE (Smart Notebook) ---------------- */}
        {activeTab === "intelligence" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
            {/* Left: Meeting Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={18} /> Smart Notebook
                </h4>
                <button className="px-3 py-1.5 rounded-lg font-bold bg-[#000100] hover:bg-black text-white">
                  + New Note
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {workspace.notes?.map((note) => (
                  <div key={note.id} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h5>
                      <span className="text-xs text-gray-400">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {note.summary}
                    </p>

                    {/* AI Extracted Actions */}
                    <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                      <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                        <Zap size={10} /> AI Extracted Actions
                      </div>
                      <ul className="space-y-1">
                        {note.actionItems.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs text-gray-700"
                          >
                            <div className="w-3 h-3 rounded border border-gray-300 bg-white"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Context Feed */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
              <div className="p-5 border-b border-gray-100">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} /> Context Timeline
                </h4>
              </div>
              <div className="p-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-100"></div>

                <div className="space-y-8 relative z-10">
                  {[
                    {
                      date: "Today",
                      time: "10:00 AM",
                      event: "Meeting Note Added",
                      type: "note",
                    },
                    {
                      date: "Yesterday",
                      time: "4:30 PM",
                      event: "Post #45 Approved",
                      type: "check",
                    },
                    {
                      date: "Oct 22",
                      time: "9:00 AM",
                      event: "Competitor Alert: FastTrack AI",
                      type: "alert",
                    },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div
                        className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                          event.type === "alert"
                            ? "bg-red-500"
                            : event.type === "check"
                            ? "bg-green-500"
                            : "bg-indigo-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 mb-0.5">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {event.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: PRODUCTION (Re-used) ---------------- */}
        {activeTab === "production" && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Content Queue</h3>
            <p className="text-sm text-gray-500">
              (This module renders the Kanban board from the previous step)
            </p>
          </div>
        )}

        {/* ---------------- TAB 4: VAULT (Re-used) ---------------- */}
        {activeTab === "vault" && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Asset Vault</h3>
            <p className="text-sm text-gray-500">
              (This module renders the Asset Grid with AI Vision tags)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import {
  FaUserTie,
  FaUserGraduate,
  FaRobot,
  FaExternalLinkAlt,
  FaUserFriends,
} from "react-icons/fa";

export default function LeadPersonaID() {
  // Mock Data
  const audienceData = [
    { label: "High-Intent (Leads)", value: 20, color: "#ef4444" }, // Red
    { label: "Peers/Networkers", value: 50, color: "#3b82f6" }, // Blue
    { label: "Casual/Bot", value: 30, color: "#9ca3af" }, // Gray
  ];

  const highIntentLeads = [
    {
      name: "Sarah J.",
      role: "CTO @ TechFlow",
      intent: "Asked about Pricing",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      name: "Mike R.",
      role: "Founder",
      intent: "Requested Demo",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
  ];

  // Simple SVG Donut Chart Logic
  let accumulatedAngle = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <FaUserFriends size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Lead Persona ID
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-blue-300">
                Why this matters:
              </div>
              Break down who engaged with this post. Focus your outreach on
              "High-Intent" leads.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          2 Hot Leads
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: AUDIENCE QUALITY (DONUT CHART) --- */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="transform -rotate-90 w-full h-full"
            >
              {audienceData.map((segment, i) => {
                const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -(
                  (accumulatedAngle / 100) *
                  circumference
                );
                accumulatedAngle += segment.value;
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
              <span className="text-xl font-black text-gray-900">20%</span>
              <span className="text-[8px] font-bold text-red-500 uppercase">
                Hot Leads
              </span>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {audienceData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-600 font-medium">
                    {item.label}
                  </span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: ICP ALIGNMENT --- */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ICP Alignment
            </p>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <FaUserTie className="text-gray-700" /> Startups & Founders
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-violet-600">85%</span>
            <p className="text-[9px] text-gray-400">Match Score</p>
          </div>
        </div>

        {/* --- SECTION 3: OUTREACH LIST (HOT LEADS) --- */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            High-Intent Targets
          </span>
          <div className="space-y-2">
            {highIntentLeads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100"
              >
                <img
                  src={lead.avatar}
                  alt={lead.name}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {lead.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate">
                    {lead.role}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    {lead.intent}
                  </span>
                </div>
                <FaExternalLinkAlt className="text-gray-300 group-hover:text-blue-400 text-xs ml-1" />
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
            Export 15 Prospects (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
}

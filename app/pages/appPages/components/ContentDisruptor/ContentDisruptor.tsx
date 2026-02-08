import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaLightbulb,
  FaExchangeAlt,
  FaBolt,
} from "react-icons/fa";
import { motion } from "framer-motion";

// --- Types ---
export interface DisruptorDay {
  day: string;
  time: string; // e.g., "19:30"
  pillar: string; // e.g., "Authority"
  topic: string; // e.g., "Why X is broken"
  hookStyle: "Empathetic" | "Controversial" | "Story-driven" | "Data-backed";
  suggestedHook: string;
  strategicReason: string; // e.g., "Capture the Saturday 'Strategic Delta' window."
}

export interface DisruptorData {
  score: number; // 0-100
  focus: string; // e.g., "Empathetic Authority"
  schedule: DisruptorDay[];
}

// --- Mock Data ---
const MOCK_DISRUPTOR: DisruptorData = {
  score: 92,
  focus: "Empathetic Authority",
  schedule: [
    {
      day: "Monday",
      time: "08:00 AM",
      pillar: "Authority",
      topic: "The MERN Stack Myth",
      hookStyle: "Controversial",
      suggestedHook: "Stop using Create React App in 2024...",
      strategicReason: "Competitor is silent on Mondays. Own the morning feed.",
    },
    {
      day: "Tuesday",
      time: "07:30 PM",
      pillar: "Hand-Raiser",
      topic: "Free Resource: Cheat Sheet",
      hookStyle: "Empathetic",
      suggestedHook: "I know Redux is hard. Here's a 1-page guide...",
      strategicReason:
        "Audience peaks at 8PM. Catch them just before heavily traffic.",
    },
    {
      day: "Wednesday",
      time: "12:00 PM",
      pillar: "Social Proof",
      topic: "Client Case Study",
      hookStyle: "Data-backed",
      suggestedHook: "How we scaled to 10k users with $0 ads...",
      strategicReason:
        "Mid-week trust builder to counter competitor's 'Hype' posts.",
    },
    {
      day: "Thursday",
      time: "09:00 AM",
      pillar: "Education",
      topic: "Tutorial: Auth.js",
      hookStyle: "Story-driven",
      suggestedHook: "I spent 3 days debugging Auth.js so you don't have to...",
      strategicReason:
        "Fill the 'Educational Gap' left by competitor's promo heavy week.",
    },
    {
      day: "Friday",
      time: "04:00 PM",
      pillar: "Personal",
      topic: "My Dev Setup",
      hookStyle: "Empathetic",
      suggestedHook: "My desk isn't perfect, but it works...",
      strategicReason: "Humanize the brand before the weekend.",
    },
    {
      day: "Saturday",
      time: "10:00 AM",
      pillar: "Engagement",
      topic: "Debate: Vim vs VS Code",
      hookStyle: "Controversial",
      suggestedHook: "Unpopular opinion: Vim is overrated...",
      strategicReason: "High weekend engagement. Start a conversation.",
    },
    {
      day: "Sunday",
      time: "08:00 PM",
      pillar: "Reflection",
      topic: "Weekly Wins",
      hookStyle: "Story-driven",
      suggestedHook: "Best thing I learned this week...",
      strategicReason: "Prepare for the week ahead.",
    },
  ],
};

// --- Component ---
export default function ContentDisruptor() {
  const data = MOCK_DISRUPTOR;

  const getHookColor = (style: string) => {
    switch (style) {
      case "Empathetic":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "Controversial":
        return "text-red-600 bg-red-50 border-red-100";
      case "Story-driven":
        return "text-blue-600 bg-blue-50 border-blue-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-50 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
            <FaCalendarAlt size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 text-lg border-b border-dashed border-gray-300 inline-block">
                Content Disruptor
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Your 7-Day Battle Plan. It suggests daily content angles to
                counter your competitor's weak spots and exploit their silence
                windows.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">7-Day Strategic Battle Plan</p>
          </div>
        </div>

        {/* Disruptor Score */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Disruptor Score
            </div>
            <div className="text-2xl font-black text-indigo-600">
              {data.score}/100
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 flex items-center justify-center">
            <FaBolt className="text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[1000px]">
          {data.schedule.map((day, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="min-w-[200px] flex-1 flex flex-col gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Top Stripe */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-indigo-400 group-hover:to-purple-500 transition-all"></div>

              <div className="flex justify-between items-center">
                <span className="font-black text-gray-400 text-xl group-hover:text-gray-800 transition-colors uppercase">
                  {day.day.substring(0, 3)}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <FaClock size={10} />
                  {day.time}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-300">
                  Strategy
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded w-fit ${getHookColor(day.hookStyle)}`}
                >
                  {day.hookStyle} Pivot
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-300">
                  Topic
                </span>
                <p className="font-bold text-gray-800 text-sm leading-tight">
                  {day.topic}
                </p>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-lg border border-dashed border-gray-200 mt-1 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 mb-1 uppercase">
                  <FaLightbulb /> Suggested Hook
                </div>
                <p className="text-xs text-gray-600 italic leading-snug">
                  "{day.suggestedHook}"
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50">
                <div className="flex items-start gap-1.5 opacity-60">
                  <FaExchangeAlt className="mt-0.5 text-[10px] text-gray-400" />
                  <p className="text-[10px] leading-snug text-gray-500 font-medium">
                    {day.strategicReason}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

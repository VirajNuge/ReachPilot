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
  time: string;
  pillar: string;
  topic: string;
  hookStyle: "Empathetic" | "Controversial" | "Story-driven" | "Data-backed";
  suggestedHook: string;
  strategicReason: string;
}

export interface DisruptorData {
  score: number;
  focus: string;
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
interface ContentDisruptorProps {
  disruptor: DisruptorData;
}

export default function ContentDisruptor({ disruptor }: ContentDisruptorProps) {
  const data = disruptor || {
    score: 0,
    focus: "Pending Analysis",
    schedule: [],
  };

  // Hook style → palette-mapped badge
  const getHookColor = (style: string) => {
    switch (style) {
      case "Empathetic":
        return "text-[#074ed5] bg-[#074ed5]/10 border-[#074ed5]/20";
      case "Controversial":
        return "text-[#000100] bg-[#caee55]/20 border-[#caee55]/30";
      case "Story-driven":
        return "text-[#000100] bg-[#f4f8fb] border-slate-200";
      default:
        return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  // Top stripe accent per hook style
  const getStripeColor = (style: string) => {
    switch (style) {
      case "Empathetic":
        return "from-[#074ed5] to-[#074ed5]/60";
      case "Controversial":
        return "from-[#caee55] to-[#caee55]/60";
      case "Story-driven":
        return "from-slate-400 to-slate-300";
      default:
        return "from-[#000100] to-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Growth Command
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Content Disruptor
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Your 7-Day Battle Plan. It suggests daily content angles to
              counter your competitor&apos;s weak spots and exploit their
              silence windows.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            7-Day Strategic Battle Plan
          </p>
        </div>

        {/* Disruptor Score */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Disruptor Score
            </div>
            <div className="text-2xl font-black text-[#074ed5]">
              {data.score}/100
            </div>
          </div>
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
            <FaCalendarAlt size={18} />
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[1000px]">
          {data.schedule.map((day, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="min-w-[200px] flex-1 flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Top Stripe */}
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStripeColor(day.hookStyle)}`}
              ></div>

              <div className="flex justify-between items-center">
                <span className="font-black text-[#074ed5] text-xl uppercase tracking-tight">
                  {day.day.substring(0, 3)}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <FaClock size={10} />
                  {day.time}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-300">
                  Strategy
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg w-fit border ${getHookColor(day.hookStyle)}`}
                >
                  {day.hookStyle} Pivot
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300">
                  Topic
                </span>
                <p className="font-bold text-[#000100] text-sm leading-tight">
                  {day.topic}
                </p>
              </div>

              <div className="p-3 bg-[#f4f8fb] rounded-xl border border-slate-100 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#074ed5] mb-1 uppercase">
                  <FaLightbulb /> Suggested Hook
                </div>
                <p className="text-xs text-slate-600 italic leading-snug">
                  &quot;{day.suggestedHook}&quot;
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-50">
                <div className="flex items-start gap-1.5">
                  <FaExchangeAlt className="mt-0.5 text-[10px] text-[#caee55] shrink-0" />
                  <p className="text-[10px] leading-snug text-slate-500 font-medium">
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

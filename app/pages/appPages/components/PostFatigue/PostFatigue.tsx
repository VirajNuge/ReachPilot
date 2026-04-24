"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  FaBatteryQuarter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPause,
  FaMagic,
  FaRegCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import { BsActivity, BsLightningChargeFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface FatigueData {
  status: "Healthy" | "Warning" | "Critical";
  fatigueScore: number; // 0-100
  optimalFrequency: string;
  saturationPoint: number; // Max posts before drop-off
  weeklyImpact: Array<{
    day: string;
    posts: number;
    impactScore: number; // Engagement Multiplier (e.g., 1.2x, 0.8x)
  }>;
}

export interface HeartbeatDay {
  day: string;
  activityScore: number;
  postsCount: number;
  peakHour: string;
  trend: "Rising" | "Flat" | "Dropping";
}

interface PostFatigueProps {
  data?: FatigueData;
  pulseHeartbeat?: HeartbeatDay[];
}

// --- Ghost Slot helpers ---
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface GhostSlot {
  day: string;
  time: string;
  label: string;
  isGhost: boolean;
  currentPosts: number;
  targetPosts: number;
}

function computeGhostSlots(
  fatigue: FatigueData,
  heartbeat: HeartbeatDay[]
): GhostSlot[] {
  const stopAt = fatigue.saturationPoint;
  // Build a map of current posts per day from heartbeat
  const heartbeatMap: Record<string, number> = {};
  heartbeat.forEach((h) => {
    heartbeatMap[h.day] = h.postsCount;
  });

  return DAYS_OF_WEEK.map((day) => {
    const current = heartbeatMap[day] ?? 0;
    const impact = fatigue.weeklyImpact.find((w) => w.day === day);
    // "Optimal" = keep at stopAt cap, no more
    const target = Math.min(stopAt, Math.max(1, stopAt - Math.max(0, current - stopAt)));
    const isGhost = current < target; // needs more content that day
    // Suggest a time: use peakHour from heartbeat if available
    const hb = heartbeat.find((h) => h.day === day);
    const time = hb?.peakHour ?? "12 PM";
    return {
      day,
      time,
      label: isGhost ? `Fill slot — post at ${time}` : `${current} post${current !== 1 ? "s" : ""} (on target)`,
      isGhost,
      currentPosts: current,
      targetPosts: target,
      impactScore: impact?.impactScore,
    } as GhostSlot & { impactScore?: number };
  });
}

// --- Schedule Modal ---
interface ScheduleModalProps {
  fatigue: FatigueData;
  heartbeat: HeartbeatDay[];
  todaysPosts: number;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  fatigue,
  heartbeat,
  todaysPosts,
  onClose,
}) => {
  const slots = computeGhostSlots(fatigue, heartbeat);
  const ghostCount = slots.filter((s) => s.isGhost).length;
  const overloadedCount = slots.filter((s) => s.currentPosts > fatigue.saturationPoint).length;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl">
              <FaRegCalendarAlt size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#000100] leading-tight">
                Auto-Balanced Schedule
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {ghostCount} ghost slot{ghostCount !== 1 ? "s" : ""} created · {overloadedCount} day{overloadedCount !== 1 ? "s" : ""} rebalanced
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <IoMdClose size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Summary strip */}
        <div className="px-6 py-3 bg-[#f4f8fb] border-b border-slate-100 flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-black text-[#000100]">{fatigue.saturationPoint}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stop At</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-[#074ed5]">{fatigue.optimalFrequency}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Optimal Freq</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-[#000100]">{todaysPosts}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Today</p>
          </div>
        </div>

        {/* Day rows */}
        <div className="px-6 py-4 flex flex-col gap-2 max-h-[340px] overflow-y-auto">
          {slots.map((slot) => {
            const overloaded = slot.currentPosts > fatigue.saturationPoint;
            return (
              <div
                key={slot.day}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                  overloaded
                    ? "bg-red-50 border-red-100"
                    : slot.isGhost
                    ? "bg-[#caee55]/10 border-[#caee55]/30"
                    : "bg-[#f4f8fb] border-slate-100"
                }`}
              >
                {/* Day + status */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                      overloaded
                        ? "bg-red-100 text-red-600"
                        : slot.isGhost
                        ? "bg-[#caee55]/30 text-[#000100]"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {slot.day.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000100] leading-tight">
                      {overloaded
                        ? `Move excess — keep ${fatigue.saturationPoint} max`
                        : slot.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {slot.currentPosts} current · target {slot.targetPosts}
                    </p>
                  </div>
                </div>

                {/* Badge */}
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-xl shrink-0 ${
                    overloaded
                      ? "bg-red-100 text-red-600"
                      : slot.isGhost
                      ? "bg-[#caee55]/40 text-[#000100]"
                      : "bg-[#074ed5]/10 text-[#074ed5]"
                  }`}
                >
                  {overloaded ? "REBALANCE" : slot.isGhost ? "GHOST SLOT" : "ON TRACK"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Why it works */}
        <div className="mx-6 mb-4 bg-[#074ed5]/5 border border-[#074ed5]/15 rounded-2xl p-4 flex items-start gap-3">
          <FaChartLine className="text-[#074ed5] shrink-0 mt-0.5" size={13} />
          <div>
            <p className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1">
              Why it works
            </p>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Posting above {fatigue.saturationPoint}×/day triggers audience fatigue. Ghost slots keep your cadence consistent without overloading — your audience sees you as reliable, not spammy.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98]"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- Component ---
const PostFatigue: React.FC<PostFatigueProps> = ({ data, pulseHeartbeat = [] }) => {
  const [showModal, setShowModal] = useState(false);

  const safeData: FatigueData = data || {
    status: "Warning",
    fatigueScore: 45,
    optimalFrequency: "3-4 posts/week",
    saturationPoint: 2,
    weeklyImpact: [
      { day: "Mon", posts: 1, impactScore: 1.1 },
      { day: "Tue", posts: 0, impactScore: 1.0 },
      { day: "Wed", posts: 3, impactScore: 0.6 },
      { day: "Thu", posts: 1, impactScore: 0.9 },
      { day: "Fri", posts: 1, impactScore: 1.2 },
      { day: "Sat", posts: 0, impactScore: 1.0 },
      { day: "Sun", posts: 1, impactScore: 1.05 },
    ],
  };

  // Compute today's post count from pulseHeartbeat
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  }); // "Mon", "Tue" etc.
  const todayEntry = pulseHeartbeat.find((h) => h.day === todayLabel);
  const todaysPosts = todayEntry?.postsCount ?? 0;
  const isEmergencyBrake = todaysPosts >= safeData.saturationPoint;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return {
          text: "text-[#074ed5]",
          bg: "bg-[#074ed5]/10",
          bar: "#0052FF",
          border: "border-[#074ed5]/20",
        };
      case "Warning":
        return {
          text: "text-[#000100]",
          bg: "bg-[#caee55]/20",
          bar: "#caee55",
          border: "border-[#caee55]/30",
        };
      case "Critical":
        return {
          text: "text-white",
          bg: "bg-[#000100]",
          bar: "#000100",
          border: "border-transparent",
        };
      default:
        return {
          text: "text-slate-500",
          bg: "bg-slate-100",
          bar: "#9ca3af",
          border: "border-slate-200",
        };
    }
  };

  const colors = getStatusColor(safeData.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Fatigue Predictor
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Audience Saturation
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {safeData.status === "Critical" ||
              safeData.status === "Warning" ? (
                <FaExclamationTriangle size={10} className={colors.text} />
              ) : (
                <FaCheckCircle size={10} className={colors.text} />
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {safeData.status}
              </span>
            </div>

            {/* Emergency indicator badge */}
            {isEmergencyBrake && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 border border-red-200">
                <FaPause size={8} className="text-red-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-600">
                  {todaysPosts}/{safeData.saturationPoint} Today
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div
          className={`p-2.5 rounded-2xl shadow-sm shrink-0 transition-colors ${
            isEmergencyBrake
              ? "bg-red-500 text-white"
              : "bg-[#074ed5] text-white"
          }`}
        >
          <BsActivity size={18} />
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-6">
        {/* Saturation Gauge / Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
              Optimal Freq
            </span>
            <span className="text-sm font-black text-[#000100]">
              {safeData.optimalFrequency}
            </span>
          </div>
          <div className="flex-1 bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
              Stop At
            </span>
            <span className="text-sm font-black text-[#000100]">
              {safeData.saturationPoint} posts
            </span>
          </div>
          {todaysPosts > 0 && (
            <div
              className={`flex-1 rounded-2xl p-4 border ${
                isEmergencyBrake
                  ? "bg-red-50 border-red-100"
                  : "bg-[#f4f8fb] border-slate-100"
              }`}
            >
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                Today
              </span>
              <span
                className={`text-sm font-black ${
                  isEmergencyBrake ? "text-red-600" : "text-[#000100]"
                }`}
              >
                {todaysPosts} posts
              </span>
            </div>
          )}
        </div>

        {/* Impact Chart */}
        <div className="flex-1 w-full min-h-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData.weeklyImpact}>
              <defs>
                <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.bar} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.bar} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f8fb"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000100",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "6px 10px",
                }}
                itemStyle={{ color: "white" }}
              />
              <ReferenceLine
                y={1}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  position: "top",
                  value: "Baseline",
                  fontSize: 10,
                  fill: "#64748b",
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="impactScore"
                stroke={colors.bar}
                fillOpacity={1}
                fill="url(#colorImpact)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Box */}
        <div className="mt-auto">
          <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <FaBatteryQuarter className="text-[#074ed5] shrink-0" size={10} />{" "}
              AI Observation
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {isEmergencyBrake
                ? `You've hit your saturation limit today (${todaysPosts}/${safeData.saturationPoint} posts). Posting more will drop engagement — your queue is paused.`
                : `Posting more than ${safeData.saturationPoint} times causes a ${Math.round(
                    (1 -
                      (safeData.weeklyImpact.find((d) => d.posts > 1)
                        ?.impactScore || 0.6)) *
                      100
                  )}% drop in engagement. Stick to the 'Sweet Spot'.`}
            </p>
          </div>

          {/* Action Button — Emergency Brake or Auto-Balance */}
          {isEmergencyBrake ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-red-500 hover:bg-red-600 text-white active:scale-[0.98]"
            >
              <FaPause size={14} />
              Pause Queue
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-[#000100] hover:bg-black text-white active:scale-[0.98]"
            >
              <FaMagic className="text-[#caee55]" size={14} />
              Auto-Balance Schedule
            </button>
          )}
        </div>
      </div>

      {/* --- Schedule Portal Modal --- */}
      <AnimatePresence>
        {showModal && (
          <ScheduleModal
            fatigue={safeData}
            heartbeat={pulseHeartbeat}
            todaysPosts={todaysPosts}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostFatigue;

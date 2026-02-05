"use client";

import React, { useState } from "react";
import { BsClockHistory, BsCalendarCheck, BsStars } from "react-icons/bs";

interface TimeSlot {
  id: string;
  label: string;
  value: number; // 0-100 intensity
  engagement: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

interface BestTimeProps {
  scheduleData: DaySchedule[];
  aiInsight: string;
}

// Color scale from light (low engagement) to dark (high engagement)
const getIntensityStyle = (value: number) => {
  if (value >= 80) {
    return {
      background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
      color: "#ffffff",
      label: "Excellent",
    };
  }
  if (value >= 60) {
    return {
      background: "linear-gradient(135deg, #818CF8 0%, #A5B4FC 100%)",
      color: "#ffffff",
      label: "Good",
    };
  }
  if (value >= 40) {
    return {
      background: "linear-gradient(135deg, #C7D2FE 0%, #DDD6FE 100%)",
      color: "#4338CA",
      label: "Average",
    };
  }
  return {
    background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
    color: "#6B7280",
    label: "Low",
  };
};

const DAYS_SHORT: Record<string, string> = {
  MONDAY: "MON",
  TUESDAY: "TUE",
  WEDNESDAY: "WED",
  THURSDAY: "THU",
  FRIDAY: "FRI",
  SATURDAY: "SAT",
  SUNDAY: "SUN",
};

const BestTimePost: React.FC<BestTimeProps> = ({ scheduleData, aiInsight }) => {
  const [hoveredSlot, setHoveredSlot] = useState<{
    day: string;
    slot: string;
    rate: string;
    value: number;
  } | null>(null);

  return (
    <div className="flex h-[360px] w-[540px] flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-900">Posting Schedule</h4>
          <p className="text-xs text-gray-500 font-medium">Optimal Times</p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <BsClockHistory size={16} />
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Headers */}
        <div className="grid grid-cols-5 gap-2 text-[10px] tracking-widest uppercase font-bold text-gray-400 mb-2 text-center">
          <span className="text-left font-normal normal-case tracking-normal pl-1">
            Day
          </span>
          <span>Morn</span>
          <span>Noon</span>
          <span>Eve</span>
          <span>Night</span>
        </div>

        <div className="flex flex-col gap-2">
          {scheduleData.map((dayRow, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <span className="text-xs font-bold text-gray-700">
                {dayRow.day.substring(0, 3)}
              </span>
              {dayRow.slots.map((slot) => {
                const style = getIntensityStyle(slot.value);
                const isBest = slot.value >= 80;
                return (
                  <div
                    key={slot.id}
                    className={`h-8 rounded-[8px] cursor-help transition-all duration-300 flex items-center justify-center relative group ${isBest ? "shadow-md shadow-indigo-100 ring-2 ring-white" : ""}`}
                    style={{ background: style.background }}
                    onMouseEnter={() =>
                      setHoveredSlot({
                        day: dayRow.day,
                        slot: slot.label,
                        rate: slot.engagement,
                        value: slot.value,
                      })
                    }
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    {slot.value >= 70 && (
                      <span className="text-[9px] font-black text-white/90">
                        {slot.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {aiInsight && (
          <div className="flex gap-3 items-start p-3 bg-indigo-50/50 rounded-xl border border-indigo-50">
            <BsStars className="text-indigo-500 mt-0.5 shrink-0" size={14} />
            <p className="text-xs font-medium text-indigo-900 leading-relaxed">
              <span className="font-bold">AI Insight:</span> {aiInsight}
            </p>
          </div>
        )}

        {/* Floating Tooltip */}
        {hoveredSlot && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl z-20 pointer-events-none text-center border border-white/10">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
              {hoveredSlot.day} • {hoveredSlot.slot}
            </div>
            <div className="text-lg font-bold text-white leading-none mb-1">
              {hoveredSlot.value}
              <span className="text-sm font-medium text-gray-400">%</span>
            </div>
            <div className="text-[10px] font-medium text-emerald-400">
              {hoveredSlot.rate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestTimePost;

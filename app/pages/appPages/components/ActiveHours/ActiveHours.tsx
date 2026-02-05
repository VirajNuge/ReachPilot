import React, { useState } from "react";
import { FaClock, FaBolt, FaSync, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

// --- Types ---

export interface ActiveHourData {
  hour: number; // 0-23
  creatorPosts: number; // 0-1 (normalized presence)
  audienceActivity: number; // 0-100 (heat)
}

export interface ActiveHoursProps {
  data?: ActiveHourData[];
}

// --- Mock Data ---

const MOCK_HOURS: ActiveHourData[] = Array.from({ length: 24 }, (_, i) => {
  // Simulate "Midnight Debate": Active late at night, posts during day
  let audienceActivity = 20;
  if (i >= 22 || i <= 2) audienceActivity = 85 + Math.random() * 15; // Late night peak
  if (i >= 9 && i <= 17) audienceActivity = 30 + Math.random() * 20; // Lower day activity

  let creatorPosts = 0;
  if (i === 9 || i === 17) creatorPosts = 1; // Posts at 9AM and 5PM

  return {
    hour: i,
    creatorPosts,
    audienceActivity,
  };
});

// --- Component ---

export default function ActiveHours({ data = MOCK_HOURS }: ActiveHoursProps) {
  const [hoveredHour, setHoveredHour] = useState<ActiveHourData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Identifying the "Strategic Delta"
  // Simple logic: Find max audience activity hour
  const bestHour = data.reduce(
    (max, curr) => (curr.audienceActivity > max.audienceActivity ? curr : max),
    data[0],
  );

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}${ampm}`;
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      alert(
        `📅 Schedule Synced! Added slots for ${formatHour(bestHour.hour)} (Golden Window)`,
      );
      setIsSyncing(false);
    }, 1500);
  };

  // --- Clock Visualization Helpers ---
  const RADIUS = 120;
  const CENTER = 150;

  // slices for 24 hours (15 degrees each)
  const pieSlices = data.map((d, i) => {
    const startAngle = (i * 15 - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * 15 - 90) * (Math.PI / 180);

    const x1 = CENTER + RADIUS * Math.cos(startAngle);
    const y1 = CENTER + RADIUS * Math.sin(startAngle);
    const x2 = CENTER + RADIUS * Math.cos(endAngle);
    const y2 = CENTER + RADIUS * Math.sin(endAngle);

    // Heatmap Color scaling (Violet to Orange)
    const intensity = d.audienceActivity / 100;
    const color = `rgba(139, 92, 246, ${0.2 + intensity * 0.8})`; // Violet base with opacity

    return {
      path: `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`,
      color,
      data: d,
    };
  });

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-violet-50 p-2.5 rounded-xl text-violet-600">
            <FaClock size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Active Hours
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-violet-300">
                  Why this matters:
                </div>
                Identifies the "Golden Window" when the audience is awake and
                engaging. Comparing this to posting times reveals lost
                opportunities.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Response Velocity Map
            </p>
          </div>
        </div>
        {/* Hijack Alert Badge */}
        <div
          className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse cursor-pointer hover:bg-red-100 transition-colors"
          title="Crowd Hijack Opportunity!"
        >
          <FaBolt size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Hijack: Now
          </span>
        </div>
      </div>

      <div className="p-6 pt-2 flex flex-col md:flex-row gap-6 h-full items-center justify-center">
        {/* 1. Clock Map */}
        <div className="relative w-[300px] h-[300px] flex-shrink-0">
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full transform -rotate-90"
          >
            {" "}
            {/* Rotate so 0 is at top? No, we calculated -90 in angles */}
            {/* Background Circle */}
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#F3F4F6" />
            {/* Heatmap Slices */}
            {pieSlices.map((slice, i) => (
              <path
                key={i}
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="1"
                className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                onMouseEnter={() => setHoveredHour(slice.data)}
                onMouseLeave={() => setHoveredHour(null)}
              />
            ))}
            {/* Outer Ring Indicators (Creator Posts) */}
            {data.map((d, i) => {
              if (d.creatorPosts === 0) return null;
              const angle = (i * 15 - 90 + 7.5) * (Math.PI / 180); // Center of slice
              const x = CENTER + (RADIUS + 15) * Math.cos(angle);
              const y = CENTER + (RADIUS + 15) * Math.sin(angle);
              return (
                <circle
                  key={`post-${i}`}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#111827" // Gray-900
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
            {/* Center Content */}
            <foreignObject
              x={CENTER - 50}
              y={CENTER - 50}
              width={100}
              height={100}
            >
              <div className="w-full h-full rounded-full bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transform rotate-90">
                {" "}
                {/* Counter-rotate text */}
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Golden
                  <br />
                  Window
                </div>
                <div className="text-xl font-bold text-violet-600 leading-none mt-1">
                  {formatHour(bestHour.hour)}
                </div>
              </div>
            </foreignObject>
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredHour && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 w-full text-center mt-[160px]">
              <div className="inline-block bg-gray-900 text-white text-xs py-1 px-3 rounded-full shadow-lg">
                {formatHour(hoveredHour.hour)}: {hoveredHour.audienceActivity}%
                Activity
              </div>
            </div>
          )}
        </div>

        {/* 2. Strategy Panel */}
        <div className="flex-1 w-full flex flex-col justify-center gap-4">
          {/* Insight Card */}
          <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                <FaBolt /> Strategy: Midnight Debate
              </span>
            </div>
            <div className="text-gray-900 text-sm font-medium leading-relaxed">
              "The creator posts at <span className="font-bold">9 AM</span>, but
              the Crowd is most active at{" "}
              <span className="font-bold">{formatHour(bestHour.hour)}</span>.
              This implies an 'After-Hours' audience who loves to debate at
              night."
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-bold">
                Response Velocity
              </div>
              <div className="text-lg font-bold text-gray-900">High ⚡</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-bold">
                Engagement Lag
              </div>
              <div className="text-lg font-bold text-gray-900">~8 Hours</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full py-2 px-4 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isSyncing ? (
              <>
                <FaSync className="animate-spin" /> Syncing Queue...
              </>
            ) : (
              <>
                <FaSync /> Sync to My Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

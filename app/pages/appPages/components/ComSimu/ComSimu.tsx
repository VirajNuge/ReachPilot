"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- Interfaces ---

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  step?: number;
}

interface ResultCardProps {
  title: string;
  baseline: number;
  simulated: number;
  format?: "number" | "percent";
}

// --- Components ---

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <label className="text-xs font-bold text-gray-700 w-1/3 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-2/3 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
        style={{
          background: `linear-gradient(to right, black 0%, black ${
            ((value - min) / (max - min)) * 100
          }%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({
  title,
  baseline,
  simulated,
  format = "number",
}) => {
  let baseDisplay: string | number;
  let simDisplay: string | number;

  if (format === "percent") {
    baseDisplay = `${baseline.toFixed(1)}%`;
    simDisplay = `${simulated.toFixed(1)}%`;
  } else {
    baseDisplay = Math.round(baseline);
    simDisplay = Math.round(simulated);
  }

  const growth = ((simulated - baseline) / baseline) * 100;
  const isPositive = growth >= 0;
  const growthFormatted = `${isPositive ? "+" : ""}${Math.round(growth)}%`;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-center">
      <h4 className="font-bold text-gray-500 text-xs uppercase mb-1">
        {title}
      </h4>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{simDisplay}</span>
        <span
          className={`text-xs font-bold ${
            isPositive ? "text-green-600" : "text-red-500"
          }`}
        >
          {growthFormatted}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">Prev: {baseDisplay}</p>
    </div>
  );
};

const Simulator = () => {
  // --- State ---
  const [cadence, setCadence] = useState(3);
  const [mediaRatio, setMediaRatio] = useState(50);
  const [hookLength, setHookLength] = useState(5);
  const [ctaUsage, setCtaUsage] = useState(60);
  const [replyRate, setReplyRate] = useState(40);
  const [hashtagCount, setHashtagCount] = useState(15);

  const baselineMetrics = {
    engagementRate: 2.1,
    monthlyFollowers: 200,
    monthlyLeads: 12,
  };

  // --- Logic Engine ---
  const { simulatedMetrics, liftMultiplier } = useMemo(() => {
    let score = 0;

    // Logic: Calculate a "Quality Score" based on inputs
    score += (cadence / 7) * 0.25;
    score += (mediaRatio / 100) * 0.2;
    score += ((10 - hookLength) / 10) * 0.15;
    score += (ctaUsage / 100) * 0.1;
    score += (replyRate / 100) * 0.2;

    // Bell curve logic for hashtags (15 is optimal)
    const distanceFromOptimal = Math.abs(hashtagCount - 15);
    const hashtagScore = Math.max(0, 1 - distanceFromOptimal / 15);
    score += hashtagScore * 0.1;

    const baselineScore = 0.5;
    // Multiplier determines how much better/worse than baseline we are
    const liftMultiplier = (score + 0.3) / (baselineScore + 0.3);

    return {
      liftMultiplier,
      simulatedMetrics: {
        engagementRate: baselineMetrics.engagementRate * liftMultiplier,
        monthlyFollowers:
          baselineMetrics.monthlyFollowers * liftMultiplier * 1.5, // Followers compound faster
        monthlyLeads:
          baselineMetrics.monthlyLeads *
          liftMultiplier *
          (0.5 + ctaUsage / 100),
      },
    };
  }, [cadence, mediaRatio, hookLength, ctaUsage, replyRate, hashtagCount]);

  // --- Dynamic Chart Data Generation ---
  const chartData = useMemo(() => {
    const data = [];
    let currentBase = 1000; // Starting total followers
    let currentSim = 1000;

    // Generate 6 months of data
    for (let i = 0; i <= 6; i++) {
      data.push({
        month: `Month ${i}`,
        Baseline: Math.round(currentBase),
        Simulated: Math.round(currentSim),
      });

      // Add monthly growth
      currentBase += baselineMetrics.monthlyFollowers;
      // Simulated growth gets the multiplier effect
      currentSim += simulatedMetrics.monthlyFollowers;
    }
    return data;
  }, [simulatedMetrics.monthlyFollowers]);

  return (
    <div className="w-[630px] h-max rounded-xl  border border-gray-100 mx-auto font-sans">
      {/* 1. Header & Sliders */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <SliderControl
            label="Posting Cadence"
            value={cadence}
            min={1}
            max={7}
            onChange={setCadence}
          />
          <SliderControl
            label="Media Ratio"
            value={mediaRatio}
            min={0}
            max={100}
            onChange={setMediaRatio}
          />
          <SliderControl
            label="Hook Length"
            value={hookLength}
            min={1}
            max={10}
            onChange={setHookLength}
          />
          <SliderControl
            label="CTA Usage"
            value={ctaUsage}
            min={0}
            max={100}
            onChange={setCtaUsage}
          />
          <SliderControl
            label="Reply Rate"
            value={replyRate}
            min={0}
            max={100}
            onChange={setReplyRate}
          />
          <SliderControl
            label="Hashtag Count"
            value={hashtagCount}
            min={0}
            max={30}
            onChange={setHashtagCount}
          />
        </div>
      </div>

      {/* 2. Functional Graph Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-bold text-gray-800">
            Projected Follower Growth (6 Months)
          </h5>
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            Multiplier:{" "}
            <span className="font-bold text-black">
              {liftMultiplier.toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="h-[250px] w-full bg-gray-50/50 rounded-lg p-2 border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                dy={10}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

              {/* Baseline Line (Gray) */}
              <Line
                type="monotone"
                dataKey="Baseline"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />

              {/* Simulated Line (Purple Gradient Logic) */}
              <Line
                type="monotone"
                dataKey="Simulated"
                stroke="#7c3aed" /* Purple-600 */
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#7c3aed" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bottom Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <ResultCard
          title="Engagement Rate"
          baseline={baselineMetrics.engagementRate}
          simulated={simulatedMetrics.engagementRate}
          format="percent"
        />
        <ResultCard
          title="Monthly Follower Growth"
          baseline={baselineMetrics.monthlyFollowers}
          simulated={simulatedMetrics.monthlyFollowers}
          format="number"
        />
        <ResultCard
          title="Monthly Leads Generated"
          baseline={baselineMetrics.monthlyLeads}
          simulated={simulatedMetrics.monthlyLeads}
          format="number"
        />
        <ResultCard
          title="Avg. Reach per Post"
          baseline={1500}
          simulated={1500 * liftMultiplier}
          format="number"
        />
      </div>

      {/* Styles for Custom Range Input */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: black;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -5px;
          box-shadow: 0 0 0 2px white; /* small border for cleaner look */
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: black;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Simulator;

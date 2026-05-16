"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LazyRadarChartProps {
  data: any[];
  dataKey: string;
  angleAxisKey: string;
  height?: number;
  colors?: string[];
}

export default function LazyRadarChart({
  data,
  dataKey,
  angleAxisKey,
  height = 300,
  colors = ["#8884d8"],
}: LazyRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={angleAxisKey} />
        <PolarRadiusAxis />
        <Radar name={dataKey} dataKey={dataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

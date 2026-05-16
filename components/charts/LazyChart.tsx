"use client";

/**
 * Lazy-loaded recharts components.
 * These are code-split to reduce initial dashboard bundle size.
 */

import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LazyChartProps {
  data: any[];
  type?: "line" | "bar";
  dataKey: string;
  xAxisKey: string;
  width?: string | number;
  height?: number;
}

export default function LazyChart({
  data,
  type = "line",
  dataKey,
  xAxisKey,
  height = 300,
}: LazyChartProps) {
  const ChartComponent = type === "line" ? LineChart : BarChart;
  const SeriesComponent = type === "line" ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <SeriesComponent dataKey={dataKey} stroke="#8884d8" />
      </ChartComponent>
    </ResponsiveContainer>
  );
}

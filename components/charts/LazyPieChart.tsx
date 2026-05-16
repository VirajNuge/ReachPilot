"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LazyPieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
}

export default function LazyPieChart({
  data,
  dataKey,
  nameKey,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"],
  height = 300,
}: LazyPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

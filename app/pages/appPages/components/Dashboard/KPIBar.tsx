import React from "react";
import KPICard, { KPITrend } from "./KPICard";

export interface KPIItem {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  trend?: KPITrend;
}

interface KPIBarProps {
  items: KPIItem[];
}

export default function KPIBar({ items }: KPIBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {items.map((item) => (
        <KPICard key={item.label} {...item} />
      ))}
    </div>
  );
}

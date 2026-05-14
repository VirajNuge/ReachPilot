import React from "react";
import SectionCard from "./SectionCard";

export interface AnalyticsSnapshotData {
  impressions: number;
  engagement: number;
  engagementRate: number;
  topPlatform: string;
  trend: number[];
}

interface AnalyticsSnapshotProps {
  data: AnalyticsSnapshotData;
}

const platformColors: Record<string, string> = {
  linkedin:  "text-[#0A66C2]",
  x:         "text-[#1A1D23]",
  twitter:   "text-[#1A1D23]",
  instagram: "text-[#E1306C]",
  facebook:  "text-[#1877F2]",
};

export default function AnalyticsSnapshot({ data }: AnalyticsSnapshotProps) {
  const platformKey = data.topPlatform?.toLowerCase() || "";
  const platformColor = platformColors[platformKey] || "text-[#9C4BFF]";

  const maxTrend = Math.max(...data.trend, 1);

  return (
    <SectionCard
      title="Analytics Snapshot"
      subtitle="Last 30 days performance"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          Open analytics
        </button>
      }
    >
      {/* Metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="col-span-1 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Impressions</div>
          <div className="text-[28px] font-black tracking-tight text-[#1A1D23] leading-none">{data.impressions.toLocaleString()}</div>
        </div>
        <div className="col-span-1 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Engagement</div>
          <div className="text-[28px] font-black tracking-tight text-[#1A1D23] leading-none">{data.engagement.toLocaleString()}</div>
        </div>
        <div className="col-span-1 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 mb-1.5">Eng. Rate</div>
          <div className="text-[28px] font-black tracking-tight text-[#9C4BFF] leading-none">{data.engagementRate}%</div>
        </div>
        <div className="col-span-1 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-1.5">Top Platform</div>
          <div className={`text-[20px] font-black tracking-tight capitalize leading-none ${platformColor}`}>{data.topPlatform || "—"}</div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Engagement trend</div>
        <div className="flex items-end gap-1.5 h-24">
          {data.trend.map((value, index) => {
            const height = Math.max(8, Math.round((value / maxTrend) * 100));
            return (
              <div
                key={`${value}-${index}`}
                className="flex-1 rounded-t-md bg-gradient-to-t from-[#9C4BFF] to-[#C084FC] hover:from-[#7B2FFF] hover:to-[#9C4BFF] transition-all duration-200 cursor-default"
                style={{ height: `${height}%` }}
                title={`${value}`}
              />
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

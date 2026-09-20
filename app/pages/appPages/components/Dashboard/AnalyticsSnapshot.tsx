import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
  x:         "text-slate-900",
  twitter:   "text-slate-900",
  instagram: "text-[#E1306C]",
  facebook:  "text-[#1877F2]",
};

export default function AnalyticsSnapshot({ data }: AnalyticsSnapshotProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  const platformKey = data.topPlatform?.toLowerCase() || "";
  const platformColor = platformColors[platformKey] || "text-blue-600";

  const maxTrend = Math.max(...data.trend, 1);

  return (
    <SectionCard
      title="Analytics Snapshot"
      subtitle="Last 30 days performance"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/analytics`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Open analytics</span>
          <ArrowUpRight size={13} />
        </button>
      }
    >
      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Impressions</div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">{data.impressions.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Engagement</div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">{data.engagement.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Eng. Rate</div>
          <div className="text-xl sm:text-2xl font-bold leading-none tracking-tight text-blue-600">{data.engagementRate}%</div>
        </div>
        <div className="rounded-xl border border-blue-100/80 bg-blue-50/50 p-3.5 transition-colors hover:bg-blue-50/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Top Platform</div>
          <div className={`text-lg sm:text-xl font-bold tracking-tight capitalize leading-none ${platformColor}`}>{data.topPlatform || "—"}</div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-3">
          <span className="uppercase tracking-wider font-bold">Engagement trend</span>
          <span className="text-[10px] text-slate-400">Past 30 days</span>
        </div>
        {data.impressions === 0 && data.engagement === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center rounded-lg border border-dashed border-slate-200/80 bg-white/50 px-4">
            <p className="text-xs font-semibold text-slate-600">No engagement recorded in this period</p>
            <p className="text-[11px] text-slate-400 mt-0.5">As you publish posts, your daily reach and interaction trends will plot here.</p>
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-24">
            {data.trend.map((value, index) => {
              const height = Math.max(8, Math.round((value / maxTrend) * 100));
              return (
                <div
                  key={`${value}-${index}`}
                  className="flex-1 rounded-t-sm bg-blue-500/70 transition-all hover:bg-blue-600 hover:scale-y-105 origin-bottom"
                  style={{ height: `${height}%` }}
                  title={`Day ${index + 1}: ${value}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

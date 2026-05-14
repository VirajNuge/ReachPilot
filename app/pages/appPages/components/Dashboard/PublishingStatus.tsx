import React from "react";
import SectionCard from "./SectionCard";

interface PublishingStatusProps {
  drafts: number;
  scheduled: number;
  failed: number;
  nextPublish: string;
}

export default function PublishingStatus({
  drafts,
  scheduled,
  failed,
  nextPublish,
}: PublishingStatusProps) {
  const total = drafts + scheduled + failed;
  const scheduledPct = total > 0 ? Math.round((scheduled / total) * 100) : 0;

  return (
    <SectionCard
      title="Publishing Pipeline"
      subtitle="Drafts and scheduled posts"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          Open publishing
        </button>
      }
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Drafts</div>
          <div className="text-[26px] font-black text-[#1A1D23] leading-none">{drafts}</div>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-500 mb-1.5">Scheduled</div>
          <div className="text-[26px] font-black text-blue-700 leading-none">{scheduled}</div>
        </div>
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-400 mb-1.5">Failed</div>
          <div className="text-[26px] font-black text-rose-600 leading-none">{failed}</div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700"
              style={{ width: `${scheduledPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
            {scheduledPct}% of content is scheduled
          </div>
        </div>
      )}

      {/* Next publish */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
        <div className="text-[12px] text-slate-500 font-medium">
          Next publish: <span className="font-semibold text-[#1A1D23]">{nextPublish}</span>
        </div>
      </div>
    </SectionCard>
  );
}

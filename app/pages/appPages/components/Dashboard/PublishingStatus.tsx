import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  const total = drafts + scheduled + failed;
  const scheduledPct = total > 0 ? Math.round((scheduled / total) * 100) : 0;

  return (
    <SectionCard
      title="Publishing Pipeline"
      subtitle="Drafts and scheduled posts"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/publishing`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Open publishing</span>
          <ArrowUpRight size={13} />
        </button>
      }
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Drafts</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">{drafts}</div>
        </div>
        <div className="rounded-xl bg-blue-50/50 border border-blue-100/80 p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-blue-500 mb-1">Scheduled</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 leading-none">{scheduled}</div>
        </div>
        <div className="rounded-xl bg-rose-50/50 border border-rose-100/80 p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-rose-500 mb-1">Failed</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 leading-none">{failed}</div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${scheduledPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
            {scheduledPct}% of content is scheduled
          </div>
        </div>
      )}

      {/* Next publish */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
        <div className="text-xs text-slate-500 font-medium truncate">
          Next publish: <span className="font-semibold text-slate-900">{nextPublish}</span>
        </div>
      </div>
    </SectionCard>
  );
}

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface WorkspaceContextProps {
  workspaceName: string;
  platforms: string[];
  personaStatus: string;
}

const platformMeta: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  linkedin:  { color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", border: "border-[#0A66C2]/20", label: "LinkedIn", icon: "in" },
  x:         { color: "text-slate-800",  bg: "bg-slate-100",     border: "border-slate-200",     label: "X", icon: "𝕏" },
  twitter:   { color: "text-slate-800",  bg: "bg-slate-100",     border: "border-slate-200",     label: "X", icon: "𝕏" },
  instagram: { color: "text-[#E1306C]", bg: "bg-[#E1306C]/10", border: "border-[#E1306C]/20", label: "Instagram", icon: "ig" },
  facebook:  { color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", border: "border-[#1877F2]/20", label: "Facebook", icon: "fb" },
};

function getPlatformMeta(p: string) {
  const key = p.toLowerCase();
  return platformMeta[key] || {
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: p,
    icon: p.slice(0, 2).toLowerCase(),
  };
}

export default function WorkspaceContext({
  workspaceName,
  platforms,
  personaStatus,
}: WorkspaceContextProps) {
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  const pctMatch = personaStatus.match(/(\d+)%/);
  const pct = pctMatch ? parseInt(pctMatch[1], 10) : 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
        {/* 1. Workspace Profile (cols 1-4) */}
        <div className="flex min-w-0 items-center gap-3.5 lg:col-span-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white shadow-xs">
            <span className="text-lg">{workspaceName?.slice(0, 1).toUpperCase() || "W"}</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <span>Active Workspace</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                <CheckCircle2 size={11} /> Live
              </span>
            </div>
            <div className="truncate text-base font-bold text-slate-900">{workspaceName}</div>
            <p className="truncate text-[11px] font-medium text-slate-500">Multi-channel AI creator hub</p>
          </div>
        </div>

        {/* 2. Middle: Persona Readiness Tile (cols 5-8) */}
        <div className="flex min-w-0 flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 lg:col-span-4 transition-colors hover:bg-slate-50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">AI Persona Readiness</span>
            <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              {personaStatus}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="h-2 flex-1 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${Math.max(pct, 6)}%` }}
              />
            </div>
            <Link
              href={`/${accountId}/accountPersona`}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 no-underline"
            >
              <span>{pct === 100 ? "Review" : "Set up"}</span>
              <ArrowRight size={11} />
            </Link>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-tight">
            {pct === 100
              ? "Brand persona configured for customized voice & style."
              : "Complete persona to unlock tailored AI hooks and captions."}
          </p>
        </div>

        {/* 3. Right: Connected Channels (cols 9-12) */}
        <div className="flex min-w-0 flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 lg:col-span-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700">Connected Channels</span>
            <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Synced
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {platforms.map((platform) => {
              const meta = getPlatformMeta(platform);
              return (
                <span
                  key={platform}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color} ${meta.border}`}
                >
                  <span className="text-[10px] font-black uppercase">{meta.icon}</span>
                  <span>{meta.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

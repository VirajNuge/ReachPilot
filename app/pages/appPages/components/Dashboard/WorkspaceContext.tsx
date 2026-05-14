import React from "react";

interface WorkspaceContextProps {
  workspaceName: string;
  platforms: string[];
  personaStatus: string;
}

const platformMeta: Record<string, { color: string; bg: string; icon: string }> = {
  linkedin:  { color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/8 border-[#0A66C2]/20",  icon: "in" },
  x:         { color: "text-slate-700",  bg: "bg-slate-100 border-slate-200",        icon: "𝕏"  },
  instagram: { color: "text-[#E1306C]", bg: "bg-[#E1306C]/8 border-[#E1306C]/20",  icon: "ig" },
  facebook:  { color: "text-[#1877F2]", bg: "bg-[#1877F2]/8 border-[#1877F2]/20",  icon: "fb" },
};

function getPlatformMeta(p: string) {
  return platformMeta[p.toLowerCase()] || {
    color: "text-slate-700",
    bg: "bg-slate-100 border-slate-200",
    icon: p.slice(0, 2),
  };
}

export default function WorkspaceContext({
  workspaceName,
  platforms,
  personaStatus,
}: WorkspaceContextProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5">
        {/* Left: workspace info */}
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#9C4BFF] to-[#0052FF] flex items-center justify-center shadow-md shadow-purple-200 flex-shrink-0">
            <span className="text-white font-black text-[15px]">
              {workspaceName?.slice(0, 1).toUpperCase() || "W"}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
              Active Workspace
            </div>
            <div className="text-[16px] font-black text-[#1A1D23] leading-tight">{workspaceName}</div>
            <div className="text-[12px] text-slate-400 font-medium mt-0.5">
              Persona: <span className="text-[#9C4BFF] font-semibold">{personaStatus}</span>
            </div>
          </div>
        </div>

        {/* Right: platform badges */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const meta = getPlatformMeta(platform);
            return (
              <span
                key={platform}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold cursor-default transition-all hover:scale-105 ${meta.bg} ${meta.color}`}
              >
                <span className="font-black text-[10px] uppercase">{meta.icon}</span>
                {platform}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

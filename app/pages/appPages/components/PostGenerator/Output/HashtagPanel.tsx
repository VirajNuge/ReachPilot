"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Hash } from "lucide-react";
import { flattenGroupedHashtags, normalizeGroupedHashtags } from "@/lib/postGeneration/hashtags";

interface HashtagPanelProps {
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
}

type GroupKey = "highReach" | "niche" | "branded";

const GROUP_META: Record<GroupKey, { label: string; hint: string }> = {
  highReach: { label: "High Reach", hint: "Broad discoverability tags" },
  niche: { label: "Niche", hint: "Topic-specific relevance tags" },
  branded: { label: "Branded", hint: "Brand and campaign tags" },
};

export const HashtagPanel: React.FC<HashtagPanelProps> = ({ hashtags }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const grouped = useMemo(() => normalizeGroupedHashtags(hashtags), [hashtags]);
  const allTags = useMemo(() => flattenGroupedHashtags(grouped), [grouped]);

  const handleCopy = async (key: GroupKey | "all") => {
    const text =
      key === "all"
        ? allTags.join(" ")
        : grouped[key].join(" ");
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Hashtags</p>
          <h3 className="mt-1 text-sm font-semibold text-[#111827]">Grouped hashtag sets</h3>
        </div>
        <button
          type="button"
          onClick={() => handleCopy("all")}
          className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#9CA3AF]"
        >
          {copiedKey === "all" ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedKey === "all" ? "Copied all" : "Copy all grouped"}
        </button>
      </div>

      <div className="space-y-3">
        {(Object.keys(GROUP_META) as GroupKey[]).map((key) => (
          <div key={key} className="rounded-[22px] border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{GROUP_META[key].label}</p>
                <p className="text-[11px] text-[#6B7280]">{GROUP_META[key].hint}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(key)}
                disabled={grouped[key].length === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[11px] font-semibold text-[#374151] transition-colors hover:border-[#9CA3AF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copiedKey === key ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === key ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
              <p className="text-sm leading-7 text-[#374151]">
                {grouped[key].join(" ") || "No hashtags in this group."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


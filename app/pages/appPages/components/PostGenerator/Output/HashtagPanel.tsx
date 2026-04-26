"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Hash } from "lucide-react";

interface HashtagPanelProps {
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
}

export const HashtagPanel: React.FC<HashtagPanelProps> = ({ hashtags }) => {
  const [copied, setCopied] = useState(false);

  const allTags = useMemo(
    () => [
      ...(hashtags?.highReach ?? []),
      ...(hashtags?.niche ?? []),
      ...(hashtags?.branded ?? []),
    ],
    [hashtags]
  );

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(allTags.join(" "));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Hashtags</p>
          <h3 className="mt-1 text-sm font-semibold text-[#111827]">One-click hashtag block</h3>
        </div>
        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#9CA3AF]"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-start gap-3">
          <Hash className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
          <p className="text-sm leading-7 text-[#374151]">{allTags.join(" ") || "No hashtags generated yet."}</p>
        </div>
      </div>
    </section>
  );
};

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

  const getGroupColors = (key: GroupKey) => {
    switch (key) {
      case "highReach":
        return "bg-blue-50 text-blue-700 hover:bg-blue-100 ring-blue-600/20";
      case "niche":
        return "bg-purple-50 text-purple-700 hover:bg-purple-100 ring-purple-600/20";
      case "branded":
        return "bg-slate-50 text-slate-700 hover:bg-slate-100 ring-slate-600/20";
    }
  };

  const handleCopyTag = async (tag: string) => {
    const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
    await navigator.clipboard.writeText(formattedTag);
    setCopiedKey(tag);
    window.setTimeout(() => setCopiedKey((prev) => (prev === tag ? null : prev)), 1500);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Hashtags</p>
          <h3 className="mt-1 text-sm font-semibold text-[#111827]">Grouped hashtag sets</h3>
        </div>
        <button
          type="button"
          onClick={() => handleCopy("all")}
          className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#9CA3AF] shadow-sm"
        >
          {copiedKey === "all" ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedKey === "all" ? "Copied all" : "Copy all"}
        </button>
      </div>

      <div className="space-y-3">
        {(Object.keys(GROUP_META) as GroupKey[]).map((key) => {
          const tags = grouped[key];
          if (tags.length === 0) return null;

          return (
            <div key={key} className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFD] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{GROUP_META[key].label}</p>
                  <p className="text-[11px] text-[#6B7280]">{GROUP_META[key].hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(key)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#374151] transition-colors hover:border-gray-300 shadow-sm"
                >
                  {copiedKey === key ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === key ? "Copied" : "Copy group"}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const displayTag = tag.startsWith("#") ? tag : `#${tag}`;
                  const isCopied = copiedKey === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleCopyTag(tag)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all duration-200 ${
                        isCopied 
                          ? "bg-green-50 text-green-700 ring-green-600/20" 
                          : getGroupColors(key)
                      }`}
                      title="Click to copy"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : null}
                      {displayTag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hash, Copy, Check } from "lucide-react";

interface HashtagPanelProps {
  hashtags: {
    highReach: string[];
    niche: string[];
    branded: string[];
  };
}

export const HashtagPanel: React.FC<HashtagPanelProps> = ({ hashtags }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const allTags = [
    ...(hashtags?.highReach || []),
    ...(hashtags?.niche || []),
    ...(hashtags?.branded || []),
  ];

  const handleCopyAll = () => {
    navigator.clipboard.writeText(allTags.join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const renderTagGroup = (title: string, tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
          {title}
        </span>
        <div className="flex flex-wrap gap-2 items-start max-h-36 overflow-y-auto pr-1">
          {tags.map((tag, index) => {
            const isCopied = copiedTag === tag;
            return (
              <motion.button
                key={`${tag}-${index}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCopyTag(tag)}
                className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-semibold leading-none transition-all duration-200 flex items-center gap-1.5 hover:z-10 flex-shrink-0 ${
                  isCopied
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-[#E8ECF2] text-gray-700 border border-transparent hover:bg-gray-200"
                }`}
              >
                {isCopied ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                <span>{tag.replace(/^#/, "")}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#0052FF]" />
          Hashtag Strategy
        </h3>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-[11px] text-gray-700"
        >
          {copiedAll ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copiedAll ? "Copied All" : "Copy All"}
        </button>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        {renderTagGroup("High Reach", hashtags?.highReach || [])}
        {renderTagGroup("Niche", hashtags?.niche || [])}
        {renderTagGroup("Branded", hashtags?.branded || [])}
      </div>
    </motion.div>
  );
};

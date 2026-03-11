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
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => {
            const isCopied = copiedTag === tag;
            return (
              <motion.button
                key={`${tag}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                  isCopied
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-[#E8ECF2] text-gray-700 border border-transparent hover:bg-gray-200"
                }`}
              >
                {isCopied ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                {tag.replace(/^#/, "")}
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
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#0052FF]" />
          Hashtag Strategy
        </h3>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold text-xs text-gray-700 shadow-sm"
        >
          {copiedAll ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copiedAll ? "Copied All" : "Copy All"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderTagGroup("High Reach", hashtags?.highReach || [])}
        {renderTagGroup("Niche", hashtags?.niche || [])}
        {renderTagGroup("Branded", hashtags?.branded || [])}
      </div>
    </motion.div>
  );
};

"use client";

import React, { useState } from "react";
import {
  BsBullseye,
  BsStars,
  BsChevronDown,
  BsChevronUp,
} from "react-icons/bs";
import { triggerChatbot } from "@/app/components/Chatbot/chatbotEvents";

interface StatusColor {
  bg: string;
  text: string;
}

interface KeywordStatus {
  label: string;
  keywords: string;
  color: StatusColor;
}

interface StatusData {
  current: KeywordStatus;
  missing: KeywordStatus;
}

interface KeyAccProps {
  alignmentTags: string[];
  statusData: StatusData;
}

const MAX_VISIBLE_TAGS = 8;

const KeyAccTag: React.FC<{ tag: string }> = ({ tag }) => (
  <p className="p-2 bg-[#E7E6FF] rounded-full w-max text-xs font-medium text-[#0012FF] px-3 whitespace-nowrap">
    {tag}
  </p>
);

const KeyAccStatus: React.FC<KeywordStatus> = ({ label, keywords, color }) => {
  // Limit keywords string to prevent overflow
  const maxLength = 80;
  const displayKeywords =
    keywords.length > maxLength
      ? keywords.substring(0, maxLength) + "..."
      : keywords;

  return (
    <p
      className={`p-2 ${color.bg} rounded-[8px] text-xs font-medium ${color.text} px-3 mb-[12px] leading-relaxed`}
    >
      <b>{label} </b>
      {displayKeywords}
    </p>
  );
};

const KeyAcc: React.FC<KeyAccProps> = ({ alignmentTags, statusData }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll
    ? alignmentTags
    : alignmentTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = alignmentTags.length - MAX_VISIBLE_TAGS;
  const hasMore = hiddenCount > 0;

  return (
    <div className="flex h-full w-full flex-col p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-900">Keyword Alignment</h4>
          <p className="text-xs text-gray-500 font-medium">Search Visibility</p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <BsBullseye size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {visibleTags.map((tag, index) => (
          <KeyAccTag key={index} tag={tag} />
        ))}

        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full w-max text-xs font-bold text-gray-500 px-3 whitespace-nowrap flex items-center gap-1 transition-colors border border-gray-200"
          >
            +{hiddenCount} more
            <BsChevronDown size={10} />
          </button>
        )}

        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full w-max text-xs font-bold text-gray-500 px-3 whitespace-nowrap flex items-center gap-1 transition-colors border border-gray-200"
          >
            Show less
            <BsChevronUp size={10} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KeyAccStatus {...statusData.current} />
        <KeyAccStatus {...statusData.missing} />
      </div>

      <div className="mt-4 flex flex-col gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-900">Insight:</span> Your profile
          is visible for broad searches, but not optimized for your target
          niche.
        </p>

        <button
          className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all bg-[#000100] hover:bg-black text-white"
          onClick={() => {
            const context = `Current keywords: ${alignmentTags.join(", ")}\nCurrent skills: ${statusData.current.keywords}\nMissing keywords: ${statusData.missing.keywords}`;
            triggerChatbot(
              "Suggest better keywords for my profile to improve visibility",
              context,
            );
          }}
        >
          <BsStars size={14} className="text-yellow-300" />
          Optimize Keywords with AI
        </button>
      </div>
    </div>
  );
};

export default KeyAcc;

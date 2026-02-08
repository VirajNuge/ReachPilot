import React from "react";
import {
  FaFire,
  FaRegLightbulb,
  FaTools,
  FaExclamationCircle,
  FaComments,
} from "react-icons/fa";

export default function CommentGapDiscovery() {
  // Mock Data based on user request
  const gapData = [
    {
      gap: "Pricing/Cost",
      frequency: 12,
      strategy: "Create a 'Value vs. Cost' comparison post.",
      icon: <FaFire className="text-orange-500" />,
    },
    {
      gap: "Technical Setup",
      frequency: 8,
      strategy: "Post a 'Step-by-Step' technical guide.",
      icon: <FaTools className="text-blue-500" />,
    },
    {
      gap: "Alternative Tools",
      frequency: 5,
      strategy: "Create a 'Why [Your Tool] is better' post.",
      icon: <FaRegLightbulb className="text-yellow-500" />,
    },
  ];

  const confusionPoint = {
    text: "Deployment Process",
    sentiment: "Frustrated",
    insight: "Users are stuck on the final 'Go Live' step.",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-max flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
            <FaComments size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Comment Gap Discovery
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-yellow-300">
                Why this matters:
              </div>
              Identify user questions and complaints in the comments to create
              high-value problem-solving content.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          3 Opportunities Found
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1 flex flex-col">
        {/* --- SECTION 1: TOP 3 CONTENT OPPORTUNITIES (GAP REPORT) --- */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Top Content Opportunities
          </span>
          <div className="space-y-3">
            {gapData.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/30 transition-colors group"
              >
                <div className="mt-1 p-1 bg-white rounded-lg shadow-sm">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">
                      {item.gap}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                      {item.frequency} comments
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700 leading-snug">
                    <span className="font-bold text-violet-600">Strategy:</span>{" "}
                    {item.strategy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: CONFUSION POINT MAPPING --- */}
        <div className="mt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Friction Finder
          </span>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex gap-3 items-center">
            <FaExclamationCircle className="text-red-400 shrink-0" />
            <div>
              <p className="text-xs text-red-800 font-medium">
                <span className="font-bold">Confusion Alert:</span>{" "}
                {confusionPoint.text}
              </p>
              <p className="text-[10px] text-red-600/80">
                {confusionPoint.insight}
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: STEAL THE TRAFFIC (ACTION) --- */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Action Plan
          </span>
          <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200/50 hover:scale-[1.02] active:scale-[0.98]">
            Generate "Reply Post" & Sniper Comment
          </button>
        </div>
      </div>
    </div>
  );
}

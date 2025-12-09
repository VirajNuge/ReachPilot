"use client";

import React from "react";
import { GoDiamond, GoCheckCircle, GoXCircle } from "react-icons/go";
import { BsLightningFill, BsSearch, BsImage } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Interfaces ---

interface AttributeScore {
  attribute: string;
  You: number;
  Competitor: number;
}

interface ChecklistItem {
  feature: string;
  you: boolean;
  competitor: boolean;
}

interface KeywordData {
  type: "Common" | "You Only" | "Competitor Only";
  words: string[];
}

interface ProfileQualityTabProps {
  overallScoreYou: number;
  overallScoreComp: number;
  attributeData: AttributeScore[];
  checklistData: ChecklistItem[];
  keywordData: KeywordData[];
  insights: string[];
}

const ProfileQualityTab: React.FC<ProfileQualityTabProps> = ({
  overallScoreYou,
  overallScoreComp,
  attributeData,
  checklistData,
  keywordData,
  insights,
}) => {
  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200 rounded-xl mx-auto">
      {/* 1. Overall Score Header */}
      <div className="flex gap-4 mb-8">
        {/* Your Score */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">You</p>
            <h3 className="text-3xl font-bold text-blue-600">
              {overallScoreYou}
              <span className="text-sm text-gray-400 font-normal">/100</span>
            </h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <BsLightningFill size={20} />
          </div>
        </div>
        {/* Competitor Score */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Comp</p>
            <h3 className="text-3xl font-bold text-purple-500">
              {overallScoreComp}
              <span className="text-sm text-gray-400 font-normal">/100</span>
            </h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-full text-purple-500">
            <BsLightningFill size={20} />
          </div>
        </div>
      </div>

      {/* 2. Attribute Comparison (Grouped Bar Chart) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Attribute Scoring (0-10)
        </h3>
        <div className="h-[200px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attributeData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} hide />
              <YAxis
                dataKey="attribute"
                type="category"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "8px", border: "none" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar
                dataKey="You"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
              <Bar
                dataKey="Competitor"
                fill="#c084fc"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Feature Checklist Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Profile Features Audit
        </h3>
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-gray-100 pb-2 mb-2 text-xs font-bold text-gray-500 uppercase">
            <span>Feature</span>
            <span className="text-center">You</span>
            <span className="text-center">Competitor</span>
          </div>
          {/* Rows */}
          <div className="flex flex-col gap-3">
            {checklistData.map((item, index) => (
              <div key={index} className="grid grid-cols-3 items-center">
                <span className="text-xs font-medium text-gray-700">
                  {item.feature}
                </span>
                <div className="flex justify-center">
                  {item.you ? (
                    <GoCheckCircle className="text-green-500" size={16} />
                  ) : (
                    <GoXCircle className="text-red-400" size={16} />
                  )}
                </div>
                <div className="flex justify-center">
                  {item.competitor ? (
                    <GoCheckCircle className="text-green-500" size={16} />
                  ) : (
                    <GoXCircle className="text-red-400" size={16} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Keyword Gap Analysis (Tag Cloud Visual) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            Keyword Gap Analysis (Bio & Headlines)
          </h3>
          <BsSearch className="text-gray-400" size={14} />
        </div>

        <div className="flex flex-col gap-4">
          {keywordData.map((group, idx) => (
            <div key={idx}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                {group.type}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.words.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      group.type === "You Only"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : group.type === "Competitor Only"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Insights */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Optimization Opportunities
        </h4>
        {insights.map((insight, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-start gap-2"
          >
            <GoDiamond
              className="mt-1 flex-shrink-0 text-amber-500"
              size={10}
            />
            <p className="text-xs font-medium text-gray-800 leading-relaxed">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileQualityTab;

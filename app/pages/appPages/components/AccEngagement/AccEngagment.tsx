"use client";

import React from "react";
import { BsBarChartFill, BsStars } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { triggerChatbot } from "@/app/components/Chatbot/chatbotEvents";

interface ContentMetrics {
  frequencyScore: number;
  contentMixScore: number;
  engagementScore: number;
}

interface AnalysisText {
  frequency: string;
  contentMix: string;
  engagement: string;
}

interface AccEngagmentProps {
  contentMetrics?: ContentMetrics;
  analysisText: AnalysisText;
}

const CHART_COLORS = {
  frequency: "#818CF8", // Purple
  contentMix: "#34D399", // Green
  engagement: "#F472B6", // Pink
};

const AccEngagment: React.FC<AccEngagmentProps> = ({
  contentMetrics,
  analysisText,
}) => {
  const chartData = [
    {
      name: "Frequency",
      value: contentMetrics?.frequencyScore ?? 50,
      fill: CHART_COLORS.frequency,
    },
    {
      name: "Content Mix",
      value: contentMetrics?.contentMixScore ?? 50,
      fill: CHART_COLORS.contentMix,
    },
    {
      name: "Engagement",
      value: contentMetrics?.engagementScore ?? 50,
      fill: CHART_COLORS.engagement,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col p-5">
      <div className="flex gap-2 items-center mb-4">
        <div className="bg-pink-50 p-2 rounded-lg text-pink-600">
          <BsBarChartFill size={16} />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900">Engagement</h4>
          <p className="text-xs text-gray-500 font-medium">
            Performance Metrics
          </p>
        </div>
      </div>

      <div className="flex min-h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              stroke="#9ca3af"
              fontSize={10}
              fontWeight={500}
              tickFormatter={(value) => `${value}`}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="#6b7280"
              fontSize={10}
              fontWeight={600}
              tick={{ dy: 10 }}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#e5e7eb", marginBottom: "4px" }}
              itemStyle={{ color: "#fff", fontWeight: 600 }}
              formatter={(value: number) => [`${value}/100`, "Score"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gray-50 pt-3">
        <div className="flex items-center text-xs">
          <span className="font-medium text-gray-500">Frequency ➜</span>
          <span className="font-bold text-gray-800">
            {analysisText.frequency}
          </span>
        </div>
        <div className="flex items-center text-xs">
          <span className="font-medium text-gray-500">Mix ➜</span>
          <span className="font-bold text-gray-800">
            {analysisText.contentMix}
          </span>
        </div>
        <div className="flex items-center text-xs">
          <span className="font-medium text-gray-500">Eng. ➜</span>
          <span className="font-bold text-gray-800">
            {analysisText.engagement}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccEngagment;

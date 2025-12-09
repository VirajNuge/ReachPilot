"use client";

import React from "react";
import { GoDiamond } from "react-icons/go";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

interface FormatData {
  name: string;
  User: number;
  Competitor: number;
}

interface ScatterData {
  x: number;
  y: number;
  z: number;
}

interface TopPost {
  id: number;
  headline: string;
  type: string;
  length: string;
  engagementRate: string;
  cta: string;
}

interface ContentComparisonTabProps {
  formatDistributionData: FormatData[];
  scatterDataYou: ScatterData[];
  scatterDataCompetitor: ScatterData[];
  topPostsData: TopPost[];
  insightsData: string[];
}

const ContentComparisonTab: React.FC<ContentComparisonTabProps> = ({
  formatDistributionData,
  scatterDataYou,
  scatterDataCompetitor,
  topPostsData,
  insightsData,
}) => {
  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200  rounded-xl mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Content Format Distribution
          </h3>
          <div className="h-[200px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatDistributionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: "10px", paddingTop: "5px" }}
                />
                <Bar
                  dataKey="User"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="Competitor"
                  fill="#fda4af"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Post Length vs Engagement
          </h3>
          <div className="h-[200px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Length"
                  domain={[0, 60]}
                  tickCount={5}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Engagement"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px", paddingTop: "5px" }}
                />
                <Scatter
                  name="You"
                  data={scatterDataYou}
                  fill="#3b82f6"
                  shape="circle"
                />
                <Scatter
                  name="Competitor"
                  data={scatterDataCompetitor}
                  fill="#fda4af"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Top Posts by Engagement
        </h3>
        <div className="flex flex-col gap-3">
          {topPostsData.map((post) => (
            <React.Fragment key={post.id}>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {post.headline}
                  </h4>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">Type:</span> {post.type}{" "}
                    <span className="ml-2 font-semibold">Length:</span>{" "}
                    {post.length}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className=" flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-semibold rounded text-[10px] whitespace-nowrap">
                      Engagement Rate : {post.engagementRate}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 font-semibold rounded text-[10px] whitespace-nowrap">
                      CTA : {post.cta}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 font-semibold rounded text-[10px] whitespace-nowrap cursor-pointer hover:">
                      Replicate
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {insightsData.map((insight, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-start gap-2"
          >
            <GoDiamond className="mt-1 flex-shrink-0 text-black" size={10} />
            <p className="text-xs font-medium text-gray-900">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentComparisonTab;

"use client";

import React from "react";
import { GoDiamond } from "react-icons/go";
import { BsPeopleFill, BsGlobeAmericas, BsBriefcaseFill } from "react-icons/bs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AudienceStat {
  label: string;
  you: string;
  comp: string;
  icon: "people" | "globe" | "briefcase";
  winner: boolean;
}

interface SeniorityData {
  name: string;
  value: number;
}

interface IndustryData {
  name: string;
  You: number;
  Competitor: number;
}

interface LocationData {
  city: string;
  percentage: string;
}

interface AudienceComparisonTabProps {
  audienceStats: AudienceStat[];
  seniorityDataYou: SeniorityData[];
  seniorityDataComp: SeniorityData[];
  industryData: IndustryData[];
  topLocations: LocationData[];
  insights: string[];
}

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const COLORS_COMP = ["#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"];

const AudienceComparisonTab: React.FC<AudienceComparisonTabProps> = ({
  audienceStats,
  seniorityDataYou,
  seniorityDataComp,
  industryData,
  topLocations,
  insights,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "people":
        return <BsPeopleFill size={16} className="text-blue-600" />;
      case "globe":
        return <BsGlobeAmericas size={16} className="text-green-600" />;
      case "briefcase":
        return <BsBriefcaseFill size={16} className="text-purple-600" />;
      default:
        return <BsPeopleFill size={16} />;
    }
  };

  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200 rounded-xl mx-auto">
      <div className="grid grid-cols-3 gap-3 mb-8">
        {audienceStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                {getIcon(stat.icon)}
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase">
                {stat.label}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 mb-1">You</p>
                <p className="text-lg font-bold text-gray-900">{stat.you}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Comp</p>
                <p className="text-lg font-bold text-gray-400">{stat.comp}</p>
              </div>
            </div>
            {stat.winner && (
              <div className="mt-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-max">
                You Lead
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">
            Your Audience Seniority
          </h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seniorityDataYou}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {seniorityDataYou.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-blue-600">You</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {seniorityDataYou.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-[10px] text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">
            Competitor Seniority
          </h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seniorityDataComp}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {seniorityDataComp.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_COMP[index % COLORS_COMP.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-purple-600">Comp</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {seniorityDataComp.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: COLORS_COMP[index % COLORS_COMP.length],
                  }}
                />
                <span className="text-[10px] text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Top Industries (Penetration %)
        </h3>
        <div className="h-[220px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={industryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={90}
                tick={{ fontSize: 11, fontWeight: 500 }}
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
                barSize={15}
              />
              <Bar
                dataKey="Competitor"
                fill="#a855f7"
                radius={[0, 4, 4, 0]}
                barSize={15}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
            Top Locations
          </h4>
          <div className="space-y-3">
            {topLocations.map((loc, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">
                  {loc.city}
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {loc.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-start gap-2 h-full"
            >
              <GoDiamond
                className="mt-1 flex-shrink-0 text-orange-500"
                size={10}
              />
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudienceComparisonTab;

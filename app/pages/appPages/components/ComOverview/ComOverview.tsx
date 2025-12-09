"use client";
import { BsDiamond, BsCheckSquareFill, BsXLg } from "react-icons/bs";
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RadarDataPoint {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

interface ComparisonRow {
  label: string;
  you: string;
  comp: string;
  win: boolean;
}

interface ComOverviewProps {
  radarData: RadarDataPoint[];
  tableData: ComparisonRow[];
  insights: string[];
}

const ComOverview: React.FC<ComOverviewProps> = ({
  radarData,
  tableData,
  insights,
}) => {
  return (
    <>
      <div>
        <div className="h-[550px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />

              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
              />

              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />

              <Radar
                name="You"
                dataKey="A"
                stroke="#0012FF"
                strokeWidth={2}
                fill="#0012FF"
                fillOpacity={0.3}
              />

              <Radar
                name="Competitor"
                dataKey="B"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="#7c3aed"
                fillOpacity={0.3}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-hidden rounded-lg border border-[#0012FF] mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E7E6FF] text-[#0012FF]">
                <th className="py-3 px-4 text-center border-r border-b border-[#0012FF] w-1/4">
                  Dimensions
                </th>
                <th className="py-3 px-4 text-center border-r border-b border-[#0012FF] w-1/4">
                  You
                </th>
                <th className="py-3 px-4 text-center border-r border-b border-[#0012FF] w-1/4">
                  Competitor
                </th>
                <th className="py-3 px-4 text-center border-b border-[#0012FF] w-1/4">
                  Better
                </th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="bg-[#F9F9F9]">
                  <td className="py-3 px-4 text-center font-medium text-black border-r border-b border-[#0012FF] last:border-b-0">
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-center text-black border-r border-b border-[#0012FF] last:border-b-0">
                    {row.you}
                  </td>
                  <td className="py-3 px-4 text-center text-black border-r border-b border-[#0012FF] last:border-b-0">
                    {row.comp}
                  </td>
                  <td className="py-3 px-4 flex justify-center items-center border-b border-[#0012FF] last:border-b-0 h-full">
                    {row.win ? (
                      <BsCheckSquareFill size={22} className="text-[#00C805]" />
                    ) : (
                      <BsXLg
                        size={22}
                        className="text-[#FF0000] stroke-[1px]"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-start gap-3"
            >
              <BsDiamond className="mt-1 flex-shrink-0 text-black" size={12} />
              <p className="text-sm text-gray-800">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ComOverview;

"use client";
import { BsDiamond, BsCheckSquareFill, BsXLg } from "react-icons/bs";
import React from "react";
import { motion } from "framer-motion";
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
  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4 + i * 0.08,
        duration: 0.3,
      },
    }),
  };

  const insightVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6 + i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <>
      <div>
        {/* Animated Chart Container */}
        <motion.div
          className="h-[550px] w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>

        {/* Animated Table */}
        <motion.div
          className="overflow-hidden rounded-lg border border-[#0012FF] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
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
                <motion.tr
                  key={index}
                  className="bg-[#F9F9F9]"
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "#f0f0f0" }}
                >
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5 + index * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      {row.win ? (
                        <BsCheckSquareFill
                          size={22}
                          className="text-[#00C805]"
                        />
                      ) : (
                        <BsXLg
                          size={22}
                          className="text-[#FF0000] stroke-[1px]"
                        />
                      )}
                    </motion.div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Animated Insights */}
        <div className="flex flex-col gap-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-start gap-3"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={insightVariants}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: { duration: 0.15 },
              }}
            >
              <BsDiamond className="mt-1 flex-shrink-0 text-black" size={12} />
              <p className="text-sm text-gray-800">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ComOverview;

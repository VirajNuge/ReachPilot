import React from "react";
import { BsBarChartFill, BsStars } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  name: string;
  value: number;
  max: number;
}

interface AnalysisText {
  frequency: string;
  contentMix: string;
  engagement: string;
}

interface AccEngagmentProps {
  chartData: ChartDataPoint[];
  analysisText: AnalysisText;
}

const AccEngagment: React.FC<AccEngagmentProps> = ({
  chartData,
  analysisText,
}) => {
  return (
    <div>
      <div className="bg-white rounded-[8px] p-[12px] w-[450px] h-max">
        <div className="flex gap-[6px] items-center mb-[6px]">
          <BsBarChartFill size="16px" />
          <h4 className="font-[600]">Content & Engagement</h4>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="40%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e0e0e0"
              vertical={false}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              stroke="#a0a0a0"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="#555"
              interval={0}
            />

            <Bar dataKey="max" fill="#F0F0FF" barSize={50} />

            <Bar dataKey="value" fill="#9999FF" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
        <div>
          <p className="text-[14px] mb-[12px]">
            <b>Posting frequency → </b>
            {analysisText.frequency}
          </p>
          <p className="text-[14px] mb-[12px]">
            <b>Content mix → </b>
            {analysisText.contentMix}
          </p>
          <p className="text-[14px] mb-[12px]">
            <b>Engagement → </b>
            {analysisText.engagement}
          </p>
        </div>
        <p className="w-max p-[8px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px] flex gap-[6px] items-center cursor-pointer hover:bg-[#d3d1ff] transition-all duration-[300ms] ease-in">
          <BsStars size="16px" color="#0900FF" />
          Re-write with AI
        </p>
      </div>
    </div>
  );
};

export default AccEngagment;

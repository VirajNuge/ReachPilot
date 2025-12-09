import React from "react";
import { BsPinAngleFill } from "react-icons/bs";

interface RecommendationProps {
  title: string;
  observation: string;
  impact: string;
  example: string;
}

const ComRe: React.FC<RecommendationProps> = ({
  title,
  observation,
  impact,
  example,
}) => {
  return (
    <div className="mt-[12px] p-[12px] bg-white w-[335px] rounded-lg shadow-sm">
      <div className="flex items-center gap-[8px] mb-2">
        <BsPinAngleFill size={14} color="blue" className="stroke-1" />
        <h5 className="font-medium text-gray-700">{title}</h5>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[14px] text-gray-600">{observation}</p>

        <p className="text-[14px] font-medium text-green-600">→ {impact}</p>

        <p className="text-[14px] text-gray-500 italic border-l-2 border-gray-200 pl-2 mt-1">
          Example: “{example}”
        </p>
      </div>
    </div>
  );
};

export default ComRe;

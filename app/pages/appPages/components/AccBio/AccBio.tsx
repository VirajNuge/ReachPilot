import React from "react";
import { BsPersonFill, BsStars } from "react-icons/bs";

// Interface for the component's props
interface AccBioProps {
  clarityScore: number;
  clarityTotal: number;
  keywordScore: number;
  keywordTotal: number;
  tone: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  onRewriteWithAI: () => void; // Function to handle the AI rewrite click
}

const AccBio: React.FC<AccBioProps> = ({
  clarityScore,
  clarityTotal,
  keywordScore,
  keywordTotal,
  tone,
  strengths,
  weaknesses,
  suggestions,
  onRewriteWithAI,
}) => {
  return (
    <div>
      <div className="bg-white rounded-[8px] p-[12px] w-[450px] h-max">
        {/* Header */}
        <div className="flex gap-[6px] items-center mb-[6px]">
          <BsPersonFill size="20px" />
          <h4 className="font-[600]">Bio & Headline Analysis</h4>
        </div>

        {/* Scores and Tone */}
        <div className="flex gap-[6px] mb-[6px]">
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Clarity : {clarityScore} / {clarityTotal}
          </p>
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Keyword Usage : {keywordScore} / {keywordTotal}
          </p>
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Tone : {tone}
          </p>
        </div>

        {/* Analysis Details */}
        <div>
          {/* Strengths */}
          <p className="text-[12px] mb-[6px]">
            <b>Strengths →</b> {strengths.join(" ")}
          </p>

          {/* Weaknesses */}
          <p className="text-[12px] mb-[6px]">
            <b>Weaknesses → </b>
            {weaknesses.join(" ")}
          </p>

          {/* Suggestions */}
          <p className="text-[12px] mb-[6px]">
            <b>Suggestions → </b>
            {suggestions.join(" ")}
          </p>
        </div>

        {/* Re-write with AI Button */}
        <p
          className="w-max p-[8px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px] flex gap-[6px] items-center cursor-pointer hover:bg-[#d3d1ff] transition-all duration-[300ms] ease-in"
          onClick={onRewriteWithAI}
        >
          <BsStars size="16px" color="#0900FF" />
          Re-write with AI
        </p>
      </div>
    </div>
  );
};

export default AccBio;

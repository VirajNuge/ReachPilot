import React from "react";
import { BsPersonFill, BsStars } from "react-icons/bs";

const AccBio = () => {
  return (
    <div>
      <div className="bg-white rounded-[8px] p-[12px] w-[450px] h-max">
        <div className="flex gap-[6px] items-center mb-[6px]">
          <BsPersonFill size="20px" />
          <h4 className="font-[600]">Bio & Headline Analysis</h4>
        </div>
        <div className="flex gap-[6px] mb-[6px]">
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Clarity : 8 / 10
          </p>
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Keyword Usage : 6 / 10
          </p>
          <p className="w-max p-[6px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px]">
            Tone : Friendly
          </p>
        </div>
        <div>
          <p className="text-[12px] mb-[6px]">
            <b>Strengths →</b> “You highlight your current role clearly.” “You
            highlight your current role clearly.”
          </p>
          <p className="text-[12px] mb-[6px]">
            <b>Weaknesses → </b>“Missing keywords that recruiters/clients search
            for.” “Missing keywords that recruiters/clients search for.”
          </p>
          <p className="text-[12px] mb-[6px]">
            <b>Suggestions → </b>“Include terms like ‘Growth Marketing’, ‘B2B
            SaaS’, ‘AI Strategy’.” “Include terms like ‘Growth Marketing’, ‘B2B
            SaaS’, ‘AI Strategy’.”
          </p>
        </div>
        <p className="w-max p-[8px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px] flex gap-[6px] items-center cursor-pointer hover:bg-[#d3d1ff]  transition-all duration-[300ms] ease-in">
          <BsStars size="16px" color="#0900FF" />
          Re-write with AI
        </p>
      </div>
    </div>
  );
};

export default AccBio;

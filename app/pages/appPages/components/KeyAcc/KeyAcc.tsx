import React from "react";
import { BsBullseye, BsStars } from "react-icons/bs";

interface StatusColor {
  bg: string;
  text: string;
}

interface KeywordStatus {
  label: string;
  keywords: string;
  color: StatusColor;
}

interface StatusData {
  current: KeywordStatus;
  missing: KeywordStatus;
}

interface KeyAccProps {
  alignmentTags: string[];
  statusData: StatusData;
}

const KeyAccTag: React.FC<{ tag: string }> = ({ tag }) => (
  <p className="p-2 bg-[#E7E6FF] rounded-full w-max text-xs font-medium text-[#0012FF] px-3 whitespace-nowrap">
    {tag}
  </p>
);

const KeyAccStatus: React.FC<KeywordStatus> = ({ label, keywords, color }) => (
  <p
    className={`p-2 ${color.bg} rounded-full text-xs font-medium ${color.text} px-3 whitespace-nowrap mb-[12px]`}
  >
    <b>{label} </b>
    {keywords}
  </p>
);

const KeyAcc: React.FC<KeyAccProps> = ({ alignmentTags, statusData }) => {
  return (
    <div className="bg-white rounded-[8px] p-[12px] w-[450px] h-max mt-[12px]">
      <div>
        <div className="flex items-center gap-[6px] mb-[6px]">
          <BsBullseye size="20px" className="text-gray-700" />
          <h4 className="font-semibold text-base">
            Keyword & Industry Alignment
          </h4>
        </div>

        <div className="flex flex-wrap gap-2 mb-[12px]">
          {alignmentTags.map((tag, index) => (
            <KeyAccTag key={index} tag={tag} />
          ))}
        </div>

        <div className="mt-[12px]">
          <KeyAccStatus {...statusData.current} />

          <KeyAccStatus {...statusData.missing} />

          <p className="text-[12px]">
            Your profile is visible for broad searches, but not optimized for
            your target niche.
          </p>
          <p className="text-[12px] mb-[12px]">
            <b>Suggest </b>“Add niche-specific keywords in Headline + About +
            Skills.”
          </p>

          <p className="w-max p-[8px] font-[500] rounded-[20px] px-[14px] bg-[#E7E6FF] text-[#0900FF] text-[12px] flex gap-[6px] items-center cursor-pointer hover:bg-[#d3d1ff] transition-all duration-[300ms] ease-in">
            <BsStars size="16px" color="#0900FF" />
            Re-write with AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyAcc;

import React from "react";

interface AccQkFixProps {
  headline: string;
  description: string;
  tag: string;
}

const AccQkFix: React.FC<AccQkFixProps> = ({ headline, description, tag }) => {
  const getTagStyle = (tag: string) => {
    switch (tag.toUpperCase()) {
      case "HIGH IMPACT":
        return "bg-[#E7E6FF] text-[#0900FF]";
      case "MEDIUM IMPACT":
        return "bg-[#FFF8E1] text-[#A17B00]";
      case "LOW IMPACT":
        return "bg-[#F3F4F6] text-[#4B5563]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  return (
    <div className="p-[10px] bg-white rounded-[12px] leading-[1.5] mb-[12px]">
      <h4>{headline}</h4>
      <p className="text-[14px]">{description}</p>
      <h6
        className={`w-max p-[8px] font-[500] rounded-[20px] px-[16px] ${getTagStyle(
          tag
        )}`}
      >
        {tag}
      </h6>
    </div>
  );
};

export default AccQkFix;

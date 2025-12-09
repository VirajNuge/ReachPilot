import React from "react";

interface ActionItemProps {
  title: string;
  effort: string;
  lift: string;
  current: string;
  suggested: string;
}

const ComBetter: React.FC<ActionItemProps> = ({
  title,
  effort,
  lift,
  current,
  suggested,
}) => {
  const effortColors =
    effort === "Medium"
      ? "text-[#5D5FEF] bg-[#EFEEFF]"
      : "text-[#0012FF] bg-[#E7E6FF]";

  return (
    <div className="">
      <div className="mt-[0px] p-[12px] bg-white w-[370px] rounded-lg shadow-sm h-max ">
        <div className="flex items-center gap-[8px] mb-2">
          <h5 className="font-medium text-gray-700">{title}</h5>
        </div>

        <div className="flex gap-3 flex-wrap">
          <p
            className={`${effortColors} w-max pl-3 pr-3 p-1 text-[14px] mb-2 rounded-[90px]`}
          >
            Effort: {effort}
          </p>
          <p className="text-[#000000] bg-[#EFEFEF] w-max pl-3 pr-3 p-1 text-[14px] mb-2 rounded-[90px]">
            Lift: {lift}
          </p>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <p className="text-[14px] text-gray-600">
            <span className="font-medium">Current:</span> {current}
          </p>

          <p className="text-[14px] text-gray-500 italic border-l-2 border-gray-200 pl-2 mt-1">
            <span className="font-medium not-italic text-gray-600">
              Suggested:
            </span>{" "}
            “{suggested}”
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComBetter;

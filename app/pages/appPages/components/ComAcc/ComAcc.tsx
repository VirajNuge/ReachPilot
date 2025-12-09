import React from "react";
import { BsChevronDoubleUp, BsUpload, BsHeartFill } from "react-icons/bs";

interface ComAccProps {
  name: string;
  role: string;
  imageSrc: string;
  score: number;
  stats: {
    cadence: string;
    engagement: string;
    growth: string;
  };
}

const ComAcc: React.FC<ComAccProps> = ({
  name,
  role,
  imageSrc,
  score,
  stats,
}) => {
  return (
    <div className="bg-[#F9F9F9] w-[350px] p-[12px] rounded-[12px]">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <img
            src={imageSrc}
            alt={name}
            className="h-14 w-14 object-cover rounded-[50%]"
          />
          <div>
            <h3>{name}</h3>
            <h5 className="text-gray-500 text-sm">{role}</h5>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white w-max p-3 rounded-[8px]">
          <BsChevronDoubleUp color="green" />
          <h5 className="font-bold">{score}/100</h5>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-3 p-4 bg-white rounded-lg">
          <div className="flex items-center gap-3 text-black">
            <BsUpload size={14} className="stroke-1" />
            <p className="text-[14px]">
              <span className="font-bold">Posting Cadence :</span>{" "}
              {stats.cadence}
            </p>
          </div>

          <div className="flex items-center gap-3 text-black">
            <BsHeartFill size={14} />
            <p className="text-[14px]">
              <span className="font-bold">Avg Engagement :</span>{" "}
              {stats.engagement}
            </p>
          </div>

          <div className="flex items-center gap-3 text-black">
            <BsChevronDoubleUp size={14} className="stroke-1" />
            <p className="text-[14px]">
              <span className="font-bold">Follower Growth :</span>{" "}
              {stats.growth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComAcc;

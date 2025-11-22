import React, { useState } from "react";
import { BsClockHistory, BsCalendarCheck, BsStars } from "react-icons/bs";

interface TimeSlot {
  id: string;
  label: string;
  value: number; // 0-100 intensity
  engagement: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

interface BestTimeProps {
  scheduleData: DaySchedule[];
  aiInsight: string;
}

const getIntensityClass = (value: number) => {
  if (value >= 80) return "bg-[#4F46E5] text-white"; // Very High (Dark Purple)
  if (value >= 60) return "bg-[#818CF8] text-white"; // High
  if (value >= 40) return "bg-[#C7D2FE] text-[#312E81]"; // Medium
  return "bg-[#EEF2FF] text-[#312E81]"; // Low (Lightest)
};

const BestTimePost: React.FC<BestTimeProps> = ({ scheduleData, aiInsight }) => {
  const [hoveredSlot, setHoveredSlot] = useState<{
    day: string;
    slot: string;
    rate: string;
  } | null>(null);

  return (
    <div className="bg-white rounded-[8px] p-[12px] w-[450px] h-max shadow-sm border border-gray-100">
      <div className="flex items-center gap-[8px] mb-[16px]">
        <BsClockHistory size="20px" className="text-gray-700" />
        <h4 className="font-semibold text-base">Best Time to Post</h4>
      </div>

      <div className="relative mb-[16px]">
        <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 mb-2 text-center font-medium">
          <span></span>
          <span>Morn</span>
          <span>Noon</span>
          <span>Eve</span>
          <span>Night</span>
        </div>

        <div className="flex flex-col gap-2">
          {scheduleData.map((dayRow, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                {dayRow.day}
              </span>
              {dayRow.slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`h-8 rounded-[4px] cursor-pointer transition-all duration-200 ${getIntensityClass(
                    slot.value
                  )}`}
                  onMouseEnter={() =>
                    setHoveredSlot({
                      day: dayRow.day,
                      slot: slot.label,
                      rate: slot.engagement,
                    })
                  }
                  onMouseLeave={() => setHoveredSlot(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {hoveredSlot && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg z-10 pointer-events-none whitespace-nowrap">
            {hoveredSlot.day} {hoveredSlot.slot}: {hoveredSlot.rate} Eng.
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
        <div className="flex gap-2 items-start">
          <BsStars className="text-[#4F46E5] mt-1 flex-shrink-0" size={14} />
          <p className="text-xs text-gray-600 leading-relaxed">{aiInsight}</p>
        </div>
      </div>

      <button className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
        <BsCalendarCheck size={16} />
        Add to Scheduling
      </button>
    </div>
  );
};

export default BestTimePost;

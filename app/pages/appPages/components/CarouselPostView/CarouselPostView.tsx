"use client";

import React from "react";
import { CarouselPostContent } from "../../[id]/postGenerator/GeneratorResults";
import {
  getPlatformDetails,
  TextContentBox,
  PostVisualCard,
} from "../SharedPostComponents/SharedPostComponents";
import { Download, Layers } from "lucide-react";

interface CarouselViewProps {
  data: CarouselPostContent;
}

export default function CarouselPostView({ data }: CarouselViewProps) {
  const platformInfo = getPlatformDetails("LINKEDIN"); // Defaulting to LinkedIn style for carousels

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-md p-1.5 ${platformInfo.bg}`}>
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Carousel Sequence
            </h3>
            <p className="text-[10px] text-gray-500">
              Swipeable Story Arc ({data.slides.length} Slides)
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={12} /> Download Assets
        </button>
      </div>

      {/* Main Caption */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
          Main Post Caption
        </p>
        <TextContentBox text={data.main_caption} />
      </div>

      {/* Grid of Slides */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-gray-400">
          <Layers size={14} />
          <p className="text-[10px] font-bold uppercase tracking-wider">
            Slide Layouts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.slides.map((slide, index) => (
            <PostVisualCard
              key={index}
              title={slide.headline}
              subTitle={slide.content}
              visualPrompt={slide.visual_description}
              indexLabel={`Slide ${slide.slide_number}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

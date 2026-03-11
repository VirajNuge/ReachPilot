"use client";

import React from "react";
import { MessageCircle, Link, Smile, Hash } from "lucide-react";
import type { 
  PostGenerationInput, 
  ToneType, 
  CTAType, 
  IntensityLevel 
} from "@/lib/types/postGeneration";
import { 
  TONE_LABELS, 
  CTA_LABELS 
} from "@/lib/types/postGeneration";

interface StepToneMessagingProps {
  input: PostGenerationInput;
  onChange: (updates: Partial<PostGenerationInput>) => void;
}

const INTENSITY_LEVELS: { value: IntensityLevel; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
];

export function StepToneMessaging({ input, onChange }: StepToneMessagingProps) {
  return (
    <div className="space-y-8">
      {/* Tone */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">What is the tone of voice?</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Object.entries(TONE_LABELS) as [ToneType, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
            const isSelected = input.tone === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ tone: key })}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#0052FF] bg-blue-50/30 shadow-[0_0_0_1px_#0052FF]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-[#0052FF]" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs font-medium ${isSelected ? "text-blue-600/70" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-5 h-5 text-[#0052FF]" />
          <h3 className="text-sm font-bold text-gray-800">Call to Action (CTA)</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CTA_LABELS) as [CTAType, string][]).map(([key, label]) => {
            const isSelected = input.cta === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ cta: key })}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                  isSelected
                    ? "bg-gray-800 text-white border-gray-800 shadow-md transform scale-105"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Intensity Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Emoji Level */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Smile className="w-5 h-5 text-[#0052FF]" />
            <h3 className="text-sm font-bold text-gray-800">Emoji Usage</h3>
          </div>
          <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1">
            {INTENSITY_LEVELS.map(({ value, label, color }) => {
              const isSelected = input.emojiLevel === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange({ emojiLevel: value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? color : "bg-gray-300"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Hashtag Intensity */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-[#0052FF]" />
            <h3 className="text-sm font-bold text-gray-800">Hashtag Density</h3>
          </div>
          <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1">
            {INTENSITY_LEVELS.map(({ value, label, color }) => {
              const isSelected = input.hashtagIntensity === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange({ hashtagIntensity: value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? color : "bg-gray-300"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

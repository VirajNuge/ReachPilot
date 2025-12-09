"use client";

import React from "react";
import { Sparkles, Loader2, Share2 } from "lucide-react";

// --- 1. IMPORT CHILD COMPONENTS ---
import SinglePostView from "../../components/SinglePostView/SinglePostView";
import CarouselPostView from "../../components/CarouselPostView/CarouselPostView";

// --- 2. DEFINE TYPES (Necessary for Type Safety) ---
export interface SinglePostContent {
  type: "single";
  headline: string;
  content: string;
  caption: string;
  visual_description: string;
}

export interface CarouselSlide {
  slide_number: number;
  headline: string;
  content: string;
  visual_description: string;
}

export interface CarouselPostContent {
  type: "carousel";
  main_caption: string;
  slides: CarouselSlide[];
}

export type GeneratedContent = SinglePostContent | CarouselPostContent;

// --- 3. CORRECTED PROPS INTERFACE ---
interface GeneratorResultsProps {
  result: GeneratedContent | null;
  isGenerating: boolean;
  postType: string; // Using string as the type is defined in the parent component
}

// --- 4. MAIN COMPONENT ---
export default function GeneratorResults({
  result,
  isGenerating,
  postType,
}: GeneratorResultsProps) {
  // A. LOADING STATE
  if (isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-6 min-h-[500px]">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-100 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={20} className="text-indigo-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-900">
            Designing your Content...
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {postType === "CAROUSEL"
              ? "Crafting a multi-slide storytelling sequence"
              : "Generating a high-impact visual post"}
          </p>
        </div>
      </div>
    );
  }

  // B. EMPTY STATE (Start Screen)
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center min-h-[500px]">
        <div className="mb-6 rounded-full bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <Share2 className="h-10 w-10 text-indigo-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          Ready to Create
        </h3>
        <p className="max-w-xs text-sm text-gray-500 leading-relaxed">
          Select your format and preferences on the left, then click
          <span className="font-bold text-gray-700"> "Generate Canvas" </span>
          to start.
        </p>
      </div>
    );
  }

  // C. RENDER CONTENT
  return (
    <div className="w-full pb-20">
      {result.type === "single" && (
        <SinglePostView data={result as SinglePostContent} />
      )}

      {result.type === "carousel" && (
        <CarouselPostView data={result as CarouselPostContent} />
      )}

      {/* Error Fallback */}
      {result.type !== "single" && result.type !== "carousel" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm font-bold text-center">
          Error: Unknown result type received ({result?.type}).
        </div>
      )}
    </div>
  );
}

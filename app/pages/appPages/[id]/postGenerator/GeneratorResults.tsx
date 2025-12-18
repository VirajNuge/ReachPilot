"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Share2 } from "lucide-react";

// --- IMPORT VIEWS ---
import SinglePostView from "../../components/SinglePostView/SinglePostView";
import CarouselPostView from "../../components/CarouselPostView/CarouselPostView";

// =======================================================
// TYPES (UPDATED FOR INPUT IMAGES + GENERATED IMAGE)
// =======================================================

export interface StrategyBlock {
  best_posting_day: string;
  best_posting_time: string;
  why_this_works: string;
  algorithm_alignment: string;
  engagement_tips: string[];
  visual_tips: string[];
  caption_tips: string[];
}

export interface EngagementScore {
  score_value: number;
  predicted_performance: string;
  score_explanation: string;
  platform_factors?: Record<string, string>;
  content_factors?: Record<string, string>;
  audience_factors?: Record<string, string>;
}

export interface SinglePostContent {
  type: "single";
  headline: string;
  content: string;
  caption: string;
  visual_description: string;

  strategy: StrategyBlock;
  engagement_score?: EngagementScore;

  hashtags?: string[];
  alt_text?: string;
  seo_keywords?: string[];
  thumbnail_text?: string;

  cross_platform_reposts?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    pinterest?: string;
    twitter?: string;
  };

  /* ⭐ NEW — REAL user images returned from Gemini */
  input_images?: {
    base64: string;
    mimeType: string;
    description?: string;
  }[];

  /* ⭐ IMAGE GENERATION OUTPUT */
  generated_image?: string;
  image_width?: number;
  image_height?: number;
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

// =======================================================
// PROPS
// =======================================================

interface GeneratorResultsProps {
  result: GeneratedContent | null;
  isGenerating: boolean;
  postType: string;
}

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function GeneratorResults({
  result,
  isGenerating,
  postType,
}: GeneratorResultsProps) {
  const [imageLoading, setImageLoading] = useState(false);

  // ---------------------------------------------------
  // ⭐ Generate Final Image AFTER Text JSON is Created
  // ---------------------------------------------------

  useEffect(() => {
    if (!result) return;
    if (result.type !== "single") return;

    // Already generated → skip
    if (result.generated_image) return;

    // Missing visual prompt → skip
    if (!result.visual_description) return;

    generateFinalImage(result);
  }, [result]);

  // ---------------------------------------------------
  // 👉 Generate final Imagen artwork
  // ---------------------------------------------------

  const generateFinalImage = async (jsonData: SinglePostContent) => {
    try {
      setImageLoading(true);

      const width = jsonData.image_width || 1080;
      const height = jsonData.image_height || 1350;

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: jsonData.visual_description,
          width,
          height,

          // ⭐ CRITICAL: Forward the uploaded assets to Imagen
          assets: jsonData.input_images || [],
        }),
      });

      const json = await response.json();

      if (json.success) {
        jsonData.generated_image = json.url;
        jsonData.image_width = width;
        jsonData.image_height = height;
      } else {
        console.error("Image generation failed:", json.error);
      }
    } catch (e) {
      console.error("Generate image error:", e);
    } finally {
      setImageLoading(false);
    }
  };

  // =======================================================
  // 1. TEXT GENERATING STATE
  // =======================================================

  if (isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-6 min-h-[480px]">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={22} className="text-indigo-600 animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            Designing your content…
          </h3>
          <p className="text-sm text-gray-500">
            {postType === "CAROUSEL"
              ? "Building a multi-slide storytelling sequence"
              : "Generating a high-impact visual post"}
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // 2. EMPTY STATE
  // =======================================================

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center min-h-[480px]">
        <div className="mb-6 rounded-full bg-white p-6 shadow-sm">
          <Share2 className="h-10 w-10 text-indigo-500" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to Create
        </h3>
        <p className="text-gray-500 text-sm">
          Fill out your post details, then click{" "}
          <span className="font-semibold">Generate Canvas</span>.
        </p>
      </div>
    );
  }

  // =======================================================
  // 3. RENDER RESULT
  // =======================================================

  return (
    <div className="w-full pb-20">
      {/* SINGLE POST */}
      {result.type === "single" && (
        <SinglePostView data={result as SinglePostContent} />
      )}

      {/* CAROUSEL POST */}
      {result.type === "carousel" && (
        <CarouselPostView data={result as CarouselPostContent} />
      )}

      {/* IMAGE LOADING INDICATOR */}
      {imageLoading && (
        <div className="mt-4 text-sm text-gray-500 animate-pulse text-center">
          Rendering final image…
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";

// --- IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import GeneratorForm from "./GeneratorForm";
import GeneratorResults, { GeneratedContent } from "./GeneratorResults";

// =====================================================
// 1. SHARED TYPES (Expanded to support Step 1–9)
// =====================================================

export type PostType = "SINGLE" | "CAROUSEL";

export type PlatformFormat =
  | "IG_SQUARE"
  | "IG_PORTRAIT"
  | "IG_STORY"
  | "IG_REEL_COVER"
  | "LINKEDIN_LANDSCAPE"
  | "LINKEDIN_PORTRAIT"
  | "LINKEDIN_SQUARE"
  | "TWITTER_POST"
  | "FB_POST"
  | "FB_STORY"
  | "FB_EVENT_BANNER"
  | "YOUTUBE_THUMBNAIL"
  | "PINTEREST_PIN"
  | "TIKTOK_COVER";

export interface TextElement {
  id: string;
  type: "HEADLINE" | "SUBHEAD" | "BODY" | "CTA" | "QUOTE";
  content: string;
}

export interface BrandColor {
  id: string;
  name: string;
  value: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  description?: string;

  base64?: string;
  mimeType?: string;
}

// =====================================================
// STEP 5 — STEP 9 TYPES
// =====================================================

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
  type: string;
  headline: string;
  content: string;
  caption: string;
  visual_description: string;

  strategy?: StrategyBlock;
  engagement_score?: EngagementScore;

  hashtags?: string[];
  alt_text?: string;
  seo_keywords?: string[];
  thumbnail_text?: string;
  cross_platform_reposts?: Record<string, string>;
  caption_variants?: Record<string, string>;
  headline_variants?: Record<string, string>;
  visual_variants?: Record<string, string>;

  // IMAGE
  generated_image?: string;
  image_width?: number;
  image_height?: number;
}

export type GeneratedSinglePost = SinglePostContent;

// =====================================================
// FORM STATE
// =====================================================

export interface GeneratorFormState {
  postType: PostType;
  platform: PlatformFormat;
  postIdea: string;
  targetAudience: string;

  tone: string;
  typographyMood: string;
  layoutDensity: number;
  designKeywords: string;

  useBrandKit: boolean;
  backgroundStyle: string;
  colors: BrandColor[];
  images: UploadedImage[];
  logoPlacement: "AUTO" | "MANUAL";

  textElements: TextElement[];
}

// =====================================================
// File → Base64 Helper
// =====================================================

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PostGeneratorPage() {
  const [formState, setFormState] = useState<GeneratorFormState>({
    postType: "SINGLE",
    platform: "IG_SQUARE",
    postIdea: "",
    targetAudience: "",
    tone: "PROFESSIONAL",
    typographyMood: "MODERN",
    layoutDensity: 2,
    designKeywords: "",
    useBrandKit: false,
    backgroundStyle: "Gradient",
    colors: [
      { id: "c1", name: "Primary", value: "#000000" },
      { id: "c2", name: "Accent", value: "#4F46E5" },
    ],
    images: [],
    logoPlacement: "AUTO",
    textElements: [{ id: "init-1", type: "HEADLINE", content: "" }],
  });

  const [generatedResult, setGeneratedResult] =
    useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // =====================================================
  // HELPER — Platform Size Map
  // (Same structure as in singlePostPrompt.ts)
  // =====================================================

  const PLATFORM_SIZE_MAP: Record<
    PlatformFormat,
    { width: number; height: number }
  > = {
    IG_SQUARE: { width: 1080, height: 1080 },
    IG_PORTRAIT: { width: 1080, height: 1350 },
    IG_STORY: { width: 1080, height: 1920 },
    IG_REEL_COVER: { width: 1080, height: 1920 },
    LINKEDIN_LANDSCAPE: { width: 1200, height: 627 },
    LINKEDIN_PORTRAIT: { width: 1080, height: 1350 },
    LINKEDIN_SQUARE: { width: 1080, height: 1080 },
    TWITTER_POST: { width: 1600, height: 900 },
    FB_POST: { width: 1200, height: 1500 },
    FB_STORY: { width: 1080, height: 1920 },
    FB_EVENT_BANNER: { width: 1920, height: 1080 },
    YOUTUBE_THUMBNAIL: { width: 1280, height: 720 },
    PINTEREST_PIN: { width: 1000, height: 1500 },
    TIKTOK_COVER: { width: 1080, height: 1920 },
  };

  // =====================================================
  // API HANDLER
  // =====================================================

  const handleGenerate = async () => {
    if (!formState.postIdea.trim()) {
      alert("Please enter a Post Idea first!");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      // 1. Convert images to Base64
      const imagesWithBase64 = await Promise.all(
        formState.images.map(async (img) => ({
          id: img.id,
          description: img.description || "",
          base64: await fileToBase64(img.file),
          mimeType: img.file.type,
        }))
      );

      // 2. Platform size
      const size = PLATFORM_SIZE_MAP[formState.platform];

      // 3. Payload for Gemini
      const payload = {
        ...formState,
        images: imagesWithBase64,
        image_width: size.width,
        image_height: size.height,
      };

      // 4. Request text + metadata from Gemini
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!json.success) {
        console.error("Generation failed:", json.error);
        alert(`Generation failed: ${json.error}`);
        return;
      }

      // 5. Now generate image using Imagen
      const visualPrompt = json.data.visual_description;

      const imgResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: visualPrompt,
          width: size.width,
          height: size.height,
        }),
      });

      const imgJson = await imgResponse.json();

      // 6. Merge image into final JSON result
      setGeneratedResult({
        ...json.data,
        generated_image: imgJson.url,
        image_width: size.width,
        image_height: size.height,
      });
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // =====================================================
  // RENDER UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans">
      <TopMenu
        pageName="Post Generator"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
        {/* LEFT PANEL */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <GeneratorForm
              formState={formState}
              setFormState={setFormState}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            <GeneratorResults
              result={generatedResult}
              isGenerating={isGenerating}
              postType={formState.postType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

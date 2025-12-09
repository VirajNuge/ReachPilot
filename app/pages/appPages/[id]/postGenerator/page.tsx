"use client";

import React, { useState } from "react";
// --- IMPORTS ---
// Ensure these paths match your actual folder structure.
// If your components are in the same folder, use "./GeneratorForm".
import TopMenu from "../../components/topMenu/topMenu";
import GeneratorForm from "./GeneratorForm";
import GeneratorResults, { GeneratedContent } from "./GeneratorResults";

// ==========================================
// 1. SHARED TYPES (Exported for use in other files)
// ==========================================

export type PostType = "SINGLE" | "CAROUSEL";

export type PlatformFormat =
  | "IG_SQUARE"
  | "IG_PORTRAIT"
  | "IG_STORY"
  | "LINKEDIN_LANDSCAPE"
  | "LINKEDIN_PORTRAIT"
  | "LINKEDIN_SQUARE"
  | "TWITTER_POST"
  | "FB_POST"
  | "FB_STORY"
  | "THREADS_PORTRAIT";

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
  // Optional properties for the API payload
  base64?: string;
  mimeType?: string;
}

export interface GeneratorFormState {
  // Strategy
  postType: PostType;
  platform: PlatformFormat;
  postIdea: string;
  targetAudience: string;

  // Design & Vibe
  tone: string;
  typographyMood: string;
  layoutDensity: number;
  designKeywords: string;

  // Assets
  useBrandKit: boolean;
  backgroundStyle: string;
  colors: BrandColor[];
  images: UploadedImage[];
  logoPlacement: "AUTO" | "MANUAL";

  // Content
  textElements: TextElement[];
}

// ==========================================
// 2. HELPER: FILE TO BASE64
// ==========================================
// This converts the raw File object into a string string the API can read.
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function PostGeneratorPage() {
  // --- A. State Initialization ---
  // This object holds EVERY piece of data from your form.
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

  // State for the Result (Typed to avoid 'never' errors)
  const [generatedResult, setGeneratedResult] =
    useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- B. API Integration ---
  const handleGenerate = async () => {
    // 1. Validation
    if (!formState.postIdea.trim()) {
      alert("Please enter a Post Idea first!");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null); // Clear previous results

    try {
      // 2. IMAGE PROCESSING
      // We must convert the File objects to Base64 strings before sending to the API.
      const imagesWithBase64 = await Promise.all(
        formState.images.map(async (img) => ({
          id: img.id,
          description: img.description, // Keep the text context
          base64: await fileToBase64(img.file), // The actual image data
          mimeType: img.file.type,
        }))
      );

      // 3. CREATE PAYLOAD
      // Construct the final object to send to the server
      const payload = {
        ...formState,
        images: imagesWithBase64, // Use the processed images
      };

      // 4. SEND TO API
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (json.success) {
        setGeneratedResult(json.data);
      } else {
        console.error("Generation failed:", json.error);
        alert(`Failed: ${json.error}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong connecting to the server.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- C. RENDER ---
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans">
      {/* Top Menu */}
      <TopMenu
        pageName="Post Generator"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
        {/* Left Column: Form */}
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

        {/* Right Column: Results */}
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

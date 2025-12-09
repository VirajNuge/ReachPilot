"use client";

import React, { useState, useEffect } from "react";
import {
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Share2,
  AtSign,
  Loader2,
  Edit3,
  Copy,
  Download,
  Heart,
  Clock,
} from "lucide-react";

// --- 1. PLATFORM HELPER ---
export const getPlatformDetails = (platformString: string = "IG") => {
  const p = platformString.toUpperCase();
  if (p.includes("TWITTER"))
    return {
      icon: <Twitter size={16} className="text-sky-500" />,
      label: "Twitter / X",
      bg: "bg-sky-50",
    };
  if (p.includes("IG") || p.includes("INSTAGRAM"))
    return {
      icon: <Instagram size={16} className="text-pink-600" />,
      label: "Instagram",
      bg: "bg-pink-50",
    };
  if (p.includes("LINKEDIN"))
    return {
      icon: <Linkedin size={16} className="text-blue-700" />,
      label: "LinkedIn",
      bg: "bg-blue-50",
    };
  if (p.includes("FACEBOOK"))
    return {
      icon: <Facebook size={16} className="text-blue-600" />,
      label: "Facebook",
      bg: "bg-blue-50",
    };
  if (p.includes("THREADS"))
    return {
      icon: <AtSign size={16} className="text-black" />,
      label: "Threads",
      bg: "bg-gray-100",
    };
  return {
    icon: <Share2 size={16} className="text-indigo-600" />,
    label: "Social Post",
    bg: "bg-indigo-50",
  };
};

// --- 2. AI IMAGE COMPONENT (Auto-Generates) ---
export const AIGeneratedImage = ({ description }: { description: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const generateImage = async () => {
      if (!description) return;
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: description }),
        });
        const data = await response.json();
        if (isMounted && data.success) setImageUrl(data.url);
      } catch (err) {
        console.error("Image gen failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    generateImage();
    return () => {
      isMounted = false;
    };
  }, [description]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
        <Loader2 size={24} className="animate-spin mb-2 text-indigo-500" />
        <span className="text-[10px] font-medium">Rendering AI Art...</span>
      </div>
    );
  }
  if (imageUrl) {
    return (
      <>
        <img
          src={imageUrl}
          alt="AI Generated"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#be185d]" />
  );
};

// --- 3. TEXT CAPTION BOX ---
export const TextContentBox = ({ text }: { text: string }) => (
  <div className="mb-4 rounded-xl border border-gray-100 bg-[#F8F9FC] p-4 group relative">
    <div className="space-y-2 text-xs text-gray-600 leading-relaxed whitespace-pre-line font-medium">
      {text}
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
      <span className="text-[10px] font-bold text-gray-400">
        {text.length} Characters
      </span>
      <div className="flex gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Copy size={10} /> Copy
        </button>
      </div>
    </div>
  </div>
);

// --- 4. VISUAL CARD (The Image + Text Overlay) ---
export const PostVisualCard = ({
  title,
  subTitle,
  visualPrompt,
  indexLabel,
}: {
  title: string;
  subTitle: string;
  visualPrompt: string;
  indexLabel?: string;
}) => (
  <div className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all hover:shadow-lg border border-gray-100/20">
    {/* The Background Image */}
    <AIGeneratedImage description={visualPrompt} />

    {/* Label (e.g., Slide 1) */}
    {indexLabel && (
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
        {indexLabel}
      </div>
    )}

    {/* Text Overlay (Glassmorphism) */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="mb-2 text-lg font-bold leading-tight text-white drop-shadow-lg">
          {title}
        </h3>
        <div className="h-0.5 w-8 bg-white/50 mx-auto mb-2 rounded-full"></div>
        <p className="text-[10px] font-medium text-white/90 line-clamp-3 leading-relaxed">
          {subTitle}
        </p>
      </div>
    </div>
  </div>
);

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, CheckCircle2, Sparkles } from "lucide-react";
import type { ImageVariation } from "@/lib/types/postGeneration";

interface ImagePreviewProps {
  imageVariations?: ImageVariation[];
  imageUrl?: string; // fallback single image
  headline: string;
  subtext: string;
  cta?: string;
  imagePrompt: string;
  suggestedLayout?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageVariations,
  imageUrl,
  headline,
  subtext,
  cta,
  imagePrompt,
}) => {
  const [activeId, setActiveId] = useState<number>(1);

  // Resolve variations — use imageVariations array if available, else wrap single imageUrl
  const variations: ImageVariation[] =
    imageVariations && imageVariations.length > 0
      ? imageVariations
      : imageUrl
      ? [{ id: 1, imageUrl, model: "unknown", aspectRatio: "1:1" }]
      : [];

  const activeVariation = variations.find((v) => v.id === activeId) ?? variations[0];

  const handleDownload = () => {
    if (!activeVariation?.imageUrl) return;
    const link = document.createElement("a");
    link.href = activeVariation.imageUrl;
    link.download = `reachpilot-poster-v${activeVariation.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#0052FF]" />
          AI Generated Poster
        </h3>
        {variations.length > 0 && (
          <span className="text-xs font-medium text-gray-400">
            {variations.length} variation{variations.length !== 1 ? "s" : ""} generated
          </span>
        )}
      </div>

      {/* Variation Thumbnails */}
      {variations.length > 1 && (
        <div className="flex gap-3">
          {variations.map((v) => {
            const isActive = v.id === activeId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isActive
                    ? "border-[#0052FF] shadow-[0_0_0_2px_rgba(0,82,255,0.15)]"
                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-90"
                }`}
              >
                <img
                  src={v.imageUrl}
                  alt={`Variation ${v.id}`}
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 bg-[#0052FF] rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  V{v.id}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Poster Display */}
      <div className="w-full rounded-xl overflow-hidden bg-gray-900 shadow-inner relative">
        {activeVariation ? (
          <>
            <img
              src={activeVariation.imageUrl}
              alt={`Generated poster - ${headline}`}
              className="w-full h-auto object-contain"
            />
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          </>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center animate-pulse">
            <ImageIcon className="w-8 h-8 text-gray-600 mb-3" />
            <span className="text-gray-400 text-sm font-medium">Generating poster...</span>
          </div>
        )}
      </div>

      {/* Post Details */}
      <div className="bg-[#F6F8FF] rounded-xl p-4 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Headline</span>
          <span className="text-sm font-bold text-gray-900">{headline}</span>
        </div>
        {subtext && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtext</span>
            <span className="text-sm text-gray-600 font-medium">{subtext}</span>
          </div>
        )}
        {cta && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA</span>
            <span className="text-sm font-bold text-[#0052FF]">{cta}</span>
          </div>
        )}
      </div>

      {/* Download Button */}
      {activeVariation && (
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0052FF] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Poster {variations.length > 1 ? `(V${activeVariation.id})` : ""}
        </button>
      )}
    </motion.div>
  );
};

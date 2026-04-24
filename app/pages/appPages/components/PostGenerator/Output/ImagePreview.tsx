"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, CheckCircle2 } from "lucide-react";
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
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#0052FF]" />
          AI Generated Poster
        </h3>
        {variations.length > 0 && (
          <span className="text-[11px] font-medium text-gray-400">
            {variations.length} variation{variations.length !== 1 ? "s" : ""} generated
          </span>
        )}
      </div>

      {/* Variation Thumbnails */}
      {variations.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {variations.map((v) => {
            const isActive = v.id === activeId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 ${
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
          </>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center animate-pulse">
            <ImageIcon className="w-8 h-8 text-gray-600 mb-3" />
            <span className="text-gray-400 text-sm font-medium">Generating poster...</span>
          </div>
        )}
      </div>

      {/* Post Details */}
      <div className="bg-[#F6F8FF] rounded-xl p-5 grid gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[#0052FF] uppercase tracking-[0.12em]">Headline</span>
          <p className="text-[13px] font-bold text-gray-900 mt-1">{headline}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {subtext && (
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Subtext</span>
              <p className="text-[13px] text-gray-700 font-medium mt-1">{subtext}</p>
            </div>
          )}
          {cta && (
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">CTA</span>
              <p className="text-[13px] font-bold text-[#0052FF] mt-1">{cta}</p>
            </div>
          )}
        </div>
        <details className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-semibold text-[#64748B]">View prompt used</summary>
          <p className="text-[12px] text-gray-600 mt-2 leading-relaxed">{imagePrompt}</p>
        </details>
      </div>

      {/* Download Button */}
      {activeVariation && (
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0052FF] hover:bg-blue-700 text-white rounded-lg font-semibold text-[13px] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Poster {variations.length > 1 ? `(V${activeVariation.id})` : ""}
        </button>
      )}
    </motion.div>
  );
};

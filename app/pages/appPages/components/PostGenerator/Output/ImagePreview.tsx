"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Image as ImageIcon } from "lucide-react";

import type { ImageVariation } from "@/lib/types/postGeneration";

interface ImagePreviewProps {
  imageVariations?: ImageVariation[];
  imageUrl?: string;
  headline: string;
  subtext: string;
  cta?: string;
  imagePrompt: any;
  selectedImageVariationId?: number;
  onSelectVariation?: (variationId: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageVariations,
  imageUrl,
  headline,
  subtext,
  cta,
  imagePrompt,
  selectedImageVariationId,
  onSelectVariation,
}) => {
  const variations: ImageVariation[] =
    imageVariations && imageVariations.length > 0
      ? imageVariations
      : imageUrl
        ? [{ id: 1, imageUrl, model: "unknown", aspectRatio: "1:1" }]
        : [];

  const [activeId, setActiveId] = useState<number>(selectedImageVariationId ?? variations[0]?.id ?? 1);
  const activeVariation = variations.find((item) => item.id === activeId) ?? variations[0];

  useEffect(() => {
    setActiveId(selectedImageVariationId ?? variations[0]?.id ?? 1);
  }, [selectedImageVariationId, variations]);

  if (!activeVariation) {
    return null;
  }

  const handleSelectVariation = (variationId: number) => {
    setActiveId(variationId);
    onSelectVariation?.(variationId);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = activeVariation.imageUrl;
    link.download = `reachpilot-poster-${activeVariation.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      <div className="relative group overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(243,244,246,0.86))] shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-[#111827] shadow-sm">
            <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
            AI-generated poster
          </span>
        </div>
        
        <button
          type="button"
          onClick={handleDownload}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#111827] shadow-sm opacity-0 transform translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white"
          title="Download image"
        >
          <Download className="h-4 w-4" />
        </button>

        <img
          src={activeVariation.imageUrl}
          alt={`Generated poster - ${headline}`}
          className="w-full h-auto object-contain transition-transform duration-700 hover:scale-[1.02]"
        />
      </div>

      {variations.length > 1 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {variations.map((variation) => {
            const isActive = variation.id === activeVariation.id;

            return (
              <button
                key={variation.id}
                type="button"
                onClick={() => handleSelectVariation(variation.id)}
                className={[
                  "group relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-2xl transition-all duration-300",
                  isActive
                    ? "ring-2 ring-blue-600 shadow-md"
                    : "ring-1 ring-gray-200 opacity-70 hover:opacity-100 hover:ring-gray-300",
                ].join(" ")}
              >
                <img src={variation.imageUrl} alt={`Variation ${variation.id}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                
                {isActive && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-blue-600 p-1 text-white shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                )}
                
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-center">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium text-white/90 tracking-wide uppercase">
                    {variation.model || "Imagen"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <details className="group rounded-[20px] border border-[#E5E7EB] bg-white transition-all [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-[#374151]">
          <span>Poster Details</span>
          <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Headline</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{headline || "Generated poster"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">CTA</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{cta || "Ready to publish"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Subtext</p>
              <p className="mt-1 text-sm text-[#374151]">{subtext || "AI-generated poster."}</p>
            </div>
          </div>
          
          {imagePrompt && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Prompt Used</p>
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                {typeof imagePrompt === "string"
                  ? imagePrompt
                  : (imagePrompt as any)?.masterPrompt ||
                    (imagePrompt as any)?.posterPrompt ||
                    JSON.stringify(imagePrompt)}
              </p>
            </div>
          )}
        </div>
      </details>
    </motion.section>
  );
};

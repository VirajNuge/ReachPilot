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
  imagePrompt: string;
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
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(246,249,252,0.78))] px-5 py-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Poster</p>
          <h3 className="mt-1 text-lg font-semibold text-[#111827]">AI-generated final poster</h3>
          <p className="mt-1 text-sm text-[#475569]">The model generated the full poster in one shot, including text, styling, and integrated branding.</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-3.5 py-2 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(243,244,246,0.86))] p-3 shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
        <img
          src={activeVariation.imageUrl}
          alt={`Generated poster - ${headline}`}
          className="w-full h-auto rounded-[24px] object-contain"
        />
      </div>

      {variations.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {variations.map((variation) => {
            const isActive = variation.id === activeVariation.id;

            return (
              <button
                key={variation.id}
                type="button"
                onClick={() => handleSelectVariation(variation.id)}
                className={[
                  "relative h-20 w-20 overflow-hidden rounded-2xl border transition-all",
                  isActive
                    ? "border-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                    : "border-[#E5E7EB] opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                <img src={variation.imageUrl} alt={`Variation ${variation.id}`} className="h-full w-full object-cover" />
                {isActive && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-[#111827]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFD] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Headline</p>
          <p className="mt-2 text-sm font-semibold text-[#111827]">{headline || "Generated poster"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Subtext</p>
          <p className="mt-2 text-sm text-[#374151]">{subtext || "AI-generated poster."}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">CTA</p>
          <p className="mt-2 text-sm font-semibold text-[#111827]">{cta || "Ready to publish"}</p>
        </div>
      </div>

      {imagePrompt && (
        <details className="rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[#374151]">
            Poster prompt
          </summary>
          <div className="mt-3 flex gap-3 text-sm leading-7 text-[#4B5563]">
            <ImageIcon className="mt-1 h-4 w-4 shrink-0 text-[#6B7280]" />
            <p>{imagePrompt}</p>
          </div>
        </details>
      )}
    </motion.section>
  );
};

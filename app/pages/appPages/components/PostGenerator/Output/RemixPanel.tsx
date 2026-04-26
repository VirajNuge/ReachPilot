"use client";

import React from "react";
import { ChevronDown, RefreshCw, Sparkles } from "lucide-react";
import { REMIX_STYLE_LABELS, RemixStyle } from "@/lib/types/postGeneration";

interface RemixPanelProps {
  onRemix: (style: RemixStyle) => void;
  isRemixing?: boolean;
}

export const RemixPanel: React.FC<RemixPanelProps> = ({ onRemix, isRemixing = false }) => {
  const [open, setOpen] = React.useState(false);
  const styles = Object.keys(REMIX_STYLE_LABELS) as RemixStyle[];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] px-3.5 py-2 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
      >
        {isRemixing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Remix
        <ChevronDown className={["h-4 w-4 transition-transform", open ? "rotate-180" : ""].join(" ")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-[20px] border border-[#E5E7EB] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          {styles.map((style) => {
            const item = REMIX_STYLE_LABELS[style];
            return (
              <button
                key={style}
                type="button"
                disabled={isRemixing}
                onClick={() => {
                  onRemix(style);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-[#111827] transition-colors hover:bg-[#F3F4F6] disabled:opacity-50"
              >
                <span>{item.emoji}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

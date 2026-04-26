import React from "react";

import type { CreativeHandoffV2, PostGenerationInput } from "@/lib/types/postGeneration";

export type TemplateBaseProps = {
  creativeHandoff: CreativeHandoffV2;
  brandAssets: PostGenerationInput["brandAssets"];
  backgroundImageUrl: string;
  width: number;
  height: number;
};

export function overlayBackground(overlay: CreativeHandoffV2["layoutBrief"]["overlay"]): string {
  switch (overlay) {
    case "black-gradient-60":
      return "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)";
    case "dark-glass":
      return "linear-gradient(180deg, rgba(7,11,20,0.28) 0%, rgba(7,11,20,0.52) 100%)";
    case "brand-tint":
      return "linear-gradient(135deg, rgba(37,99,235,0.24) 0%, rgba(15,23,42,0.55) 100%)";
    case "none":
      return "transparent";
    default:
      return "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.8) 100%)";
  }
}

export function textAlignFor(alignment: CreativeHandoffV2["layoutBrief"]["alignment"]): React.CSSProperties["textAlign"] {
  return alignment;
}

export function justifyFor(alignment: CreativeHandoffV2["layoutBrief"]["alignment"]): React.CSSProperties["justifyContent"] {
  switch (alignment) {
    case "right":
      return "flex-end";
    case "center":
      return "center";
    default:
      return "flex-start";
  }
}

export function textColorFor(theme: CreativeHandoffV2["layoutBrief"]["textTheme"]): string {
  switch (theme) {
    case "dark-on-light":
      return "#0F172A";
    case "brand-accent":
      return "#E0F2FE";
    default:
      return "#FFFFFF";
  }
}

export function ctaStyle(theme: CreativeHandoffV2["layoutBrief"]["textTheme"], brandAssets: PostGenerationInput["brandAssets"]): React.CSSProperties {
  const accent = brandAssets.colorPalette[0] ?? "#38BDF8";
  if (theme === "dark-on-light") {
    return {
      background: accent,
      color: "#FFFFFF",
      border: "none",
    };
  }
  return {
    background: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    border: `1px solid ${accent}`,
    boxShadow: `0 0 0 1px ${accent} inset`,
  };
}

export function fontFamily(brandAssets: PostGenerationInput["brandAssets"]): string {
  return brandAssets.fontFamily ? `${brandAssets.fontFamily}, Inter, Arial, sans-serif` : "Inter, Arial, sans-serif";
}

export function logoBadge(brandAssets: PostGenerationInput["brandAssets"], theme: CreativeHandoffV2["layoutBrief"]["textTheme"]) {
  if (!brandAssets.logoUrl) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 72,
        height: 72,
        borderRadius: 18,
        background: theme === "dark-on-light" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      <img src={brandAssets.logoUrl} alt="Brand logo" style={{ maxWidth: 48, maxHeight: 48, objectFit: "contain" }} />
    </div>
  );
}

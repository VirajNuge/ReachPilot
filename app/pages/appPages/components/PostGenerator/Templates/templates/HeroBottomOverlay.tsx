import React from "react";

import { TemplateBaseProps, ctaStyle, fontFamily, logoBadge, overlayBackground, textAlignFor } from "./shared";

export function HeroBottomOverlayTemplate({ creativeHandoff, brandAssets, backgroundImageUrl, width, height }: TemplateBaseProps) {
  const textColor = creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "#0F172A" : "#FFFFFF";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        borderRadius: 28,
        background: "#0F172A",
        fontFamily: fontFamily(brandAssets),
      }}
    >
      <img src={backgroundImageUrl} alt="Generated background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: overlayBackground(creativeHandoff.layoutBrief.overlay) }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 56,
          color: textColor,
          textAlign: textAlignFor(creativeHandoff.layoutBrief.alignment),
          gap: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: creativeHandoff.layoutBrief.alignment === "right" ? "flex-end" : creativeHandoff.layoutBrief.alignment === "center" ? "center" : "flex-start" }}>
          {logoBadge(brandAssets, creativeHandoff.layoutBrief.textTheme)}
        </div>
        <div style={{ maxWidth: width * 0.72, marginLeft: creativeHandoff.layoutBrief.alignment === "right" ? "auto" : undefined, marginRight: creativeHandoff.layoutBrief.alignment === "center" ? "auto" : undefined }}>
          <h1 style={{ margin: 0, fontSize: Math.max(42, width * 0.062), lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase" }}>
            {creativeHandoff.copyBrief.headline}
          </h1>
          <p style={{ margin: "18px 0 0", fontSize: Math.max(18, width * 0.022), lineHeight: 1.4, opacity: 0.94 }}>
            {creativeHandoff.copyBrief.subtext}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: creativeHandoff.layoutBrief.alignment === "right" ? "flex-end" : creativeHandoff.layoutBrief.alignment === "center" ? "center" : "flex-start" }}>
          <div style={{ ...ctaStyle(creativeHandoff.layoutBrief.textTheme, brandAssets), borderRadius: 999, padding: "14px 24px", fontSize: 16, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {creativeHandoff.copyBrief.cta}
          </div>
        </div>
      </div>
    </div>
  );
}

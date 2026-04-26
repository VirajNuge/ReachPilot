import React from "react";

import { TemplateBaseProps, ctaStyle, fontFamily, logoBadge, textColorFor } from "./shared";

export function MinimalCardTemplate({ creativeHandoff, brandAssets, backgroundImageUrl, width, height }: TemplateBaseProps) {
  const textColor = textColorFor(creativeHandoff.layoutBrief.textTheme);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", borderRadius: 28, background: "#EEF2FF", fontFamily: fontFamily(brandAssets) }}>
      <img src={backgroundImageUrl} alt="Generated background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(1.02)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(248,250,252,0.18) 0%, rgba(248,250,252,0.38) 100%)" }} />

      <div style={{ position: "absolute", inset: 36, borderRadius: 30, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(18px)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)", padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between", color: textColor }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65 }}>Minimal Card</div>
          {logoBadge(brandAssets, "dark-on-light")}
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <h1 style={{ margin: 0, fontSize: Math.max(38, width * 0.05), lineHeight: 0.98, fontWeight: 900, letterSpacing: "-0.04em" }}>
            {creativeHandoff.copyBrief.headline}
          </h1>
          <p style={{ margin: 0, fontSize: Math.max(18, width * 0.019), lineHeight: 1.45, opacity: 0.78 }}>
            {creativeHandoff.copyBrief.subtext}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, opacity: 0.6 }}>Built in ReachPilot</div>
          <div style={{ ...ctaStyle("dark-on-light", brandAssets), borderRadius: 999, padding: "14px 22px", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
            {creativeHandoff.copyBrief.cta}
          </div>
        </div>
      </div>
    </div>
  );
}

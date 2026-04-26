import React from "react";

import { TemplateBaseProps, ctaStyle, fontFamily, logoBadge, overlayBackground, textColorFor } from "./shared";

export function SplitEditorialTemplate({ creativeHandoff, brandAssets, backgroundImageUrl, width, height }: TemplateBaseProps) {
  const textColor = textColorFor(creativeHandoff.layoutBrief.textTheme);
  const panelBackground = creativeHandoff.layoutBrief.textTheme === "dark-on-light"
    ? "rgba(255,255,255,0.88)"
    : "rgba(7,11,20,0.62)";

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", borderRadius: 28, background: "#0F172A", fontFamily: fontFamily(brandAssets) }}>
      <img src={backgroundImageUrl} alt="Generated background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: overlayBackground(creativeHandoff.layoutBrief.overlay) }} />

      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "0.95fr 1.05fr" }}>
        <div style={{ padding: 40, display: "flex", alignItems: "stretch" }}>
          <div style={{ width: "100%", borderRadius: 26, background: panelBackground, color: textColor, backdropFilter: "blur(16px)", padding: 34, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7 }}>
                ReachPilot Composition
              </div>
              {logoBadge(brandAssets, creativeHandoff.layoutBrief.textTheme)}
            </div>

            <div>
              <h1 style={{ margin: 0, fontSize: Math.max(40, width * 0.055), lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase" }}>
                {creativeHandoff.copyBrief.headline}
              </h1>
              <p style={{ margin: "20px 0 0", fontSize: Math.max(18, width * 0.02), lineHeight: 1.45, opacity: 0.86 }}>
                {creativeHandoff.copyBrief.subtext}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ ...ctaStyle(creativeHandoff.layoutBrief.textTheme, brandAssets), borderRadius: 999, padding: "14px 22px", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {creativeHandoff.copyBrief.cta}
              </div>
            </div>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
}

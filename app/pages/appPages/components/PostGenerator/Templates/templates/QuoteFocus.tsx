import React from "react";

import { TemplateBaseProps, ctaStyle, fontFamily, overlayBackground, textColorFor } from "./shared";

export function QuoteFocusTemplate({ creativeHandoff, brandAssets, backgroundImageUrl, width, height }: TemplateBaseProps) {
  const textColor = textColorFor(creativeHandoff.layoutBrief.textTheme);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", borderRadius: 28, background: "#0F172A", fontFamily: fontFamily(brandAssets) }}>
      <img src={backgroundImageUrl} alt="Generated background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: overlayBackground(creativeHandoff.layoutBrief.overlay) }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 52 }}>
        <div style={{ width: "100%", maxWidth: width * 0.78, borderRadius: 32, background: creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.58)", backdropFilter: "blur(16px)", padding: 42, color: textColor, textAlign: "center", boxShadow: "0 24px 80px rgba(15,23,42,0.22)" }}>
          <div style={{ fontSize: 82, lineHeight: 0.8, opacity: 0.22, fontWeight: 900 }}>
            “
          </div>
          <h1 style={{ margin: "-18px 0 0", fontSize: Math.max(38, width * 0.05), lineHeight: 1.02, fontWeight: 900, letterSpacing: "-0.04em" }}>
            {creativeHandoff.copyBrief.headline}
          </h1>
          <p style={{ margin: "18px auto 0", maxWidth: width * 0.56, fontSize: Math.max(18, width * 0.019), lineHeight: 1.45, opacity: 0.86 }}>
            {creativeHandoff.copyBrief.subtext}
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <div style={{ ...ctaStyle(creativeHandoff.layoutBrief.textTheme, brandAssets), borderRadius: 999, padding: "14px 22px", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
              {creativeHandoff.copyBrief.cta}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

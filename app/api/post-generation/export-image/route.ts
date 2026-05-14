import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

import { getAuthFromRequest } from "@/lib/auth";
import { resolveSelectedVariation, validateComposedPostPackage } from "@/lib/postGeneration/compositionValidation";
import { buildFallbackCreativeHandoff } from "@/lib/postGeneration/creativeHandoffValidation";
import { POST_IMAGE_SIZES } from "@/lib/types/postGeneration";
import type { ContentStrategyOutput, CreativeHandoffV2, PostGenerationInput } from "@/lib/types/postGeneration";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function overlayBackground(overlay: CreativeHandoffV2["layoutBrief"]["overlay"]): string {
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

function templateMarkup(
  creativeHandoff: CreativeHandoffV2,
  brandAssets: PostGenerationInput["brandAssets"],
  backgroundImageUrl: string,
  width: number,
  height: number,
) {
  const headline = escapeHtml(creativeHandoff.copyBrief.headline);
  const subtext = escapeHtml(creativeHandoff.copyBrief.subtext);
  const cta = escapeHtml(creativeHandoff.copyBrief.cta);
  const textColor = creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "#0F172A" : "#FFFFFF";
  const fontFamily = brandAssets.fontFamily ? `${brandAssets.fontFamily}, Inter, Arial, sans-serif` : "Inter, Arial, sans-serif";
  const accent = brandAssets.colorPalette[0] ?? "#38BDF8";
  const overlay = overlayBackground(creativeHandoff.layoutBrief.overlay);
  const logoMarkup = brandAssets.logoUrl
    ? `<div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:18px;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.12)"};backdrop-filter:blur(12px);overflow:hidden;"><img src="${brandAssets.logoUrl}" alt="Brand logo" style="max-width:48px;max-height:48px;object-fit:contain;display:block;" /></div>`
    : "";

  if (creativeHandoff.layoutBrief.templateId === "split-editorial") {
    return `
      <div id="reachpilot-export-root" style="position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:28px;background:#0F172A;font-family:${fontFamily};">
        <img src="${backgroundImageUrl}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" />
        <div style="position:absolute;inset:0;background:${overlay};"></div>
        <div style="position:absolute;inset:0;display:grid;grid-template-columns:0.95fr 1.05fr;">
          <div style="padding:40px;display:flex;align-items:stretch;">
            <div style="width:100%;border-radius:26px;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "rgba(255,255,255,0.88)" : "rgba(7,11,20,0.62)"};color:${textColor};backdrop-filter:blur(16px);padding:34px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 24px 80px rgba(15,23,42,0.18);">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                <div style="font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;opacity:0.7;">ReachPilot Composition</div>
                ${logoMarkup}
              </div>
              <div>
                <h1 style="margin:0;font-size:${Math.max(40, width * 0.055)}px;line-height:0.95;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;">${headline}</h1>
                <p style="margin:20px 0 0;font-size:${Math.max(18, width * 0.02)}px;line-height:1.45;opacity:0.86;">${subtext}</p>
              </div>
              <div style="display:flex;justify-content:flex-start;">
                <div style="border-radius:999px;padding:14px 22px;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? accent : "rgba(255,255,255,0.16)"};color:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "#FFFFFF" : "#FFFFFF"};border:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `1px solid ${accent}`};box-shadow:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `0 0 0 1px ${accent} inset`};">${cta}</div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>`;
  }

  if (creativeHandoff.layoutBrief.templateId === "minimal-card") {
    return `
      <div id="reachpilot-export-root" style="position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:28px;background:#EEF2FF;font-family:${fontFamily};">
        <img src="${backgroundImageUrl}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(0.92) contrast(1.02);display:block;" />
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(248,250,252,0.18) 0%, rgba(248,250,252,0.38) 100%);"></div>
        <div style="position:absolute;inset:36px;border-radius:30px;background:rgba(255,255,255,0.78);backdrop-filter:blur(18px);box-shadow:0 24px 80px rgba(15,23,42,0.18);padding:36px;display:flex;flex-direction:column;justify-content:space-between;color:#0F172A;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;"><div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;opacity:0.65;">Minimal Card</div>${logoMarkup}</div>
          <div style="display:grid;gap:18px;">
            <h1 style="margin:0;font-size:${Math.max(38, width * 0.05)}px;line-height:0.98;font-weight:900;letter-spacing:-0.04em;">${headline}</h1>
            <p style="margin:0;font-size:${Math.max(18, width * 0.019)}px;line-height:1.45;opacity:0.78;">${subtext}</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <div style="font-size:14px;opacity:0.6;">Built in ReachPilot</div>
            <div style="border-radius:999px;padding:14px 22px;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;background:${accent};color:#FFFFFF;">${cta}</div>
          </div>
        </div>
      </div>`;
  }

  if (creativeHandoff.layoutBrief.templateId === "quote-focus") {
    return `
      <div id="reachpilot-export-root" style="position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:28px;background:#0F172A;font-family:${fontFamily};">
        <img src="${backgroundImageUrl}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" />
        <div style="position:absolute;inset:0;background:${overlay};"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:52px;">
          <div style="width:100%;max-width:${width * 0.78}px;border-radius:32px;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.58)"};backdrop-filter:blur(16px);padding:42px;color:${textColor};text-align:center;box-shadow:0 24px 80px rgba(15,23,42,0.22);">
            <div style="font-size:82px;line-height:0.8;opacity:0.22;font-weight:900;">“</div>
            <h1 style="margin:-18px 0 0;font-size:${Math.max(38, width * 0.05)}px;line-height:1.02;font-weight:900;letter-spacing:-0.04em;">${headline}</h1>
            <p style="margin:18px auto 0;max-width:${width * 0.56}px;font-size:${Math.max(18, width * 0.019)}px;line-height:1.45;opacity:0.86;">${subtext}</p>
            <div style="display:flex;justify-content:center;margin-top:28px;">
              <div style="border-radius:999px;padding:14px 22px;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? accent : "rgba(255,255,255,0.16)"};color:#FFFFFF;border:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `1px solid ${accent}`};box-shadow:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `0 0 0 1px ${accent} inset`};">${cta}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  return `
    <div id="reachpilot-export-root" style="position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:28px;background:#0F172A;font-family:${fontFamily};">
      <img src="${backgroundImageUrl}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" />
      <div style="position:absolute;inset:0;background:${overlay};"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:56px;color:${textColor};text-align:${creativeHandoff.layoutBrief.alignment};gap:18px;">
        <div style="display:flex;justify-content:${creativeHandoff.layoutBrief.alignment === "right" ? "flex-end" : creativeHandoff.layoutBrief.alignment === "center" ? "center" : "flex-start"};">${logoMarkup}</div>
        <div style="max-width:${width * 0.72}px;${creativeHandoff.layoutBrief.alignment === "right" ? "margin-left:auto;" : creativeHandoff.layoutBrief.alignment === "center" ? "margin-left:auto;margin-right:auto;" : ""}">
          <h1 style="margin:0;font-size:${Math.max(42, width * 0.062)}px;line-height:0.95;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;">${headline}</h1>
          <p style="margin:18px 0 0;font-size:${Math.max(18, width * 0.022)}px;line-height:1.4;opacity:0.94;">${subtext}</p>
        </div>
        <div style="display:flex;justify-content:${creativeHandoff.layoutBrief.alignment === "right" ? "flex-end" : creativeHandoff.layoutBrief.alignment === "center" ? "center" : "flex-start"};">
          <div style="border-radius:999px;padding:14px 24px;font-size:16px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;background:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? accent : "rgba(255,255,255,0.16)"};color:#FFFFFF;border:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `1px solid ${accent}`};box-shadow:${creativeHandoff.layoutBrief.textTheme === "dark-on-light" ? "none" : `0 0 0 1px ${accent} inset`};">${cta}</div>
        </div>
      </div>
    </div>`;
}

function buildExportHtml(
  creativeHandoff: CreativeHandoffV2,
  brandAssets: PostGenerationInput["brandAssets"],
  backgroundImageUrl: string,
  width: number,
  height: number,
): string {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>${escapeHtml(creativeHandoff.copyBrief.headline)}</title>
        <style>
          html, body { margin: 0; padding: 0; background: transparent; }
          body { width: ${width}px; height: ${height}px; overflow: hidden; }
          *, *::before, *::after { box-sizing: border-box; }
          img { display: block; }
        </style>
      </head>
      <body>
        ${templateMarkup(creativeHandoff, brandAssets, backgroundImageUrl, width, height)}
      </body>
    </html>`;
}

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const auth = await getAuthFromRequest(req);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      input?: PostGenerationInput;
      strategy?: ContentStrategyOutput;
      creativeHandoff?: CreativeHandoffV2;
      imageUrl?: string;
      imageVariations?: { id: number; imageUrl: string; model: string; aspectRatio: string }[];
      selectedImageVariationId?: number;
    };

    if (!body.input || !body.imageUrl) {
      return NextResponse.json({ error: "input and imageUrl are required" }, { status: 400 });
    }

    const selectedSize = POST_IMAGE_SIZES.find((size) => size.id === body.input?.imageSize);
    const width = selectedSize?.width ?? 1080;
    const height = selectedSize?.height ?? 1080;

    const creativeHandoff = body.creativeHandoff ?? (body.strategy ? buildFallbackCreativeHandoff(body.input, body.strategy) : null);
    if (!creativeHandoff) {
      return NextResponse.json({ error: "creativeHandoff or strategy is required" }, { status: 400 });
    }

    const selectedVariation = resolveSelectedVariation(body.imageVariations, body.selectedImageVariationId);
    const exportImageUrl = selectedVariation?.imageUrl ?? body.imageUrl;

    const validation = validateComposedPostPackage({
      creativeHandoff,
      imageUrl: exportImageUrl,
      imageVariations: body.imageVariations,
      selectedImageVariationId: body.selectedImageVariationId,
    });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors.join(". ") }, { status: 400 });
    }

    const html = buildExportHtml(creativeHandoff, body.input.brandAssets, exportImageUrl!, width, height);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });

    await page.evaluate(async () => {
      const imagePromises = Array.from(document.images).map(
        (image) =>
          image.complete
            ? Promise.resolve(true)
            : new Promise<boolean>((resolve) => {
                image.addEventListener("load", () => resolve(true), { once: true });
                image.addEventListener("error", () => resolve(false), { once: true });
              }),
      );

      await Promise.all(imagePromises);

      if ("fonts" in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }
    });

    const element = await page.$("#reachpilot-export-root");
    if (!element) {
      return NextResponse.json({ error: "Export surface not found" }, { status: 500 });
    }

    const png = await element.screenshot({ type: "png" });

    return new NextResponse(Buffer.from(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="reachpilot-post-${Date.now()}.png"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export image route error:", error);
    return NextResponse.json({ error: "Failed to export image" }, { status: 500 });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Failed to close export browser:", closeError);
      }
    }
  }
}

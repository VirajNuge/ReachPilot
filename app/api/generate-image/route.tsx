import { NextRequest, NextResponse } from "next/server";

// --------------------------------------------------------
// Map arbitrary width/height to a supported Imagen ratio
// Supported: 1:1, 9:16, 16:9, 4:3, 3:4
// --------------------------------------------------------
function mapToSupportedRatio(width: number, height: number): string {
  const ratio = width / height;

  const supported = [
    { r: 1 / 1, label: "1:1" },
    { r: 9 / 16, label: "9:16" },
    { r: 16 / 9, label: "16:9" },
    { r: 4 / 3, label: "4:3" },
    { r: 3 / 4, label: "3:4" },
  ];

  let closest = supported[0];
  let smallestDiff = Math.abs(ratio - closest.r);

  for (const s of supported) {
    const diff = Math.abs(ratio - s.r);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = s;
    }
  }

  return closest.label;
}

// --------------------------------------------------------
// POST /api/generate-image
// --------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const { prompt, width, height, assets } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing prompt" },
        { status: 400 }
      );
    }

    if (!width || !height) {
      return NextResponse.json(
        { success: false, error: "Missing width/height" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // ----------------------------------------------------
    // 1. Aspect ratio → always Imagen-supported
    // ----------------------------------------------------
    const aspectRatio = mapToSupportedRatio(width, height);

    // ----------------------------------------------------
    // 2. Prepare uploaded images for Imagen
    //    (these are your logos / products / brand assets)
    // ----------------------------------------------------
    const formattedImages =
      Array.isArray(assets) && assets.length > 0
        ? assets
            .filter((img: any) => !!img.base64)
            .map((img: any) => ({
              bytesBase64Encoded: img.base64.split(",")[1],
              mimeType: img.mimeType || "image/png",
            }))
        : [];

    // ----------------------------------------------------
    // 3. Build Imagen request payload
    // ----------------------------------------------------
    const modelName = "imagen-4.0-generate-001";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      instances: [
        {
          prompt: `
${prompt}

CRITICAL:
- Use the uploaded images as fixed brand assets (logos/products).
- Do NOT redraw or alter them.
- Design background, lighting and composition around them.
`.trim(),
          // 🔥 key part: send the assets to Imagen
          images: formattedImages,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio, // must be one of: 1:1, 9:16, 16:9, 4:3, 3:4
      },
    };

    console.log("📸 Imagen Request", {
      aspectRatio,
      width,
      height,
      assetsUsed: formattedImages.length,
    });

    // ----------------------------------------------------
    // 4. Call Imagen 4 API
    // ----------------------------------------------------
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Imagen API Error:", text);
      return NextResponse.json(
        { success: false, error: text },
        { status: response.status }
      );
    }

    const data = JSON.parse(text);
    const base64String = data?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64String) {
      console.error("❌ No image data returned:", data);
      return NextResponse.json(
        { success: false, error: "No image data returned" },
        { status: 500 }
      );
    }

    const mimeType = data?.predictions?.[0]?.mimeType || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    // ----------------------------------------------------
    // 5. Success
    // ----------------------------------------------------
    return NextResponse.json({
      success: true,
      url: dataUrl,
      width,
      height,
      aspectRatioUsed: aspectRatio,
      assetsUsed: formattedImages.length,
    });
  } catch (err: any) {
    console.error("❌ /api/generate-image ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt)
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    if (!process.env.GEMINI_API_KEY)
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    // FIX: Use the FULL model ID with the suffix
    const modelName = "imagen-4.0-generate-001";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      instances: [{ prompt: prompt }],
      parameters: {
        sampleCount: 1,
        // Imagen 4 Fast supports these specific ratios
        aspectRatio: "1:1",
      },
    };

    console.log(`🎨 Requesting Image from Google (${modelName})...`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Image API Error:", errorText);
      return NextResponse.json(
        { success: false, error: `API Error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract Base64 (Imagen 4 returns standard format)
    const base64String = data.predictions?.[0]?.bytesBase64Encoded;
    const mimeType = data.predictions?.[0]?.mimeType || "image/png";

    if (!base64String)
      throw new Error("No image data returned from Google API");

    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error: any) {
    console.error("Image Gen Failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

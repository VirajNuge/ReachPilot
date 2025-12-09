import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API Key found in .env.local" },
        { status: 500 }
      );
    }

    // Direct REST call to Gemini API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: "GET" }
    );

    const data = await response.json();

    // Filter to show only "generateContent" models (the ones we need)
    const availableModels = data.models
      ?.filter((m: any) =>
        m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => m.name);

    return NextResponse.json({
      success: true,
      my_available_models: availableModels || "No models found",
      full_response: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

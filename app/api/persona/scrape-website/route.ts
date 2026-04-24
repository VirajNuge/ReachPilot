import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scrapeProfile } from "@/lib/scrapeService";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please include https://" },
        { status: 400 }
      );
    }

    const cleanUrl = parsedUrl.toString();

    // 1. Scrape the website using existing puppeteer service
    const rawText = await scrapeProfile(cleanUrl);

    if (rawText.startsWith("ERROR:") || rawText.length < 100) {
      return NextResponse.json(
        {
          error:
            "Could not retrieve content from this website. Try a different URL or enter details manually.",
        },
        { status: 422 }
      );
    }

    // 2. Use Gemini to extract brand summary from raw text
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If no Gemini key, return truncated raw text as fallback
      return NextResponse.json({
        summary: rawText.substring(0, 800),
        message: "Website content extracted (AI summary unavailable).",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are a brand analyst. Extract a concise brand summary from this website content.

WEBSITE CONTENT:
${rawText.substring(0, 15000)}

Extract and summarize:
1. What the brand/company does (core offering in 1-2 sentences)
2. Who they serve (target audience)
3. Their value proposition or tagline if present
4. Industry/niche
5. Any notable brand tone (formal, casual, expert, etc.)

Keep the summary under 300 words. Return only the summary text, no headers or JSON.
    `.trim();

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return NextResponse.json({
      summary,
      message: "Brand details extracted from your website!",
    });
  } catch (error) {
    console.error("[/api/persona/scrape-website] Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process the website. It may be blocking automated access. Please enter your brand details manually.",
      },
      { status: 500 }
    );
  }
}

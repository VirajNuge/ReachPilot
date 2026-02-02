import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const { question } = await req.json();

    // Initialize AI after API key check
    const genAI = new GoogleGenerativeAI(apiKey);
    // Select the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // The "Prompt" tells the AI exactly how to behave
    const prompt = `
      You are an expert helper. Write a response to this question: "${question.title}"
      Use the PAS (Problem, Agitate, Solution) framework.
      Keep it short, friendly, and include 2 emojis.
      Context: ${question.snippet}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ draft: text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "AI Generation failed" },
      { status: 500 },
    );
  }
}

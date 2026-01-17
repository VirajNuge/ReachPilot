import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI with the secret key from your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    // Select the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
      { status: 500 }
    );
  }
}

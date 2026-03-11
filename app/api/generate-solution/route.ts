import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const { question, accountId } = await req.json();

    // Try to load persona context for this user+account
    let personaContext = "";
    try {
      const auth = await getAuthFromCookies();
      if (auth?.userId) {
        const persona = await getPersonaByUserAndAccount(auth.userId, accountId);
        if (persona) {
          personaContext = buildContentGenerationContext(persona);
        }
      }
    } catch {
      // Fail silently — persona is optional context
    }

    // Initialize AI after API key check
    const genAI = new GoogleGenerativeAI(apiKey);
    // Select the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // The "Prompt" tells the AI exactly how to behave
    const basePrompt = `
      You are an expert helper. Write a response to this question: "${question.title}"
      Use the PAS (Problem, Agitate, Solution) framework.
      Keep it short, friendly, and include 2 emojis.
      Context: ${question.snippet}
    `;

    const prompt = personaContext
      ? `${personaContext}\n\n---\n\nNow respond to the following:\n${basePrompt}`
      : basePrompt;

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

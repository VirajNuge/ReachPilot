import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { buildRemixPrompt } from "@/lib/postGenerationPrompts";
import type { RemixStyle } from "@/lib/types/postGeneration";

async function loadPersonaContext(accountId?: string): Promise<string> {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) return "";
    const persona = await getPersonaByUserAndAccount(auth.userId, accountId);
    if (!persona) return "";
    return buildContentGenerationContext(persona);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      caption?: string;
      platform?: string;
      remixStyle?: RemixStyle;
      accountId?: string;
    };

    if (!body.caption || !body.platform || !body.remixStyle) {
      return NextResponse.json(
        { error: "caption, platform, and remixStyle are required" },
        { status: 400 },
      );
    }

    const personaContext = await loadPersonaContext(body.accountId);
    const prompt = buildRemixPrompt(
      body.caption,
      body.platform,
      body.remixStyle,
      personaContext,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const result = await model.generateContent(prompt);
      const remixedCaption = result.response.text().trim();
      return NextResponse.json({ remixedCaption });
    } catch (error) {
      console.error("Remix AI generation error:", error);
      return NextResponse.json(
        { error: "AI Generation failed" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Remix route error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

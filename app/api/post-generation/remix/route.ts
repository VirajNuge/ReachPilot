import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import { buildContentGenerationContext } from "@/lib/personaPromptBuilder";
import { buildRemixPrompt } from "@/lib/postGenerationPrompts";
import { AI_MODELS } from "@/lib/aiConfig";
import type { RemixStyle } from "@/lib/types/postGeneration";

async function loadPersonaContext(userId: string, accountId?: string): Promise<string> {
  try {
    const persona = await getPersonaByUserAndAccount(userId, accountId);
    if (!persona) return "";
    return buildContentGenerationContext(persona);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

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

    const personaContext = await loadPersonaContext(userId, body.accountId);
    const prompt = buildRemixPrompt(
      body.caption,
      body.platform,
      body.remixStyle,
      personaContext,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.TEXT });

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

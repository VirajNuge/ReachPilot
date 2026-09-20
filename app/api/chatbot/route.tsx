import { OpenRouterClient } from "@/lib/ai/openrouter";
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

const SYSTEM_PROMPT = `You are ReachPilot Assistant, a friendly and helpful AI assistant for the ReachPilot social media optimization platform.

Your capabilities include helping users with:
- Profile analysis and optimization tips
- Content creation suggestions
- Best posting times and scheduling advice
- Keyword and hashtag recommendations
- Understanding their analytics and engagement metrics
- Navigating the ReachPilot app features

Guidelines:
- Be concise but helpful (2-3 sentences max for simple questions)
- Use emojis sparingly to keep responses friendly 🚀
- If asked about specific data, remind users to use the Profile Analyzer feature
- Always maintain a positive, encouraging tone
- For technical issues, suggest refreshing the page or checking the connection

App Features you should know about:
1. Solo Analysis - Analyze a single social media profile
2. Compare Mode - Compare two profiles side by side
3. Content & Engagement Charts - Visual metrics
4. Best Time to Post - Heatmap showing optimal posting times
5. Quick Fixes - Actionable improvement suggestions
6. Keywords Analysis - Current and missing keyword opportunities
7. Bio Analysis - Headline and bio optimization

If users ask about something outside your scope, politely redirect them to the app features or suggest contacting support.`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const genAI = new OpenRouterClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: "openrouter/free",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert history to Gemini format
    const chatHistory: ChatMessage[] = history.map(
      (msg: { sender: string; text: string }) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }),
    );

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error("[Chatbot API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        response:
          "I'm having trouble connecting right now. Please try again in a moment! 🔄",
      },
      { status: 500 },
    );
  }
}

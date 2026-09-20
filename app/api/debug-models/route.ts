import { NextResponse } from "next/server";
import { AI_MODELS } from "@/lib/aiConfig";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    models: {
      text: AI_MODELS.TEXT,
      vision: AI_MODELS.VISION,
      image: AI_MODELS.IMAGE_DEFAULT,
    },
  });
}

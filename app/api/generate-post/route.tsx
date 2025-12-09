import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSinglePostPrompt } from "../../../lib/singlePostPrompt";
import { buildCarouselPostPrompt } from "../../../lib/carouselPostPrompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const data = await req.json(); // This contains the Base64 images now

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API Key missing" },
        { status: 500 }
      );
    }

    // 1. Build the Text Prompt
    // We pass 'data' because it matches the shape of GeneratorFormState
    let promptText = "";
    if (data.postType === "SINGLE") {
      promptText = buildSinglePostPrompt(data);
    } else {
      promptText = buildCarouselPostPrompt(data); // Assuming you have this
    }

    // 2. Construct the Multimodal Parts
    // Start with the text prompt
    const promptParts: any[] = [{ text: promptText }];

    // If there are images, add them to the prompt parts
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((img: any) => {
        if (img.base64) {
          // Remove the "data:image/png;base64," prefix if present
          const base64Data = img.base64.split(",")[1];

          promptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: img.mimeType || "image/png",
            },
          });
        }
      });

      // If images are present, add a text instruction to look at them
      if (data.images.length > 0) {
        promptParts.push({
          text: "\n\nCRITICAL: I have attached reference images. Use their visual style, colors, and composition as the primary inspiration for the 'visual_description' JSON field.",
        });
      }
    }

    // 3. Call Gemini (Multimodal)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // 2.0 Flash handles images perfectly
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();

    // 4. Clean and Parse
    const cleanJsonString = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: jsonData });
  } catch (error: any) {
    console.error("Generate Post Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

// CORS headers for extension requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate basic structure
    if (!data.posts || !Array.isArray(data.posts) || data.posts.length === 0) {
      return NextResponse.json(
        { error: "Invalid data: non-empty 'posts' array required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const platform = data.posts[0]?.platform || "unknown";
    const postCount = data.posts.length;

    console.log(
      `[analyze-extension] Received ${postCount} posts from platform: ${platform}`,
    );

    // TODO (Phase 2): Send to Gemini for deep analysis
    // For now, return a success acknowledgment with basic stats
    const totalLikes = data.posts.reduce(
      (sum: number, p: any) => sum + (p.metrics?.likes || 0),
      0,
    );
    const totalComments = data.posts.reduce(
      (sum: number, p: any) => sum + (p.comments?.length || 0),
      0,
    );
    const totalViews = data.posts.reduce(
      (sum: number, p: any) => sum + (p.metrics?.views || 0),
      0,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Data received successfully",
        summary: {
          platform,
          postCount,
          totalLikes,
          totalComments,
          totalViews,
          author: data.posts[0]?.author || "Unknown",
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[analyze-extension] Error:", error);
    return NextResponse.json(
      { error: "Failed to process extension data" },
      { status: 500, headers: corsHeaders },
    );
  }
}

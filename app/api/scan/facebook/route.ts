import { NextRequest, NextResponse } from "next/server";
import {
  extractUsername,
  hasCredentials,
  type MetaProfile,
  type ScanResult,
} from "../types";

// Facebook Profile Scanner
// POST /api/scan/facebook { url: string }

const GRAPH_API_BASE = "https://graph.facebook.com/v18.0";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, platform: "facebook", error: "URL is required" },
        { status: 400 },
      );
    }

    const username = extractUsername(url, "facebook");
    if (!username) {
      return NextResponse.json(
        { success: false, platform: "facebook", error: "Invalid Facebook URL" },
        { status: 400 },
      );
    }

    // Check for access token in cookie
    const accessToken = request.cookies.get("meta_token")?.value;

    if (!accessToken) {
      // No token - need to authenticate
      if (!hasCredentials("facebook")) {
        return NextResponse.json({
          success: false,
          platform: "facebook",
          error: "Meta API credentials not configured. See setup instructions.",
          requiresAuth: true,
          setup: {
            step1: "Go to https://developers.facebook.com/apps",
            step2: "Create a new app (Consumer type)",
            step3: "Add Facebook Login product",
            step4: "In Settings > Basic, copy App ID and App Secret",
            step5: "Add to .env.local: META_APP_ID=xxx and META_APP_SECRET=xxx",
            step6:
              "Add Valid OAuth Redirect URI: http://localhost:3000/api/auth/meta/callback",
          },
        } as ScanResult);
      }

      return NextResponse.json({
        success: false,
        platform: "facebook",
        error: "Authentication required",
        requiresAuth: true,
        authUrl: `/api/auth/meta?platform=facebook&profileUrl=${encodeURIComponent(url)}`,
      } as ScanResult);
    }

    // Fetch page/profile data using Graph API
    try {
      // First, try to get the page by username
      const pageResponse = await fetch(
        `${GRAPH_API_BASE}/${username}?fields=id,name,about,followers_count,fan_count,picture.type(large),website,category,location,verification_status&access_token=${accessToken}`,
      );

      if (!pageResponse.ok) {
        let errorData: any = {};
        try {
          errorData = await pageResponse.json();
        } catch {
          // If response is not JSON, use default error message
          errorData = { error: { code: 0 } };
        }

        // Token expired or invalid
        if (errorData.error?.code === 190) {
          const response = NextResponse.json({
            success: false,
            platform: "facebook",
            error: "Session expired. Please reconnect.",
            requiresAuth: true,
            authUrl: `/api/auth/meta?platform=facebook&profileUrl=${encodeURIComponent(url)}`,
          } as ScanResult);

          // Clear expired token
          response.cookies.delete("meta_token");
          return response;
        }

        throw new Error(
          errorData.error?.message || "Failed to fetch page data",
        );
      }

      const pageData = await pageResponse.json();

      // Get page insights (if available - requires page access token)
      let insights = null;
      try {
        const insightsResponse = await fetch(
          `${GRAPH_API_BASE}/${pageData.id}/insights?metric=page_engaged_users,page_post_engagements,page_impressions&period=day&access_token=${accessToken}`,
        );
        if (insightsResponse.ok) {
          insights = await insightsResponse.json();
        }
      } catch {
        // Insights may not be available for all pages
      }

      const profile: MetaProfile = {
        platform: "facebook",
        name: pageData.name || username,
        username: username,
        bio: pageData.about || "",
        followers: (
          pageData.followers_count ||
          pageData.fan_count ||
          0
        ).toLocaleString(),
        following: "N/A",
        verified: pageData.verification_status === "verified",
        profileImage: pageData.picture?.data?.url,
        website: pageData.website,
        location: pageData.location?.city,
        pageId: pageData.id,
        pageLikes: pageData.fan_count,
        pageFollowers: pageData.followers_count,
        businessAccount: !!pageData.category,
        raw: { pageData, insights },
      };

      return NextResponse.json({
        success: true,
        platform: "facebook",
        data: profile,
      } as ScanResult);
    } catch (apiError) {
      console.error("Facebook API error:", apiError);
      return NextResponse.json({
        success: false,
        platform: "facebook",
        error:
          apiError instanceof Error
            ? apiError.message
            : "Failed to fetch Facebook data",
      } as ScanResult);
    }
  } catch (error) {
    console.error("Facebook scanner error:", error);
    return NextResponse.json(
      {
        success: false,
        platform: "facebook",
        error: error instanceof Error ? error.message : "Internal server error",
      } as ScanResult,
      { status: 500 },
    );
  }
}

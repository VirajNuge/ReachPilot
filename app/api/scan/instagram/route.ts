import { NextRequest, NextResponse } from "next/server";
import {
  extractUsername,
  hasCredentials,
  type MetaProfile,
  type ScanResult,
} from "../types";

// Instagram Profile Scanner
// POST /api/scan/instagram { url: string }

const GRAPH_API_BASE = "https://graph.facebook.com/v18.0";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, platform: "instagram", error: "URL is required" },
        { status: 400 },
      );
    }

    const username = extractUsername(url, "instagram");
    if (!username) {
      return NextResponse.json(
        {
          success: false,
          platform: "instagram",
          error: "Invalid Instagram URL",
        },
        { status: 400 },
      );
    }

    // Check for access token in cookie
    const accessToken = request.cookies.get("meta_token")?.value;

    if (!accessToken) {
      // No token - need to authenticate
      if (!hasCredentials("instagram")) {
        return NextResponse.json({
          success: false,
          platform: "instagram",
          error: "Meta API credentials not configured. See setup instructions.",
          requiresAuth: true,
          setup: {
            step1: "Go to https://developers.facebook.com/apps",
            step2: "Create a new app (Consumer type)",
            step3: "Add Instagram Basic Display product",
            step4: "In Settings > Basic, copy App ID and App Secret",
            step5: "Add to .env.local: META_APP_ID=xxx and META_APP_SECRET=xxx",
            step6:
              "Add Valid OAuth Redirect URI: http://localhost:3000/api/auth/meta/callback",
            note: "Instagram API requires a Business or Creator account connected to a Facebook Page",
          },
        } as ScanResult);
      }

      return NextResponse.json({
        success: false,
        platform: "instagram",
        error: "Authentication required",
        requiresAuth: true,
        authUrl: `/api/auth/meta?platform=instagram&profileUrl=${encodeURIComponent(url)}`,
      } as ScanResult);
    }

    try {
      // Get user's Instagram Business Account(s) via Facebook Pages
      // First, get the user's pages
      const pagesResponse = await fetch(
        `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`,
      );

      if (!pagesResponse.ok) {
        let errorData: any = {};
        try {
          errorData = await pagesResponse.json();
        } catch {
          // If response is not JSON, use default error message
          errorData = { error: { code: 0 } };
        }

        if (errorData.error?.code === 190) {
          const response = NextResponse.json({
            success: false,
            platform: "instagram",
            error: "Session expired. Please reconnect.",
            requiresAuth: true,
            authUrl: `/api/auth/meta?platform=instagram&profileUrl=${encodeURIComponent(url)}`,
          } as ScanResult);
          response.cookies.delete("meta_token");
          return response;
        }

        throw new Error(errorData.error?.message || "Failed to fetch pages");
      }

      const pagesData = await pagesResponse.json();
      const pages = pagesData.data || [];

      if (pages.length === 0) {
        return NextResponse.json({
          success: false,
          platform: "instagram",
          error:
            "No Facebook Pages found. Instagram Business accounts must be connected to a Facebook Page.",
        } as ScanResult);
      }

      // For each page, try to get the Instagram Business Account
      let instagramAccount = null;
      let pageAccessToken = null;

      for (const page of pages) {
        const igResponse = await fetch(
          `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account{id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website}&access_token=${page.access_token}`,
        );

        if (igResponse.ok) {
          const igData = await igResponse.json();
          if (igData.instagram_business_account) {
            // Check if this matches the requested username
            if (
              igData.instagram_business_account.username?.toLowerCase() ===
              username.toLowerCase()
            ) {
              instagramAccount = igData.instagram_business_account;
              pageAccessToken = page.access_token;
              break;
            }
          }
        }
      }

      if (!instagramAccount) {
        return NextResponse.json({
          success: false,
          platform: "instagram",
          error: `Instagram account @${username} not found or not connected as a Business account to your Facebook Pages.`,
        } as ScanResult);
      }

      // Get additional insights if available
      let insights = null;
      if (pageAccessToken) {
        try {
          const insightsResponse = await fetch(
            `${GRAPH_API_BASE}/${instagramAccount.id}/insights?metric=impressions,reach,profile_views&period=day&access_token=${pageAccessToken}`,
          );
          if (insightsResponse.ok) {
            insights = await insightsResponse.json();
          }
        } catch {
          // Insights may not be available
        }
      }

      const profile: MetaProfile = {
        platform: "instagram",
        name: instagramAccount.name || username,
        username: instagramAccount.username,
        bio: instagramAccount.biography || "",
        followers: (instagramAccount.followers_count || 0).toLocaleString(),
        following: (instagramAccount.follows_count || 0).toLocaleString(),
        posts: (instagramAccount.media_count || 0).toLocaleString(),
        verified: false, // Would need additional API call
        profileImage: instagramAccount.profile_picture_url,
        website: instagramAccount.website,
        businessAccount: true,
        postsCount: instagramAccount.media_count,
        pageFollowers: instagramAccount.followers_count,
        raw: { instagramAccount, insights },
      };

      return NextResponse.json({
        success: true,
        platform: "instagram",
        data: profile,
      } as ScanResult);
    } catch (apiError) {
      console.error("Instagram API error:", apiError);
      return NextResponse.json({
        success: false,
        platform: "instagram",
        error:
          apiError instanceof Error
            ? apiError.message
            : "Failed to fetch Instagram data",
      } as ScanResult);
    }
  } catch (error) {
    console.error("Instagram scanner error:", error);
    return NextResponse.json(
      {
        success: false,
        platform: "instagram",
        error: error instanceof Error ? error.message : "Internal server error",
      } as ScanResult,
      { status: 500 },
    );
  }
}

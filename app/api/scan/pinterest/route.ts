import { NextRequest, NextResponse } from "next/server";
import {
  extractUsername,
  hasCredentials,
  type PinterestProfile,
  type ScanResult,
} from "../types";

// Pinterest Profile Scanner
// POST /api/scan/pinterest { url: string }

const PINTEREST_API_BASE = "https://api.pinterest.com/v5";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, platform: "pinterest", error: "URL is required" },
        { status: 400 },
      );
    }

    const username = extractUsername(url, "pinterest");
    if (!username) {
      return NextResponse.json(
        {
          success: false,
          platform: "pinterest",
          error: "Invalid Pinterest URL",
        },
        { status: 400 },
      );
    }

    // Check for access token in cookie
    const accessToken = request.cookies.get("pinterest_access_token")?.value;

    if (!accessToken) {
      if (!hasCredentials("pinterest")) {
        return NextResponse.json({
          success: false,
          platform: "pinterest",
          error:
            "Pinterest API credentials not configured. See setup instructions.",
          requiresAuth: true,
          setup: {
            step1: "Go to https://developers.pinterest.com/apps/",
            step2: "Create a new app",
            step3: "In Settings, copy App ID and App Secret",
            step4:
              "Add to .env.local: PINTEREST_APP_ID=xxx and PINTEREST_APP_SECRET=xxx",
            step5:
              "Add redirect URI: http://localhost:3000/api/auth/pinterest/callback",
            step6: "Submit app for review to access production data",
          },
        } as ScanResult);
      }

      return NextResponse.json({
        success: false,
        platform: "pinterest",
        error: "Authentication required",
        requiresAuth: true,
        authUrl: `/api/auth/pinterest?profileUrl=${encodeURIComponent(url)}`,
      } as ScanResult);
    }

    try {
      // Get authenticated user's account info
      // Note: Pinterest API v5 primarily supports accessing the authenticated user's own data
      const userResponse = await fetch(`${PINTEREST_API_BASE}/user_account`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        let errorData: any = {};
        try {
          errorData = await userResponse.json();
        } catch {
          // If response is not JSON, use default error message
          errorData = { message: "Failed to fetch user data" };
        }

        if (userResponse.status === 401) {
          // Try refresh token
          const refreshToken = request.cookies.get(
            "pinterest_refresh_token",
          )?.value;
          if (refreshToken) {
            // TODO: Implement token refresh
          }

          const response = NextResponse.json({
            success: false,
            platform: "pinterest",
            error: "Session expired. Please reconnect.",
            requiresAuth: true,
            authUrl: `/api/auth/pinterest?profileUrl=${encodeURIComponent(url)}`,
          } as ScanResult);
          response.cookies.delete("pinterest_access_token");
          response.cookies.delete("pinterest_refresh_token");
          return response;
        }

        throw new Error(errorData.message || "Failed to fetch user data");
      }

      const userData = await userResponse.json();

      // Verify this is the requested user (Pinterest API only returns authenticated user)
      if (userData.username?.toLowerCase() !== username.toLowerCase()) {
        return NextResponse.json({
          success: false,
          platform: "pinterest",
          error: `Cannot access @${username}'s data. Pinterest API only allows accessing your own profile. Please log in as @${username}.`,
        } as ScanResult);
      }

      // Get boards count
      let boardCount = 0;
      try {
        const boardsResponse = await fetch(`${PINTEREST_API_BASE}/boards`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (boardsResponse.ok) {
          const boardsData = await boardsResponse.json();
          boardCount = boardsData.items?.length || 0;
        }
      } catch {
        // Boards fetch failed, continue without it
      }

      // Get pins count
      let pinCount = 0;
      try {
        const pinsResponse = await fetch(`${PINTEREST_API_BASE}/pins`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (pinsResponse.ok) {
          const pinsData = await pinsResponse.json();
          pinCount = pinsData.items?.length || 0;
        }
      } catch {
        // Pins fetch failed, continue without it
      }

      const profile: PinterestProfile = {
        platform: "pinterest",
        name: userData.business_name || userData.username,
        username: userData.username,
        bio: userData.about || "",
        followers: (userData.follower_count || 0).toLocaleString(),
        following: (userData.following_count || 0).toLocaleString(),
        profileImage: userData.profile_image,
        website: userData.website_url,
        boardCount,
        pinCount,
        monthlyViews: userData.monthly_views,
        raw: userData,
      };

      return NextResponse.json({
        success: true,
        platform: "pinterest",
        data: profile,
      } as ScanResult);
    } catch (apiError) {
      console.error("Pinterest API error:", apiError);
      return NextResponse.json({
        success: false,
        platform: "pinterest",
        error:
          apiError instanceof Error
            ? apiError.message
            : "Failed to fetch Pinterest data",
      } as ScanResult);
    }
  } catch (error) {
    console.error("Pinterest scanner error:", error);
    return NextResponse.json(
      {
        success: false,
        platform: "pinterest",
        error: error instanceof Error ? error.message : "Internal server error",
      } as ScanResult,
      { status: 500 },
    );
  }
}

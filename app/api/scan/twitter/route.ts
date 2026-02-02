import { NextRequest, NextResponse } from "next/server";
import {
  extractUsername,
  hasCredentials,
  type TwitterProfile,
  type ScanResult,
} from "../types";

// X (Twitter) Profile Scanner
// POST /api/scan/twitter { url: string }

const X_API_BASE = "https://api.twitter.com/2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, platform: "twitter", error: "URL is required" },
        { status: 400 },
      );
    }

    const username = extractUsername(url, "twitter");
    if (!username) {
      return NextResponse.json(
        { success: false, platform: "twitter", error: "Invalid X/Twitter URL" },
        { status: 400 },
      );
    }

    // Check for access token in cookie
    const accessToken = request.cookies.get("x_access_token")?.value;

    if (!accessToken) {
      if (!hasCredentials("twitter")) {
        return NextResponse.json({
          success: false,
          platform: "twitter",
          error: "X API credentials not configured. See setup instructions.",
          requiresAuth: true,
          setup: {
            step1: "Go to https://developer.twitter.com/en/portal/dashboard",
            step2: "Create a project and app (Free tier available)",
            step3: "Go to Settings > User authentication settings",
            step4: "Enable OAuth 2.0 with 'Read' permissions",
            step5: "Set Type: Web App, Confidential Client",
            step6:
              "Add callback URL: http://localhost:3000/api/auth/x/callback",
            step7: "Copy Client ID and Client Secret to .env.local",
          },
        } as ScanResult);
      }

      return NextResponse.json({
        success: false,
        platform: "twitter",
        error: "Authentication required",
        requiresAuth: true,
        authUrl: `/api/auth/x?profileUrl=${encodeURIComponent(url)}`,
      } as ScanResult);
    }

    try {
      // Fetch user by username
      const userFields = [
        "id",
        "name",
        "username",
        "description",
        "profile_image_url",
        "public_metrics",
        "verified",
        "verified_type",
        "location",
        "url",
        "created_at",
        "pinned_tweet_id",
      ].join(",");

      const userResponse = await fetch(
        `${X_API_BASE}/users/by/username/${username}?user.fields=${userFields}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!userResponse.ok) {
        let errorData: any = {};
        try {
          errorData = await userResponse.json();
        } catch {
          // If response is not JSON, use default error message
          errorData = { detail: "Failed to fetch user data", title: "Error" };
        }

        // Token expired
        if (userResponse.status === 401) {
          // Try to refresh token
          const refreshToken = request.cookies.get("x_refresh_token")?.value;
          if (refreshToken) {
            // TODO: Implement token refresh
          }

          const response = NextResponse.json({
            success: false,
            platform: "twitter",
            error: "Session expired. Please reconnect.",
            requiresAuth: true,
            authUrl: `/api/auth/x?profileUrl=${encodeURIComponent(url)}`,
          } as ScanResult);
          response.cookies.delete("x_access_token");
          response.cookies.delete("x_refresh_token");
          return response;
        }

        throw new Error(
          errorData.detail || errorData.title || "Failed to fetch user data",
        );
      }

      const userData = await userResponse.json();
      const user = userData.data;

      if (!user) {
        return NextResponse.json({
          success: false,
          platform: "twitter",
          error: `User @${username} not found`,
        } as ScanResult);
      }

      const metrics = user.public_metrics || {};

      const profile: TwitterProfile = {
        platform: "twitter",
        name: user.name,
        username: user.username,
        bio: user.description || "",
        followers: (metrics.followers_count || 0).toLocaleString(),
        following: (metrics.following_count || 0).toLocaleString(),
        posts: (metrics.tweet_count || 0).toLocaleString(),
        verified: user.verified || user.verified_type === "blue",
        profileImage: user.profile_image_url?.replace("_normal", "_400x400"),
        website: user.url,
        location: user.location,
        userId: user.id,
        tweetCount: metrics.tweet_count,
        listedCount: metrics.listed_count,
        createdAt: user.created_at,
        pinnedTweetId: user.pinned_tweet_id,
        raw: userData,
      };

      return NextResponse.json({
        success: true,
        platform: "twitter",
        data: profile,
      } as ScanResult);
    } catch (apiError) {
      console.error("X API error:", apiError);
      return NextResponse.json({
        success: false,
        platform: "twitter",
        error:
          apiError instanceof Error
            ? apiError.message
            : "Failed to fetch X data",
      } as ScanResult);
    }
  } catch (error) {
    console.error("X scanner error:", error);
    return NextResponse.json(
      {
        success: false,
        platform: "twitter",
        error: error instanceof Error ? error.message : "Internal server error",
      } as ScanResult,
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// Common scanner types
export interface ScannedProfile {
  platform: string;
  name: string;
  username?: string;
  headline?: string;
  bio?: string;
  followers: string;
  following?: string;
  posts?: string;
  engagement?: string;
  location?: string;
  verified?: boolean;
  profileImage?: string;
  website?: string;
  raw?: Record<string, unknown>;
}

export interface ScanResult {
  success: boolean;
  platform: string;
  data?: ScannedProfile;
  error?: string;
  requiresAuth?: boolean;
  authUrl?: string;
}

// OAuth Token Types
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

// Platform-specific profile types
export interface MetaProfile extends ScannedProfile {
  pageId?: string;
  pageLikes?: number;
  pageFollowers?: number;
  postsCount?: number;
  avgEngagement?: number;
  businessAccount?: boolean;
}

export interface TwitterProfile extends ScannedProfile {
  userId?: string;
  tweetCount?: number;
  listedCount?: number;
  createdAt?: string;
  pinnedTweetId?: string;
}

export interface PinterestProfile extends ScannedProfile {
  boardCount?: number;
  pinCount?: number;
  monthlyViews?: number;
}

// Validation patterns for each platform
export const PLATFORM_PATTERNS = {
  linkedin: /linkedin\.com\/(in|company)\/[\w-]+/i,
  facebook: /facebook\.com\/[\w.-]+/i,
  twitter: /(twitter|x)\.com\/[\w]+/i,
  instagram: /instagram\.com\/[\w._]+/i,
  pinterest: /pinterest\.com\/[\w]+/i,
};

export function validateUrl(
  url: string,
  platform: keyof typeof PLATFORM_PATTERNS,
): boolean {
  return PLATFORM_PATTERNS[platform].test(url);
}

// Extract username from URL
export function extractUsername(url: string, platform: string): string | null {
  const patterns: Record<string, RegExp> = {
    linkedin: /linkedin\.com\/(?:in|company)\/([\w-]+)/i,
    facebook: /facebook\.com\/([\w.-]+)/i,
    twitter: /(?:twitter|x)\.com\/([\w]+)/i,
    instagram: /instagram\.com\/([\w._]+)/i,
    pinterest: /pinterest\.com\/([\w]+)/i,
  };

  const match = url.match(patterns[platform]);
  return match ? match[1] : null;
}

// Check if credentials are configured
export function hasCredentials(platform: string): boolean {
  switch (platform) {
    case "facebook":
    case "instagram":
      return !!(process.env.META_APP_ID && process.env.META_APP_SECRET);
    case "twitter":
      return !!(
        (process.env.X_CLIENT_ID || process.env.X_CONSUMER_KEY) &&
        (process.env.X_CLIENT_SECRET || process.env.X_CONSUMER_SECRET)
      );
    case "pinterest":
      return !!(
        process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET
      );
    default:
      return false;
  }
}

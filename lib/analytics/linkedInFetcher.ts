/**
 * LinkedIn Data Fetcher
 * 
 * Fetches posts and metrics from LinkedIn using the Stats API and Posts API
 * Documentation: https://learn.microsoft.com/en-us/linkedin/share/integrations/analytics-api
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import { upsertConnection } from "@/lib/models/connection";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";
import { linkedinFetch } from "@/lib/utils/linkedinFetch";

export class LinkedInFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://api.linkedin.com/v2";

  constructor(connection: ConnectionDocument) {
    super(connection, "linkedin");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    let userInfoStatus: number | null = null;
    try {
      const response = await linkedinFetch(`${this.API_BASE}/userinfo`, {
        headers: {
          Authorization: `Bearer ${this.connection.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      userInfoStatus = response.status;
      if (response.ok) {
        if (!this.connection.platformUserId || !this.connection.platformUsername) {
          const userInfo = await response.json().catch(() => ({}));
          const platformUserId =
            (typeof userInfo.sub === "string" ? userInfo.sub : "") ||
            (typeof userInfo.id === "string" ? userInfo.id : "");
          const platformUsername =
            (typeof userInfo.name === "string" ? userInfo.name : "") ||
            (typeof userInfo.given_name === "string" ? userInfo.given_name : "");

          if (platformUserId || platformUsername) {
            await upsertConnection(this.userId, this.accountId, "linkedin", {
              accessToken: this.connection.accessToken,
              refreshToken: this.connection.refreshToken,
              tokenExpiresAt: this.connection.tokenExpiresAt,
              platformUserId: platformUserId || this.connection.platformUserId,
              platformUsername: platformUsername || this.connection.platformUsername,
              scope: this.connection.scope,
            });
            this.connection.platformUserId = platformUserId || this.connection.platformUserId;
            this.connection.platformUsername = platformUsername || this.connection.platformUsername;
          }
        }
        return true;
      }
    } catch {
      // Network failure for /userinfo; continue with /me fallback.
    }

    try {
      // Fallback for apps still using older LinkedIn member scopes.
      const legacyProfileResponse = await linkedinFetch(`${this.API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${this.connection.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (legacyProfileResponse.ok) return true;

      // If unauthorized and we have a refresh token, attempt refresh
      if ((userInfoStatus === 401 || legacyProfileResponse.status === 401) && this.connection.refreshToken) {
        try {
          await this.refreshToken();
          return true;
        } catch (err) {
          console.warn("[LinkedIn] Token refresh failed:", err);
          return false;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<void> {
    if (!this.connection.refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("LinkedIn client credentials not configured");
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.connection.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const resp = await linkedinFetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    let data: any = {};
    try {
      data = await resp.json();
    } catch (parseErr) {
      const text = await resp.text().catch(() => "<unreadable>");
      console.error("[LinkedIn] Token refresh response parse error:", parseErr, "response:", text);
      throw new Error("Failed to parse LinkedIn token response");
    }

    if (!resp.ok || data.error) {
      const text = JSON.stringify(data) || (await resp.text().catch(() => "<unreadable>"));
      console.error("[LinkedIn] Token refresh failed:", resp.status, resp.statusText, text);
      throw new Error(data.error_description || data.error || "Failed to refresh LinkedIn token");
    }

    const tokenExpiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined;

    // Persist updated tokens to DB
    await upsertConnection(this.userId, this.accountId, "linkedin", {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.connection.refreshToken,
      tokenExpiresAt,
      platformUserId: this.connection.platformUserId,
      platformUsername: this.connection.platformUsername,
    });

    // Update in-memory values
    this.connection.accessToken = data.access_token;
    if (data.refresh_token) this.connection.refreshToken = data.refresh_token;
    this.connection.tokenExpiresAt = tokenExpiresAt;
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.platformUserId || !this.connection.accessToken) {
      throw new Error("LinkedIn user profile is incomplete");
    }

    try {
      const authorUrn = `urn:li:person:${this.connection.platformUserId}`;
      const query = new URLSearchParams({
        q: "authors",
        authors: `List(${authorUrn})`,
        count: String(Math.min(limit, 50)),
        sortBy: "LAST_MODIFIED",
      });

      const response = await linkedinFetch(
        `${this.API_BASE}/ugcPosts?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const message = `LinkedIn posts fetch failed (${response.status}): ${body || response.statusText}`;
        const accessDenied = response.status === 403 && body.includes("ACCESS_DENIED");
        if (!accessDenied) {
          throw new Error(message);
        }

        console.warn(
          "[LinkedIn] UGC post read not permitted for this token. Trying shares fallback.",
          message,
        );
        const fallbackPosts = await this.fetchSharesFallback(limit);
        return fallbackPosts;
      }

      const data = await response.json();
      const posts = data.elements || [];

      const parsed = await Promise.all(
        posts.map((post: any) => this.parseLinkedInPost(post))
      );

      return parsed.filter((post): post is RawPlatformPost => Boolean(post?.id));
    } catch (error) {
      console.error("[LinkedIn] Error fetching posts:", error);
      // Keep sync alive even when post-read scopes are missing.
      return [];
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.platformUserId || !this.connection.accessToken) {
      throw new Error("LinkedIn user profile is incomplete");
    }

    try {
      const authorUrn = `urn:li:person:${this.connection.platformUserId}`;
      const response = await linkedinFetch(
        `${this.API_BASE}/networkSizes/${encodeURIComponent(authorUrn)}?edgeType=MemberToFollower`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );
      const followerData = response.ok ? await response.json().catch(() => ({})) : {};
      const followers =
        typeof followerData?.firstDegreeSize === "number"
          ? followerData.firstDegreeSize
          : 0;

      const posts = await this.fetchPosts(20);
      const engagements = posts.reduce(
        (sum, post) => sum + post.metrics.likes + post.metrics.comments + post.metrics.shares,
        0
      );
      const impressions = posts.reduce(
        (sum, post) => sum + (post.metrics.views || 0),
        0
      );
      const topPost = posts
        .slice()
        .sort(
          (a, b) =>
            (b.metrics.likes + b.metrics.comments + b.metrics.shares) -
            (a.metrics.likes + a.metrics.comments + a.metrics.shares)
        )[0];

      return {
        date: date ?? new Date(),
        followers,
        posts: posts.length,
        impressions,
        engagements,
        clicks: posts.reduce((sum, post) => sum + (post.metrics.clicks || 0), 0),
        shares: posts.reduce((sum, post) => sum + post.metrics.shares, 0),
        topPostId: topPost?.id,
        topPostEngagement: topPost
          ? topPost.metrics.likes + topPost.metrics.comments + topPost.metrics.shares
          : 0,
      };
    } catch (error) {
      console.error("[LinkedIn] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "linkedin" as const,
      platformPostId: post.id,
      platformUsername: this.connection.platformUsername,
      caption: post.caption || post.text || "",
      mediaUrls: this.extractMediaUrls(post),
      format: this.determineFormat(post),
      postedAt: post.createdAt,
      metrics: {
        likes: post.metrics.likes,
        comments: post.metrics.comments,
        shares: post.metrics.shares,
        views: post.metrics.views,
        clicks: post.metrics.clicks || 0,
      },
      engagement: {
        engagementRate: this.calculateEngagementRate(
          post.metrics.likes +
            post.metrics.comments +
            post.metrics.shares,
          post.metrics.views
        ),
        commentRate: this.calculateRate(post.metrics.comments, post.metrics.views),
        shareRate: this.calculateRate(post.metrics.shares, post.metrics.views),
      },
      lastFetchedAt: new Date(),
    }));
  }

  normalizeMetrics(
    rawMetrics: RawPlatformMetrics
  ): Omit<SocialMediaMetricsDocument, "_id" | "createdAt" | "updatedAt"> | null {
    if (!rawMetrics) return null;

    return {
      userId: this.userId,
      accountId: this.accountId,
      platform: "linkedin" as const,
      date: rawMetrics.date,
      granularity: "daily",
      metrics: {
        followers: rawMetrics.followers,
        posts: rawMetrics.posts,
        totalImpressions: rawMetrics.impressions,
        totalEngagements: rawMetrics.engagements,
        totalClicks: rawMetrics.clicks,
        totalShares: rawMetrics.shares,
        averageEngagementRate: rawMetrics.engagements > 0 
          ? (rawMetrics.engagements / Math.max(rawMetrics.impressions, 1)) * 100
          : 0,
        averageCommentRate: 0, // LinkedIn doesn't provide this
        averageShareRate: rawMetrics.impressions > 0 
          ? (rawMetrics.shares / rawMetrics.impressions) * 100
          : 0,
      },
      growth: {
        followerGrowth: 0,
        followerGrowthRate: 0,
        impressionGrowth: 0,
        impressionGrowthRate: 0,
        engagementGrowth: 0,
        engagementGrowthRate: 0,
      },
      topPost: rawMetrics.topPostId
        ? {
            platformPostId: rawMetrics.topPostId,
            engagement: rawMetrics.topPostEngagement || 0,
            engagementRate: 0,
          }
        : undefined,
    };
  }

  // Helper methods

  private async parseLinkedInPost(post: any): Promise<RawPlatformPost | null> {
    const postUrn = this.toPostUrn(post?.id || post?.entityUrn);
    if (!postUrn) return null;
    const socialActions = await this.fetchSocialActions(postUrn);
    const shareContent = post?.specificContent?.["com.linkedin.ugc.ShareContent"];
    const media = this.parseLinkedInMedia(shareContent);

    const caption =
      shareContent?.shareCommentary?.text ||
      post?.commentary ||
      "";

    return {
      id: postUrn,
      caption,
      media,
      createdAt: new Date(post.created?.time || post.lastModified?.time || Date.now()),
      metrics: {
        likes: socialActions.likes,
        comments: socialActions.comments,
        shares: socialActions.shares,
        views: 0,
        clicks: 0,
      },
    };
  }

  private async fetchSharesFallback(limit: number): Promise<RawPlatformPost[]> {
    const ownerUrn = `urn:li:person:${this.connection.platformUserId}`;
    const query = new URLSearchParams({
      q: "owners",
      owners: ownerUrn,
      count: String(Math.min(limit, 50)),
    });

    const response = await linkedinFetch(`${this.API_BASE}/shares?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.connection.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `[LinkedIn] Shares fallback also unavailable (${response.status}): ${body || response.statusText}`,
      );
      return [];
    }

    const data = await response.json().catch(() => ({}));
    const shares = Array.isArray(data?.elements) ? data.elements : [];

    const parsed = await Promise.all(
      shares.map((share: any) => this.parseLinkedInShare(share)),
    );
    return parsed.filter((post): post is RawPlatformPost => Boolean(post?.id));
  }

  private async parseLinkedInShare(share: any): Promise<RawPlatformPost | null> {
    const shareUrn = this.toPostUrn(share?.id || share?.activity || share?.urn);
    if (!shareUrn) return null;

    const socialActions = await this.fetchSocialActions(shareUrn);
    const text =
      (typeof share?.text?.text === "string" ? share.text.text : "") ||
      (typeof share?.commentary === "string" ? share.commentary : "");

    return {
      id: shareUrn,
      caption: text,
      media: [],
      createdAt: new Date(share?.created?.time || share?.created?.timestamp || Date.now()),
      metrics: {
        likes: socialActions.likes,
        comments: socialActions.comments,
        shares: socialActions.shares,
        views: 0,
        clicks: 0,
      },
    };
  }

  private parseLinkedInMedia(
    shareContent: any
  ): Array<{ type: "image" | "video"; url: string }> {
    const media: Array<{ type: "image" | "video"; url: string }> = [];
    const rawMedia = Array.isArray(shareContent?.media) ? shareContent.media : [];

    for (const item of rawMedia) {
      const candidateUrl =
        item?.originalUrl ||
        item?.thumbnails?.[0]?.resolvedUrl ||
        item?.media?.originalUrl ||
        item?.media?.thumbnails?.[0]?.resolvedUrl;

      if (!candidateUrl || typeof candidateUrl !== "string") continue;
      const mediaType: "image" | "video" =
        item?.media?.mediaType?.includes("VIDEO") ||
        item?.status?.includes("VIDEO")
          ? "video"
          : "image";
      media.push({ type: mediaType, url: candidateUrl });
    }

    return media;
  }

  private toPostUrn(value: unknown): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    if (value.startsWith("urn:li:ugcPost:")) return value;
    if (value.startsWith("urn:li:share:")) return value;
    if (/^\d+$/.test(value)) return `urn:li:ugcPost:${value}`;
    return null;
  }

  private async fetchSocialActions(postUrn: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
  }> {
    try {
      const response = await linkedinFetch(
        `${this.API_BASE}/socialActions/${encodeURIComponent(postUrn)}`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        },
      );

      if (!response.ok) {
        return { likes: 0, comments: 0, shares: 0 };
      }

      const data = await response.json().catch(() => ({}));
      return {
        likes: data?.likesSummary?.totalLikes || 0,
        comments: data?.commentsSummary?.totalFirstLevelComments || 0,
        shares: data?.sharesSummary?.totalShares || 0,
      };
    } catch {
      return { likes: 0, comments: 0, shares: 0 };
    }
  }

  private calculateEngagementRate(
    engagements: number,
    impressions: number
  ): number {
    if (impressions === 0) return 0;
    return Math.min((engagements / impressions) * 100, 100);
  }

  private calculateRate(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.min((value / total) * 100, 100);
  }
}

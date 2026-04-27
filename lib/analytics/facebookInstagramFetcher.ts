/**
 * Facebook & Instagram Data Fetcher
 * 
 * Fetches posts and metrics from Facebook Pages and Instagram Business Accounts
 * using the Meta Graph API v18.0+
 * Documentation: https://developers.facebook.com/docs/graph-api
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class FacebookFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://graph.facebook.com/v18.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "facebook");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.pageAccessToken) return false;

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}?access_token=${this.connection.pageAccessToken}`,
        { method: "GET" }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) {
      throw new Error("Facebook Page ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/feed?fields=id,message,story,created_time,type,picture,link,full_picture,insights.metric(post_impressions,post_engaged_users,post_clicks,post_negative_feedback_by_type)&limit=${limit}&access_token=${this.connection.pageAccessToken}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      const data = await response.json();
      const posts = data.data || [];

      return await Promise.all(posts.map((post: any) => this.parseFacebookPost(post)));
    } catch (error) {
      console.error("[Facebook] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) {
      throw new Error("Facebook Page ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/insights?metric=page_fans,page_impressions,page_engaged_users,page_post_engagements&period=day&access_token=${this.connection.pageAccessToken}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseFacebookMetrics(data);
    } catch (error) {
      console.error("[Facebook] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "facebook" as const,
      platformPostId: post.id,
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
          post.metrics.views || post.metrics.impressions || 1
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
      platform: "facebook" as const,
      date: rawMetrics.date,
      granularity: "daily",
      metrics: {
        followers: rawMetrics.followers,
        posts: rawMetrics.posts,
        totalImpressions: rawMetrics.impressions,
        totalEngagements: rawMetrics.engagements,
        totalClicks: rawMetrics.clicks,
        totalShares: rawMetrics.shares,
        averageEngagementRate: rawMetrics.impressions > 0
          ? (rawMetrics.engagements / rawMetrics.impressions) * 100
          : 0,
        averageCommentRate: 0,
        averageShareRate: 0,
      },
      growth: {
        followerGrowth: 0,
        followerGrowthRate: 0,
        impressionGrowth: 0,
        impressionGrowthRate: 0,
        engagementGrowth: 0,
        engagementGrowthRate: 0,
      },
    };
  }

  // Helper methods

  private async parseFacebookPost(post: any): Promise<RawPlatformPost> {
    const insights = post.insights?.data || [];
    const impressions =
      insights.find((i: any) => i.name === "post_impressions")?.values?.[0]
        ?.value || 0;
    const engagedUsers =
      insights.find((i: any) => i.name === "post_engaged_users")?.values?.[0]
        ?.value || 0;
    const clicks =
      insights.find((i: any) => i.name === "post_clicks")?.values?.[0]?.value ||
      0;

    return {
      id: post.id,
      caption: post.message || post.story || "",
      media: post.picture ? [{ type: "image" as const, url: post.picture }] : [],
      createdAt: new Date(post.created_time),
      metrics: {
        likes: 0, // FB doesn't provide this via feed
        comments: 0,
        shares: 0,
        views: impressions,
        clicks: clicks,
        impressions: impressions,
      },
    };
  }

  private parseFacebookMetrics(data: any): RawPlatformMetrics {
    const insights = data.data || [];

    const followers =
      insights.find((i: any) => i.name === "page_fans")?.values?.[0]?.value || 0;
    const impressions =
      insights.find((i: any) => i.name === "page_impressions")?.values?.[0]
        ?.value || 0;
    const engagements =
      insights.find((i: any) => i.name === "page_engaged_users")?.values?.[0]
        ?.value || 0;
    const postEngagements =
      insights.find((i: any) => i.name === "page_post_engagements")
        ?.values?.[0]?.value || 0;

    return {
      date: new Date(),
      followers,
      posts: 0,
      impressions,
      engagements: postEngagements,
      clicks: 0,
      shares: 0,
    };
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

export class InstagramFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://graph.instagram.com/v18.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "instagram");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.pageAccessToken) return false;

    try {
      const response = await fetch(
        `${this.API_BASE}/me?access_token=${this.connection.pageAccessToken}`,
        { method: "GET" }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) {
      throw new Error("Instagram Business Account ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,insights.metric(impressions,engagement)&access_token=${this.connection.pageAccessToken}&limit=${limit}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const posts = data.data || [];

      return posts.map((post: any) => this.parseInstagramPost(post));
    } catch (error) {
      console.error("[Instagram] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) {
      throw new Error("Instagram Business Account ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/insights?metric=follower_count,impressions,engagement&period=day&access_token=${this.connection.pageAccessToken}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseInstagramMetrics(data);
    } catch (error) {
      console.error("[Instagram] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "instagram" as const,
      platformPostId: post.id,
      caption: post.caption || "",
      mediaUrls: this.extractMediaUrls(post),
      format: this.determineFormat(post),
      postedAt: post.createdAt,
      metrics: {
        likes: post.metrics.likes,
        comments: post.metrics.comments,
        shares: 0, // Instagram doesn't track shares the same way
        views: post.metrics.views,
        saves: post.metrics.saves || 0,
      },
      engagement: {
        engagementRate: this.calculateEngagementRate(
          post.metrics.likes + post.metrics.comments,
          post.metrics.views
        ),
        commentRate: this.calculateRate(post.metrics.comments, post.metrics.views),
        shareRate: 0,
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
      platform: "instagram" as const,
      date: rawMetrics.date,
      granularity: "daily",
      metrics: {
        followers: rawMetrics.followers,
        posts: rawMetrics.posts,
        totalImpressions: rawMetrics.impressions,
        totalEngagements: rawMetrics.engagements,
        totalClicks: 0,
        totalShares: 0,
        totalSaves: 0,
        averageEngagementRate: rawMetrics.impressions > 0
          ? (rawMetrics.engagements / rawMetrics.impressions) * 100
          : 0,
        averageCommentRate: 0,
        averageShareRate: 0,
      },
      growth: {
        followerGrowth: 0,
        followerGrowthRate: 0,
        impressionGrowth: 0,
        impressionGrowthRate: 0,
        engagementGrowth: 0,
        engagementGrowthRate: 0,
      },
    };
  }

  // Helper methods

  private parseInstagramPost(post: any): RawPlatformPost {
    const insights = post.insights?.data || [];
    const impressions =
      insights.find((i: any) => i.name === "impressions")?.values?.[0]
        ?.value || 0;
    const engagement =
      insights.find((i: any) => i.name === "engagement")?.values?.[0]?.value ||
      0;

    return {
      id: post.id,
      caption: post.caption || "",
      media:
        post.media_url && post.media_type !== "CAROUSEL"
          ? [
              {
                type: post.media_type === "VIDEO" ? ("video" as const) : ("image" as const),
                url: post.media_url,
              },
            ]
          : [],
      createdAt: new Date(post.timestamp),
      metrics: {
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        shares: 0,
        views: impressions,
        impressions: impressions,
      },
    };
  }

  private parseInstagramMetrics(data: any): RawPlatformMetrics {
    const insights = data.data || [];

    const followers =
      insights.find((i: any) => i.name === "follower_count")?.values?.[0]
        ?.value || 0;
    const impressions =
      insights.find((i: any) => i.name === "impressions")?.values?.[0]?.value ||
      0;
    const engagement =
      insights.find((i: any) => i.name === "engagement")?.values?.[0]?.value ||
      0;

    return {
      date: new Date(),
      followers,
      posts: 0,
      impressions,
      engagements: engagement,
      clicks: 0,
      shares: 0,
    };
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

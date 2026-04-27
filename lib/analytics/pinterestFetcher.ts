/**
 * Pinterest Data Fetcher
 * 
 * Fetches pins and analytics from Pinterest API v5
 * Documentation: https://developers.pinterest.com/docs/api/overview/
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class PinterestFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://api.pinterest.com/v5";

  constructor(connection: ConnectionDocument) {
    super(connection, "pinterest");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    try {
      const response = await fetch(`${this.API_BASE}/user_account`, {
        headers: {
          Authorization: `Bearer ${this.connection.accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.platformUserId) {
      throw new Error("Pinterest User ID not found");
    }

    try {
      // Fetch user's pins
      const response = await fetch(
        `${this.API_BASE}/pins?creator_filter=all&fields=id,created_at,description,media,note,url,counts&limit=${Math.min(limit, 100)}`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pinterest API error: ${response.statusText}`);
      }

      const data = await response.json();
      const pins = data.items || data.data || [];

      return pins.map((pin: any) => this.parsePinterestPin(pin));
    } catch (error) {
      console.error("[Pinterest] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.platformUserId) {
      throw new Error("Pinterest User ID not found");
    }

    try {
      // Fetch user analytics
      const response = await fetch(
        `${this.API_BASE}/user_account/analytics?start_date=${this.getDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}&end_date=${this.getDateString(new Date())}&granularity=day`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pinterest API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePinterestMetrics(data);
    } catch (error) {
      console.error("[Pinterest] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "pinterest" as const,
      platformPostId: post.id,
      caption: post.caption || "",
      mediaUrls: this.extractMediaUrls(post),
      format: "image", // Pinterest is mostly images
      postedAt: post.createdAt,
      metrics: {
        likes: 0, // Pinterest tracks different metrics
        comments: 0,
        shares: 0,
        views: post.metrics.views,
        clicks: post.metrics.clicks || 0,
        saves: post.metrics.saves || 0,
      },
      engagement: {
        engagementRate: this.calculateEngagementRate(
          (post.metrics.clicks || 0) + (post.metrics.saves || 0),
          post.metrics.views || 0
        ),
        commentRate: 0,
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
      platform: "pinterest" as const,
      date: rawMetrics.date,
      granularity: "daily",
      metrics: {
        followers: rawMetrics.followers,
        posts: rawMetrics.posts,
        totalImpressions: rawMetrics.impressions,
        totalEngagements: rawMetrics.engagements,
        totalClicks: rawMetrics.clicks,
        totalShares: 0, // Pinterest doesn't track shares like other platforms
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

  private parsePinterestPin(pin: any): RawPlatformPost {
    const counts = pin.counts || {};

    return {
      id: pin.id,
      caption: pin.description || pin.note || "",
      media: pin.media?.image_cover_url
        ? [{ type: "image" as const, url: pin.media.image_cover_url }]
        : [],
      createdAt: new Date(pin.created_at),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: counts.pin_clicks || 0,
        clicks: counts.pin_clicks || 0,
        saves: counts.saves || 0,
        impressions: counts.impressions || 0,
      },
    };
  }

  private parsePinterestMetrics(data: any): RawPlatformMetrics {
    const analytics = data.daily_metrics?.[0] || {};

    return {
      date: new Date(),
      followers: analytics.followers_count || 0,
      posts: 0,
      impressions: analytics.impressions || 0,
      engagements: (analytics.outbound_clicks || 0) + (analytics.saves || 0),
      clicks: analytics.outbound_clicks || 0,
      shares: 0,
    };
  }

  private getDateString(date: Date): string {
    return date.toISOString().split("T")[0];
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

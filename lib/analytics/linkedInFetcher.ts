/**
 * LinkedIn Data Fetcher
 * 
 * Fetches posts and metrics from LinkedIn using the Stats API and Posts API
 * Documentation: https://learn.microsoft.com/en-us/linkedin/share/integrations/analytics-api
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class LinkedInFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://api.linkedin.com/v2";
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

  constructor(connection: ConnectionDocument) {
    super(connection, "linkedin");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    try {
      const response = await fetch(`${this.API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${this.connection.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.platformUserId) {
      throw new Error("LinkedIn User ID not found");
    }

    try {
      // Fetch user's posts (as an organization/user)
      const response = await fetch(
        `${this.API_BASE}/me/posts?count=${Math.min(limit, 100)}`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      const posts = data.elements || [];

      return posts.map((post: any) => this.parseLinkedInPost(post));
    } catch (error) {
      console.error("[LinkedIn] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.platformUserId) {
      throw new Error("LinkedIn User ID not found");
    }

    try {
      // Fetch organization/user analytics
      const response = await fetch(
        `${this.API_BASE}/networkSize?q=me`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Also fetch page stats
      const statsResponse = await fetch(
        `${this.API_BASE}/me/pageStatistics?q=me`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let stats = null;
      if (statsResponse.ok) {
        stats = await statsResponse.json();
      }

      return this.parseLinkedInMetrics(data, stats);
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

  private parseLinkedInPost(post: any): RawPlatformPost {
    return {
      id: post.id,
      caption: post.commentary || "",
      media: this.parseLinkedInMedia(post),
      createdAt: new Date(post.created?.time || Date.now()),
      metrics: {
        likes: post.likeCount || 0,
        comments: post.commentCount || 0,
        shares: post.shareCount || 0,
        views: post.impressionCount || 0,
        clicks: post.clickCount || 0,
      },
    };
  }

  private parseLinkedInMedia(
    post: any
  ): Array<{ type: "image" | "video"; url: string }> {
    const media: Array<{ type: "image" | "video"; url: string }> = [];

    if (post.content?.media?.[0]?.status === "PUBLISHED") {
      const mediaContent = post.content.media[0];
      if (mediaContent.media?.originalUrl) {
        media.push({
          type: mediaContent.media.media?.video ? "video" : "image",
          url: mediaContent.media.originalUrl,
        });
      }
    }

    return media;
  }

  private parseLinkedInMetrics(data: any, stats: any): RawPlatformMetrics {
    const followers = data.elements?.[0]?.followerCount || 0;
    const impressions = stats?.elements?.[0]?.totalPageViews || 0;

    return {
      date: new Date(),
      followers,
      posts: 0, // LinkedIn API doesn't easily provide total post count
      impressions,
      engagements: stats?.elements?.[0]?.totalPostClicks || 0,
      clicks: stats?.elements?.[0]?.totalPostClicks || 0,
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

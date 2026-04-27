/**
 * Threads Data Fetcher
 * 
 * Fetches posts and metrics from Threads (Meta's Twitter alternative)
 * Uses Instagram Graph API infrastructure since Threads is integrated with Instagram
 * Documentation: https://developers.facebook.com/docs/threads
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class ThreadsFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://graph.threads.net/v18.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "threads");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    try {
      const response = await fetch(
        `${this.API_BASE}/me?access_token=${this.connection.accessToken}`,
        { method: "GET" }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.pageId || !this.connection.accessToken) {
      throw new Error("Threads User ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/threads?fields=id,text,timestamp,media_product_type,media_url,like_count,replies_count,reposts_count,quotes_count,bookmark_count,impressions,views&access_token=${this.connection.accessToken}&limit=${limit}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Threads API error: ${response.statusText}`);
      }

      const data = await response.json();
      const threads = data.data || [];

      return threads.map((thread: any) => this.parseThreadsPost(thread));
    } catch (error) {
      console.error("[Threads] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.pageId || !this.connection.accessToken) {
      throw new Error("Threads User ID or access token not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${this.connection.pageId}/threads_insights?metric=views,likes,reposts,quotes,followers_count&period=day&access_token=${this.connection.accessToken}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Threads API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseThreadsMetrics(data);
    } catch (error) {
      console.error("[Threads] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "threads" as const,
      platformPostId: post.id,
      platformUsername: this.connection.platformUsername,
      caption: post.caption || "",
      mediaUrls: this.extractMediaUrls(post),
      format: this.determineFormat(post),
      postedAt: post.createdAt,
      metrics: {
        likes: post.metrics.likes,
        comments: post.metrics.comments,
        shares: post.metrics.shares,
        views: post.metrics.views,
        reposts: post.metrics.shares || 0,
      },
      engagement: {
        engagementRate: this.calculateEngagementRate(
          post.metrics.likes +
            post.metrics.comments +
            post.metrics.shares +
            (post.metrics.shares || 0),
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
      platform: "threads" as const,
      date: rawMetrics.date,
      granularity: "daily",
      metrics: {
        followers: rawMetrics.followers,
        posts: rawMetrics.posts,
        totalImpressions: rawMetrics.impressions,
        totalEngagements: rawMetrics.engagements,
        totalClicks: 0,
        totalShares: rawMetrics.shares,
        averageEngagementRate: rawMetrics.impressions > 0
          ? (rawMetrics.engagements / rawMetrics.impressions) * 100
          : 0,
        averageCommentRate: 0,
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
    };
  }

  // Helper methods

  private parseThreadsPost(thread: any): RawPlatformPost {
    return {
      id: thread.id,
      text: thread.text,
      media:
        thread.media_url && thread.media_product_type !== "CAROUSEL"
          ? [
              {
                type: thread.media_product_type === "VIDEO"
                  ? ("video" as const)
                  : ("image" as const),
                url: thread.media_url,
              },
            ]
          : [],
      createdAt: new Date(thread.timestamp),
      metrics: {
        likes: thread.like_count || 0,
        comments: thread.replies_count || 0,
        shares: (thread.quotes_count || 0) + (thread.reposts_count || 0),
        views: thread.views || thread.impressions || 0,
        impressions: thread.impressions || 0,
      },
    };
  }

  private parseThreadsMetrics(data: any): RawPlatformMetrics {
    const insights = data.data || [];

    let followers = 0;
    let views = 0;
    let engagements = 0;
    let shares = 0;

    for (const insight of insights) {
      if (insight.name === "followers_count") {
        followers = insight.total_value?.total_value || 0;
      } else if (insight.name === "views") {
        views = insight.total_value?.total_value || 0;
      } else if (insight.name === "likes" || insight.name === "reposts") {
        engagements += insight.total_value?.total_value || 0;
      } else if (insight.name === "quotes") {
        shares += insight.total_value?.total_value || 0;
      }
    }

    return {
      date: new Date(),
      followers,
      posts: 0,
      impressions: views,
      engagements,
      clicks: 0,
      shares,
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

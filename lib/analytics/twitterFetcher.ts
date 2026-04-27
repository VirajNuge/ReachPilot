/**
 * Twitter/X Data Fetcher
 * 
 * Fetches posts (tweets) and metrics from Twitter API v2
 * Documentation: https://developer.twitter.com/en/docs/twitter-api
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class TwitterFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://api.twitter.com/2";

  constructor(connection: ConnectionDocument) {
    super(connection, "x");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    try {
      const response = await fetch(`${this.API_BASE}/tweets/search/recent?query=from:${this.connection.platformUserId}&max_results=10`, {
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
      throw new Error("Twitter User ID not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/users/${this.connection.platformUserId}/tweets?max_results=${Math.min(limit, 100)}&tweet.fields=created_at,public_metrics,author_id&media.fields=url,type`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const tweets = data.data || [];

      return tweets.map((tweet: any) => this.parseTwitterPost(tweet, data.includes?.media));
    } catch (error) {
      console.error("[Twitter] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.platformUserId) {
      throw new Error("Twitter User ID not found");
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/users/${this.connection.platformUserId}?user.fields=public_metrics,created_at`,
        {
          headers: {
            Authorization: `Bearer ${this.connection.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseTwitterMetrics(data.data);
    } catch (error) {
      console.error("[Twitter] Error fetching metrics:", error);
      return null;
    }
  }

  normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[] {
    return rawPosts.map((post) => ({
      userId: this.userId,
      accountId: this.accountId,
      platform: "x" as const,
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
      platform: "x" as const,
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

  private parseTwitterPost(tweet: any, media: any[] = []): RawPlatformPost {
    const metrics = tweet.public_metrics || {};

    // Find media for this tweet
    let mediaUrls: Array<{ type: "image" | "video"; url: string }> = [];
    if (tweet.attachments?.media_keys && media) {
      const tweetMedia = media.filter((m: any) =>
        tweet.attachments.media_keys.includes(m.media_key)
      );
      mediaUrls = tweetMedia.map((m: any) => ({
        type: m.type === "video" || m.type === "animated_gif" ? ("video" as const) : ("image" as const),
        url: m.url,
      }));
    }

    return {
      id: tweet.id,
      text: tweet.text,
      media: mediaUrls,
      createdAt: new Date(tweet.created_at),
      metrics: {
        likes: metrics.like_count || 0,
        comments: metrics.reply_count || 0,
        shares: metrics.retweet_count || 0,
        views: metrics.impression_count || 0,
      },
    };
  }

  private parseTwitterMetrics(user: any): RawPlatformMetrics {
    const metrics = user.public_metrics || {};

    return {
      date: new Date(),
      followers: metrics.followers_count || 0,
      posts: metrics.tweet_count || 0,
      impressions: 0, // Twitter API v2 doesn't provide total impressions
      engagements: 0,
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

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
  private readonly API_BASE = "https://graph.threads.net/v1.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "threads");
  }

  private async fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs: number = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchWithRetry(url: string, init: RequestInit = {}, attempts: number = 3, timeoutMs: number = 15000): Promise<Response> {
    let attempt = 0;
    let lastErr: any = null;
    while (attempt < attempts) {
      attempt++;
      try {
        const res = await this.fetchWithTimeout(url, init, timeoutMs);
        if (res.ok) return res;

        // Retry on 429 or 5xx
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          const wait = Math.pow(2, attempt) * 250 + Math.floor(Math.random() * 200);
          console.warn(`[Threads] fetchWithRetry attempt ${attempt} got ${res.status}, retrying after ${wait}ms`);
          await new Promise((r) => setTimeout(r, wait));
          lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
          continue;
        }

        // Non-retriable error
        return res;
      } catch (e) {
        lastErr = e;
        const wait = Math.pow(2, attempt) * 250 + Math.floor(Math.random() * 200);
        console.warn(`[Threads] fetchWithRetry attempt ${attempt} threw, retrying after ${wait}ms`, e);
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    throw lastErr || new Error("fetchWithRetry failed");
  }

  async isTokenValid(): Promise<boolean> {
    if (!this.connection.accessToken) return false;

    try {
      const response = await this.fetchWithTimeout(
        `${this.API_BASE}/me?fields=id,username&access_token=${this.connection.accessToken}`,
        { method: "GET" }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    if (!this.connection.platformUserId || !this.connection.accessToken) {
      throw new Error("Threads User ID or access token not found");
    }

    const collected: any[] = [];
    let nextUrl: string | null = `${this.API_BASE}/${this.connection.platformUserId}/threads?fields=id,text,timestamp,media_product_type,media_url,like_count,replies_count,reposts_count,quotes_count,bookmark_count,views&access_token=${this.connection.accessToken}&limit=${limit}`;
    const maxTotal = Math.max(limit, 500);

    try {
      while (nextUrl && collected.length < maxTotal) {
        const response = await this.fetchWithRetry(nextUrl, { method: "GET" }, 3, 15000);

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Threads API error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const threads = data.data || [];
        collected.push(...threads);

        // Determine next page URL
        if (data.paging?.next) {
          nextUrl = data.paging.next;
        } else if (data.paging?.cursors?.after) {
          // Construct nextUrl if API supports cursor
          nextUrl = `${this.API_BASE}/${this.connection.platformUserId}/threads?after=${data.paging.cursors.after}&access_token=${this.connection.accessToken}&limit=${limit}`;
        } else {
          nextUrl = null;
        }
      }

      const slice = collected.slice(0, limit);
      return slice.map((thread: any) => this.parseThreadsPost(thread));
    } catch (error) {
      console.error("[Threads] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    if (!this.connection.platformUserId || !this.connection.accessToken) {
      throw new Error("Threads User ID or access token not found");
    }

    try {
      const metrics = "views,likes,reposts,quotes,replies,followers_count";
      const url = `${this.API_BASE}/${this.connection.platformUserId}/threads_insights?metric=${metrics}&access_token=${this.connection.accessToken}`;
      const response = await this.fetchWithRetry(url, { method: "GET" }, 3, 15000);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Threads API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const metrics_result = this.parseThreadsMetrics(data);

      // Fetch posts to get post count (needed for comprehensive metrics)
      let postCount = 0;
      try {
        const postsUrl = `${this.API_BASE}/${this.connection.platformUserId}/threads?fields=id&limit=100&access_token=${this.connection.accessToken}`;
        const postsResponse = await this.fetchWithRetry(postsUrl, { method: "GET" }, 2, 10000);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          postCount = (postsData.data || []).length;
        }
      } catch (e) {
        console.warn("[Threads] Failed to fetch post count:", e);
      }

      metrics_result.posts = postCount;
      return metrics_result;
    } catch (error) {
      console.error("[Threads] Error fetching metrics:", error);
      return null;
    }
  }

  /**
   * Fetch replies for a specific thread
   */
  async fetchReplies(threadId: string): Promise<any[]> {
    if (!this.connection.accessToken) throw new Error("Missing access token");

    const url = `${this.API_BASE}/${threadId}/replies?fields=id,text,timestamp,username&access_token=${this.connection.accessToken}`;
    const res = await this.fetchWithTimeout(url, { method: "GET" });
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Fetch threads where the user was mentioned
   */
  async fetchMentions(): Promise<any[]> {
    if (!this.connection.platformUserId || !this.connection.accessToken) throw new Error("Missing credentials");

    const url = `${this.API_BASE}/${this.connection.platformUserId}/mentions?fields=id,text,timestamp,username&access_token=${this.connection.accessToken}`;
    const res = await this.fetchWithTimeout(url, { method: "GET" });
    const data = await res.json();
    return data.data || [];
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
            post.metrics.shares,
          post.metrics.views || 1
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
        totalComments: rawMetrics.comments || 0,
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
      caption: thread.text || "",
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
        views: thread.views || 0,
        impressions: thread.views || 0,
      },
    };
  }

  private parseThreadsMetrics(data: any): RawPlatformMetrics {
    const insights = data.data || [];

    let followers = 0;
    let views = 0;
    let engagements = 0;
    let comments = 0;
    let shares = 0;

    for (const insight of insights) {
      // Threads API returns values as array with period snapshots
      const val = insight.values?.[0]?.value || insight.total_value?.total_value || 0;
      
      if (insight.name === "followers_count") {
        followers = val;
      } else if (insight.name === "views") {
        views = val;
      } else if (insight.name === "likes") {
        engagements += val;
      } else if (insight.name === "reposts") {
        engagements += val;
        shares += val;
      } else if (insight.name === "quotes") {
        engagements += val;
        shares += val;
      } else if (insight.name === "replies") {
        engagements += val;
        comments += val;
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
      comments,
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

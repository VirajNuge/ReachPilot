/**
 * Facebook & Instagram Data Fetcher
 * 
 * Fetches posts and metrics from Facebook Pages and Instagram Business Accounts
 * using the Meta Graph API v18.0+
 * Documentation: https://developers.facebook.com/docs/graph-api
 */

import { BasePlatformFetcher, type RawPlatformPost, type RawPlatformMetrics } from "./baseFetcher";
import type { ConnectionDocument } from "@/lib/models/connection";
import { upsertConnection } from "@/lib/models/connection";
import type { SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";

export class FacebookFetcher extends BasePlatformFetcher {
  private readonly API_BASE = "https://graph.facebook.com/v21.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "facebook");
  }

  private getPageToken(): string | null {
    const token = this.connection.pageAccessToken || this.connection.accessToken || null;
    if (!token) {
      console.error("[Facebook] No page token or access token available");
    } else if (!this.connection.pageAccessToken) {
      console.warn("[Facebook] pageAccessToken missing, falling back to accessToken");
    }
    return token;
  }

  private getPageId(): string | null {
    const pageId = this.connection.pageId || this.connection.platformUserId || null;
    if (!pageId) {
      console.error("[Facebook] No pageId or platformUserId available");
    } else if (!this.connection.pageId) {
      console.warn("[Facebook] pageId missing, falling back to platformUserId");
    }
    return pageId;
  }

  private async resolvePageCredentials(): Promise<{ pageId: string; token: string } | null> {
    const token = this.getPageToken();
    const pageId = this.getPageId();
    if (token && pageId) {
      return { pageId, token };
    }

    const userToken = this.connection.accessToken;
    if (!userToken) return null;

    try {
      const url = `${this.API_BASE}/me/accounts?fields=id,access_token&limit=5&access_token=${userToken}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) return null;

      const payload = await response.json();
      const firstPage = Array.isArray(payload?.data) ? payload.data[0] : null;
      if (!firstPage?.id || !firstPage?.access_token) return null;

      this.connection.pageId = firstPage.id;
      this.connection.pageAccessToken = firstPage.access_token;
      console.warn("[Facebook] Recovered pageId/pageAccessToken from /me/accounts fallback");

      // Validate the recovered page token before persisting
      try {
        const validateUrl = `${this.API_BASE}/${firstPage.id}?fields=id&access_token=${firstPage.access_token}`;
        const validateRes = await fetch(validateUrl, { method: "GET" });
        if (validateRes.ok) {
          // Persist recovered credentials back to social_connections (idempotent)
          try {
            await upsertConnection(this.userId, this.accountId, this.connection.platform, {
              accessToken: userToken,
              pageId: firstPage.id,
              pageAccessToken: firstPage.access_token,
              platformUserId: this.connection.platformUserId,
              platformUsername: this.connection.platformUsername,
            });
            console.log("[Facebook] Persisted recovered pageId/pageAccessToken to social_connections");
          } catch (e) {
            console.warn("[Facebook] Failed to persist recovered page credentials:", e);
          }
        } else {
          console.warn("[Facebook] Recovered page token failed validation, not persisting");
        }
      } catch (e) {
        console.warn("[Facebook] Validation of recovered page token threw:", e);
      }

      return { pageId: firstPage.id, token: firstPage.access_token };
    } catch (error) {
      console.warn("[Facebook] Failed to resolve page credentials from /me/accounts:", error);
      return null;
    }
  }

  async isTokenValid(): Promise<boolean> {
    const credentials = await this.resolvePageCredentials();
    if (!credentials) return false;
    if (!credentials.pageId) {
      console.error("[Facebook] isTokenValid: pageId/platformUserId is missing");
      return false;
    }

    try {
      const url = `${this.API_BASE}/${credentials.pageId}?fields=id,name&access_token=${credentials.token}`;
      console.log(`[Facebook] isTokenValid → GET ${url.replace(credentials.token, "<TOKEN>")}`); 
      const response = await fetch(url, { method: "GET" });
      const body = await response.text();
      console.log(`[Facebook] isTokenValid ← ${response.status} ${response.statusText}:`, body.slice(0, 300));
      return response.ok;
    } catch (err) {
      console.error("[Facebook] isTokenValid threw:", err);
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    const credentials = await this.resolvePageCredentials();
    if (!credentials) {
      console.error("[Facebook] fetchPosts: missing pageId or pageAccessToken", {
        hasPageId: Boolean(this.connection.pageId || this.connection.platformUserId),
        hasPageAccessToken: Boolean(this.connection.pageAccessToken),
      });
      throw new Error("Facebook Page ID or access token not found");
    }

    try {
      // Use reactions edge — aggregated likes.summary is deprecated since Graph API v3.3
      // Added 'shares' to track post distribution metrics
      let fields = "id,message,created_time,status_type,full_picture,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares";
      let url = `${this.API_BASE}/${credentials.pageId}/posts?fields=${fields}&limit=${limit}&access_token=${credentials.token}`;
      console.log(`[Facebook] fetchPosts → GET .../${credentials.pageId}/posts fields=${fields}`);
      let response = await fetch(url, { method: "GET" });
      let bodyText = await response.text();
      console.log(`[Facebook] fetchPosts ← ${response.status} ${response.statusText}:`, bodyText.slice(0, 400));

      if (!response.ok) {
        // Fallback: retry with bare minimum fields
        console.warn(`[Facebook] fetchPosts attempt 1 failed (${response.status}), retrying with minimal fields`);
        fields = "id,message,created_time,status_type,full_picture";
        url = `${this.API_BASE}/${credentials.pageId}/posts?fields=${fields}&limit=${limit}&access_token=${credentials.token}`;
        console.log(`[Facebook] fetchPosts (retry) → GET .../${credentials.pageId}/posts fields=${fields}`);
        response = await fetch(url, { method: "GET" });
        bodyText = await response.text();
        console.log(`[Facebook] fetchPosts (retry) ← ${response.status} ${response.statusText}:`, bodyText.slice(0, 400));

        if (!response.ok) {
          throw new Error(`Facebook API error (retry): ${response.status} ${response.statusText} - ${bodyText}`);
        }
      }

      const data = JSON.parse(bodyText);
      const posts = data.data || [];
      console.log(`[Facebook] fetchPosts: got ${posts.length} posts`);

      return await Promise.all(posts.map((post: any) => this.parseFacebookPost(post)));
    } catch (error) {
      console.error("[Facebook] fetchPosts threw:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    const credentials = await this.resolvePageCredentials();
    if (!credentials) {
      console.error("[Facebook] fetchMetrics: missing pageId or pageAccessToken");
      throw new Error("Facebook Page ID or access token not found");
    }

    try {
      // Step 1: Get follower/fan count from the page object (reliable, no insights permission needed)
      const pageUrl = `${this.API_BASE}/${credentials.pageId}?fields=fan_count,followers_count&access_token=${credentials.token}`;
      console.log(`[Facebook] fetchMetrics/page -> GET .../${credentials.pageId}?fields=fan_count,followers_count`);
      const pageRes = await fetch(pageUrl, { method: "GET" });
      const pageBody = await pageRes.text();
      console.log(`[Facebook] fetchMetrics/page <- ${pageRes.status} ${pageRes.statusText}:`, pageBody.slice(0, 300));

      let fanCount = 0;
      if (pageRes.ok) {
        const pageData = JSON.parse(pageBody);
        // On New Page Experience (NPE), followers_count tracks page followers.
        // fan_count tracks legacy "likes" — a separate, usually lower number.
        // Always prefer followers_count as it's the real audience size.
        fanCount = pageData.followers_count || pageData.fan_count || 0;
      }

      // Step 2: Fetch insights with explicit 30-day date range (since/until)
      // NOTE: Facebook Insights only returns data for Pages with 100+ followers.
      // Metrics like page_views_total are invalid — use page_impressions (correct v19 name).
      const sinceTs = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      const untilTs = Math.floor(Date.now() / 1000);

      let impressions = 0;
      let engagements = 0;
      let totalComments = 0;
      let totalShares = 0;

      // Sum all daily values across the date range (not just the last day)
      const sumDailyValues = (data: any[]): number => {
        const metricData = data?.[0];
        if (!metricData?.values) return 0;
        return metricData.values.reduce((sum: number, v: any) => sum + (v?.value || 0), 0);
      };

      // Facebook "Views" in native dashboard = page_views_total (sometimes restricted).
      // page_impressions_unique = deduplicated unique reach.
      const impressionCandidates = [
        "page_views_total",           // EXACT MATCH for Facebook native "Views"
        "page_impressions",           // Total impressions
        "page_posts_impressions",     // Times posts entered a screen
        "page_impressions_unique",    // Unique viewers
        "page_media_view",            // NPE content plays/displays
        "page_total_media_view_unique", // NPE unique media viewers
      ];
      const engagementCandidates = ["page_post_engagements", "page_engaged_users"];

      for (const metric of impressionCandidates) {
        try {
          const insightUrl = `${this.API_BASE}/${credentials.pageId}/insights?metric=${metric}&period=day&since=${sinceTs}&until=${untilTs}&access_token=${credentials.token}`;
          const insightRes = await fetch(insightUrl, { method: "GET" });
          const insightBody = await insightRes.text();

          if (insightRes.ok) {
            const insightData = JSON.parse(insightBody);
            const total = sumDailyValues(insightData.data || []);
            console.log(`[Facebook] fetchMetrics: tried ${metric}, got sum=${total}`);
            if (total > 0) {
              impressions = total;
              console.log(`[Facebook] fetchMetrics: impressions resolved via "${metric}" = ${impressions}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`[Facebook] fetchMetrics: metric ${metric} threw:`, e);
        }
      }

      for (const metric of engagementCandidates) {
        try {
          const insightUrl = `${this.API_BASE}/${credentials.pageId}/insights?metric=${metric}&period=day&since=${sinceTs}&until=${untilTs}&access_token=${credentials.token}`;
          const insightRes = await fetch(insightUrl, { method: "GET" });
          const insightBody = await insightRes.text();

          if (insightRes.ok) {
            const insightData = JSON.parse(insightBody);
            const total = sumDailyValues(insightData.data || []);
            console.log(`[Facebook] fetchMetrics: tried ${metric}, got sum=${total}`);
            if (total > 0) {
              engagements = total;
              console.log(`[Facebook] fetchMetrics: engagements resolved via "${metric}" = ${engagements}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`[Facebook] fetchMetrics: metric ${metric} threw:`, e);
        }
      }

      // Step 3: Fetch comments and shares from posts directly (post-level, no insights permission needed)
      let postCount = 0;
      try {
        const fields = "id,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares";
        const postsUrl = `${this.API_BASE}/${credentials.pageId}/posts?fields=${fields}&limit=100&since=${sinceTs}&access_token=${credentials.token}`;
        console.log(`[Facebook] fetchMetrics/posts -> fetching reactions+comments+shares for 30d`);
        const postsRes = await fetch(postsUrl, { method: "GET" });
        if (postsRes.ok) {
          const postsData = JSON.parse(await postsRes.text());
          const posts = postsData.data || [];
          postCount = posts.length;
          for (const post of posts) {
            totalComments += post.comments?.summary?.total_count || 0;
            totalShares += post.shares?.count || 0;
          }
          console.log(`[Facebook] fetchMetrics: post-level count=${postCount}, comments=${totalComments}, shares=${totalShares}`);
        }
      } catch (e) {
        console.warn(`[Facebook] fetchMetrics: post-level comments/shares fetch threw:`, e);
      }

      console.log(`[Facebook] fetchMetrics result: fans=${fanCount}, impressions=${impressions}, engagements=${engagements}, comments=${totalComments}, shares=${totalShares}, posts=${postCount}`);

      return {
        date: new Date(),
        followers: fanCount,
        posts: postCount,
        impressions,
        engagements,
        clicks: 0,
        shares: totalShares,
        comments: totalComments,
      };
    } catch (error) {
      console.error("[Facebook] fetchMetrics threw:", error);
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
        totalComments: rawMetrics.comments || 0,
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
    // reactions.summary and comments.summary with limit(0) is the v3.3+ way to get counts
    const likes = post.reactions?.summary?.total_count || 0;
    const comments = post.comments?.summary?.total_count || 0;
    const shares = post.shares?.count || 0;
    const impressions = Math.max(likes + comments + shares, 1);

    return {
      id: post.id,
      caption: post.message || "",
      media: post.full_picture ? [{ type: "image" as const, url: post.full_picture }] : [],
      createdAt: new Date(post.created_time),
      metrics: {
        likes,
        comments,
        shares,
        views: impressions,
        clicks: 0,
        impressions,
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
  private readonly API_BASE = "https://graph.facebook.com/v21.0";

  constructor(connection: ConnectionDocument) {
    super(connection, "instagram");
  }

  private getPageToken(): string | null {
    const token = this.connection.pageAccessToken || null;
    if (!token) {
      console.error("[Instagram] No pageAccessToken available");
    }
    return token;
  }

  private getInstagramUserId(): string | null {
    const userId = this.connection.pageId || null;
    if (!userId) {
      console.error("[Instagram] No pageId available");
    }
    return userId;
  }

  private async resolveInstagramCredentials(): Promise<{ igUserId: string; token: string } | null> {
    const token = this.getPageToken();
    const igId = this.getInstagramUserId();
    if (token && igId) return { igUserId: igId, token };

    // Recover only by matching the saved Instagram account/username.
    // Never default to the first Facebook Page, because that can fetch the wrong account's metrics.
    const userToken = this.connection.accessToken;
    if (!userToken) return null;

    try {
      const pagesUrl = `${this.API_BASE}/me/accounts?fields=id,access_token&limit=10&access_token=${userToken}`;
      const res = await fetch(pagesUrl, { method: "GET" });
      if (!res.ok) return null;
      const payload = await res.json();
      const pages = Array.isArray(payload?.data) ? payload.data : [];
      const desiredUsername = (this.connection.platformUsername || "").trim().toLowerCase();
      const desiredPageId = (this.connection.pageId || "").trim();

      if (!desiredPageId && !desiredUsername) {
        console.warn("[Instagram] No stored Instagram pageId or platformUsername to resolve against");
        return null;
      }

      for (const p of pages) {
        if (!p?.id || !p?.access_token) continue;
        try {
          const igLookupUrl = `${this.API_BASE}/${p.id}?fields=instagram_business_account{id,username,name},name&access_token=${p.access_token}`;
          const igRes = await fetch(igLookupUrl, { method: "GET" });
          if (!igRes.ok) continue;
          const igBody = await igRes.json();
          const igAccount = igBody?.instagram_business_account;
          const igIdFound = igAccount?.id;
          if (!igIdFound) continue;

          const matchesStoredPage = desiredPageId && (p.id === desiredPageId || igIdFound === desiredPageId);
          const matchesStoredUsername = desiredUsername && String(igAccount?.username || "").trim().toLowerCase() === desiredUsername;
          if (!matchesStoredPage && !matchesStoredUsername) {
            continue;
          }

          // Validate IG token by fetching IG user.
          const validateUrl = `${this.API_BASE}/${igIdFound}?fields=id,username&access_token=${p.access_token}`;
          const validateRes = await fetch(validateUrl, { method: "GET" });
          if (!validateRes.ok) continue;

          // Persist recovered values
          this.connection.pageId = igIdFound;
          this.connection.pageAccessToken = p.access_token;
          this.connection.platformUserId = igIdFound;
          this.connection.platformUsername = igAccount?.username || this.connection.platformUsername || igBody?.name || undefined;
          try {
            await upsertConnection(this.userId, this.accountId, this.connection.platform, {
              accessToken: userToken,
              pageId: igIdFound,
              pageAccessToken: p.access_token,
              platformUserId: igIdFound,
              platformUsername: this.connection.platformUsername,
            });
            console.log("[Instagram] Persisted recovered IG credentials to social_connections");
          } catch (e) {
            console.warn("[Instagram] Failed to persist recovered IG credentials:", e);
          }

          return { igUserId: igIdFound, token: p.access_token };
        } catch (e) {
          // ignore and continue to next page
          console.warn("[Instagram] ig lookup for page threw:", e);
          continue;
        }
      }

      return null;
    } catch (e) {
      console.warn("[Instagram] Failed to resolve IG credentials:", e);
      return null;
    }
  }

  async isTokenValid(): Promise<boolean> {
    const credentials = await this.resolveInstagramCredentials();
    if (!credentials) return false;

    try {
      const url = `${this.API_BASE}/${credentials.igUserId}?fields=id,username&access_token=${credentials.token}`;
      console.log(`[Instagram] isTokenValid → GET ${url.replace(credentials.token, "<TOKEN>")}`);
      const response = await fetch(url, { method: "GET" });
      const body = await response.text();
      console.log(`[Instagram] isTokenValid ← ${response.status}:`, body.slice(0, 200));
      return response.ok;
    } catch (err) {
      console.error("[Instagram] isTokenValid threw:", err);
      return false;
    }
  }

  async fetchPosts(limit: number = 50): Promise<RawPlatformPost[]> {
    const credentials = await this.resolveInstagramCredentials();
    if (!credentials) throw new Error("Instagram Business Account ID or access token not found");

    try {
      const fields = "id,caption,media_type,media_url,timestamp,like_count,comments_count,saved_count";
      const url = `${this.API_BASE}/${credentials.igUserId}/media?fields=${fields}&limit=${limit}&access_token=${credentials.token}`;
      console.log(`[Instagram] fetchPosts → GET .../${credentials.igUserId}/media`);
      
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Instagram API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const posts = data.data || [];
      console.log(`[Instagram] fetchPosts: got ${posts.length} posts`);

      return posts.map((post: any) => this.parseInstagramPost(post));
    } catch (error) {
      console.error("[Instagram] Error fetching posts:", error);
      throw error;
    }
  }

  async fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null> {
    const credentials = await this.resolveInstagramCredentials();
    if (!credentials) throw new Error("Instagram Business Account ID or access token not found");

    try {
      // 1. Get follower count from the IG User object
      const userUrl = `${this.API_BASE}/${credentials.igUserId}?fields=followers_count&access_token=${credentials.token}`;
      const userRes = await fetch(userUrl);
      const userData = await userRes.json();
      const followerCount = userData.followers_count || 0;

      // 2. Fetch Account Insights (Impressions/Reach)
      const sinceTs = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      const untilTs = Math.floor(Date.now() / 1000);

      const metrics = ["impressions", "reach"];
      let totalImpressions = 0;
      let totalReach = 0;    

      for (const metric of metrics) {
        try {
          const insightUrl = `${this.API_BASE}/${credentials.igUserId}/insights?metric=${metric}&period=day&since=${sinceTs}&until=${untilTs}&access_token=${credentials.token}`;
          const insightRes = await fetch(insightUrl);
          if (insightRes.ok) {
            const insightData = await insightRes.json();
            const values = insightData.data?.[0]?.values || [];
            const sum = values.reduce((acc: number, v: any) => acc + (v.value || 0), 0);
            if (metric === "impressions") totalImpressions = sum;
            if (metric === "reach") totalReach = sum;
          }
        } catch (e) {
          console.warn(`[Instagram] Failed to fetch insight ${metric}:`, e);
        }
      }

      // 3. Fallback/Supplement: Aggregate from media objects (very reliable)
      const postFields = "id,like_count,comments_count,saved_count";
      const postsUrl = `${this.API_BASE}/${credentials.igUserId}/media?fields=${postFields}&limit=50&access_token=${credentials.token}`;
      const postsRes = await fetch(postsUrl);
      let aggregatedEngagements = 0;
      let aggregatedComments = 0;
      let aggregatedSaves = 0;
      let postLevelImpressions = 0;

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const posts = postsData.data || [];
        const postIds = posts.map((p: any) => p.id);

        for (const post of posts) {
          aggregatedEngagements += (post.like_count || 0) + (post.comments_count || 0);
          aggregatedComments += (post.comments_count || 0);
          aggregatedSaves += (post.saved_count || 0);
        }

        // Batch fetch impressions for these posts to solve the "0 impressions" issue
        if (postIds.length > 0) {
          try {
            const batchUrl = `${this.API_BASE}/?ids=${postIds.join(",")}&fields=insights.metric(impressions)&access_token=${credentials.token}`;
            const batchRes = await fetch(batchUrl);
            if (batchRes.ok) {
              const batchData = await batchRes.json();
              for (const id of postIds) {
                const insights = batchData[id]?.insights?.data || [];
                const impMetric = insights.find((m: any) => m.name === "impressions");
                postLevelImpressions += impMetric?.values?.[0]?.value || 0;
              }
            }
          } catch (e) {
            console.warn("[Instagram] Failed to fetch batch post impressions:", e);
          }
        }
      }

      // Final aggregation logic
      const finalImpressions = totalImpressions || totalReach || postLevelImpressions;

      console.log(`[Instagram] fetchMetrics: followers=${followerCount}, impressions=${finalImpressions}, engagements=${aggregatedEngagements}, saves=${aggregatedSaves}`);

      return {
        date: new Date(),
        followers: followerCount,
        posts: 0,
        impressions: finalImpressions,
        engagements: aggregatedEngagements,
        clicks: 0,
        shares: aggregatedSaves, // Map saves to shares for consistent card mapping
        comments: aggregatedComments,
      };
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
        shares: 0,
        views: post.metrics.views,
        saves: post.metrics.saves || 0,
      },
      engagement: {
        engagementRate: this.calculateEngagementRate(
          post.metrics.likes + post.metrics.comments,
          post.metrics.views || 1
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
        totalShares: rawMetrics.shares || 0,
        totalComments: rawMetrics.comments || 0,
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
    const likes = post.like_count || 0;
    const comments = post.comments_count || 0;
    const saves = post.saved_count || 0;
    // For IG, use impressions as views if available, else estimate
    const impressions = Math.max(likes + comments + saves, 1);

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
        likes: likes,
        comments: comments,
        shares: 0,
        saves: saves,
        views: impressions,
        impressions: impressions,
      },
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

  /**
   * Search for a hashtag ID by name
   * Documentation: https://developers.facebook.com/docs/instagram-api/guides/hashtag-search
   */
  async searchHashtags(query: string): Promise<{ id: string; name: string }[]> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) throw new Error("Missing credentials");

    const url = `${this.API_BASE}/ig_hashtag_search?user_id=${this.connection.pageId}&q=${query}&access_token=${this.connection.pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Fetch recent media for a specific hashtag ID
   */
  async fetchHashtagMedia(hashtagId: string, limit: number = 20): Promise<any[]> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) throw new Error("Missing credentials");

    const fields = "id,media_type,media_url,caption,like_count,comments_count,timestamp";
    const url = `${this.API_BASE}/${hashtagId}/recent_media?user_id=${this.connection.pageId}&fields=${fields}&limit=${limit}&access_token=${this.connection.pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Discover basic data about another Instagram Business or Creator account
   * Documentation: https://developers.facebook.com/docs/instagram-api/guides/business-discovery
   */
  async discoverBusiness(username: string): Promise<any> {
    if (!this.connection.pageId || !this.connection.pageAccessToken) throw new Error("Missing credentials");

    const fields = `business_discovery.username(${username}){followers_count,media_count,id,username,biography,name,profile_picture_url}`;
    const url = `${this.API_BASE}/${this.connection.pageId}?fields=${fields}&access_token=${this.connection.pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.business_discovery;
  }
}


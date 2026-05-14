/**
 * Base Fetcher Interface & Types
 * 
 * Defines common interface and types that all platform fetchers must implement.
 * This ensures consistency across all platform integrations.
 */

import type { Platform, SocialMediaPostDocument, SocialMediaMetricsDocument } from "@/lib/models/persistedTypes";
import type { ConnectionDocument } from "@/lib/models/connection";

/**
 * Result of a fetch operation
 */
export interface FetchResult {
  success: boolean;
  postsAdded: number;
  postsUpdated: number;
  metricsAdded: number;
  metricsUpdated: number;
  errors: Array<{ message: string; code?: string }>;
  dataQuality?: {
    completeness: number; // 0-100%
    accuracy?: string; // notes on data accuracy
  };
  nextSyncTime?: Date; // when to sync next based on API rate limits
}

/**
 * Raw data from platform API before normalization
 */
export interface RawPlatformPost {
  id: string;
  caption?: string;
  text?: string;
  media?: Array<{
    type: "image" | "video";
    url: string;
  }>;
  createdAt: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks?: number;
    saves?: number;
    impressions?: number;
  };
}

/**
 * Raw metrics from platform API
 */
export interface RawPlatformMetrics {
  date: Date;
  followers: number;
  posts: number;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments?: number;
  saves?: number;
  topPostId?: string;
  topPostEngagement?: number;
}

/**
 * Base class that all platform fetchers must extend
 */
export abstract class BasePlatformFetcher {
  protected connection: ConnectionDocument;
  protected platform: Platform;
  protected userId: string;
  protected accountId: string;

  constructor(
    connection: ConnectionDocument,
    platform: Platform
  ) {
    this.connection = connection;
    this.platform = platform;
    this.userId = connection.userId;
    this.accountId = connection.accountId;
  }

  /**
   * Fetch posts from platform API
   * Must be implemented by each platform
   */
  abstract fetchPosts(limit?: number): Promise<RawPlatformPost[]>;

  /**
   * Fetch metrics from platform API
   * Must be implemented by each platform
   */
  abstract fetchMetrics(date?: Date): Promise<RawPlatformMetrics | null>;

  /**
   * Check if access token is valid or needs refresh
   * Must be implemented by each platform if they support token refresh
   */
  abstract isTokenValid(): boolean | Promise<boolean>;

  /**
   * Refresh access token if needed
   * Optional - implement if platform supports refresh
   */
  async refreshToken(): Promise<void> {
    throw new Error(`Token refresh not implemented for ${this.platform}`);
  }

  /**
   * Normalize raw platform post to common schema
   * Must be implemented by each platform
   */
  abstract normalizePosts(
    rawPosts: RawPlatformPost[]
  ): Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">[];

  /**
   * Normalize raw metrics to common schema
   * Must be implemented by each platform
   */
  abstract normalizeMetrics(
    rawMetrics: RawPlatformMetrics
  ): Omit<SocialMediaMetricsDocument, "_id" | "createdAt" | "updatedAt"> | null;

  /**
   * Main sync operation - fetch and store data
   * Can be overridden for platform-specific behavior
   */
  async sync(): Promise<FetchResult> {
    const result: FetchResult = {
      success: false,
      postsAdded: 0,
      postsUpdated: 0,
      metricsAdded: 0,
      metricsUpdated: 0,
      errors: [],
    };

    try {
      // Check token validity
      if (!(await this.isTokenValid())) {
        result.errors.push({
          message: "Access token is invalid or expired",
          code: "TOKEN_INVALID",
        });
        return result;
      }

      // Fetch posts
      const rawPosts = await this.fetchPosts();
      if (rawPosts.length > 0) {
        const normalizedPosts = this.normalizePosts(rawPosts);
        result.postsAdded = normalizedPosts.length;
      }

      // Fetch metrics
      const rawMetrics = await this.fetchMetrics();
      if (rawMetrics) {
        const normalizedMetrics = this.normalizeMetrics(rawMetrics);
        if (normalizedMetrics) {
          result.metricsAdded = 1;
        }
      }

      result.success = true;
      result.dataQuality = {
        completeness: rawPosts.length > 0 ? 100 : 0,
      };
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SYNC_ERROR",
      });
    }

    return result;
  }

  /**
   * Helper to determine post format from raw data
   */
  protected determineFormat(
    post: RawPlatformPost
  ): "text" | "image" | "video" | "carousel" | "reel" | "article" {
    if (!post.media || post.media.length === 0) {
      return "text";
    }

    if (post.media.length === 1) {
      return post.media[0].type === "video" ? "video" : "image";
    }

    return "carousel";
  }

  /**
   * Helper to extract media URLs
   */
  protected extractMediaUrls(post: RawPlatformPost): string[] {
    return post.media?.map((m) => m.url) || [];
  }
}

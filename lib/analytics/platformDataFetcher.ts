/**
 * Platform Data Fetcher Orchestrator
 * 
 * Main entry point that orchestrates fetching data from all connected social media platforms.
 * Handles:
 * - Fetching from all platforms
 * - Storing data in MongoDB
 * - Handling errors gracefully
 * - Tracking sync results
 */

import { getConnections } from "@/lib/models/connection";
import {
  upsertPost,
  getPostsNeedingRefresh,
  upsertMetrics,
  type SocialMediaPostDocument,
  type SocialMediaMetricsDocument,
} from "@/lib/models/persistedTypes";

import { BasePlatformFetcher, type FetchResult } from "./baseFetcher";
import { LinkedInFetcher } from "./linkedInFetcher";
import { FacebookFetcher, InstagramFetcher } from "./facebookInstagramFetcher";
import { TwitterFetcher } from "./twitterFetcher";
import { PinterestFetcher } from "./pinterestFetcher";
import { ThreadsFetcher } from "./threadsFetcher";

import type { ConnectionDocument } from "@/lib/models/connection";

export interface SyncStats {
  totalPlatforms: number;
  successfulPlatforms: number;
  failedPlatforms: number;
  totalPostsAdded: number;
  totalPostsUpdated: number;
  totalMetricsAdded: number;
  totalMetricsUpdated: number;
  errors: Array<{
    platform: string;
    error: string;
  }>;
  duration: number; // milliseconds
  timestamp: Date;
}

/**
 * Create fetcher for a platform based on connection
 */
function createFetcher(connection: ConnectionDocument): BasePlatformFetcher {
  switch (connection.platform) {
    case "linkedin":
      return new LinkedInFetcher(connection);
    case "facebook":
      return new FacebookFetcher(connection);
    case "instagram":
      return new InstagramFetcher(connection);
    case "x":
      return new TwitterFetcher(connection);
    case "pinterest":
      return new PinterestFetcher(connection);
    case "threads":
      return new ThreadsFetcher(connection);
    default:
      throw new Error(`Unsupported platform: ${connection.platform}`);
  }
}

/**
 * Sync data for a specific platform
 */
async function syncPlatform(
  connection: ConnectionDocument,
  fetcher: BasePlatformFetcher
): Promise<{
  success: boolean;
  postsAdded: number;
  postsUpdated: number;
  metricsAdded: number;
  metricsUpdated: number;
  error?: string;
}> {
  const result = {
    success: false,
    postsAdded: 0,
    postsUpdated: 0,
    metricsAdded: 0,
    metricsUpdated: 0,
    error: undefined as string | undefined,
  };

  try {
    // Fetch posts
    const rawPosts = await fetcher.fetchPosts(100);
    if (rawPosts.length > 0) {
      const normalizedPosts = fetcher.normalizePosts(rawPosts);

      for (const post of normalizedPosts) {
        try {
          await upsertPost(post);
          result.postsAdded++;
        } catch (error: any) {
          // If it's a duplicate key error, it's an update not an insert
          if (error.code === 11000) {
            result.postsUpdated++;
          }
        }
      }
    }

    // Fetch metrics
    const rawMetrics = await fetcher.fetchMetrics();
    if (rawMetrics) {
      const normalizedMetrics = fetcher.normalizeMetrics(rawMetrics);
      if (normalizedMetrics) {
        try {
          await upsertMetrics(normalizedMetrics);
          result.metricsAdded++;
        } catch (error: any) {
          if (error.code === 11000) {
            result.metricsUpdated++;
          }
        }
      }
    }

    result.success = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
  }

  return result;
}

/**
 * Sync all connected platforms for a user account
 */
export async function syncAllPlatforms(
  userId: string,
  accountId: string
): Promise<SyncStats> {
  const startTime = Date.now();
  const stats: SyncStats = {
    totalPlatforms: 0,
    successfulPlatforms: 0,
    failedPlatforms: 0,
    totalPostsAdded: 0,
    totalPostsUpdated: 0,
    totalMetricsAdded: 0,
    totalMetricsUpdated: 0,
    errors: [],
    duration: 0,
    timestamp: new Date(),
  };

  try {
    // Get all connected platforms for this account
    const connections = await getConnections(userId, accountId);

    if (connections.length === 0) {
      console.log("[Analytics] No connected platforms for account", accountId);
      return stats;
    }

    stats.totalPlatforms = connections.length;

    // Sync each platform
    for (const connection of connections) {
      try {
        console.log(`[Analytics] Syncing ${connection.platform}...`);

        const fetcher = createFetcher(connection);
        const result = await syncPlatform(connection, fetcher);

        if (result.success) {
          stats.successfulPlatforms++;
          stats.totalPostsAdded += result.postsAdded;
          stats.totalPostsUpdated += result.postsUpdated;
          stats.totalMetricsAdded += result.metricsAdded;
          stats.totalMetricsUpdated += result.metricsUpdated;

          console.log(`[Analytics] ✓ ${connection.platform} synced successfully`);
          console.log(
            `  Posts: +${result.postsAdded} added, ${result.postsUpdated} updated`
          );
          console.log(
            `  Metrics: +${result.metricsAdded} added, ${result.metricsUpdated} updated`
          );
        } else {
          stats.failedPlatforms++;
          stats.errors.push({
            platform: connection.platform,
            error: result.error || "Unknown error",
          });
          console.error(
            `[Analytics] ✗ ${connection.platform} sync failed:`,
            result.error
          );
        }
      } catch (error) {
        stats.failedPlatforms++;
        stats.errors.push({
          platform: connection.platform,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(
          `[Analytics] ✗ ${connection.platform} error:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Analytics] Sync failed:", error);
  }

  stats.duration = Date.now() - startTime;
  return stats;
}

/**
 * Sync specific platform for a user account
 */
export async function syncPlatformData(
  userId: string,
  accountId: string,
  platform: string
): Promise<{
  success: boolean;
  postsAdded: number;
  postsUpdated: number;
  metricsAdded: number;
  metricsUpdated: number;
  error?: string;
}> {
  try {
    const connections = await getConnections(userId, accountId);
    const connection = connections.find((c) => c.platform === platform);

    if (!connection) {
      throw new Error(`Platform ${platform} not connected`);
    }

    const fetcher = createFetcher(connection);
    return await syncPlatform(connection, fetcher);
  } catch (error) {
    return {
      success: false,
      postsAdded: 0,
      postsUpdated: 0,
      metricsAdded: 0,
      metricsUpdated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Refresh posts that need updating (older than specified hours)
 */
export async function refreshStaleData(userId: string, accountId: string, hoursOld: number = 24): Promise<number> {
  try {
    const stalePostsCount = (await getPostsNeedingRefresh(hoursOld)).filter(
      (p) => p.userId === userId && p.accountId === accountId
    ).length;

    if (stalePostsCount === 0) {
      console.log(`[Analytics] No stale posts to refresh for account ${accountId}`);
      return 0;
    }

    console.log(
      `[Analytics] Found ${stalePostsCount} stale posts, syncing all platforms...`
    );

    const stats = await syncAllPlatforms(userId, accountId);

    console.log(
      `[Analytics] Refresh complete. Synced ${stats.totalPostsAdded} new posts and ${stats.totalPostsUpdated} updated posts.`
    );

    return stalePostsCount;
  } catch (error) {
    console.error("[Analytics] Stale data refresh failed:", error);
    return 0;
  }
}

/**
 * Get sync status for a user account
 */
export async function getSyncStatus(userId: string, accountId: string): Promise<{
  lastSync?: Date;
  platformCount: number;
  platforms: Array<{
    platform: string;
    connected: boolean;
    lastSynced?: Date;
  }>;
}> {
  try {
    const connections = await getConnections(userId, accountId);

    return {
      platformCount: connections.length,
      platforms: connections.map((c) => ({
        platform: c.platform,
        connected: true,
        lastSynced: c.updatedAt,
      })),
    };
  } catch (error) {
    console.error("[Analytics] Failed to get sync status:", error);
    return {
      platformCount: 0,
      platforms: [],
    };
  }
}

export type { FetchResult } from "./baseFetcher";
export { createFetcher };

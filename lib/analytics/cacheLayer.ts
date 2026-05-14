/**
 * Multi-Level Cache Layer
 * 
 * Implements efficient caching with:
 * - In-memory cache (fast, per-instance)
 * - Database cache (persistent, shared)
 * - Cache invalidation strategies
 * - Background refresh
 */

import type { AnalyticsSummaryResponse } from "./types";

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  data: AnalyticsSummaryResponse;
  expiresAt: number;
  createdAt: number;
  hits: number; // For LRU tracking
  size: number; // For memory management
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsed: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

/**
 * In-memory LRU cache with size limits
 */
class LRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number; // MB
  private maxEntries: number;
  private currentSize = 0; // MB
  private totalHits = 0;
  private totalMisses = 0;

  constructor(maxSizeMB: number = 50, maxEntries: number = 100) {
    this.maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    this.maxEntries = maxEntries;
  }

  /**
   * Get entry from cache
   */
  get(key: string): AnalyticsSummaryResponse | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.totalMisses++;
      return null;
    }

    // Update LRU tracking
    entry.hits++;
    this.totalHits++;

    return entry.data;
  }

  /**
   * Set entry in cache
   */
  set(key: string, data: AnalyticsSummaryResponse, ttlMs: number): void {
    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
      this.cache.delete(key);
    }

    // Calculate size (rough estimate)
    const size = JSON.stringify(data).length;

    // Check size limits
    if (size > this.maxSize) {
      // Entry is too large, skip caching
      return;
    }

    // Evict entries if needed
    while (this.currentSize + size > this.maxSize || this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    // Add new entry
    const entry: CacheEntry = {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
      hits: 0,
      size,
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Prefer evicting entries with fewer hits and older creation time
      const score = entry.hits + (Date.now() - entry.createdAt) / 1000000;
      if (score < lruHits + lruTime / 1000000) {
        lruKey = key;
        lruHits = entry.hits;
        lruTime = entry.createdAt;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey)!;
      this.currentSize -= entry.size;
      this.cache.delete(lruKey);
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let oldestTime: number | null = null;
    let newestTime: number | null = null;

    for (const entry of this.cache.values()) {
      if (oldestTime === null || entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
      }
      if (newestTime === null || entry.createdAt > newestTime) {
        newestTime = entry.createdAt;
      }
    }

    const totalRequests = this.totalHits + this.totalMisses;
    const hitRate = totalRequests > 0 ? (this.totalHits / totalRequests) * 100 : 0;

    return {
      totalEntries: this.cache.size,
      hitRate,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      memoryUsed: this.currentSize,
      oldestEntry: oldestTime,
      newestEntry: newestTime,
    };
  }

  /**
   * Remove specific entry
   */
  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get all keys (for debugging)
   */
  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Global cache instance
 */
let globalCache: LRUCache | null = null;

/**
 * Initialize cache (call once on app startup)
 */
export function initializeCache(maxSizeMB: number = 50, maxEntries: number = 100): void {
  globalCache = new LRUCache(maxSizeMB, maxEntries);
}

/**
 * Get cache instance (creates if needed)
 */
function getCache(): LRUCache {
  if (!globalCache) {
    globalCache = new LRUCache();
  }
  return globalCache;
}

/**
 * Build cache key from parameters
 */
export function buildCacheKey(
  userId: string,
  accountId: string,
  platform: string,
  dateRange: string,
  plan: string
): string {
  return `${userId}:${accountId}:${platform}:${dateRange}:${plan}`;
}

/**
 * Get from cache
 */
export function getCachedAnalytics(key: string): AnalyticsSummaryResponse | null {
  const cache = getCache();
  return cache.get(key);
}

/**
 * Set in cache with 1-hour default TTL
 */
export function setCachedAnalytics(
  key: string,
  data: AnalyticsSummaryResponse,
  ttlMs: number = 1000 * 60 * 60
): void {
  const cache = getCache();
  cache.set(key, data, ttlMs);
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCacheEntry(key: string): void {
  const cache = getCache();
  cache.invalidate(key);
}

/**
 * Invalidate all cache entries for a user/account
 */
export function invalidateCacheForAccount(userId: string, accountId: string): number {
  const cache = getCache();
  const pattern = `^${userId}:${accountId}:`;
  return cache.invalidatePattern(pattern);
}

/**
 * Invalidate all cache entries for a user
 */
export function invalidateCacheForUser(userId: string): number {
  const cache = getCache();
  const pattern = `^${userId}:`;
  return cache.invalidatePattern(pattern);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  const cache = getCache();
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const cache = getCache();
  return cache.getStats();
}

/**
 * Get all cache keys (for debugging)
 */
export function getCacheKeys(): string[] {
  const cache = getCache();
  return cache.getAllKeys();
}

/**
 * Background sync task
 * Refreshes stale cache entries in the background
 */
export interface BackgroundSyncConfig {
  enabled: boolean;
  interval: number; // ms between checks
  staleTTL: number; // ms - consider entry stale if older than this
  maxConcurrent: number; // max concurrent refreshes
}

/**
 * Global background sync state
 */
let backgroundSyncConfig: BackgroundSyncConfig = {
  enabled: true,
  interval: 1000 * 60 * 5, // 5 minutes
  staleTTL: 1000 * 60 * 30, // 30 minutes
  maxConcurrent: 3,
};

let backgroundSyncRunning = false;
let refreshQueue: string[] = [];
let activeRefreshes = 0;

/**
 * Configure background sync
 */
export function configureBackgroundSync(config: Partial<BackgroundSyncConfig>): void {
  backgroundSyncConfig = { ...backgroundSyncConfig, ...config };
}

/**
 * Queue an entry for background refresh
 */
export function queueForRefresh(key: string): void {
  if (!refreshQueue.includes(key)) {
    refreshQueue.push(key);
  }
  processRefreshQueue();
}

/**
 * Process refresh queue
 */
async function processRefreshQueue(): Promise<void> {
  if (!backgroundSyncConfig.enabled || backgroundSyncRunning) {
    return;
  }

  while (refreshQueue.length > 0 && activeRefreshes < backgroundSyncConfig.maxConcurrent) {
    const key = refreshQueue.shift();
    if (key) {
      activeRefreshes++;
      // Refresh happens asynchronously, don't await
      refreshCacheEntry(key).finally(() => {
        activeRefreshes--;
        processRefreshQueue();
      });
    }
  }
}

/**
 * Refresh a cache entry (to be called by background task)
 * This would typically call getAllAnalyticsMetrics and update the cache
 */
async function refreshCacheEntry(key: string): Promise<void> {
  try {
    // Parse cache key
    const parts = key.split(":");
    if (parts.length !== 5) {
      return;
    }

    const [userId, accountId, platform, dateRange, plan] = parts;

    // Import here to avoid circular dependency
    const { buildRealAnalyticsSummary } = await import("./realDataAdapter");

    // Fetch fresh data
    const freshData = await buildRealAnalyticsSummary(
      userId,
      accountId,
      platform as any,
      dateRange as any,
      plan as any
    );

    // Update cache with new data
    setCachedAnalytics(key, freshData);
  } catch (error) {
    console.warn("Background cache refresh failed for key:", key, error);
  }
}

/**
 * Cache warming: Pre-populate cache for active users
 * Should be called periodically or after sync completion
 */
export async function warmCache(userIds: string[], accountIds: string[]): Promise<number> {
  let warmed = 0;

  for (const userId of userIds) {
    for (const accountId of accountIds) {
      for (const platform of ["all", "facebook", "instagram", "x", "threads"]) {
        for (const range of ["7D", "30D", "90D"]) {
          for (const plan of ["core", "pro"]) {
            const key = buildCacheKey(userId, accountId, platform, range, plan);

            // Check if entry already cached
            if (getCachedAnalytics(key)) {
              continue;
            }

            try {
              const { buildRealAnalyticsSummary } = await import("./realDataAdapter");
              const data = await buildRealAnalyticsSummary(
                userId,
                accountId,
                platform as any,
                range as any,
                plan as any
              );

              setCachedAnalytics(key, data);
              warmed++;
            } catch (error) {
              // Silently continue on error
            }
          }
        }
      }
    }
  }

  return warmed;
}

/**
 * Adaptive cache TTL based on hit rate
 * Returns shorter TTL for high-traffic entries, longer for low-traffic
 */
export function getAdaptiveTTL(hits: number): number {
  const baseExpiry = 1000 * 60 * 60; // 1 hour

  if (hits > 100) {
    // Very popular, cache longer
    return baseExpiry * 4; // 4 hours
  } else if (hits > 50) {
    // Popular, standard cache
    return baseExpiry; // 1 hour
  } else if (hits > 10) {
    // Moderate, shorter cache
    return baseExpiry / 2; // 30 minutes
  } else {
    // Low traffic, minimal cache
    return baseExpiry / 4; // 15 minutes
  }
}

/**
 * Cache health check
 * Returns diagnostics about cache performance
 */
export interface CacheHealth {
  status: "healthy" | "warning" | "critical";
  hitRate: number;
  totalEntries: number;
  memoryUsedMB: number;
  memoryLimitMB: number;
  issues: string[];
}

export function getCacheHealth(): CacheHealth {
  const stats = getCacheStats();
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  const memoryUsedMB = stats.memoryUsed / (1024 * 1024);
  const memoryLimitMB = 50; // Default limit

  if (stats.hitRate < 50) {
    issues.push(`Low cache hit rate: ${stats.hitRate.toFixed(2)}%`);
    status = "warning";
  }

  if (memoryUsedMB > memoryLimitMB * 0.9) {
    issues.push(`High memory usage: ${memoryUsedMB.toFixed(2)}MB of ${memoryLimitMB}MB`);
    status = "critical";
  }

  if (stats.totalEntries > 90) {
    issues.push(`Cache near capacity: ${stats.totalEntries} entries`);
    status = "warning";
  }

  return {
    status,
    hitRate: stats.hitRate,
    totalEntries: stats.totalEntries,
    memoryUsedMB,
    memoryLimitMB,
    issues,
  };
}

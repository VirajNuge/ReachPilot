/**
 * Cache Management Utilities
 * 
 * Public API for managing cache and sync operations
 */

import {
  getCacheStats,
  getCacheHealth,
  getCacheKeys,
  invalidateCacheForAccount,
  invalidateCacheForUser,
  clearAllCache,
  warmCache,
} from "./cacheLayer";

import {
  getSyncStatusReport,
  getSyncQueueStatus,
  triggerEmergencySync,
  queueFullAccountSync,
} from "./backgroundSyncService";

export type {
  CacheStats,
  CacheHealth,
} from "./cacheLayer";

export type {
  SyncTaskResult,
  SyncTaskConfig,
  SyncQueueStatus,
  SyncStatusReport,
  PeriodicSyncConfig,
} from "./backgroundSyncService";

/**
 * Get all cache diagnostics
 */
export function getCacheDiagnostics() {
  return {
    stats: getCacheStats(),
    health: getCacheHealth(),
    keys: getCacheKeys(),
    keysCount: getCacheKeys().length,
  };
}

/**
 * Get all sync diagnostics
 */
export function getSyncDiagnostics() {
  return {
    statusReport: getSyncStatusReport(),
    queueStatus: getSyncQueueStatus(),
  };
}

/**
 * Admin operation: Reset all caches
 */
export async function resetAllAnalyticsCaches() {
  clearAllCache();
  return { cleared: true, timestamp: new Date().toISOString() };
}

/**
 * Admin operation: Trigger full system sync
 */
export async function triggerFullSystemSync(users: string[], accounts: string[]) {
  const queued = await triggerEmergencySync(users, accounts);
  return {
    queued,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Export utilities for direct use
 */
export {
  getCacheStats,
  getCacheHealth,
  getCacheKeys,
  invalidateCacheForAccount,
  invalidateCacheForUser,
  clearAllCache,
  warmCache,
  getSyncStatusReport,
  getSyncQueueStatus,
  triggerEmergencySync,
  queueFullAccountSync,
};

/**
 * Background Sync Service
 * 
 * Handles:
 * - Periodic data synchronization from APIs
 * - Stale data detection and refresh
 * - Background task scheduling
 * - Sync status tracking
 */

import { syncAllPlatforms, syncPlatformData, getSyncStatus } from "./platformDataFetcher";
import type { Platform } from "@/lib/models/persistedTypes";
import {
  invalidateCacheForAccount,
  queueForRefresh,
  buildCacheKey,
} from "./cacheLayer";

type PlatformSyncResult = Awaited<ReturnType<typeof syncPlatformData>>;
type AllPlatformsSyncResult = Awaited<ReturnType<typeof syncAllPlatforms>>;
type SyncResult = PlatformSyncResult | AllPlatformsSyncResult;

/**
 * Sync task configuration
 */
export interface SyncTaskConfig {
  userId: string;
  accountId: string;
  platform?: Platform;
  priority: "high" | "normal" | "low";
}

/**
 * Sync task result
 */
export interface SyncTaskResult {
  taskId: string;
  userId: string;
  accountId: string;
  platform?: Platform;
  status: "pending" | "running" | "completed" | "failed";
  startTime: number;
  endTime?: number;
  duration?: number;
  result?: {
    postsAdded: number;
    metricsAdded: number;
    errors: string[];
  };
  error?: string;
}

/**
 * Global sync state
 */
let syncQueue: SyncTaskConfig[] = [];
let activeSyncTasks: Map<string, SyncTaskResult> = new Map();
let syncTaskCounter = 0;
let isProcessingSyncQueue = false;

/**
 * Sync configuration
 */
let syncConfig = {
  maxConcurrent: 2,
  highPriorityBatch: 5,
  normalPriorityBatch: 3,
  lowPriorityBatch: 1,
  retryAttempts: 3,
  retryDelay: 2000, // ms
};

/**
 * Configure sync service
 */
export function configureSyncService(config: Partial<typeof syncConfig>): void {
  syncConfig = { ...syncConfig, ...config };
}

/**
 * Queue a sync task
 */
export function queueSyncTask(config: SyncTaskConfig): string {
  const taskId = `sync-${++syncTaskCounter}`;

  syncQueue.push(config);

  // Sort by priority
  syncQueue.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  processSyncQueue();

  return taskId;
}

/**
 * Queue full account sync (all platforms)
 */
export function queueFullAccountSync(userId: string, accountId: string): string {
  return queueSyncTask({
    userId,
    accountId,
    priority: "normal",
  });
}

/**
 * Queue platform-specific sync
 */
export function queuePlatformSync(
  userId: string,
  accountId: string,
  platform: Platform,
  priority: "high" | "normal" | "low" = "normal"
): string {
  return queueSyncTask({
    userId,
    accountId,
    platform,
    priority,
  });
}

/**
 * Process sync queue
 */
async function processSyncQueue(): Promise<void> {
  if (isProcessingSyncQueue) {
    return;
  }

  isProcessingSyncQueue = true;

  try {
    while (syncQueue.length > 0 && activeSyncTasks.size < syncConfig.maxConcurrent) {
      const config = syncQueue.shift();
      if (config) {
        executeSyncTask(config);
      }
    }
  } finally {
    isProcessingSyncQueue = false;
  }
}

/**
 * Execute a sync task
 */
async function executeSyncTask(config: SyncTaskConfig): Promise<void> {
  const taskId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const task: SyncTaskResult = {
    taskId,
    userId: config.userId,
    accountId: config.accountId,
    platform: config.platform,
    status: "running",
    startTime: Date.now(),
  };

  activeSyncTasks.set(taskId, task);

  try {
    // Execute sync with retry logic
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < syncConfig.retryAttempts; attempt++) {
      try {
        let result: SyncResult;

        if (config.platform) {
          // Sync specific platform
          result = await syncPlatformData(config.userId, config.accountId, config.platform);
        } else {
          // Sync all platforms
          result = await syncAllPlatforms(config.userId, config.accountId);
        }

        // Update task result
        task.status = "completed";
        task.endTime = Date.now();
        task.duration = task.endTime - task.startTime;
        task.result = {
          postsAdded: "totalPostsAdded" in result ? result.totalPostsAdded : result.postsAdded,
          metricsAdded: "totalMetricsAdded" in result ? result.totalMetricsAdded : result.metricsAdded,
          errors: "errors" in result
            ? result.errors.map((entry) => `${entry.platform}: ${entry.error}`)
            : result.error
              ? [result.error]
              : [],
        };

        // Invalidate cache for this account to force refresh
        invalidateCacheForAccount(config.userId, config.accountId);

        // Queue cache warming for key ranges
        queueCacheWarming(config.userId, config.accountId);

        break;
      } catch (error) {
        lastError = error as Error;

        // Wait before retry
        if (attempt < syncConfig.retryAttempts - 1) {
          await sleep(syncConfig.retryDelay * (attempt + 1));
        }
      }
    }

    if (lastError && task.status !== "completed") {
      task.status = "failed";
      task.endTime = Date.now();
      task.duration = task.endTime - task.startTime;
      task.error = lastError.message;
    }
  } catch (error) {
    task.status = "failed";
    task.endTime = Date.now();
    task.duration = task.endTime - task.startTime;
    task.error = String(error);
  } finally {
    // Remove from active tasks after a delay
    setTimeout(() => {
      activeSyncTasks.delete(taskId);
    }, 5000);

    // Process next task in queue
    processSyncQueue();
  }
}

/**
 * Queue cache warming after sync
 */
function queueCacheWarming(userId: string, accountId: string): void {
  // Queue key cache entries for refresh
  const priorities = [
    { platform: "all", range: "30D", plan: "pro" }, // Most important
    { platform: "all", range: "7D", plan: "pro" },
    { platform: "all", range: "30D", plan: "core" },
  ];

  for (const prio of priorities) {
    const key = buildCacheKey(userId, accountId, prio.platform, prio.range, prio.plan);
    queueForRefresh(key);
  }
}

/**
 * Get sync task status
 */
export function getSyncTaskStatus(taskId: string): SyncTaskResult | null {
  return activeSyncTasks.get(taskId) || null;
}

/**
 * Get all active sync tasks
 */
export function getActiveSyncTasks(): SyncTaskResult[] {
  return Array.from(activeSyncTasks.values());
}

/**
 * Get sync queue status
 */
export interface SyncQueueStatus {
  queueLength: number;
  activeTasks: number;
  totalCapacity: number;
  canAccept: boolean;
  nextTaskPriority?: string;
}

export function getSyncQueueStatus(): SyncQueueStatus {
  return {
    queueLength: syncQueue.length,
    activeTasks: activeSyncTasks.size,
    totalCapacity: syncConfig.maxConcurrent,
    canAccept: activeSyncTasks.size < syncConfig.maxConcurrent,
    nextTaskPriority: syncQueue[0]?.priority,
  };
}

/**
 * Clear sync queue (emergency)
 */
export function clearSyncQueue(): number {
  const count = syncQueue.length;
  syncQueue = [];
  return count;
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Periodic sync scheduler
 * Run this at intervals (e.g., every 30 minutes)
 */
let schedulerRunning = false;
let schedulerInterval: NodeJS.Timeout | null = null;

export interface PeriodicSyncConfig {
  enabled: boolean;
  interval: number; // ms
  priority: "high" | "normal" | "low";
}

let periodicSyncConfig: PeriodicSyncConfig = {
  enabled: false,
  interval: 1000 * 60 * 30, // 30 minutes
  priority: "normal",
};

/**
 * Configure periodic sync
 */
export function configurePeriodicSync(config: Partial<PeriodicSyncConfig>): void {
  periodicSyncConfig = { ...periodicSyncConfig, ...config };

  if (config.enabled && !schedulerRunning) {
    startPeriodicSync();
  } else if (!config.enabled && schedulerRunning) {
    stopPeriodicSync();
  }
}

/**
 * Start periodic sync
 */
export function startPeriodicSync(): void {
  if (schedulerRunning) {
    return;
  }

  schedulerRunning = true;

  // Run immediately on start (offset by 5 seconds)
  setTimeout(() => {
    if (schedulerRunning) {
      runPeriodicSync();
    }
  }, 5000);

  // Then run at intervals
  schedulerInterval = setInterval(() => {
    if (schedulerRunning) {
      runPeriodicSync();
    }
  }, periodicSyncConfig.interval);
}

/**
 * Stop periodic sync
 */
export function stopPeriodicSync(): void {
  schedulerRunning = false;

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

/**
 * Run periodic sync
 * This would ideally query the database for all active accounts
 */
async function runPeriodicSync(): Promise<void> {
  try {
    // In a real implementation, this would:
    // 1. Query database for all users with connections
    // 2. Queue high-priority syncs for each
    // 3. Log sync results

    console.log("[Analytics] Running periodic sync", new Date().toISOString());

    // For now, just log that it ran
    // TODO: Integrate with database to get list of users/accounts
  } catch (error) {
    console.error("[Analytics] Periodic sync error:", error);
  }
}

/**
 * Sync status report
 */
export interface SyncStatusReport {
  timestamp: string;
  activeServices: {
    periodic: boolean;
    backgroundRefresh: boolean;
  };
  queue: SyncQueueStatus;
  recentTasks: SyncTaskResult[];
  statistics: {
    totalSyncsCompleted: number;
    totalSyncsFailed: number;
    averageSyncTime: number;
  };
}

let syncStatistics = {
  completed: 0,
  failed: 0,
  totalTime: 0,
};

/**
 * Get comprehensive sync status report
 */
export function getSyncStatusReport(): SyncStatusReport {
  const completedTasks = Array.from(activeSyncTasks.values())
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
    .slice(0, 5);

  const avgTime =
    syncStatistics.completed > 0
      ? syncStatistics.totalTime / syncStatistics.completed
      : 0;

  return {
    timestamp: new Date().toISOString(),
    activeServices: {
      periodic: schedulerRunning,
      backgroundRefresh: periodicSyncConfig.enabled,
    },
    queue: getSyncQueueStatus(),
    recentTasks: completedTasks,
    statistics: {
      totalSyncsCompleted: syncStatistics.completed,
      totalSyncsFailed: syncStatistics.failed,
      averageSyncTime: Math.round(avgTime),
    },
  };
}

/**
 * Trigger emergency full sync
 * Useful for manual refresh of all data
 */
export async function triggerEmergencySync(
  userIds: string[],
  accountIds: string[]
): Promise<number> {
  let queued = 0;

  for (const userId of userIds) {
    for (const accountId of accountIds) {
      queueFullAccountSync(userId, accountId);
      queued++;
    }
  }

  return queued;
}

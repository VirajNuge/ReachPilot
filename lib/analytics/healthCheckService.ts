/**
 * Health Check Service for Analytics Pipeline
 * Monitors system health and provides diagnostics
 */

import { getCacheStats } from "./cacheLayer";
import { getSyncQueueStatus, getSyncStatusReport } from "./backgroundSyncService";
import { getAnalyticsSummary } from "./aggregationService";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    cache: {
      status: "ok" | "warning" | "error";
      hitRate: number;
      size: number;
      entries: number;
      message: string;
    };
    sync: {
      status: "ok" | "warning" | "error";
      queueLength: number;
      lastSync: string | null;
      failureCount: number;
      message: string;
    };
    database: {
      status: "ok" | "warning" | "error";
      responseTime: number;
      message: string;
    };
  };
  metrics: {
    apiResponseTime: number;
    cacheEfficiency: number;
    syncSuccess: number;
  };
  recommendations: string[];
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  const checks = await Promise.all([
    checkCacheHealth(),
    checkSyncHealth(),
    checkDatabaseHealth(),
  ]);

  const apiResponseTime = performance.now() - startTime;

  const cacheHealth = checks[0];
  const syncHealth = checks[1];
  const dbHealth = checks[2];

  const overallStatus = determineOverallStatus([cacheHealth, syncHealth, dbHealth]);
  const recommendations = generateRecommendations(cacheHealth, syncHealth, dbHealth);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: {
      cache: cacheHealth,
      sync: syncHealth,
      database: dbHealth,
    },
    metrics: {
      apiResponseTime,
      cacheEfficiency: cacheHealth.hitRate,
      syncSuccess: (1 - syncHealth.failureCount / Math.max(1, syncHealth.queueLength + syncHealth.failureCount)) * 100,
    },
    recommendations,
  };
}

/**
 * Check cache system health
 */
async function checkCacheHealth(): Promise<HealthCheckResult["checks"]["cache"]> {
  try {
    const health = getCacheStats();

    let status: "ok" | "warning" | "error" = "ok";
    let message = "Cache system operating normally";

    if (health.hitRate < 60) {
      status = "warning";
      message = `Low hit rate: ${health.hitRate.toFixed(1)}%`;
    }
    if (health.totalEntries > 90) {
      status = "warning";
      message = `Cache near capacity: ${health.totalEntries} entries`;
    }
    if (health.hitRate < 40) {
      status = "error";
      message = "Critical: Very low cache hit rate";
    }

    return {
      status,
      hitRate: health.hitRate,
      size: health.memoryUsed,
      entries: health.totalEntries,
      message,
    };
  } catch (error) {
    return {
      status: "error",
      hitRate: 0,
      size: 0,
      entries: 0,
      message: `Cache error: ${error}`,
    };
  }
}

/**
 * Check background sync health
 */
async function checkSyncHealth(): Promise<HealthCheckResult["checks"]["sync"]> {
  try {
    const syncStats = getSyncStatusReport();
    const queueStatus = getSyncQueueStatus();

    let status: "ok" | "warning" | "error" = "ok";
    let message = "Background sync operating normally";

    const failureRate = syncStats.statistics.totalSyncsFailed > 0
      ? syncStats.statistics.totalSyncsFailed /
        (syncStats.statistics.totalSyncsCompleted + syncStats.statistics.totalSyncsFailed)
      : 0;

    if (queueStatus.queueLength > 100) {
      status = "warning";
      message = `Large sync queue: ${queueStatus.queueLength} pending tasks`;
    }
    if (failureRate > 0.1) {
      status = "warning";
      message = `High failure rate: ${(failureRate * 100).toFixed(1)}%`;
    }
    if (queueStatus.queueLength > 500 || failureRate > 0.25) {
      status = "error";
      message = "Critical: Sync system degraded";
    }

    return {
      status,
      queueLength: queueStatus.queueLength,
      lastSync: null,
      failureCount: syncStats.statistics.totalSyncsFailed,
      message,
    };
  } catch (error) {
    return {
      status: "error",
      queueLength: 0,
      lastSync: null,
      failureCount: 0,
      message: `Sync error: ${error}`,
    };
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<HealthCheckResult["checks"]["database"]> {
  try {
    const startTime = performance.now();

    // Test database query
    await getAnalyticsSummary("test-user", "test-account", 30);

    const responseTime = performance.now() - startTime;

    let status: "ok" | "warning" | "error" = "ok";
    let message = "Database responding normally";

    if (responseTime > 2000) {
      status = "warning";
      message = `Slow database response: ${responseTime.toFixed(0)}ms`;
    }
    if (responseTime > 5000) {
      status = "error";
      message = `Critical: Database timeout risk at ${responseTime.toFixed(0)}ms`;
    }

    return {
      status,
      responseTime,
      message,
    };
  } catch (error) {
    return {
      status: "error",
      responseTime: 0,
      message: `Database error: ${error}`,
    };
  }
}

/**
 * Determine overall system status
 */
function determineOverallStatus(checks: Array<any>): "healthy" | "degraded" | "unhealthy" {
  const statuses = checks.map((c) => c.status);

  if (statuses.includes("error")) {
    return "unhealthy";
  }
  if (statuses.includes("warning")) {
    return "degraded";
  }
  return "healthy";
}

/**
 * Generate recommendations based on health checks
 */
function generateRecommendations(
  cacheHealth: HealthCheckResult["checks"]["cache"],
  syncHealth: HealthCheckResult["checks"]["sync"],
  dbHealth: HealthCheckResult["checks"]["database"],
): string[] {
  const recommendations: string[] = [];

  // Cache recommendations
  if (cacheHealth.hitRate < 0.6) {
    recommendations.push("Increase cache TTL or review cache key patterns");
  }
  if (cacheHealth.status === "warning" || cacheHealth.status === "error") {
    recommendations.push("Monitor cache memory usage and consider cache flush");
  }

  // Sync recommendations
  if (syncHealth.queueLength > 100) {
    recommendations.push("Increase background sync concurrency or reduce request rate");
  }
  if (syncHealth.failureCount > 0) {
    recommendations.push("Review sync failures and check platform API connectivity");
  }

  // Database recommendations
  if (dbHealth.responseTime > 2000) {
    recommendations.push("Check database performance and connection pool");
  }
  if (dbHealth.status === "error") {
    recommendations.push("Verify database connection and restart if necessary");
  }

  if (recommendations.length === 0) {
    recommendations.push("System operating optimally");
  }

  return recommendations;
}

/**
 * Get quick health status
 */
export function getQuickHealthStatus(): {
  status: "healthy" | "degraded" | "unhealthy";
  cacheOk: boolean;
  syncOk: boolean;
  dbOk: boolean;
} {
  const cacheHealth = getCacheStats();
  const syncStats = getSyncStatusReport();

  return {
    status: cacheHealth.hitRate > 60 && syncStats.statistics.totalSyncsFailed === 0 ? "healthy" : "degraded",
    cacheOk: cacheHealth.hitRate > 60,
    syncOk: syncStats.statistics.totalSyncsFailed === 0,
    dbOk: true, // Assume OK unless query fails
  };
}

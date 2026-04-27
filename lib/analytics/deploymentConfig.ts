/**
 * Production Deployment & Monitoring Setup
 * Canary deployment strategy and production configuration
 */

export interface DeploymentConfig {
  environment: "development" | "staging" | "production";
  canaryPercentage: number;
  featureFlags: {
    useRealData: boolean;
    useCaching: boolean;
    useBackgroundSync: boolean;
    enableMonitoring: boolean;
  };
  limits: {
    maxConcurrentSyncs: number;
    maxCacheSize: number;
    maxCacheEntries: number;
    requestTimeoutMs: number;
    syncRetryAttempts: number;
  };
  monitoring: {
    enableErrorTracking: boolean;
    enablePerformanceTracking: boolean;
    sampleRate: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      cacheHitRate: number;
    };
  };
}

/**
 * Default production configuration
 */
export const PRODUCTION_CONFIG: DeploymentConfig = {
  environment: "production",
  canaryPercentage: 5, // Start with 5% of traffic
  featureFlags: {
    useRealData: true,
    useCaching: true,
    useBackgroundSync: true,
    enableMonitoring: true,
  },
  limits: {
    maxConcurrentSyncs: 2,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    maxCacheEntries: 100,
    requestTimeoutMs: 30000, // 30 seconds
    syncRetryAttempts: 3,
  },
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    sampleRate: 0.1, // 10% of requests
    alertThresholds: {
      errorRate: 0.05, // 5% error rate
      responseTime: 1000, // 1 second
      cacheHitRate: 0.7, // 70% cache hit rate
    },
  },
};

/**
 * Canary deployment tracking
 */
export interface CanaryDeployment {
  id: string;
  startTime: Date;
  currentPercentage: number;
  targetPercentage: number;
  status: "running" | "completed" | "rolled_back";
  metrics: {
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
    cacheHitRate: number;
  };
}

/**
 * Production metrics collector
 */
export class ProductionMetrics {
  private metrics: Map<string, any> = new Map();
  private startTime = Date.now();

  /**
   * Record request metric
   */
  recordRequest(path: string, duration: number, status: number, cached: boolean): void {
    const key = `${path}:${status}`;
    const current = this.metrics.get(key) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      cached: 0,
      avgTime: 0,
    };

    current.count += 1;
    current.totalTime += duration;
    if (status >= 400) current.errors += 1;
    if (cached) current.cached += 1;
    current.avgTime = current.totalTime / current.count;

    this.metrics.set(key, current);
  }

  /**
   * Record error
   */
  recordError(component: string, error: string): void {
    const key = `error:${component}`;
    const current = this.metrics.get(key) || {
      count: 0,
      lastError: null,
      lastTime: null,
    };

    current.count += 1;
    current.lastError = error;
    current.lastTime = new Date().toISOString();

    this.metrics.set(key, current);
  }

  /**
   * Get current metrics
   */
  getMetrics(): object {
    const uptime = Date.now() - this.startTime;
    const metricsArray = Array.from(this.metrics.entries()).map(([key, value]) => ({
      name: key,
      ...value,
    }));

    return {
      uptime,
      metricsCount: metricsArray.length,
      metrics: metricsArray,
    };
  }

  /**
   * Get summary stats
   */
  getSummary(): {
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    let totalRequests = 0;
    let totalErrors = 0;
    let totalTime = 0;
    let cachedRequests = 0;

    for (const [key, value] of this.metrics.entries()) {
      if (!key.startsWith("error:")) {
        totalRequests += value.count || 0;
        totalErrors += value.errors || 0;
        totalTime += value.totalTime || 0;
        cachedRequests += value.cached || 0;
      }
    }

    return {
      totalRequests,
      totalErrors,
      avgResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
      cacheHitRate: totalRequests > 0 ? cachedRequests / totalRequests : 0,
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }
}

/**
 * Rollback strategy
 */
export class RollbackStrategy {
  static shouldRollback(metrics: ReturnType<ProductionMetrics["getSummary"]>): boolean {
    // Rollback if error rate exceeds threshold
    if (metrics.errorRate > 0.1) {
      console.error("🚨 Rollback triggered: Error rate too high");
      return true;
    }

    // Rollback if average response time too high
    if (metrics.avgResponseTime > 5000) {
      console.error("🚨 Rollback triggered: Response time too high");
      return true;
    }

    // Rollback if cache hit rate drops below threshold
    if (metrics.cacheHitRate < 0.5) {
      console.error("🚨 Rollback triggered: Cache hit rate too low");
      return true;
    }

    return false;
  }

  static async performRollback(): Promise<boolean> {
    try {
      // Disable real data and revert to mock
      console.log("⚠️ Rolling back to previous version...");

      // In production, this would:
      // 1. Stop new deployments
      // 2. Redirect traffic to previous version
      // 3. Disable new features
      // 4. Send alerts to ops team

      console.log("✅ Rollback completed");
      return true;
    } catch (error) {
      console.error("❌ Rollback failed:", error);
      return false;
    }
  }
}

/**
 * Feature flags manager
 */
export class FeatureFlagsManager {
  private flags: Map<string, { enabled: boolean; rolloutPercentage: number }> = new Map();

  constructor(config: DeploymentConfig) {
    this.flags.set("useRealData", { enabled: config.featureFlags.useRealData, rolloutPercentage: 100 });
    this.flags.set("useCaching", { enabled: config.featureFlags.useCaching, rolloutPercentage: 100 });
    this.flags.set("useBackgroundSync", {
      enabled: config.featureFlags.useBackgroundSync,
      rolloutPercentage: 100,
    });
  }

  /**
   * Check if feature is enabled for user
   */
  isEnabled(featureName: string, userId: string): boolean {
    const flag = this.flags.get(featureName);
    if (!flag || !flag.enabled) return false;

    // Use user ID hash to determine if user is in rollout percentage
    const hash = userId.split("").reduce((h, c) => h + c.charCodeAt(0), 0);
    const userPercentile = (hash % 100) + 1;

    return userPercentile <= flag.rolloutPercentage;
  }

  /**
   * Update rollout percentage
   */
  updateRollout(featureName: string, percentage: number): void {
    const flag = this.flags.get(featureName);
    if (flag) {
      flag.rolloutPercentage = percentage;
      console.log(`📊 Updated ${featureName} rollout to ${percentage}%`);
    }
  }

  /**
   * Get all flags status
   */
  getStatus(): Record<string, { enabled: boolean; rolloutPercentage: number }> {
    const status: Record<string, { enabled: boolean; rolloutPercentage: number }> = {};
    for (const [name, flag] of this.flags.entries()) {
      status[name] = { ...flag };
    }
    return status;
  }
}

/**
 * Error tracking
 */
export class ErrorTracker {
  private errors: Array<{
    timestamp: Date;
    component: string;
    message: string;
    stackTrace?: string;
    severity: "low" | "medium" | "high" | "critical";
  }> = [];

  /**
   * Track error
   */
  trackError(component: string, message: string, severity: "low" | "medium" | "high" | "critical" = "medium"): void {
    const error = {
      timestamp: new Date(),
      component,
      message,
      severity,
    };

    this.errors.push(error);

    // Alert on critical errors
    if (severity === "critical") {
      console.error(`🚨 CRITICAL ERROR in ${component}: ${message}`);
      // Send to error tracking service (Sentry, etc)
    }
  }

  /**
   * Get error summary
   */
  getSummary(minutesAgo: number = 60): {
    totalErrors: number;
    byComponent: Record<string, number>;
    bySeverity: Record<string, number>;
    recentCritical: any[];
  } {
    const cutoff = new Date(Date.now() - minutesAgo * 60 * 1000);
    const recent = this.errors.filter((e) => e.timestamp > cutoff);

    const byComponent: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const error of recent) {
      byComponent[error.component] = (byComponent[error.component] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    }

    const recentCritical = recent.filter((e) => e.severity === "critical").slice(-10);

    return {
      totalErrors: recent.length,
      byComponent,
      bySeverity,
      recentCritical,
    };
  }

  /**
   * Clear old errors
   */
  cleanup(hoursAgo: number = 24): void {
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    this.errors = this.errors.filter((e) => e.timestamp > cutoff);
  }
}

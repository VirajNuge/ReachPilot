/**
 * Advanced Data Pipeline Optimizations
 * Query optimization, database tuning, and performance enhancements
 */

import type { AnalyticsSummaryResponse } from "./types";

/**
 * Query Optimization Engine
 * Optimizes MongoDB queries for analytics
 */
export class QueryOptimizer {
  /**
   * Build optimized aggregation pipeline
   */
  static buildAggregationPipeline(
    userId: string,
    dateRange: "7D" | "30D" | "90D",
    platforms?: string[],
  ): any[] {
    const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline: any[] = [
      {
        $match: {
          userId,
          createdAt: { $gte: startDate },
          ...(platforms?.length && { platform: { $in: platforms } }),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            platform: "$platform",
          },
          totalEngagement: { $sum: "$engagement" },
          totalReach: { $sum: "$reach" },
          totalImpressions: { $sum: "$impressions" },
          postCount: { $sum: 1 },
          avgEngagementRate: { $avg: "$engagementRate" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          platform: "$_id.platform",
          totalEngagement: 1,
          totalReach: 1,
          totalImpressions: 1,
          postCount: 1,
          avgEngagementRate: 1,
        },
      },
    ];

    return pipeline;
  }

  /**
   * Add indexes for common queries
   */
  static getRequiredIndexes(): Array<{ collection: string; spec: any; options?: any }> {
    return [
      {
        collection: "social_media_posts",
        spec: { userId: 1, createdAt: -1 },
        options: { name: "userId_date_idx" },
      },
      {
        collection: "social_media_posts",
        spec: { userId: 1, platform: 1, createdAt: -1 },
        options: { name: "user_platform_date_idx" },
      },
      {
        collection: "social_media_posts",
        spec: { accountId: 1, userId: 1 },
        options: { name: "account_user_idx" },
      },
      {
        collection: "social_media_metrics",
        spec: { userId: 1, dateRange: 1, createdAt: -1 },
        options: { name: "metrics_user_range_idx" },
      },
      {
        collection: "social_media_posts",
        spec: { engagement: -1, createdAt: -1 },
        options: { name: "engagement_idx" },
      },
    ];
  }

  /**
   * Query execution plan analysis
   */
  static analyzeQueryPlan(executionStats: any): {
    executionStage: string;
    docsExamined: number;
    docsReturned: number;
    executionTimeMillis: number;
    efficiency: number;
    recommendations: string[];
  } {
    const stats = executionStats;
    const efficiency = stats.docsExamined > 0 ? (stats.docsReturned / stats.docsExamined) * 100 : 0;

    const recommendations: string[] = [];

    if (efficiency < 50) {
      recommendations.push("Query efficiency is low - add indexes or refine query");
    }
    if (stats.executionTimeMillis > 1000) {
      recommendations.push("Query execution time is high - optimize or increase resources");
    }
    if (!stats.executionStages.stage.includes("COLLSCAN")) {
      recommendations.push("Add index on commonly queried fields");
    }

    return {
      executionStage: stats.executionStages?.stage || "unknown",
      docsExamined: stats.totalDocsExamined || 0,
      docsReturned: stats.nReturned || 0,
      executionTimeMillis: stats.executionStages?.executionTimeMillis || 0,
      efficiency,
      recommendations,
    };
  }

  /**
   * Batch query optimization
   */
  static optimizeBatchQueries(queries: any[]): any[] {
    // Combine similar queries into batch operations
    const grouped: Record<string, any[]> = {};

    queries.forEach((q) => {
      const key = JSON.stringify({
        collection: q.collection,
        projection: q.projection,
        sort: q.sort,
      });

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(q);
    });

    // Convert to bulk operations
    const optimized: any[] = [];
    for (const [, group] of Object.entries(grouped)) {
      if (group.length > 1) {
        optimized.push({
          type: "bulk",
          operations: group,
        });
      } else {
        optimized.push(...group);
      }
    }

    return optimized;
  }
}

/**
 * Database Connection Pool Manager
 */
export class ConnectionPoolManager {
  private poolSize: number;
  private connections: any[] = [];
  private activeConnections: Set<string> = new Set();
  private connectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    waitingRequests: 0,
    averageWaitTime: 0,
  };

  constructor(poolSize: number = 10) {
    this.poolSize = poolSize;
    this.initializePool();
  }

  private initializePool(): void {
    // Initialize connection pool
    for (let i = 0; i < this.poolSize; i++) {
      this.connections.push({
        id: `conn_${i}`,
        available: true,
        createdAt: new Date(),
        lastUsed: new Date(),
      });
    }
    this.connectionStats.totalConnections = this.poolSize;
  }

  /**
   * Get available connection
   */
  async getConnection(timeout: number = 5000): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const availableConn = this.connections.find((c) => c.available);

      if (availableConn) {
        availableConn.available = false;
        availableConn.lastUsed = new Date();
        this.activeConnections.add(availableConn.id);
        this.connectionStats.activeConnections = this.activeConnections.size;

        return availableConn.id;
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    throw new Error("Connection pool timeout - no available connections");
  }

  /**
   * Release connection back to pool
   */
  releaseConnection(connId: string): void {
    const conn = this.connections.find((c) => c.id === connId);
    if (conn) {
      conn.available = true;
      this.activeConnections.delete(connId);
      this.connectionStats.activeConnections = this.activeConnections.size;
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): typeof this.connectionStats & { utilization: number } {
    return {
      ...this.connectionStats,
      utilization: (this.connectionStats.activeConnections / this.poolSize) * 100,
    };
  }

  /**
   * Health check
   */
  healthCheck(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (this.connectionStats.activeConnections / this.poolSize > 0.8) {
      issues.push("High connection pool utilization");
      recommendations.push("Increase connection pool size");
    }

    if (this.connectionStats.activeConnections === this.poolSize) {
      issues.push("Connection pool exhausted");
      recommendations.push("Critical: Increase pool size or optimize queries");
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

/**
 * Data Compression Engine
 */
export class CompressionEngine {
  /**
   * Compress response data
   */
  static compressResponse(data: AnalyticsSummaryResponse): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    compressed: string;
  } {
    const jsonString = JSON.stringify(data);
    const originalSize = new Blob([jsonString]).size;

    // Simple compression: remove redundant data
    const compressed = {
      v: data.globalData.vitals,
      h: data.globalData.history.map((p) => [p.date, p.linkedin, p.facebook, p.instagram, p.twitter, p.pinterest, p.threads]),
      p: data.globalData.prediction,
      r: data.globalData.radar,
      t: data.globalData.topPosts,
      c: data.globalData.contentInsights,
      d: data.globalData.demographics,
      pd: data.platformData,
    };

    const compressedString = JSON.stringify(compressed);
    const compressedSize = new Blob([compressedString]).size;

    return {
      originalSize,
      compressedSize,
      compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1) as any,
      compressed: compressedString,
    };
  }

  /**
   * Decompress response data
   */
  static decompressResponse(compressed: any): AnalyticsSummaryResponse {
    // Reconstruct original data structure
    return {
      globalData: {
        vitals: compressed.v,
        history: compressed.h.map((h: any[]) => ({
          date: h[0],
          linkedin: h[1],
          facebook: h[2],
          instagram: h[3],
          twitter: h[4],
          pinterest: h[5],
          threads: h[6],
        })),
        prediction: compressed.p,
        radar: compressed.r,
        topPosts: compressed.t,
        contentInsights: compressed.c,
        demographics: compressed.d,
        anomalies: [],
      },
      platformData: compressed.pd,
      platform: "all",
      dateRange: "30D",
      plan: "pro",
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Estimate compression savings
   */
  static estimateSavings(responseCount: number, averageSize: number = 85 * 1024): {
    estimatedMonthlyTraffic: number;
    estimatedMonthlyCompressed: number;
    estimatedBandwidthSavings: string;
  } {
    const monthlyResponses = responseCount * 30;
    const originalTraffic = monthlyResponses * averageSize;

    // Assume 35% compression
    const compressedTraffic = originalTraffic * 0.65;
    const savings = originalTraffic - compressedTraffic;

    return {
      estimatedMonthlyTraffic: Math.round(originalTraffic / 1024 / 1024),
      estimatedMonthlyCompressed: Math.round(compressedTraffic / 1024 / 1024),
      estimatedBandwidthSavings: `${((savings / originalTraffic) * 100).toFixed(1)}%`,
    };
  }
}

/**
 * Database Tuning Analyzer
 */
export class DatabaseTuningAnalyzer {
  /**
   * Analyze slow queries
   */
  static analyzeSlowQueries(queries: Array<{ query: string; timeMs: number; docsScanned: number }>): {
    averageTime: number;
    slowestQueries: any[];
    recommendations: string[];
    optimizationPotential: number;
  } {
    const averageTime = queries.reduce((sum, q) => sum + q.timeMs, 0) / queries.length;
    const slowestQueries = queries.sort((a, b) => b.timeMs - a.timeMs).slice(0, 5);

    const recommendations: string[] = [];
    let optimizationPotential = 0;

    slowestQueries.forEach((q) => {
      if (q.timeMs > 1000) {
        recommendations.push(`Slow query detected (${q.timeMs}ms): Optimize or add index`);
        optimizationPotential += Math.min(50, q.timeMs / 20); // Potential 50% improvement
      }
    });

    const inefficientQueries = queries.filter((q) => q.docsScanned > q.timeMs * 100);
    if (inefficientQueries.length > 0) {
      recommendations.push("Several queries scanning many documents - add indexes");
      optimizationPotential += 30;
    }

    return {
      averageTime,
      slowestQueries,
      recommendations,
      optimizationPotential: Math.min(100, optimizationPotential),
    };
  }

  /**
   * Memory optimization recommendations
   */
  static getMemoryOptimizations(memoryUsage: number, dataSize: number): {
    currentUsage: number;
    recommendedSize: number;
    strategies: string[];
  } {
    const strategies: string[] = [];
    const recommended = dataSize * 1.5; // Rule of thumb: 1.5x data size

    if (memoryUsage > dataSize * 2) {
      strategies.push("Memory usage is high relative to data size");
      strategies.push("Implement data compression");
      strategies.push("Enable document expiration (TTL)");
    }

    if (memoryUsage > recommended) {
      strategies.push("Increase available RAM");
      strategies.push("Implement caching layer");
    }

    strategies.push("Enable WiredTiger compression");
    strategies.push("Optimize index sizes");

    return {
      currentUsage: Math.round(memoryUsage / 1024 / 1024),
      recommendedSize: Math.round(recommended / 1024 / 1024),
      strategies,
    };
  }

  /**
   * Replication lag analysis
   */
  static analyzeReplicationLag(memberStats: Array<{ member: string; lagMs: number }>): {
    maxLag: number;
    averageLag: number;
    healthy: boolean;
    recommendations: string[];
  } {
    const lags = memberStats.map((m) => m.lagMs);
    const maxLag = Math.max(...lags);
    const averageLag = lags.reduce((a, b) => a + b, 0) / lags.length;

    const recommendations: string[] = [];
    let healthy = true;

    if (maxLag > 1000) {
      recommendations.push("High replication lag detected - check network and storage");
      healthy = false;
    }

    if (averageLag > 500) {
      recommendations.push("Average replication lag is elevated - optimize secondaries");
    }

    return {
      maxLag,
      averageLag,
      healthy,
      recommendations,
    };
  }
}

/**
 * Performance Monitoring Dashboard
 */
export class PerformanceDashboard {
  private metrics: Map<string, any[]> = new Map();

  /**
   * Record metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push({
      timestamp: Date.now(),
      value,
      tags,
    });
  }

  /**
   * Get metric summary
   */
  getMetricSummary(name: string, windowMs: number = 60000): {
    count: number;
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const cutoff = Date.now() - windowMs;
    const values = (this.metrics.get(name) || [])
      .filter((m) => m.timestamp > cutoff)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      count: values.length,
      average,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }

  /**
   * Export metrics
   */
  export(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [name, values] of this.metrics.entries()) {
      result[name] = {
        count: values.length,
        recent: values.slice(-100),
        summary: this.getMetricSummary(name),
      };
    }

    return result;
  }

  /**
   * Clear old metrics
   */
  cleanup(olderThanMs: number = 3600000): void {
    const cutoff = Date.now() - olderThanMs;

    for (const [name, values] of this.metrics.entries()) {
      this.metrics.set(
        name,
        values.filter((m) => m.timestamp > cutoff),
      );
    }
  }
}

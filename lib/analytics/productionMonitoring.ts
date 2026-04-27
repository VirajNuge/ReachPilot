/**
 * Production Error Handling & Monitoring
 */

import { ErrorTracker, ProductionMetrics, FeatureFlagsManager, PRODUCTION_CONFIG } from "./deploymentConfig";

// Global instances
export const errorTracker = new ErrorTracker();
export const productionMetrics = new ProductionMetrics();
export const featureFlagsManager = new FeatureFlagsManager(PRODUCTION_CONFIG);

/**
 * Error boundary for API routes
 */
export function withErrorHandling(
  handler: (req: any) => Promise<any>,
  componentName: string,
) {
  return async (req: any) => {
    try {
      const start = performance.now();
      const response = await handler(req);
      const duration = performance.now() - start;

      // Record metrics
      const statusCode = response.status || 200;
      productionMetrics.recordRequest(
        req.url || "unknown",
        duration,
        statusCode,
        response.headers?.get?.("X-Cache") === "HIT",
      );

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errorTracker.trackError(componentName, errorMessage, "high");

      // Log to console in development
      console.error(`❌ Error in ${componentName}:`, errorMessage);

      // Return error response
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          component: componentName,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

/**
 * Get production metrics summary
 */
export function getProductionMetricsSummary() {
  const summary = productionMetrics.getSummary();
  const errors = errorTracker.getSummary(60); // Last 60 minutes

  return {
    metrics: summary,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check feature flag for user
 */
export function isFeatureEnabled(featureName: string, userId: string): boolean {
  return featureFlagsManager.isEnabled(featureName, userId);
}

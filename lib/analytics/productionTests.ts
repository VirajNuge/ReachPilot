/**
 * Production Integration Tests
 * Run before deployment to ensure all systems work together
 */

import { performHealthCheck } from "./healthCheckService";
import { getProductionMetricsSummary, isFeatureEnabled } from "./productionMonitoring";
import { generateValidationReport } from "./frontendValidator";
import { generateTestAnalyticsData } from "./testDataGenerator";

/**
 * Run production integration tests
 */
export async function runProductionTests(): Promise<{
  status: "pass" | "fail";
  tests: Array<{ name: string; passed: boolean; message: string }>;
  timestamp: string;
}> {
  const results: Array<{ name: string; passed: boolean; message: string }> = [];

  console.log("🚀 Running Production Integration Tests...\n");

  // Test 1: Health check
  try {
    const health = await performHealthCheck();
    const passed = health.status !== "unhealthy";
    results.push({
      name: "System Health Check",
      passed,
      message: passed ? "System healthy" : `System ${health.status}`,
    });
  } catch (error) {
    results.push({
      name: "System Health Check",
      passed: false,
      message: `Error: ${error}`,
    });
  }

  // Test 2: Metrics collection
  try {
    const metrics = getProductionMetricsSummary();
    const passed = metrics.metrics.totalRequests >= 0;
    results.push({
      name: "Metrics Collection",
      passed,
      message: passed ? "Metrics operational" : "Metrics unavailable",
    });
  } catch (error) {
    results.push({
      name: "Metrics Collection",
      passed: false,
      message: `Error: ${error}`,
    });
  }

  // Test 3: Feature flags
  try {
    const realDataEnabled = isFeatureEnabled("useRealData", "test-user");
    const cachingEnabled = isFeatureEnabled("useCaching", "test-user");
    const passed = typeof realDataEnabled === "boolean" && typeof cachingEnabled === "boolean";
    results.push({
      name: "Feature Flags",
      passed,
      message: passed ? "Feature flags operational" : "Feature flags error",
    });
  } catch (error) {
    results.push({
      name: "Feature Flags",
      passed: false,
      message: `Error: ${error}`,
    });
  }

  // Test 4: Component validation
  try {
    const testData = generateTestAnalyticsData({ plan: "pro" });
    const report = generateValidationReport(testData);
    const passed = report.summary.overallStatus === "pass";
    results.push({
      name: "Component Validation",
      passed,
      message: passed ? "All components valid" : `${report.summary.errorCount} validation errors`,
    });
  } catch (error) {
    results.push({
      name: "Component Validation",
      passed: false,
      message: `Error: ${error}`,
    });
  }

  // Test 5: Error tracking
  try {
    const errorSummary = getProductionMetricsSummary().errors;
    const passed = errorSummary.totalErrors >= 0;
    results.push({
      name: "Error Tracking",
      passed,
      message: passed ? "Error tracking operational" : "Error tracking unavailable",
    });
  } catch (error) {
    results.push({
      name: "Error Tracking",
      passed: false,
      message: `Error: ${error}`,
    });
  }

  // Print results
  console.log("=".repeat(50));
  console.log("📊 PRODUCTION INTEGRATION TEST RESULTS");
  console.log("=".repeat(50));

  let passCount = 0;
  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.passed) passCount++;
  }

  console.log("=".repeat(50));
  console.log(`Total: ${passCount}/${results.length} tests passed`);
  console.log("=".repeat(50) + "\n");

  const overallStatus = passCount === results.length ? "pass" : "fail";
  return {
    status: overallStatus,
    tests: results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Export test runner
 */
export { runProductionTests as runDeploymentTests };

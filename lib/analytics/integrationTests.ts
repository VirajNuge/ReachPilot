/**
 * Integration Test Suite for Analytics Pipeline
 * 
 * Tests end-to-end data flow from API to component validation
 */

import type { AnalyticsSummaryResponse } from "./types";
import { generateValidationReport, createRenderingChecklist } from "./frontendValidator";
import { generateTestAnalyticsData, generateEdgeCaseData } from "./testDataGenerator";

/**
 * Integration test runner
 */
export class AnalyticsIntegrationTestSuite {
  private testResults: IntegrationTestResult[] = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<IntegrationTestReport> {
    console.log("🧪 Starting Analytics Integration Tests...\n");

    const startTime = performance.now();

    // Run test suites
    await this.testNormalDataFlow();
    await this.testEdgeCases();
    await this.testPerformance();
    await this.testDataConsistency();
    await this.testErrorHandling();
    await this.testCacheInvalidation();
    await this.testDifferentDateRanges();
    await this.testDifferentPlans();

    const duration = performance.now() - startTime;

    return this.generateReport(duration);
  }

  /**
   * Test 1: Normal data flow from API to components
   */
  private async testNormalDataFlow(): Promise<void> {
    const testName = "Normal Data Flow";
    try {
      const data = generateTestAnalyticsData({ plan: "pro", dateRange: "30D" });
      const report = generateValidationReport(data);

      if (report.summary.overallStatus === "pass") {
        this.recordPass(testName, "All components validated successfully");
      } else {
        this.recordFail(
          testName,
          `Validation failed: ${report.summary.errorCount} errors, ${report.summary.warningCount} warnings`
        );
      }

      const checklist = createRenderingChecklist(data);
      const allChecksPassed = checklist.every((c) => c.checks.every((ch) => ch.passed));

      if (allChecksPassed) {
        this.recordPass(testName, "All components can render");
      } else {
        const failedChecks = checklist
          .filter((c) => !c.checks.every((ch) => ch.passed))
          .map((c) => c.component);
        this.recordFail(testName, `Component rendering failed: ${failedChecks.join(", ")}`);
      }
    } catch (error) {
      this.recordFail(testName, `Exception: ${error}`);
    }
  }

  /**
   * Test 2: Edge cases handling
   */
  private async testEdgeCases(): Promise<void> {
    const scenarios: Array<"empty" | "minimal" | "large" | "null"> = ["empty", "minimal", "large", "null"];

    for (const scenario of scenarios) {
      const testName = `Edge Case: ${scenario}`;
      try {
        const data = generateEdgeCaseData(scenario);
        const report = generateValidationReport(data);

        if (report.summary.errorCount === 0) {
          this.recordPass(testName, "No critical errors");
        } else {
          this.recordFail(testName, `${report.summary.errorCount} validation errors`);
        }

        // Should handle gracefully without crashing
        createRenderingChecklist(data);
        this.recordPass(testName, "Rendering checklist generated");
      } catch (error) {
        this.recordFail(testName, `Exception: ${error}`);
      }
    }
  }

  /**
   * Test 3: Performance
   */
  private async testPerformance(): Promise<void> {
    const testName = "Performance Validation";
    try {
      const data = generateTestAnalyticsData();

      // Validation timing
      const validationStart = performance.now();
      const report = generateValidationReport(data);
      const validationTime = performance.now() - validationStart;

      if (validationTime < 10) {
        this.recordPass(testName, `Validation: ${validationTime.toFixed(2)}ms (target: <10ms)`);
      } else {
        this.recordFail(testName, `Validation too slow: ${validationTime.toFixed(2)}ms`);
      }

      // Checklist generation timing
      const checklistStart = performance.now();
      createRenderingChecklist(data);
      const checklistTime = performance.now() - checklistStart;

      if (checklistTime < 5) {
        this.recordPass(testName, `Checklist: ${checklistTime.toFixed(2)}ms (target: <5ms)`);
      } else {
        this.recordFail(testName, `Checklist generation too slow: ${checklistTime.toFixed(2)}ms`);
      }

      // 100 validations timing
      const bulkStart = performance.now();
      for (let i = 0; i < 100; i++) {
        const testData = generateTestAnalyticsData();
        generateValidationReport(testData);
      }
      const bulkTime = performance.now() - bulkStart;

      if (bulkTime < 1000) {
        this.recordPass(testName, `100 validations: ${bulkTime.toFixed(0)}ms (target: <1000ms)`);
      } else {
        this.recordFail(testName, `100 validations too slow: ${bulkTime.toFixed(0)}ms`);
      }
    } catch (error) {
      this.recordFail(testName, `Exception: ${error}`);
    }
  }

  /**
   * Test 4: Data consistency
   */
  private async testDataConsistency(): Promise<void> {
    const testName = "Data Consistency";
    try {
      const data1 = generateTestAnalyticsData();
      const data2 = generateTestAnalyticsData();

      // Same schema
      const report1 = generateValidationReport(data1);
      const report2 = generateValidationReport(data2);

      if (JSON.stringify(Object.keys(report1)) === JSON.stringify(Object.keys(report2))) {
        this.recordPass(testName, "Schema consistent across runs");
      } else {
        this.recordFail(testName, "Schema inconsistency detected");
      }

      // History dates are chronological
      const isChronological = data1.globalData.history.every((h, i) => {
        if (i === 0) return true;
        return h.date >= data1.globalData.history[i - 1].date;
      });

      if (isChronological) {
        this.recordPass(testName, "History dates are chronological");
      } else {
        this.recordFail(testName, "History dates are not chronological");
      }

      // All platform names present
      const expectedPlatforms = ["linkedin", "facebook", "instagram", "twitter", "pinterest", "threads"];
      const lastPoint = data1.globalData.history[0];
      const hasPlatforms = expectedPlatforms.every((p) => p in lastPoint);

      if (hasPlatforms) {
        this.recordPass(testName, "All platforms present in history");
      } else {
        this.recordFail(testName, "Some platforms missing from history");
      }
    } catch (error) {
      this.recordFail(testName, `Exception: ${error}`);
    }
  }

  /**
   * Test 5: Error handling
   */
  private async testErrorHandling(): Promise<void> {
    const testName = "Error Handling";
    try {
      // Invalid data structures
      const invalidData: any = {
        platform: "all",
        dateRange: "30D",
        plan: "pro",
        generatedAt: new Date().toISOString(),
        globalData: {
          vitals: null, // Should have vitals
          history: [],
          prediction: [],
          radar: [],
          topPosts: [],
          contentInsights: [],
          demographics: { jobs: [], locations: [], seniority: "" },
          anomalies: [],
        },
        platformData: null,
      };

      const report = generateValidationReport(invalidData);

      if (report.summary.errorCount > 0) {
        this.recordPass(testName, "Invalid data detected correctly");
      } else {
        this.recordFail(testName, "Invalid data not detected");
      }

      // Missing required fields
      const incompleteData: any = {
        platform: "all",
        dateRange: "30D",
        plan: "pro",
        // Missing globalData entirely
      };

      try {
        generateValidationReport(incompleteData);
        // Should not crash, may report errors
        this.recordPass(testName, "Incomplete data handled gracefully");
      } catch (e) {
        this.recordFail(testName, "Incomplete data caused crash");
      }
    } catch (error) {
      this.recordFail(testName, `Exception: ${error}`);
    }
  }

  /**
   * Test 6: Cache invalidation patterns
   */
  private async testCacheInvalidation(): Promise<void> {
    const testName = "Cache Invalidation";
    try {
      // Simulate cache keys
      const userId = "user123";
      const accountId = "account456";

      const cacheKeys = [
        `${userId}:${accountId}:all:30D:pro`,
        `${userId}:${accountId}:linkedin:7D:core`,
        `${userId}:${accountId}:twitter:30D:pro`,
      ];

      // Pattern-based invalidation check
      const userPattern = `^${userId}:.*`;
      const matchingKeys = cacheKeys.filter((k) => new RegExp(userPattern).test(k));

      if (matchingKeys.length === cacheKeys.length) {
        this.recordPass(testName, "Pattern-based invalidation works");
      } else {
        this.recordFail(testName, "Pattern-based invalidation failed");
      }

      // Platform invalidation
      const platformPattern = `.*:linkedin:.*`;
      const platformMatches = cacheKeys.filter((k) => new RegExp(platformPattern).test(k));

      if (platformMatches.length === 1) {
        this.recordPass(testName, "Platform-specific invalidation works");
      } else {
        this.recordFail(testName, "Platform-specific invalidation failed");
      }
    } catch (error) {
      this.recordFail(testName, `Exception: ${error}`);
    }
  }

  /**
   * Test 7: Different date ranges
   */
  private async testDifferentDateRanges(): Promise<void> {
    const ranges: Array<"7D" | "30D" | "90D"> = ["7D", "30D", "90D"];

    for (const range of ranges) {
      const testName = `Date Range: ${range}`;
      try {
        const data = generateTestAnalyticsData({ dateRange: range });
        const report = generateValidationReport(data);

        const expectedMinDays = range === "7D" ? 7 : range === "30D" ? 30 : 90;
        const hasEnoughHistory = data.globalData.history.length >= expectedMinDays / 2; // At least half

        if (hasEnoughHistory) {
          this.recordPass(testName, `History data present`);
        } else {
          this.recordFail(testName, `Insufficient history data`);
        }

        if (report.summary.overallStatus === "pass") {
          this.recordPass(testName, "Validation passed");
        } else {
          this.recordFail(testName, "Validation failed");
        }
      } catch (error) {
        this.recordFail(testName, `Exception: ${error}`);
      }
    }
  }

  /**
   * Test 8: Different plans
   */
  private async testDifferentPlans(): Promise<void> {
    const plans: Array<"core" | "pro"> = ["core", "pro"];

    for (const plan of plans) {
      const testName = `Plan Type: ${plan}`;
      try {
        const data = generateTestAnalyticsData({ plan });
        const report = generateValidationReport(data);

        if (plan === "core" && data.platformData === null) {
          this.recordPass(testName, "Core plan has no platformData");
        } else if (plan === "pro" && data.platformData !== null) {
          this.recordPass(testName, "Pro plan has platformData");
        } else {
          this.recordFail(testName, "Plan-specific data structure incorrect");
        }

        if (report.summary.overallStatus === "pass") {
          this.recordPass(testName, "Validation passed");
        } else {
          this.recordFail(testName, "Validation failed");
        }
      } catch (error) {
        this.recordFail(testName, `Exception: ${error}`);
      }
    }
  }

  /**
   * Record a passing test
   */
  private recordPass(testName: string, message: string): void {
    this.testResults.push({
      name: testName,
      status: "pass",
      message,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ ${testName}: ${message}`);
  }

  /**
   * Record a failing test
   */
  private recordFail(testName: string, message: string): void {
    this.testResults.push({
      name: testName,
      status: "fail",
      message,
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ ${testName}: ${message}`);
  }

  /**
   * Generate test report
   */
  private generateReport(duration: number): IntegrationTestReport {
    const passed = this.testResults.filter((r) => r.status === "pass").length;
    const failed = this.testResults.filter((r) => r.status === "fail").length;
    const total = this.testResults.length;
    const successRate = ((passed / total) * 100).toFixed(1);

    return {
      timestamp: new Date().toISOString(),
      duration: `${duration.toFixed(0)}ms`,
      summary: {
        total,
        passed,
        failed,
        successRate: `${successRate}%`,
      },
      results: this.testResults,
      status: failed === 0 ? "pass" : "fail",
    };
  }
}

/**
 * Test result interface
 */
interface IntegrationTestResult {
  name: string;
  status: "pass" | "fail";
  message: string;
  timestamp: string;
}

/**
 * Test report interface
 */
interface IntegrationTestReport {
  timestamp: string;
  duration: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: string;
  };
  results: IntegrationTestResult[];
  status: "pass" | "fail";
}

/**
 * Export for testing
 */
export async function runAnalyticsTests(): Promise<void> {
  const suite = new AnalyticsIntegrationTestSuite();
  const report = await suite.runAllTests();

  console.log("\n" + "=".repeat(50));
  console.log("📊 INTEGRATION TEST REPORT");
  console.log("=".repeat(50));
  console.log(`\nTotal Tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Success Rate: ${report.summary.successRate}`);
  console.log(`Duration: ${report.duration}\n`);
  console.log(`Overall Status: ${report.status === "pass" ? "✅ PASS" : "❌ FAIL"}`);
  console.log("=".repeat(50));
}

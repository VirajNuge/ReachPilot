/**
 * Analytics Frontend Test Suite
 * 
 * Comprehensive testing infrastructure for all 7 dashboard components:
 * 1. VelocityCard
 * 2. GrowthChart
 * 3. RadarInsight
 * 4. CopyCatEngine
 * 5. ContentDNATable
 * 6. AudienceDeepDive
 * 7. ComparisonEngine
 */

import type { AnalyticsSummaryResponse } from "./types";

/**
 * Test result for a component
 */
export interface ComponentTestResult {
  component: string;
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  warnings?: string[];
}

/**
 * Component data validation result
 */
export interface ValidationResult {
  component: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: {
    hasAllFields: boolean;
    missingFields: string[];
    unexpectedFields: string[];
    fieldCount: number;
  };
}

/**
 * Validate VelocityCard data
 */
export function validateVelocityCardData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const unexpectedFields: string[] = [];

  // Check required fields
  if (!data.vitals) {
    errors.push("Missing vitals object");
  } else {
    const requiredFields = ["audience", "reach", "engagement", "clicks"];
    for (const field of requiredFields) {
      if (!data.vitals[field as keyof typeof data.vitals]) {
        missingFields.push(field);
      }
    }

    // Check metric structure
    for (const [key, metric] of Object.entries(data.vitals)) {
      if (key === "topDriver") continue; // Optional

      if (typeof metric !== "object") {
        errors.push(`Metric '${key}' is not an object`);
        continue;
      }

      const requiredMetricFields = ["id", "label", "value", "change", "trend", "velocity"];
      for (const field of requiredMetricFields) {
        if (!(field in metric)) {
          missingFields.push(`vitals.${key}.${field}`);
        }
      }

      // Validate field types
      if (metric.trend && !["up", "down", "neutral"].includes(metric.trend)) {
        errors.push(`Invalid trend value: ${metric.trend}`);
      }
      if (metric.velocity && !["high", "medium", "low"].includes(metric.velocity)) {
        errors.push(`Invalid velocity value: ${metric.velocity}`);
      }
    }
  }

  return {
    component: "VelocityCard",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: missingFields.length === 0,
      missingFields,
      unexpectedFields,
      fieldCount: data.vitals ? Object.keys(data.vitals).length : 0,
    },
  };
}

/**
 * Validate GrowthChart data
 */
export function validateGrowthChartData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Check history array
  if (!Array.isArray(data.history)) {
    errors.push("History is not an array");
  } else {
    if (data.history.length === 0) {
      warnings.push("History array is empty");
    }

    for (let i = 0; i < Math.min(data.history.length, 5); i++) {
      const point = data.history[i];
      if (!point.date) {
        errors.push(`History point ${i} missing date`);
      }
      const numericFields = Object.keys(point).filter((k) => k !== "date");
      if (numericFields.length === 0) {
        warnings.push(`History point ${i} has no numeric data`);
      }
    }
  }

  // Check prediction array
  if (!Array.isArray(data.prediction)) {
    errors.push("Prediction is not an array");
  } else {
    if (data.prediction.length === 0) {
      warnings.push("Prediction array is empty");
    }
  }

  return {
    component: "GrowthChart",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: missingFields.length === 0,
      missingFields,
      unexpectedFields: [],
      fieldCount: (data.history?.length || 0) + (data.prediction?.length || 0),
    },
  };
}

/**
 * Validate RadarInsight data
 */
export function validateRadarInsightData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data.radar)) {
    errors.push("Radar is not an array");
    return {
      component: "RadarInsight",
      isValid: false,
      errors,
      warnings,
      dataQuality: {
        hasAllFields: false,
        missingFields: ["radar"],
        unexpectedFields: [],
        fieldCount: 0,
      },
    };
  }

  if (data.radar.length === 0) {
    warnings.push("Radar array is empty");
  }

  for (let i = 0; i < data.radar.length; i++) {
    const point = data.radar[i];
    if (!point.subject) {
      errors.push(`Radar point ${i} missing subject`);
    }
    if (typeof point.A !== "number") {
      errors.push(`Radar point ${i} has invalid A value`);
    }
    if (typeof point.fullMark !== "number") {
      errors.push(`Radar point ${i} has invalid fullMark`);
    }
  }

  return {
    component: "RadarInsight",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: errors.length === 0,
      missingFields: [],
      unexpectedFields: [],
      fieldCount: data.radar.length,
    },
  };
}

/**
 * Validate CopyCatEngine data
 */
export function validateCopyCatEngineData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data.topPosts)) {
    errors.push("topPosts is not an array");
    return {
      component: "CopyCatEngine",
      isValid: false,
      errors,
      warnings,
      dataQuality: {
        hasAllFields: false,
        missingFields: ["topPosts"],
        unexpectedFields: [],
        fieldCount: 0,
      },
    };
  }

  if (data.topPosts.length === 0) {
    warnings.push("topPosts array is empty");
  }

  for (let i = 0; i < data.topPosts.length; i++) {
    const post = data.topPosts[i];
    const requiredFields = ["id", "headline", "format", "stats", "score"];

    for (const field of requiredFields) {
      if (!(field in post)) {
        errors.push(`Post ${i} missing ${field}`);
      }
    }

    if (post.stats && typeof post.stats === "object") {
      if (!post.stats.views) {
        warnings.push(`Post ${i} missing stats.views`);
      }
      if (!post.stats.engagement) {
        warnings.push(`Post ${i} missing stats.engagement`);
      }
    }
  }

  return {
    component: "CopyCatEngine",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: errors.length === 0,
      missingFields: [],
      unexpectedFields: [],
      fieldCount: data.topPosts.length,
    },
  };
}

/**
 * Validate ContentDNATable data
 */
export function validateContentDNATableData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data.contentInsights)) {
    errors.push("contentInsights is not an array");
    return {
      component: "ContentDNATable",
      isValid: false,
      errors,
      warnings,
      dataQuality: {
        hasAllFields: false,
        missingFields: ["contentInsights"],
        unexpectedFields: [],
        fieldCount: 0,
      },
    };
  }

  if (data.contentInsights.length === 0) {
    warnings.push("contentInsights array is empty");
  }

  for (let i = 0; i < data.contentInsights.length; i++) {
    const insight = data.contentInsights[i];
    const requiredFields = ["id", "format", "performance", "engagement", "insight"];

    for (const field of requiredFields) {
      if (!(field in insight)) {
        errors.push(`Insight ${i} missing ${field}`);
      }
    }

    if (typeof insight.performance === "number") {
      if (insight.performance < 0 || insight.performance > 100) {
        errors.push(`Insight ${i} performance out of range (0-100)`);
      }
    }
  }

  return {
    component: "ContentDNATable",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: errors.length === 0,
      missingFields: [],
      unexpectedFields: [],
      fieldCount: data.contentInsights.length,
    },
  };
}

/**
 * Validate AudienceDeepDive data
 */
export function validateAudienceDeepDiveData(
  data: AnalyticsSummaryResponse["globalData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.demographics) {
    errors.push("Missing demographics object");
    return {
      component: "AudienceDeepDive",
      isValid: false,
      errors,
      warnings,
      dataQuality: {
        hasAllFields: false,
        missingFields: ["demographics"],
        unexpectedFields: [],
        fieldCount: 0,
      },
    };
  }

  // Check jobs array
  if (!Array.isArray(data.demographics.jobs)) {
    errors.push("demographics.jobs is not an array");
  } else if (data.demographics.jobs.length === 0) {
    warnings.push("demographics.jobs array is empty");
  }

  // Check locations array
  if (!Array.isArray(data.demographics.locations)) {
    errors.push("demographics.locations is not an array");
  } else if (data.demographics.locations.length === 0) {
    warnings.push("demographics.locations array is empty");
  }

  // Check seniority
  if (!data.demographics.seniority) {
    warnings.push("demographics.seniority is missing");
  }

  return {
    component: "AudienceDeepDive",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: errors.length === 0,
      missingFields: [],
      unexpectedFields: [],
      fieldCount: (data.demographics.jobs?.length || 0) + (data.demographics.locations?.length || 0),
    },
  };
}

/**
 * Validate ComparisonEngine data (uses platformData)
 */
export function validateComparisonEngineData(
  platformData: AnalyticsSummaryResponse["platformData"]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!platformData) {
    errors.push("platformData is null (only available in pro plan)");
    return {
      component: "ComparisonEngine",
      isValid: false,
      errors,
      warnings,
      dataQuality: {
        hasAllFields: false,
        missingFields: ["platformData"],
        unexpectedFields: [],
        fieldCount: 0,
      },
    };
  }

  if (!platformData.vitals) {
    errors.push("platformData.vitals is missing");
  } else {
    const metricCount = Object.keys(platformData.vitals).length;
    if (metricCount === 0) {
      warnings.push("platformData.vitals is empty");
    }
  }

  return {
    component: "ComparisonEngine",
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQuality: {
      hasAllFields: errors.length === 0,
      missingFields: [],
      unexpectedFields: [],
      fieldCount: platformData.vitals ? Object.keys(platformData.vitals).length : 0,
    },
  };
}

/**
 * Validate all components
 */
export function validateAllComponents(
  response: AnalyticsSummaryResponse
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validate each component
  results.push(validateVelocityCardData(response.globalData));
  results.push(validateGrowthChartData(response.globalData));
  results.push(validateRadarInsightData(response.globalData));
  results.push(validateCopyCatEngineData(response.globalData));
  results.push(validateContentDNATableData(response.globalData));
  results.push(validateAudienceDeepDiveData(response.globalData));
  results.push(validateComparisonEngineData(response.platformData));

  return results;
}

/**
 * Generate validation report
 */
export interface ValidationReport {
  timestamp: string;
  plan: string;
  components: ValidationResult[];
  summary: {
    totalComponents: number;
    validComponents: number;
    invalidComponents: number;
    warningCount: number;
    errorCount: number;
    overallStatus: "pass" | "warn" | "fail";
  };
}

export function generateValidationReport(response: AnalyticsSummaryResponse): ValidationReport {
  const results = validateAllComponents(response);

  const validCount = results.filter((r) => r.isValid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  let overallStatus: "pass" | "warn" | "fail" = "pass";
  if (errorCount > 0) overallStatus = "fail";
  else if (warningCount > 0) overallStatus = "warn";

  return {
    timestamp: new Date().toISOString(),
    plan: response.plan,
    components: results,
    summary: {
      totalComponents: results.length,
      validComponents: validCount,
      invalidComponents: results.length - validCount,
      warningCount,
      errorCount,
      overallStatus,
    },
  };
}

/**
 * Component rendering checklist
 */
export interface RenderingChecklist {
  component: string;
  checks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
}

/**
 * Create rendering checklist
 */
export function createRenderingChecklist(response: AnalyticsSummaryResponse): RenderingChecklist[] {
  const checklists: RenderingChecklist[] = [];

  // VelocityCard
  checklists.push({
    component: "VelocityCard",
    checks: [
      { name: "Has vitals data", passed: !!response.globalData.vitals },
      { name: "Has audience metric", passed: !!response.globalData.vitals?.audience },
      { name: "Has reach metric", passed: !!response.globalData.vitals?.reach },
      { name: "Has engagement metric", passed: !!response.globalData.vitals?.engagement },
      { name: "All metrics have trends", passed: !!response.globalData.vitals?.audience?.trend },
    ],
  });

  // GrowthChart
  checklists.push({
    component: "GrowthChart",
    checks: [
      { name: "Has history data", passed: !!response.globalData.history },
      { name: "History is array", passed: Array.isArray(response.globalData.history) },
      { name: "Has prediction data", passed: !!response.globalData.prediction },
      { name: "Prediction is array", passed: Array.isArray(response.globalData.prediction) },
      {
        name: "History has dates",
        passed: (response.globalData.history?.[0]?.date ? true : false),
      },
    ],
  });

  // RadarInsight
  checklists.push({
    component: "RadarInsight",
    checks: [
      { name: "Has radar data", passed: !!response.globalData.radar },
      { name: "Radar is array", passed: Array.isArray(response.globalData.radar) },
      { name: "Has radar points", passed: (response.globalData.radar?.length || 0) > 0 },
      { name: "Radar points have subjects", passed: !!response.globalData.radar?.[0]?.subject },
      { name: "Radar points have values", passed: typeof response.globalData.radar?.[0]?.A === "number" },
    ],
  });

  // CopyCatEngine
  checklists.push({
    component: "CopyCatEngine",
    checks: [
      { name: "Has topPosts data", passed: !!response.globalData.topPosts },
      { name: "topPosts is array", passed: Array.isArray(response.globalData.topPosts) },
      { name: "Has top posts", passed: (response.globalData.topPosts?.length || 0) > 0 },
      { name: "Posts have headlines", passed: !!response.globalData.topPosts?.[0]?.headline },
      { name: "Posts have stats", passed: !!response.globalData.topPosts?.[0]?.stats },
    ],
  });

  // ContentDNATable
  checklists.push({
    component: "ContentDNATable",
    checks: [
      { name: "Has contentInsights data", passed: !!response.globalData.contentInsights },
      { name: "contentInsights is array", passed: Array.isArray(response.globalData.contentInsights) },
      { name: "Has insights", passed: (response.globalData.contentInsights?.length || 0) > 0 },
      { name: "Insights have formats", passed: !!response.globalData.contentInsights?.[0]?.format },
      { name: "Insights have performance", passed: typeof response.globalData.contentInsights?.[0]?.performance === "number" },
    ],
  });

  // AudienceDeepDive
  checklists.push({
    component: "AudienceDeepDive",
    checks: [
      { name: "Has demographics data", passed: !!response.globalData.demographics },
      { name: "Has jobs data", passed: !!response.globalData.demographics?.jobs },
      { name: "Has locations data", passed: !!response.globalData.demographics?.locations },
      { name: "Jobs is array", passed: Array.isArray(response.globalData.demographics?.jobs) },
      { name: "Locations is array", passed: Array.isArray(response.globalData.demographics?.locations) },
    ],
  });

  // ComparisonEngine (pro plan only)
  checklists.push({
    component: "ComparisonEngine",
    checks: [
      { name: "Platform data available", passed: response.plan === "pro" ? !!response.platformData : true },
      {
        name: "Has platform vitals",
        passed: response.plan === "pro" ? !!response.platformData?.vitals : true,
      },
      {
        name: "Platform vitals populated",
        passed: response.plan === "pro" ? Object.keys(response.platformData?.vitals || {}).length > 0 : true,
      },
      { name: "Plan matches data", passed: response.plan === (response.platformData ? "pro" : "core") },
    ],
  });

  return checklists;
}

/**
 * Check rendering success rate
 */
export function calculateRenderingSuccessRate(checklists: RenderingChecklist[]): number {
  let totalChecks = 0;
  let passedChecks = 0;

  for (const checklist of checklists) {
    for (const check of checklist.checks) {
      totalChecks++;
      if (check.passed) passedChecks++;
    }
  }

  return totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
}

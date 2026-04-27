/**
 * Test Data Generators for Frontend Testing
 * 
 * Generates realistic analytics data for testing all 7 components
 */

import type { AnalyticsSummaryResponse } from "./types";

/**
 * Generate realistic test analytics data
 */
export function generateTestAnalyticsData(options: {
  platform?: string;
  dateRange?: string;
  plan?: string;
  includeAnomalies?: boolean;
  includeGaps?: boolean;
} = {}): AnalyticsSummaryResponse {
  const {
    platform = "all",
    dateRange = "30D",
    plan = "pro",
    includeAnomalies = false,
    includeGaps = false,
  } = options;

  const now = new Date();
  const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;

  // Generate history data
  const history = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Realistic engagement rate with trend
    const baseEngagement = 0.05 + (i / days) * 0.03;
    const variance = Math.random() * 0.02 - 0.01;
    const anomaly = includeAnomalies && Math.random() < 0.1 ? Math.random() * 0.02 : 0;

    const value = Math.max(0, baseEngagement + variance + anomaly);

    history.push({
      date: dateStr,
      all: value,
      linkedin: value * 1.2,
      facebook: value * 0.9,
      instagram: value * 1.1,
      twitter: value * 0.8,
      pinterest: value * 0.7,
      threads: value * 0.6,
    });
  }

  // Generate prediction data (simple trend continuation)
  const prediction = [];
  for (let i = 0; i < 7; i++) {
    const lastValue = history[history.length - 1];
    const predicted = {
      date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      all: lastValue.all * (1 + Math.random() * 0.02),
      linkedin: lastValue.linkedin * (1 + Math.random() * 0.02),
      facebook: lastValue.facebook * (1 + Math.random() * 0.02),
      instagram: lastValue.instagram * (1 + Math.random() * 0.02),
      twitter: lastValue.twitter * (1 + Math.random() * 0.02),
      pinterest: lastValue.pinterest * (1 + Math.random() * 0.02),
      threads: lastValue.threads * (1 + Math.random() * 0.02),
    };
    prediction.push(predicted);
  }

  // Generate top posts
  const formats = ["carousel", "video", "image", "text", "article"];
  const topPosts = [];
  for (let i = 0; i < 5; i++) {
    const format = formats[Math.floor(Math.random() * formats.length)];
    topPosts.push({
      id: 1000 + i,
      headline: `Top performing ${format} post #${i + 1}`,
      format,
      stats: {
        views: `${Math.floor(Math.random() * 50000 + 10000)}`,
        engagement: `${(Math.random() * 15 + 3).toFixed(1)}%`,
      },
      score: Math.floor(Math.random() * 30 + 70),
      whyItWorked: `Strong ${format} engagement with strategic timing`,
    });
  }

  // Generate content insights
  const contentInsights = formats.map((format, idx) => ({
    id: idx,
    format,
    performance: Math.floor(Math.random() * 40 + 60),
    engagement: `${(Math.random() * 15 + 3).toFixed(1)}%`,
    insight: `${format} posts perform ${Math.random() > 0.5 ? "above" : "below"} average`,
    action: `Continue posting ${format} content strategically`,
  }));

  return {
    platform: platform as any,
    dateRange: dateRange as any,
    plan: plan as any,
    generatedAt: new Date().toISOString(),
    globalData: {
      vitals: {
        audience: {
          id: "followers",
          label: "Total Followers",
          value: "15K",
          change: Math.floor(Math.random() * 1000),
          trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "down" : "neutral",
          velocity: Math.random() > 0.4 ? "high" : Math.random() > 0.7 ? "medium" : "low",
        },
        reach: {
          id: "impressions",
          label: "Total Impressions",
          value: "45K",
          change: Math.floor(Math.random() * 5000),
          trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "down" : "neutral",
          velocity: Math.random() > 0.4 ? "high" : Math.random() > 0.7 ? "medium" : "low",
        },
        engagement: {
          id: "engagement",
          label: "Total Engagements",
          value: "2.5K",
          change: Math.floor(Math.random() * 500),
          trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "down" : "neutral",
          velocity: Math.random() > 0.4 ? "high" : Math.random() > 0.7 ? "medium" : "low",
        },
        clicks: {
          id: "clicks",
          label: "Total Clicks",
          value: "1.2K",
          change: Math.floor(Math.random() * 300),
          trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "down" : "neutral",
          velocity: Math.random() > 0.4 ? "high" : Math.random() > 0.7 ? "medium" : "low",
        },
      },
      history,
      prediction,
      radar: [
        { subject: "LINKEDIN", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
        { subject: "FACEBOOK", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
        { subject: "INSTAGRAM", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
        { subject: "TWITTER", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
        { subject: "PINTEREST", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
        { subject: "THREADS", A: Math.floor(Math.random() * 40 + 60), fullMark: 100 },
      ],
      contentInsights,
      demographics: {
        jobs: [
          { name: "Software Engineer", value: Math.floor(Math.random() * 300 + 200) },
          { name: "Product Manager", value: Math.floor(Math.random() * 200 + 100) },
          { name: "Designer", value: Math.floor(Math.random() * 150 + 80) },
          { name: "Marketing", value: Math.floor(Math.random() * 120 + 60) },
          { name: "Other", value: Math.floor(Math.random() * 100 + 50) },
        ],
        locations: [
          { city: "San Francisco", percent: 15 },
          { city: "New York", percent: 12 },
          { city: "Los Angeles", percent: 10 },
          { city: "Seattle", percent: 8 },
          { city: "Other", percent: 55 },
        ],
        seniority: "Mixed",
      },
      anomalies: includeAnomalies
        ? [
            {
              date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              type: "spike",
              value: 45,
              icon: "📈",
              reason: "Viral post engagement spike",
            },
            {
              date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              type: "drop",
              value: 30,
              icon: "📉",
              reason: "Lower than normal engagement",
            },
          ]
        : [],
      topPosts,
    },
    platformData:
      plan === "pro"
        ? {
            vitals: {
              audience: {
                id: "followers",
                label: `Followers (${platform})`,
                value: "5K",
                change: Math.floor(Math.random() * 300),
                trend: Math.random() > 0.3 ? "up" : "down",
                velocity: Math.random() > 0.4 ? "high" : "medium",
              },
              reach: {
                id: "impressions",
                label: `Impressions (${platform})`,
                value: "15K",
                change: Math.floor(Math.random() * 2000),
                trend: Math.random() > 0.3 ? "up" : "down",
                velocity: Math.random() > 0.4 ? "high" : "medium",
              },
              engagement: {
                id: "engagement",
                label: `Engagements (${platform})`,
                value: "800",
                change: Math.floor(Math.random() * 150),
                trend: Math.random() > 0.3 ? "up" : "down",
                velocity: Math.random() > 0.4 ? "high" : "medium",
              },
              clicks: {
                id: "clicks",
                label: `Clicks (${platform})`,
                value: "300",
                change: Math.floor(Math.random() * 100),
                trend: Math.random() > 0.3 ? "up" : "down",
                velocity: Math.random() > 0.4 ? "high" : "medium",
              },
            },
            history: history.slice(-7),
            prediction: prediction.slice(0, 3),
            radar: [],
            contentInsights: [],
            demographics: {
              jobs: [],
              locations: [],
              seniority: "",
            },
            anomalies: [],
            topPosts: [],
          }
        : null,
  };
}

/**
 * Generate edge case test data
 */
export function generateEdgeCaseData(scenario: "empty" | "minimal" | "large" | "null"): AnalyticsSummaryResponse {
  const base = generateTestAnalyticsData();

  switch (scenario) {
    case "empty":
      return {
        ...base,
        globalData: {
          ...base.globalData,
          history: [],
          prediction: [],
          radar: [],
          topPosts: [],
          contentInsights: [],
          demographics: {
            jobs: [],
            locations: [],
            seniority: "",
          },
          anomalies: [],
        },
        platformData: null,
      };

    case "minimal":
      return {
        ...base,
        globalData: {
          ...base.globalData,
          history: base.globalData.history.slice(-1),
          prediction: base.globalData.prediction.slice(0, 1),
          radar: base.globalData.radar.slice(0, 2),
          topPosts: base.globalData.topPosts.slice(0, 1),
          contentInsights: base.globalData.contentInsights.slice(0, 1),
        },
      };

    case "large":
      return {
        ...base,
        plan: "pro",
        globalData: {
          ...base.globalData,
          topPosts: Array.from({ length: 50 }, (_, i) => ({
            id: 1000 + i,
            headline: `Post ${i + 1}`,
            format: ["carousel", "video", "image"][i % 3],
            stats: { views: `${Math.random() * 100000}`, engagement: `${Math.random() * 20}%` },
            score: Math.floor(Math.random() * 100),
            whyItWorked: "Strong engagement",
          })),
          contentInsights: Array.from({ length: 20 }, (_, i) => ({
            id: i,
            format: `Format ${i}`,
            performance: Math.floor(Math.random() * 100),
            engagement: `${Math.random() * 20}%`,
            insight: "Performance insight",
            action: "Continue posting",
          })),
        },
      };

    case "null":
      return {
        ...base,
        plan: "core",
        platformData: null,
      };
  }
}

/**
 * Generate performance test data
 */
export function generatePerformanceTestData(count: number): AnalyticsSummaryResponse[] {
  return Array.from({ length: count }, (_, i) => ({
    ...generateTestAnalyticsData({
      plan: i % 2 === 0 ? "pro" : "core",
      includeAnomalies: i % 3 === 0,
    }),
  }));
}

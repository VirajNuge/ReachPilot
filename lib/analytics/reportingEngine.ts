/**
 * Advanced Reporting & Export System
 * Generate comprehensive reports in multiple formats
 */

import type { AnalyticsSummaryResponse } from "./types";

/**
 * Report Generator - Creates comprehensive analytics reports
 */
export class ReportGenerator {
  /**
   * Generate executive summary report
   */
  static generateExecutiveSummary(data: AnalyticsSummaryResponse): {
    title: string;
    period: string;
    summary: string;
    keyMetrics: Record<string, string | number>;
    highlights: string[];
    challenges: string[];
    opportunities: string[];
  } {
    const vitals = data.globalData.vitals;
    const history = data.globalData.history;
    const topPosts = data.globalData.topPosts;

    // Calculate growth
    const recentGrowth = history.length > 7 ? history.slice(-7) : history;
    const avgRecent = recentGrowth.reduce(
      (sum, h) =>
        sum +
        (
          Number(h.linkedin ?? 0) +
          Number(h.facebook ?? 0) +
          Number(h.instagram ?? 0) +
          Number(h.twitter ?? 0) +
          Number(h.pinterest ?? 0) +
          Number(h.threads ?? 0)
        ) / 6,
      0,
    ) / Math.max(1, recentGrowth.length);
    const avgPrevious = history.length > 14
      ? history
          .slice(-14, -7)
          .reduce(
            (sum, h) =>
              sum +
              (
                Number(h.linkedin ?? 0) +
                Number(h.facebook ?? 0) +
                Number(h.instagram ?? 0) +
                Number(h.twitter ?? 0) +
                Number(h.pinterest ?? 0) +
                Number(h.threads ?? 0)
              ) / 6,
            0,
          ) / Math.max(1, Math.min(7, history.length - 7))
      : avgRecent;

    const growthRate = avgPrevious !== 0 ? ((avgRecent - avgPrevious) / avgPrevious) * 100 : 0;

    const highlights: string[] = [];
    const challenges: string[] = [];
    const opportunities: string[] = [];

    if (growthRate > 10) {
      highlights.push(`Strong growth trend: +${growthRate.toFixed(1)}%`);
    } else if (growthRate < -5) {
      challenges.push(`Declining engagement: ${growthRate.toFixed(1)}%`);
    }

    if (topPosts.length > 0) {
      const bestPost = topPosts[0];
      highlights.push(`Top post: "${bestPost.headline}" with ${bestPost.stats.engagement} engagement`);
    }

    const audienceChange = vitals.audience.change;
    if (audienceChange > 100) {
      highlights.push(`Growing audience: +${audienceChange} new followers`);
    } else if (audienceChange < -50) {
      challenges.push(`Audience decline: ${audienceChange} followers`);
    }

    opportunities.push("Analyze top performing content format");
    opportunities.push("Optimize posting schedule based on engagement patterns");
    opportunities.push("Expand strategy on strongest performing platform");

    return {
      title: "Analytics Executive Summary",
      period: data.dateRange,
      summary: `Your account shows ${growthRate > 0 ? "positive" : "negative"} momentum with a ${Math.abs(growthRate).toFixed(1)}% engagement trend over the analyzed period.`,
      keyMetrics: {
        "Total Reach": vitals.reach.value,
        "Total Engagements": vitals.engagement.value,
        "Growth Rate": `${growthRate.toFixed(1)}%`,
        "Audience Size": vitals.audience.value,
      },
      highlights,
      challenges,
      opportunities,
    };
  }

  /**
   * Generate detailed analytics report
   */
  static generateDetailedReport(data: AnalyticsSummaryResponse): {
    executiveSummary: string;
    sections: Array<{
      title: string;
      content: string;
      data?: any;
    }>;
    recommendations: string[];
    generatedAt: string;
  } {
    const vitals = data.globalData.vitals;
    const sections = [];

    // Section 1: Performance Overview
    sections.push({
      title: "Performance Overview",
      content: `Your account achieved ${vitals.reach.value} impressions with ${vitals.engagement.value} engagements. Audience grew by ${vitals.audience.change} followers during this period.`,
      data: {
        impressions: vitals.reach.value,
        engagements: vitals.engagement.value,
        audienceGrowth: vitals.audience.change,
        trend: vitals.engagement.trend,
      },
    });

    // Section 2: Content Performance
    sections.push({
      title: "Content Performance",
      content: `Top performing posts focused on ${data.globalData.topPosts[0]?.format || "mixed"} format with an average engagement rate of ${((data.globalData.contentInsights[0]?.engagement || 0) as any).substring(0, 4)}%.`,
      data: data.globalData.topPosts.slice(0, 3),
    });

    // Section 3: Platform Analysis
    sections.push({
      title: "Platform Analysis",
      content: "Your multi-platform strategy is generating diverse engagement across all connected platforms.",
      data: data.globalData.radar.map((r) => ({ platform: r.subject, score: r.A })),
    });

    // Section 4: Audience Insights
    const topJob = data.globalData.demographics.jobs[0];
    sections.push({
      title: "Audience Demographics",
      content: `Your audience is primarily composed of ${topJob?.name || "professionals"} with strong representation in major markets.`,
      data: {
        topJobs: data.globalData.demographics.jobs.slice(0, 3),
        topLocations: data.globalData.demographics.locations.slice(0, 3),
      },
    });

    const summary = this.generateExecutiveSummary(data);

    const recommendations = [
      ...summary.highlights.map((h) => `Continue: ${h}`),
      ...summary.challenges.map((c) => `Address: ${c}`),
      ...summary.opportunities,
    ];

    return {
      executiveSummary: summary.summary,
      sections,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate competitive analysis report
   */
  static generateCompetitiveAnalysis(ownData: AnalyticsSummaryResponse, benchmarks?: Record<string, any>): {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  } {
    const vitals = ownData.globalData.vitals;
    const radar = ownData.globalData.radar;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];
    const recommendations: string[] = [];

    // SWOT Analysis
    const topRadar = radar.sort((a, b) => b.A - a.A)[0];
    if (topRadar.A > 75) {
      strengths.push(`Strong performance on ${topRadar.subject}: ${topRadar.A}% score`);
    }

    const bottomRadar = radar.sort((a, b) => a.A - b.A)[0];
    if (bottomRadar.A < 50) {
      weaknesses.push(`Underperforming on ${bottomRadar.subject}: ${bottomRadar.A}% score`);
      recommendations.push(`Develop strategy to improve ${bottomRadar.subject} presence`);
    }

    if (vitals.audience.trend === "up") {
      opportunities.push("Growing audience presents expansion opportunity");
    }

    if (vitals.engagement.trend === "down") {
      threats.push("Declining engagement rate requires intervention");
      recommendations.push("Review content strategy and posting schedule");
    }

    strengths.push("Diversified platform presence across 6 networks");
    opportunities.push("Leverage AI tools for content optimization");
    recommendations.push("Conduct weekly performance reviews");

    return {
      strengths,
      weaknesses,
      opportunities,
      threats,
      recommendations,
    };
  }
}

/**
 * Export Formats Manager
 */
export class ExportManager {
  /**
   * Export to JSON
   */
  static exportJSON(data: AnalyticsSummaryResponse): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV
   */
  static exportCSV(data: AnalyticsSummaryResponse): string {
    const lines: string[] = [];

    // Header
    lines.push("Date,Platform,Engagement,Reach,Impressions,Clicks");

    // Data
    data.globalData.history.forEach((point) => {
      const linkedin = Number(point.linkedin ?? 0);
      const facebook = Number(point.facebook ?? 0);
      const instagram = Number(point.instagram ?? 0);
      const twitter = Number(point.twitter ?? 0);
      const pinterest = Number(point.pinterest ?? 0);
      const threads = Number(point.threads ?? 0);
      const avgEngagement = (linkedin + facebook + instagram + twitter + pinterest + threads) / 6;

      lines.push(`${point.date},all,${avgEngagement},${linkedin},${facebook},${instagram}`);
    });

    return lines.join("\n");
  }

  /**
   * Export to HTML
   */
  static exportHTML(data: AnalyticsSummaryResponse, title: string = "Analytics Report"): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .metric-label {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
        }
        .metric-value {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        .timestamp {
            color: #999;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        
        <h2>Key Metrics</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-label">Total Reach</div>
                <div class="metric-value">${data.globalData.vitals.reach.value}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Total Engagements</div>
                <div class="metric-value">${data.globalData.vitals.engagement.value}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Audience Size</div>
                <div class="metric-value">${data.globalData.vitals.audience.value}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Total Clicks</div>
                <div class="metric-value">${data.globalData.vitals.clicks.value}</div>
            </div>
        </div>

        <h2>Top Posts</h2>
        <table>
            <thead>
                <tr>
                    <th>Headline</th>
                    <th>Format</th>
                    <th>Views</th>
                    <th>Engagement</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${data.globalData.topPosts
                  .slice(0, 5)
                  .map(
                    (post) => `
                    <tr>
                        <td>${post.headline}</td>
                        <td>${post.format}</td>
                        <td>${post.stats.views}</td>
                        <td>${post.stats.engagement}</td>
                        <td>${post.score}/100</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <h2>Content Insights</h2>
        <table>
            <thead>
                <tr>
                    <th>Format</th>
                    <th>Performance</th>
                    <th>Engagement</th>
                    <th>Insight</th>
                </tr>
            </thead>
            <tbody>
                ${data.globalData.contentInsights
                  .map(
                    (insight) => `
                    <tr>
                        <td>${insight.format}</td>
                        <td>${insight.performance}%</td>
                        <td>${insight.engagement}</td>
                        <td>${insight.insight}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Export to PDF (requires external library, returns HTML for conversion)
   */
  static exportPDFHTML(data: AnalyticsSummaryResponse): string {
    return this.exportHTML(data, "Analytics Report - PDF");
  }

  /**
   * Export to XLSX (returns JSON structure that can be converted to Excel)
   */
  static exportXLSX(data: AnalyticsSummaryResponse): {
    sheets: Array<{
      name: string;
      rows: any[];
    }>;
  } {
    return {
      sheets: [
        {
          name: "Summary",
          rows: [
            ["Metric", "Value"],
            ["Reach", data.globalData.vitals.reach.value],
            ["Engagements", data.globalData.vitals.engagement.value],
            ["Audience", data.globalData.vitals.audience.value],
            ["Clicks", data.globalData.vitals.clicks.value],
          ],
        },
        {
          name: "History",
          rows: [
            ["Date", "LinkedIn", "Facebook", "Instagram", "Twitter", "Pinterest", "Threads"],
            ...data.globalData.history.map((h) => [h.date, h.linkedin, h.facebook, h.instagram, h.twitter, h.pinterest, h.threads]),
          ],
        },
        {
          name: "Top Posts",
          rows: [
            ["ID", "Headline", "Format", "Views", "Engagement", "Score"],
            ...data.globalData.topPosts.map((p) => [p.id, p.headline, p.format, p.stats.views, p.stats.engagement, p.score]),
          ],
        },
      ],
    };
  }

  /**
   * Export to Markdown
   */
  static exportMarkdown(data: AnalyticsSummaryResponse): string {
    const md: string[] = [];

    md.push("# Analytics Report\n");
    md.push(`**Period**: ${data.dateRange}`);
    md.push(`**Generated**: ${new Date().toLocaleString()}\n\n`);

    md.push("## Key Metrics\n");
    md.push(`- **Reach**: ${data.globalData.vitals.reach.value}`);
    md.push(`- **Engagements**: ${data.globalData.vitals.engagement.value}`);
    md.push(`- **Audience**: ${data.globalData.vitals.audience.value}`);
    md.push(`- **Clicks**: ${data.globalData.vitals.clicks.value}\n`);

    md.push("## Top Posts\n");
    data.globalData.topPosts.slice(0, 5).forEach((post, i) => {
      md.push(`${i + 1}. **${post.headline}** (${post.format})`);
      md.push(`   - Views: ${post.stats.views} | Engagement: ${post.stats.engagement} | Score: ${post.score}/100`);
    });

    md.push("\n## Content Insights\n");
    md.push("| Format | Performance | Engagement | Insight |");
    md.push("|--------|-------------|------------|---------|");
    data.globalData.contentInsights.forEach((insight) => {
      md.push(`| ${insight.format} | ${insight.performance}% | ${insight.engagement} | ${insight.insight} |`);
    });

    return md.join("\n");
  }
}

/**
 * Scheduled Report Manager
 */
export class ScheduledReportManager {
  private schedules: Map<
    string,
    {
      frequency: "daily" | "weekly" | "monthly";
      format: "json" | "csv" | "html" | "pdf" | "xlsx" | "markdown";
      recipients: string[];
      enabled: boolean;
      lastSent?: Date;
    }
  > = new Map();

  /**
   * Schedule report
   */
  scheduleReport(
    name: string,
    frequency: "daily" | "weekly" | "monthly",
    format: "json" | "csv" | "html" | "pdf" | "xlsx" | "markdown",
    recipients: string[],
  ): void {
    this.schedules.set(name, {
      frequency,
      format,
      recipients,
      enabled: true,
    });
  }

  /**
   * Get scheduled reports
   */
  getSchedules(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name, config] of this.schedules.entries()) {
      result[name] = config;
    }
    return result;
  }

  /**
   * Send scheduled reports (would integrate with email service)
   */
  async sendScheduledReports(data: AnalyticsSummaryResponse): Promise<Array<{ name: string; status: "sent" | "failed"; recipients: string[] }>> {
    const results: Array<{ name: string; status: "sent" | "failed"; recipients: string[] }> = [];

    for (const [name, config] of this.schedules.entries()) {
      if (!config.enabled) continue;

      // Check if should send based on frequency
      const shouldSend = this.shouldSendReport(config.frequency, config.lastSent);

      if (shouldSend) {
        try {
          // Generate report
          let reportContent: any;

          switch (config.format) {
            case "json":
              reportContent = ExportManager.exportJSON(data);
              break;
            case "csv":
              reportContent = ExportManager.exportCSV(data);
              break;
            case "html":
              reportContent = ExportManager.exportHTML(data, name);
              break;
            case "xlsx":
              reportContent = ExportManager.exportXLSX(data);
              break;
            case "markdown":
              reportContent = ExportManager.exportMarkdown(data);
              break;
            default:
              reportContent = ExportManager.exportJSON(data);
          }

          // Here you would send via email service (SendGrid, etc.)
          config.lastSent = new Date();

          results.push({
            name,
            status: "sent",
            recipients: config.recipients,
          });
        } catch (error) {
          results.push({
            name,
            status: "failed",
            recipients: config.recipients,
          });
        }
      }
    }

    return results;
  }

  private shouldSendReport(frequency: string, lastSent?: Date): boolean {
    if (!lastSent) return true;

    const now = new Date();
    const hoursSince = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

    switch (frequency) {
      case "daily":
        return hoursSince >= 24;
      case "weekly":
        return hoursSince >= 24 * 7;
      case "monthly":
        return hoursSince >= 24 * 30;
      default:
        return false;
    }
  }
}

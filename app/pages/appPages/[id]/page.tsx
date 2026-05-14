"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import KPIBar, { KPIItem } from "../components/Dashboard/KPIBar";
import ActivityFeed from "../components/Dashboard/ActivityFeed";
import AnalyticsSnapshot from "../components/Dashboard/AnalyticsSnapshot";
import BestPosts from "../components/Dashboard/BestPosts";
import ContentCalendar from "../components/Dashboard/ContentCalendar";
import IdeaQuickAccess from "../components/Dashboard/IdeaQuickAccess";
import TemplatePreview from "../components/Dashboard/TemplatePreview";
import ProfileScore from "../components/Dashboard/ProfileScore";
import PublishingStatus from "../components/Dashboard/PublishingStatus";
import SmartRecommendations from "../components/Dashboard/SmartRecommendations";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import WorkspaceContext from "../components/Dashboard/WorkspaceContext";
import type { QuickActionItem } from "../components/Dashboard/QuickActions";
import DashboardSettingsPanel from "../components/Dashboard/DashboardSettingsPanel";
import { useDashboardConfig } from "./dashboard/hooks/useDashboardConfig";
import { useDashboardKPIs } from "./dashboard/hooks/useDashboardKPIs";
import { useDashboardAnalytics } from "./dashboard/hooks/useDashboardAnalytics";
import { useDashboardActivity } from "./dashboard/hooks/useDashboardActivity";
import { useDashboardBestPosts } from "./dashboard/hooks/useDashboardBestPosts";
import { useDashboardCalendar } from "./dashboard/hooks/useDashboardCalendar";
import { useDashboardStats } from "./dashboard/hooks/useDashboardStats";
import { useDashboardIdeas } from "./dashboard/hooks/useDashboardIdeas";
import { useDashboardTemplates } from "./dashboard/hooks/useDashboardTemplates";
import { useDashboardPublishing } from "./dashboard/hooks/useDashboardPublishing";
import { useAccountInfo } from "./dashboard/hooks/useAccountInfo";
import { useDashboardEvents } from "./dashboard/hooks/useDashboardEvents";

const quickActions: QuickActionItem[] = [
  { id: "qa-1", label: "Generate new post", intent: "primary" },
  { id: "qa-2", label: "Analyze a post", intent: "secondary" },
  { id: "qa-3", label: "Find ideas", intent: "secondary" },
  { id: "qa-4", label: "View analytics", intent: "secondary" },
];

export default function DashboardPage() {
  const params = useParams();
  const accountId = params?.id as string;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasTrackedLoad, setHasTrackedLoad] = useState(false);
  const dashboardEnabled = process.env.NEXT_PUBLIC_DASHBOARD_ENABLED !== "false";

  const { config, updateConfig } = useDashboardConfig(accountId);
  const period = config?.timeRange.default || "7days";
  const analyticsLookback = config?.timeRange.analyticsLookback || 30;
  const hiddenSections = config?.layout.hiddenSections || [];
  const columns = config?.layout.columns || 2;
  const { track } = useDashboardEvents(accountId);

  const { data: kpiData } = useDashboardKPIs(accountId, period);
  const { data: analyticsData } = useDashboardAnalytics(accountId, analyticsLookback);
  const { data: activityItems } = useDashboardActivity(accountId, 8);
  const { data: bestPosts } = useDashboardBestPosts(accountId, 6);
  const { data: calendarItems } = useDashboardCalendar(accountId, 7);
  const { data: stats } = useDashboardStats(accountId);
  const { data: ideaItems } = useDashboardIdeas(accountId, 4);
  const { data: templates } = useDashboardTemplates(accountId, 4);
  const { data: publishing } = useDashboardPublishing(accountId);
  const { data: accountInfo } = useAccountInfo(accountId);

  useEffect(() => {
    if (!accountId) return;
    track("dashboard_viewed");
  }, [accountId, track]);

  useEffect(() => {
    if (hasTrackedLoad) return;
    if (!config || !kpiData || !analyticsData) return;
    setHasTrackedLoad(true);
    track("dashboard_loaded", {
      period,
      columns,
    });
  }, [analyticsData, columns, config, hasTrackedLoad, kpiData, period, track]);

  const kpiItems: KPIItem[] = useMemo(() => {
    if (!kpiData?.kpis) return [];
    return [
      {
        label: "Posts generated",
        value: kpiData.kpis.postsGenerated.current,
        delta: kpiData.kpis.postsGenerated.growth,
        trend: kpiData.kpis.postsGenerated.trend as any,
      },
      {
        label: "Posts published",
        value: kpiData.kpis.postsPublished.current,
        delta: kpiData.kpis.postsPublished.growth,
        trend: kpiData.kpis.postsPublished.trend as any,
      },
      {
        label: "Engagement rate",
        value: Number(kpiData.kpis.avgEngagementRate.current.toFixed(1)),
        unit: "%",
        delta: kpiData.kpis.avgEngagementRate.growth,
        trend: kpiData.kpis.avgEngagementRate.trend as any,
      },
      {
        label: "Follower growth",
        value: kpiData.kpis.followerGrowth.current,
        delta: kpiData.kpis.followerGrowth.growth,
        trend: kpiData.kpis.followerGrowth.trend as any,
      },
      {
        label: "Templates saved",
        value: kpiData.kpis.templatesSaved.current,
        delta: kpiData.kpis.templatesSaved.growth,
        trend: kpiData.kpis.templatesSaved.trend as any,
      },
      {
        label: "Ideas explored",
        value: kpiData.kpis.ideasExplored.current,
        delta: kpiData.kpis.ideasExplored.growth,
        trend: kpiData.kpis.ideasExplored.trend as any,
      },
    ];
  }, [kpiData]);

  const gridColumns = columns === 3 ? "xl:grid-cols-3" : columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-2";

  const recommendations = useMemo(
    () => [
      {
        id: "rec-1",
        title: "Analyze top performing post",
        reason: "High engagement detected in the last period.",
        actionLabel: "Analyze now",
      },
      {
        id: "rec-2",
        title: "Save the best hook as a template",
        reason: "Template library can reuse strong patterns.",
        actionLabel: "Save template",
      },
    ],
    []
  );

  return (
    <div className="w-full h-full p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {!dashboardEnabled ? (
        <div className="bg-white border border-slate-200 rounded-[16px] p-6">
          <div className="text-lg font-black text-[#1A1D23]">Dashboard is disabled</div>
          <p className="text-sm text-slate-500 mt-2">
            Enable it with NEXT_PUBLIC_DASHBOARD_ENABLED=true.
          </p>
        </div>
      ) : null}

      {!dashboardEnabled ? null : (
        <>
      <DashboardHeader
        title="Dashboard"
        subtitle={`Workspace: ${accountId || "Active"}`}
        actions={quickActions}
        showTitle={false}
        onOpenSettings={() => {
          setSettingsOpen(true);
          track("settings_opened");
        }}
      />

      {!hiddenSections.includes("workspace") ? (
        <WorkspaceContext
          workspaceName={accountInfo?.name || "Workspace"}
          personaStatus={`${stats?.personaCompleteness || 0}% complete`}
          platforms={["LinkedIn", "X", "Instagram"]}
        />
      ) : null}

      {!hiddenSections.includes("kpi") ? <KPIBar items={kpiItems} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {!hiddenSections.includes("activity") ? (
            <ActivityFeed
              items={activityItems.map((item) => {
                const status = [
                  "draft",
                  "published",
                  "scheduled",
                  "analyzed",
                  "failed",
                ].includes(item.status)
                  ? (item.status as any)
                  : "draft";

                return {
                  ...item,
                  status,
                  time: new Date(item.time).toLocaleString(),
                };
              })}
            />
          ) : null}
          
          {!hiddenSections.includes("posts") ? (
            <BestPosts
              posts={bestPosts.map((post) => ({
                id: post._id?.toString() || "post",
                title: post.caption?.slice(0, 80) || "Top post",
                platform: post.platform || "",
                engagementRate: Number((post.engagementRate || 0).toFixed(1)),
                postedAt: post.postedAt ? new Date(post.postedAt).toLocaleDateString() : "",
              }))}
            />
          ) : null}

          {!hiddenSections.includes("ideas") ? (
            <IdeaQuickAccess
              ideas={ideaItems.map((idea) => ({
                id: idea._id?.toString() || "idea",
                title: idea.idea?.title || "New idea",
                mode: idea.mode || "Idea",
              }))}
            />
          ) : null}

          {!hiddenSections.includes("profile") ? (
            <ProfileScore
              score={stats?.personaCompleteness || 0}
              improvements={[
                "Add more proof points",
                "Clarify audience goals",
                "Update CTA in bio",
              ]}
            />
          ) : null}

          {!hiddenSections.includes("recommendations") ? (
            <SmartRecommendations items={recommendations} />
          ) : null}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {!hiddenSections.includes("analytics") && analyticsData ? (
            <AnalyticsSnapshot data={analyticsData} />
          ) : null}

          {!hiddenSections.includes("calendar") ? (
            <ContentCalendar
              items={calendarItems.map((item) => ({
                date: new Date(item.date).toLocaleDateString(),
                count: item.count,
                status: item.status as any,
              }))}
            />
          ) : null}

          {!hiddenSections.includes("templates") ? (
            <TemplatePreview
              templates={templates.map((template) => ({
                id: template._id?.toString() || "template",
                name: template.template?.name || "Template",
                category: template.template?.category || "General",
                usage: template.metadata?.usageCount || 0,
              }))}
            />
          ) : null}

          {!hiddenSections.includes("publishing") ? (
            <PublishingStatus
              drafts={publishing?.drafts || 0}
              scheduled={publishing?.scheduled || 0}
              failed={publishing?.failed || 0}
              nextPublish={
                publishing?.nextPublish
                  ? new Date(publishing.nextPublish).toLocaleString()
                  : "Not scheduled"
              }
            />
          ) : null}
        </div>
      </div>

      <DashboardSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onSave={async (nextConfig) => {
          await updateConfig(nextConfig);
          track("settings_saved", { hiddenSections: nextConfig?.layout?.hiddenSections });
        }}
      />
        </>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  getDashboardGridSpan,
  orderDashboardSections,
  type DashboardSectionDefinition,
  type DashboardSectionId,
} from "./dashboard/types";

const quickActions: QuickActionItem[] = [
  { id: "qa-1", label: "Generate new post", intent: "primary" },
  { id: "qa-2", label: "Analyze a post", intent: "secondary" },
  { id: "qa-3", label: "Find ideas", intent: "secondary" },
  { id: "qa-4", label: "View analytics", intent: "secondary" },
];

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAllMetrics, setShowAllMetrics] = useState(true);
  const [hasTrackedLoad, setHasTrackedLoad] = useState(false);
  const dashboardEnabled = process.env.NEXT_PUBLIC_DASHBOARD_ENABLED !== "false";

  const { config, updateConfig, loading: configLoading, error: configError, refetch: refetchConfig } = useDashboardConfig(accountId);
  const period = config?.timeRange.default || "7days";
  const analyticsLookback = config?.timeRange.analyticsLookback || 30;
  const hiddenSections = config?.layout.hiddenSections || [];
  const columns = config?.layout.columns || 2;
  const { track } = useDashboardEvents(accountId);

  const { data: kpiData, loading: kpiLoading, error: kpiError, refetch: refetchKpis } = useDashboardKPIs(accountId, period);
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useDashboardAnalytics(accountId, analyticsLookback);
  const { data: activityItems, loading: activityLoading, error: activityError, refetch: refetchActivity } = useDashboardActivity(accountId, 8);
  const { data: bestPosts, loading: bestPostsLoading, error: bestPostsError, refetch: refetchBestPosts } = useDashboardBestPosts(accountId, 6);
  const { data: calendarItems, loading: calendarLoading, error: calendarError, refetch: refetchCalendar } = useDashboardCalendar(accountId, 7);
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(accountId);
  const { data: ideaItems, loading: ideasLoading, error: ideasError, refetch: refetchIdeas } = useDashboardIdeas(accountId, 4);
  const { data: templates, loading: templatesLoading, error: templatesError, refetch: refetchTemplates } = useDashboardTemplates(accountId, 4);
  const { data: publishing, loading: publishingLoading, error: publishingError, refetch: refetchPublishing } = useDashboardPublishing(accountId);
  const { data: accountInfo, loading: accountLoading, error: accountError } = useAccountInfo(accountId);

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

  const allKpiItems: KPIItem[] = useMemo(
    () => [
      {
        label: "Posts generated",
        value: kpiData?.kpis?.postsGenerated?.current ?? 0,
        delta: kpiData?.kpis?.postsGenerated?.growth,
        trend: kpiData?.kpis?.postsGenerated?.trend as any,
      },
      {
        label: "Posts published",
        value: kpiData?.kpis?.postsPublished?.current ?? 0,
        delta: kpiData?.kpis?.postsPublished?.growth,
        trend: kpiData?.kpis?.postsPublished?.trend as any,
      },
      {
        label: "Engagement rate",
        value: Number((kpiData?.kpis?.avgEngagementRate?.current ?? 0).toFixed(1)),
        unit: "%",
        delta: kpiData?.kpis?.avgEngagementRate?.growth,
        trend: kpiData?.kpis?.avgEngagementRate?.trend as any,
      },
      {
        label: "Follower growth",
        value: kpiData?.kpis?.followerGrowth?.current ?? 0,
        delta: kpiData?.kpis?.followerGrowth?.growth,
        trend: kpiData?.kpis?.followerGrowth?.trend as any,
      },
      {
        label: "Templates saved",
        value: kpiData?.kpis?.templatesSaved?.current ?? 0,
        delta: kpiData?.kpis?.templatesSaved?.growth,
        trend: kpiData?.kpis?.templatesSaved?.trend as any,
      },
      {
        label: "Ideas explored",
        value: kpiData?.kpis?.ideasExplored?.current ?? 0,
        delta: kpiData?.kpis?.ideasExplored?.growth,
        trend: kpiData?.kpis?.ideasExplored?.trend as any,
      },
    ],
    [kpiData]
  );

  const dashboardSections = useMemo<DashboardSectionDefinition[]>(
    () => [
      {
        id: "analytics",
        title: "Analytics snapshot",
        defaultVisible: true,
        defaultSpan: 1,
        render: () =>
          analyticsData ? <AnalyticsSnapshot data={analyticsData} /> : <DashboardSectionPlaceholder title="Analytics" />,
      },
      {
        id: "publishing",
        title: "Publishing pipeline",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <PublishingStatus
            drafts={publishing?.drafts || 0}
            scheduled={publishing?.scheduled || 0}
            failed={publishing?.failed || 0}
            nextPublish={publishing?.nextPublish ? new Date(publishing.nextPublish).toLocaleString() : "Not scheduled"}
          />
        ),
      },
      {
        id: "activity",
        title: "Recent activity",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <ActivityFeed
            items={activityItems.map((item) => ({
              ...item,
              status: ["draft", "published", "scheduled", "analyzed", "failed"].includes(item.status)
                ? (item.status as any)
                : "draft",
              time: new Date(item.time).toLocaleString(),
            }))}
          />
        ),
      },
      {
        id: "calendar",
        title: "Content calendar",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <ContentCalendar
            items={calendarItems.map((item) => ({
              date: new Date(item.date).toLocaleDateString(),
              count: item.count,
              status: item.status as any,
            }))}
          />
        ),
      },
      {
        id: "posts",
        title: "Best posts",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <BestPosts
            posts={bestPosts.map((post) => ({
              id: post._id?.toString() || "post",
              title: post.caption?.slice(0, 80) || "Top post",
              platform: post.platform || "",
              engagementRate: Number((post.engagementRate || 0).toFixed(1)),
              postedAt: post.postedAt ? new Date(post.postedAt).toLocaleDateString() : "",
            }))}
          />
        ),
      },
      {
        id: "ideas",
        title: "Idea finder",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <IdeaQuickAccess
            ideas={ideaItems.map((idea) => ({
              id: idea._id?.toString() || "idea",
              title: idea.idea?.title || "New idea",
              mode: idea.mode || "Idea",
            }))}
          />
        ),
      },
      {
        id: "templates",
        title: "Templates",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <TemplatePreview
            templates={templates.map((template) => ({
              id: template._id?.toString() || "template",
              name: template.template?.name || "Template",
              category: template.template?.category || "General",
              usage: template.metadata?.usageCount || 0,
            }))}
          />
        ),
      },
      {
        id: "profile",
        title: "Profile score",
        defaultVisible: true,
        defaultSpan: 1,
        render: () => (
          <ProfileScore
            score={stats?.personaCompleteness || 0}
            improvements={["Add more proof points", "Clarify audience goals", "Update CTA in bio"]}
          />
        ),
      },
      {
        id: "recommendations",
        title: "Recommendations",
        defaultVisible: true,
        defaultSpan: 2,
        render: () => <SmartRecommendations items={recommendations} />,
      },
    ],
    [activityItems, analyticsData, bestPosts, calendarItems, ideaItems, publishing, recommendations, stats, templates]
  );

  const orderedSections = useMemo(
    () => orderDashboardSections(config?.layout.sectionOrder, dashboardSections),
    [config?.layout.sectionOrder, dashboardSections]
  );

  const handleQuickAction = (action: QuickActionItem) => {
    const routes: Record<string, string> = {
      "qa-1": `/${accountId}/postGenerator`,
      "qa-2": `/${accountId}/postAnalyzer`,
      "qa-3": `/${accountId}/generateIdeas`,
      "qa-4": `/${accountId}/analytics`,
    };
    const route = routes[action.id];
    if (route) {
      track("quick_action_clicked", { action: action.id });
      router.push(route);
    }
  };

  const isLoading = configLoading || kpiLoading || analyticsLoading || activityLoading || bestPostsLoading || calendarLoading || statsLoading || ideasLoading || templatesLoading || publishingLoading || accountLoading;
  const dashboardError = configError || kpiError || analyticsError || activityError || bestPostsError || calendarError || statsError || ideasError || templatesError || publishingError || accountError;
  const handleRetry = async () => {
    await Promise.allSettled([
      refetchConfig(), refetchKpis(), refetchAnalytics(), refetchActivity(), refetchBestPosts(),
      refetchCalendar(), refetchStats(), refetchIdeas(), refetchTemplates(), refetchPublishing(),
    ]);
  };

  const gridColumnsClass = columns === 4 ? "lg:grid-cols-4" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  const sectionClass = (section: DashboardSectionDefinition) => {
    const span = getDashboardGridSpan(section, config?.layout.sectionSizes, columns);
    if (span >= columns) return columns === 4 ? "lg:col-span-4" : columns === 3 ? "lg:col-span-3" : "lg:col-span-2";
    return "lg:col-span-1";
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-[1400px] min-w-0 px-4 pb-16 pt-5 sm:px-6 lg:px-8">
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
        subtitle={`Workspace: ${accountInfo?.name || accountId || "Active"}`}
        workspaceName={accountInfo?.name || "Active Workspace"}
        actions={quickActions}
        showTitle
        onAction={handleQuickAction}
        onOpenSettings={() => {
          setSettingsOpen(true);
          track("settings_opened");
        }}
      />

      {!hiddenSections.includes("workspace") ? (
        <div className="mt-5 sm:mt-6">
          <WorkspaceContext
            workspaceName={accountInfo?.name || "My Account"}
            personaStatus={`${stats?.personaCompleteness || 0}% complete`}
            platforms={["LinkedIn", "X", "Instagram"]}
          />
        </div>
      ) : null}

      {!hiddenSections.includes("kpi") ? (
        <div className="mt-5 sm:mt-6">
          <KPIBar items={showAllMetrics ? allKpiItems : allKpiItems.slice(0, 4)} onShowAll={() => setShowAllMetrics((value) => !value)} />
        </div>
      ) : null}

      {dashboardError && !isLoading ? (
        <DashboardErrorState message={dashboardError} onRetry={handleRetry} />
      ) : isLoading ? (
        <DashboardLoadingState />
      ) : (
        <div className={`mt-5 sm:mt-6 grid min-w-0 grid-cols-1 gap-5 ${gridColumnsClass} grid-flow-dense`}>
          {orderedSections.map((section) =>
            hiddenSections.includes(section.id as DashboardSectionId) ? null : (
              <div key={section.id} className={`min-w-0 ${sectionClass(section)}`}>
                {section.render()}
              </div>
            )
          )}
        </div>
      )}

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

function DashboardLoadingState() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Loading dashboard" role="status">
      {["one", "two", "three", "four"].map((item) => (
        <div key={item} className="h-52 animate-pulse rounded-xl border border-slate-200 bg-white">
          <div className="h-12 border-b border-slate-100 bg-slate-50" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-2 text-xs text-slate-500">No data is available for this period yet.</p>
    </div>
  );
}

function DashboardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
      <p className="text-sm font-semibold text-red-900">Dashboard data could not be loaded</p>
      <p className="mt-1 text-xs text-red-700">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Try again</button>
    </div>
  );
}

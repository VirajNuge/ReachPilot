import type React from "react";

export type DashboardSectionId =
  | "analytics"
  | "publishing"
  | "activity"
  | "calendar"
  | "posts"
  | "ideas"
  | "templates"
  | "profile"
  | "recommendations";

export interface DashboardSectionDefinition {
  id: DashboardSectionId;
  title: string;
  defaultVisible: boolean;
  defaultSpan: number;
  render: () => React.ReactNode;
}

export interface DashboardResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const DASHBOARD_SECTION_IDS: DashboardSectionId[] = [
  "analytics",
  "publishing",
  "activity",
  "calendar",
  "posts",
  "ideas",
  "templates",
  "profile",
  "recommendations",
];

export function orderDashboardSections(
  sectionOrder: string[] | undefined,
  definitions: DashboardSectionDefinition[]
) {
  const byId = new Map(definitions.map((definition) => [definition.id, definition]));
  const ordered = (sectionOrder || [])
    .map((id) => byId.get(id as DashboardSectionId))
    .filter((definition): definition is DashboardSectionDefinition => Boolean(definition));

  const included = new Set(ordered.map((definition) => definition.id));
  return [
    ...ordered,
    ...definitions.filter((definition) => !included.has(definition.id)),
  ];
}

export function getDashboardGridSpan(
  section: DashboardSectionDefinition,
  sectionSizes: Record<string, number> | undefined,
  columns = 2
) {
  const configured = sectionSizes?.[section.id];
  if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) {
    if (columns === 2) {
      if (section.id === "recommendations") return 2;
      return configured >= 4 && section.defaultSpan >= 2 ? 2 : 1;
    }
    // Existing saved configurations use a 1–4 size scale. Preserve that
    // contract while mapping larger sections to a full row in the new grid.
    return configured >= 3 ? columns : Math.min(columns, section.defaultSpan);
  }
  return Math.min(columns, section.defaultSpan);
}

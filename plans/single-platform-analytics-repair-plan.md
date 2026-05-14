# Single-Platform Analytics Repair Plan

## Problem Statement
The single-platform analytics tabs regressed after the last UI pass:

- Important platform-specific sections were removed or visually de-emphasized.
- The new chart and best-posts components overlap with the existing layout.
- The tab no longer reads as a complete account dashboard for the selected platform.

The fix should restore the value of the tab, keep the new chart and best-posts views, and make the layout feel stable and intentional.

## Goals
1. Keep the single-platform tab focused on one selected account only.
2. Re-add the important platform analysis blocks that were removed.
3. Keep the new growth chart and best-posts list visible on the tab.
4. Eliminate overlap, clipping, and crowded grid behavior.
5. Preserve the account-details-only rule for the single-platform view.

## Non-Goals
- Do not reintroduce the removed overview-only sections into the single-platform tab.
- Do not add new backend data requirements unless the current tab cannot be rendered correctly without them.
- Do not change the overview tab except where shared components need cleanup.

## Current State To Preserve
The single-platform tab already has the right data sources available:

- `analysis` for platform-specific stats, trend signals, and existing recommendation logic.
- `history` for the selected platform timeline.
- `postEvents` for chart markers.
- `bestPosts` for the 30-day best posts list.
- `connection` for account metadata such as username, page/profile ID, and updated timestamp.

This means the fix is mainly a layout and composition repair, not a data plumbing project.

## Likely Root Cause
The current `PlatformTabDashboard` was refactored too aggressively and now mixes too many blocks inside one top-level section. That likely caused:

- Nested grids without enough vertical separation.
- Sections that should stack to instead compete for the same horizontal space.
- A top container that no longer has a clear left/right or top/bottom hierarchy.
- Important prior sections being removed rather than moved below the new widgets.

## Proposed Layout
The tab should read top to bottom in this order:

1. Hero header
   - Platform name
   - Short analysis summary
   - Account details summary cards
2. Core platform metrics
   - The existing stat cards
3. Growth chart
   - Cross-check of recent trend
   - Post markers on the timeline
4. Best posts (30d)
   - Scrollable list with thumbnails and metric value
5. Platform-only account details
   - Username, page/profile ID, connected-at metadata
6. Existing platform intelligence blocks
   - Trend signals
   - Persona fit or similar platform analysis sections if they were previously present and still relevant
   - Recommendations, if the product still wants them on the single-platform tab

The layout should use separate cards with consistent spacing rather than a large multi-column block containing everything at once.

## Component Composition Plan
### 1. Reorganize `PlatformTabDashboard`
Split the tab into clear sections instead of one dense layout:

- Keep the top hero section compact.
- Move the new chart into its own full-width card.
- Place the best-posts list in a separate card beside or below the chart depending on viewport size.
- Keep account details in a small dedicated card.
- Restore any previously important platform-specific analysis blocks below those.

### 2. Reduce overlap risk
Use the following rules:

- Avoid fixed heights on wrapper sections unless the child component needs them.
- Do not place the chart and best-post list in the same cramped row on smaller screens.
- Prefer `grid gap-6` and `lg:grid-cols-2` only when the content is truly balanced.
- Let the chart occupy one full-width row if it needs space for markers and tooltips.
- Keep `overflow-hidden` only on cards that intentionally crop content.

### 3. Preserve the removed important content
Review the previous `PlatformTabDashboard` structure and restore the sections that matter to the selected platform experience, especially:

- Trend signals or platform-specific highlights.
- Recent posts or draft history if the tab previously showed them.
- Persona-fit or recommendation blocks if they are still part of the product contract for single-platform analysis.

If any section was removed only to make room for the new widgets, move it lower in the page instead of deleting it.

## Data Usage Plan
The tab should only show account data for the selected platform:

- Use the selected connection record for username, platform user ID, page ID, and timestamps.
- Filter `postEvents` and `bestPosts` to the active platform.
- Keep the chart scoped to the active platform history instead of cross-platform aggregate data.

If a selected platform has no history yet, the tab should show a clean empty state rather than collapsing the layout.

## UX Rules
1. Every card needs enough internal padding to breathe.
2. Avoid placing two high-density data widgets in the same narrow column.
3. Keep chart controls and tooltips readable without covering the chart’s core content.
4. Best posts should be scrollable inside their own card, not inside the whole page.
5. Account details should be small and informational, not dominant.

## Implementation Steps
1. Inspect the current `PlatformTabDashboard` and compare it with the pre-regression tab structure.
2. Restore the removed platform-specific blocks into their own sections.
3. Keep the new chart and best-posts list, but place them in separate card boundaries with predictable spacing.
4. Rework the responsive grid so the chart can stack above the list on smaller screens.
5. Remove any wrapper that causes children to overlap or clip.
6. Keep the account details card minimal and aligned with the selected connection only.
7. Verify that the overview tab still works unchanged after the shared component cleanup.

## Validation Plan
After the layout fix:

- Open the overview tab and ensure the new widgets still render.
- Open each single-platform tab and confirm the important prior sections are back.
- Check that the chart, best-posts list, and account-details card do not overlap at desktop or mobile widths.
- Confirm that platform-specific data only appears for the selected platform.
- Run a targeted TypeScript check for the edited analytics files.

## Acceptance Criteria
The work is done when:

- The single-platform tab no longer feels stripped down.
- The chart and best-posts list are visible and separated cleanly.
- The important platform analysis content is restored.
- Account details are shown clearly and only for the selected connection.
- No cards overlap, clip, or collapse awkwardly on common screen sizes.

## Recommended Next Edit
Make the layout fix in `app/pages/appPages/components/Analytics/PlatformTabDashboard.tsx` first, then run a focused UI/type validation before touching anything else.
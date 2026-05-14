# Analytics Feature Fix And Prune Plan

Date: 2026-05-09

## Goal

Stabilize the analytics feature so Facebook, Instagram, and Threads reliably return data and insights, while removing LinkedIn and Pinterest from the analytics feature surface.

## What Is Broken

1. The analytics dashboard still carries LinkedIn and Pinterest through multiple helper layers even though the active feature is intended to focus on Facebook, Instagram, Threads, and X.
2. Platform-tab insights can inherit global top-post data instead of platform-scoped results, which makes the selected tab feel inconsistent or empty.
3. The analytics summary path still has enough legacy platform branching that it is easy for the UI, cache, and mock adapters to drift out of sync.

## Fix Order

### Phase 1: Prune the analytics feature surface

- Remove LinkedIn and Pinterest from analytics-only platform lists, cache warming, mock data, and dashboard helper logic.
- Keep the core account model intact so other non-analytics features are not broken.
- Preserve support for X, Facebook, Instagram, and Threads.

### Phase 2: Make platform insights truly platform-scoped

- Update the analytics aggregation helpers so platform tabs fetch top posts for the active platform, not the global account.
- Ensure platform-specific summary data uses the correct platform filter for posts and metrics.
- Keep the overview/global view intact, but prevent it from leaking unrelated platform results into the active tab.

### Phase 3: Verify the read path

- Re-run typecheck/build for the analytics slice.
- Confirm the Facebook, Instagram, and Threads tabs render vitals, charts, and recommendations.
- Confirm LinkedIn and Pinterest no longer appear in the analytics UI or cached analytics warmup path.

## Files Likely To Change

- [lib/analytics/platforms.ts](../lib/analytics/platforms.ts)
- [lib/analytics/aggregationService.ts](../lib/analytics/aggregationService.ts)
- [lib/models/socialMediaPost.ts](../lib/models/socialMediaPost.ts)
- [lib/analytics/realDataAdapter.ts](../lib/analytics/realDataAdapter.ts)
- [lib/analytics/cacheLayer.ts](../lib/analytics/cacheLayer.ts)
- [lib/analytics/mockDataAdapter.ts](../lib/analytics/mockDataAdapter.ts)
- [lib/analytics/platformTab.ts](../lib/analytics/platformTab.ts)
- [lib/analytics/overview.ts](../lib/analytics/overview.ts)
- [lib/analytics/analyticsCalculator.ts](../lib/analytics/analyticsCalculator.ts) if the platform-scoped metrics path still needs a helper adjustment

## Success Criteria

- LinkedIn and Pinterest no longer appear anywhere in the analytics feature UI or analytics-specific cache warmup paths.
- Facebook, Instagram, and Threads return the correct platform metrics and insight cards again.
- The selected platform tab uses platform-specific top posts and recommendations instead of global results.
- The code passes focused validation after the change.

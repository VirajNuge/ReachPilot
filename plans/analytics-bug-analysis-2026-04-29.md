# Analytics Bug Analysis

Date: 2026-04-29

## Scope

This document traces the current analytics feature end to end and identifies what is still going wrong in the Facebook, Instagram, and Threads views.

The feature path is:

1. Sync data from external platforms
2. Store metrics in MongoDB
3. Aggregate metrics for analytics summaries
4. Adapt the summary into dashboard-ready datasets
5. Render the dashboard cards and charts

The bugs currently visible in the UI are not isolated to Threads. Threads exposed the problem, but the bigger issue is how metrics snapshots are written and then aggregated back into totals.

## What Is Still Wrong

### 1. Metrics are being accumulated across repeated syncs instead of representing the latest snapshot

This is the main cause of the inflated Facebook and Instagram values.

Relevant code:

- [lib/models/socialMediaMetrics.ts](../lib/models/socialMediaMetrics.ts)
- [lib/analytics/aggregationService.ts](../lib/analytics/aggregationService.ts)
- [lib/analytics/dataNormalizer.ts](../lib/analytics/dataNormalizer.ts)
- [lib/analytics/analyticsCalculator.ts](../lib/analytics/analyticsCalculator.ts)
- [lib/analytics/realDataAdapter.ts](../lib/analytics/realDataAdapter.ts)

Why it happens:

- Each platform fetcher builds a metrics document with `date: new Date()`.
- `upsertMetrics()` in [lib/models/socialMediaMetrics.ts](../lib/models/socialMediaMetrics.ts) only deduplicates when `userId`, `accountId`, `platform`, `date`, and `granularity` all match exactly.
- Because `date` is a full timestamp, every sync creates a new row, even when the sync is just a refresh of the same day.
- `getMetricsForAccount()` then returns all rows in the date range.
- `normalizeCrossPlatformMetrics()` sums impressions, engagements, comments, shares, clicks, and posts across all rows for a platform.
- That means each sync adds another copy of the same platform snapshot into the totals.

Concrete symptom:

- Facebook console logs show a single snapshot around impressions=9 and engagements=8.
- The dashboard shows much larger numbers like 925 impressions and 744 engagements because it is summing multiple snapshots for the same platform.
- Instagram shows the same inflation pattern.

This is the core regression.

### 2. Platform tabs depend on a filtered view, but the filtered view still uses the same historical accumulation logic

Relevant code:

- [lib/analytics/realDataAdapter.ts](../lib/analytics/realDataAdapter.ts)
- [lib/analytics/analyticsCalculator.ts](../lib/analytics/analyticsCalculator.ts)

The current flow for a platform tab is:

1. `buildRealAnalyticsSummary()` gets the global metrics.
2. It also calls `getAllAnalyticsMetrics(userId, accountId, persistedPlatform)` for the selected platform.
3. `filterMetricsForPlatform()` narrows some arrays.
4. `buildRealAnalyticsDataset()` converts the result into dashboard cards.

The problem is that even the filtered data is built on top of the same accumulated history. If the underlying account has many duplicate daily rows, the selected platform still inherits those inflated totals.

The recent edits around platform filtering are not the root fix. They were trying to correct symptom-level behavior, but the real bug is upstream in how metrics are persisted and aggregated.

### 3. Threads is still fragile because its metrics parser depends on an API shape that may not be stable for this account

Relevant code:

- [lib/analytics/threadsFetcher.ts](../lib/analytics/threadsFetcher.ts)
- [lib/analytics/platformDataFetcher.ts](../lib/analytics/platformDataFetcher.ts)

Threads problems still visible in the current implementation:

- `fetchMetrics()` calls `threads_insights` and parses returned metric items.
- The parser uses both `insight.values?.[0]?.value` and a fallback to `insight.total_value?.total_value`.
- If the API response shape is different for a specific token or permissions set, the parser can still produce zeros.
- `fetchMetrics()` also does a second request to count posts, which is not wrong by itself, but it adds another failure surface.

Important distinction:

- Threads returning zero data is not the same problem as the inflated Facebook/Instagram values.
- Facebook and Instagram already prove the write/aggregate path is wrong.
- Threads may still be broken independently, but it should be debugged only after the storage and aggregation semantics are fixed.

### 4. The analytics endpoint can amplify the problem by resyncing during reads

Relevant code:

- [app/api/analytics/summary/route.ts](../app/api/analytics/summary/route.ts)
- [lib/analytics/platformDataFetcher.ts](../lib/analytics/platformDataFetcher.ts)

The summary route currently:

- tries real data
- if that fails, triggers a synchronous full-account sync
- invalidates cache
- retries the summary
- also queues a background sync for later refreshes

This means a page load can cause more snapshots to be inserted, which then get summed again on the next read.

That does not create the inflation by itself, but it makes the inflation happen faster and more often.

### 5. The chart and radar may appear “okay” while the vitals are wrong, which hides the real issue

Relevant code:

- [lib/analytics/realDataAdapter.ts](../lib/analytics/realDataAdapter.ts)
- [app/pages/appPages/[id]/analytics/page.tsx](../app/pages/appPages/[id]/analytics/page.tsx)

The dashboard takes `summary.globalData` for Overview and `summary.platformData` for platform tabs.

The vitals cards use:

- audience
- reach
- engagement
- comments
- shares or saves

The charts use historical arrays and platform comparisons.

That separation means one part of the dashboard can look plausible while the vitals are already inflated. This is why the bug feels inconsistent across tabs.

## What Likely Needs To Change

### Priority 1: Make metrics snapshots idempotent per day and platform

Best place:

- [lib/models/socialMediaMetrics.ts](../lib/models/socialMediaMetrics.ts)

Recommended correction:

- Normalize `date` to a day bucket before upsert, or store a separate `snapshotDate` field and upsert by day.
- Preserve `updatedAt` for sync freshness, but do not let repeated syncs create new metric rows for the same platform/day.

Effect:

- Facebook and Instagram totals stop growing every time sync runs.
- Dashboard values reflect one current snapshot per day instead of a pile of duplicate snapshots.

### Priority 2: Make the aggregation layer read the latest snapshot, not all snapshots, for the vitals cards

Best place:

- [lib/analytics/aggregationService.ts](../lib/analytics/aggregationService.ts)

Recommended correction:

- Add a dedicated latest-metrics read for vitals.
- Keep historical aggregation for charts only.
- Do not sum duplicate same-day rows for the active platform when computing the vitals cards.

Effect:

- The dashboard cards show current platform state.
- Historical trends remain available for charts.

### Priority 3: Reduce sync amplification inside the summary endpoint

Best place:

- [app/api/analytics/summary/route.ts](../app/api/analytics/summary/route.ts)

Recommended correction:

- Avoid synchronous resync on every read unless the cache is empty and there is no usable data.
- Keep the background sync, but do not let tab switching repeatedly trigger writes.

Effect:

- Fewer duplicate snapshots.
- Less churn in the metric store.

### Priority 4: Validate Threads with one controlled request and one controlled snapshot

Best place:

- [lib/analytics/threadsFetcher.ts](../lib/analytics/threadsFetcher.ts)

Recommended correction:

- Log the raw Threads insights payload for one sync.
- Confirm whether the parser is receiving `values[0].value`, `total_value`, or neither.
- Confirm the post-count fetch returns the expected number of posts.

Effect:

- Threads becomes diagnosable independently from the Facebook/Instagram inflation bug.

## What Recent Changes Look Wrong Or Redundant

These are the parts that are most likely contributing to confusion right now:

- Passing and then removing platform filters across multiple analytics helper functions created churn without fixing the root cause.
- `filterMetricsForPlatform()` in [lib/analytics/realDataAdapter.ts](../lib/analytics/realDataAdapter.ts) is not the main source of the bug. The accumulated snapshots are.
- `getAllAnalyticsMetrics()` in [lib/analytics/analyticsCalculator.ts](../lib/analytics/analyticsCalculator.ts) is still acting as a broad aggregator, so it will continue to reflect bad history until the storage layer changes.
- The current Threads fix path is too close to the dashboard path and not close enough to the actual platform payload contract.

## Recommended Fix Order

1. Fix metrics persistence so one platform/day produces one row.
2. Fix vitals aggregation so they read the latest snapshot instead of summing duplicates.
3. Reduce summary endpoint resync amplification.
4. Re-test Facebook and Instagram with the corrected data model.
5. Only then debug Threads payload parsing and confirm the rendered data path.

## Expected Outcome After The Correct Fix

- Facebook values should settle near the console values from the actual sync, not grow with repeated refreshes.
- Instagram values should do the same.
- Threads should either show valid metrics or fail with a clear parser/API problem.
- The dashboard should be stable across repeated tab switches and refreshes.

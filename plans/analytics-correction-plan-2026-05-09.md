# Analytics Correction Plan

Date: 2026-05-09

## Goal

Make the analytics feature behave consistently for the supported platforms and stop the runtime regressions currently visible in the logs.

The plan addresses four concrete problems:

1. The auth helper still uses `cookies()` synchronously in route handlers, which triggers the Next.js dynamic API error.
2. The analytics summary path still tries to sync legacy platforms and keeps producing noisy/slow read-time refreshes.
3. The platform fetchers are returning invalid or missing tokens for Facebook and Instagram, while Threads still fails on network timeout paths.
4. Two analytics UI files are syntactically broken and block compilation: `GrowthChart.tsx` and `mockData.ts`.

## What The Logs Prove

The latest runtime output shows these exact failures:

- `Route "/api/persona" used cookies().get('rp_token')`
- `Facebook` and `Instagram` sync attempts fail because the page access token is missing.
- `LinkedIn` and `Pinterest` are still being synced from the analytics summary path even though they should not be part of the active analytics feature surface.
- `Threads` can still fail on `fetch failed` / connect timeout.
- `app/pages/appPages/components/Analytics/GrowthChart.tsx` has a broken return structure.
- `app/pages/appPages/components/Analytics/mockData.ts` has a syntax error near the `AnalyticsData` type.

These are not theory-level issues; they are reproducible from the current dev server output.

## Fix Order

### Phase 1: Fix auth cookie access

The first blocker is the Next.js `cookies()` API regression.

#### Files to inspect and fix

- [lib/auth.ts](../lib/auth.ts)
- [app/api/persona/route.ts](../app/api/persona/route.ts)
- Any other route that calls `getAuthFromCookies()` without an async cookie access pattern

#### What to change

- Update the cookie helper so it follows the current Next.js server API contract.
- Prefer the request-aware auth path in route handlers instead of relying on the sync cookie helper.
- Audit every route that still calls `getAuthFromCookies()` directly and move it to the request-based helper where possible.

#### Acceptance criteria

- `/api/persona` no longer logs the `cookies().get(...) should be awaited` error.
- The auth helper continues to work for both browser requests and server route handlers.
- The fix does not break login, forgot-password, reset-password, or analytics endpoints.

### Phase 2: Stop analytics sync amplification and legacy platform syncing

The current analytics route is still driving extra sync work on reads and still includes legacy platforms in logs.

#### Files to inspect and fix

- [app/api/analytics/summary/route.ts](../app/api/analytics/summary/route.ts)
- [app/api/analytics/sync/route.ts](../app/api/analytics/sync/route.ts)
- [lib/analytics/platformDataFetcher.ts](../lib/analytics/platformDataFetcher.ts)
- [lib/analytics/backgroundSyncService.ts](../lib/analytics/backgroundSyncService.ts)
- [lib/models/socialMediaMetrics.ts](../lib/models/socialMediaMetrics.ts)

#### What to change

- Make the summary route avoid sync-on-read unless there is truly no usable cache or stored summary.
- Ensure the supported analytics platforms are the only ones eligible for analytics sync and dashboard refresh.
- Keep LinkedIn/Pinterest out of the active analytics sync path entirely.
- Confirm metric persistence remains idempotent for day/platform snapshots.

#### Acceptance criteria

- Repeated analytics page loads do not trigger unnecessary syncs.
- The analytics console stops showing LinkedIn and Pinterest sync attempts in the active analytics flow.
- A read request for summary data does not create extra duplicate metric rows.

### Phase 3: Repair platform credential resolution for Facebook, Instagram, and Threads

The logs show Facebook and Instagram are not getting the expected page access token at sync time.

#### Files to inspect and fix

- [lib/analytics/facebookInstagramFetcher.ts](../lib/analytics/facebookInstagramFetcher.ts)
- [lib/analytics/threadsFetcher.ts](../lib/analytics/threadsFetcher.ts)
- [lib/models/connection.ts](../lib/models/connection.ts)
- [app/api/auth/connections/route.ts](../app/api/auth/connections/route.ts) if it needs to expose the right token fields

#### What to change

- Trace how `pageAccessToken`, `pageId`, and `platformUserId` are populated for each connection.
- Make sure the fetchers are reading the same credential fields that are actually stored in MongoDB.
- For Facebook and Instagram, verify the page token is present before sync starts and fail fast with a clear error if it is missing.
- For Threads, keep the current network fallback behavior, but isolate the timeout so it does not poison the rest of the sync loop.

#### Acceptance criteria

- Facebook and Instagram either sync successfully with the correct token or fail with a precise credential error.
- Threads timeouts are handled cleanly without hiding the real cause.
- The sync logs clearly show which credential field is missing when a platform cannot sync.

### Phase 4: Fix the broken analytics UI compile errors

The analytics UI cannot be considered stable until the syntax failures are fixed.

#### Files to inspect and fix

- [app/pages/appPages/components/Analytics/GrowthChart.tsx](../app/pages/appPages/components/Analytics/GrowthChart.tsx)
- [app/pages/appPages/components/Analytics/mockData.ts](../app/pages/appPages/components/Analytics/mockData.ts)

#### What to change

- Repair the mismatched braces/return structure in `GrowthChart.tsx`.
- Restore valid TypeScript syntax in `mockData.ts`, especially around the `AnalyticsData` type block.
- Re-run the analytics page compile after those fixes.

#### Acceptance criteria

- The analytics page compiles cleanly.
- `GrowthChart` renders again without syntax errors.
- The mock analytics fallback is available again if real data is missing.

### Phase 5: Re-run focused validation

After the above fixes, validate the exact paths that were failing.

#### Validation steps

1. Load `/api/persona` and confirm no dynamic cookies error appears.
2. Load `/api/analytics/summary` for `all`, `facebook`, `instagram`, and `threads` and confirm the sync logs are stable.
3. Confirm the analytics page compiles and renders without the `GrowthChart` or `mockData` syntax errors.
4. Run a narrow typecheck or build command for the touched analytics files.

#### Acceptance criteria

- No runtime cookie errors remain.
- No broken analytics UI imports remain.
- The analytics summary route no longer spam-syncs unsupported platforms.
- Supported platform data fetches are either valid or fail loudly with actionable errors.

## Recommended Implementation Sequence

1. Fix `lib/auth.ts` and route usage first.
2. Remove sync amplification and legacy analytics platform work from the summary path.
3. Correct the Facebook, Instagram, and Threads token resolution path.
4. Repair the broken analytics UI files.
5. Validate the end-to-end dashboard again.

## Notes And Risks

- The auth cookie issue is a framework compatibility problem, so route handlers should be updated carefully rather than patched locally in one place only.
- The analytics fetch failures may be caused by missing stored credentials, not just fetcher code, so the connection model and the sync path need to be checked together.
- The remaining LinkedIn/Pinterest references should be treated as legacy noise unless they still execute in the active analytics path.
- The build is currently blocked by syntax errors outside the analytics fetch path, so compile validation should be run only after those files are repaired.

## Definition Of Done

The work is finished when:

- `/api/persona` no longer logs the cookies warning.
- The analytics summary route no longer triggers unnecessary sync churn.
- Facebook, Instagram, and Threads sync with the correct stored credentials.
- LinkedIn and Pinterest are absent from the active analytics runtime path.
- The analytics UI files compile again.
- A focused typecheck or build passes for the analytics slice.
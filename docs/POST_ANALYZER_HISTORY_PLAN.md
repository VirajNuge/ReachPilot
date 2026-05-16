# Post Analyzer History Persistence — Implementation Plan

## Executive summary

This document defines the detailed plan to add a history layer to the Post Analyzer so completed post analyses are stored persistently, can be reopened later, and can be surfaced inside the web app the same way the Profile Analyzer history now works.

Current behavior:
- `POST /api/analyze-post` runs the Gemini analysis and writes the result to `post_analysis_cache.json`
- The API returns only `{ success: true, id }`
- The Post Analyzer page reads `analysisId` from the query string and loads `/api/analyze-post/[id]`
- Post analysis actions such as template generation already depend on `analysisId`

Goal:
- Keep the quick cache-based workflow for immediate post analysis
- Add durable, user-scoped history storage for completed analyses
- Add a history UI in the app so users can revisit previous post analyses
- Preserve the existing `analysisId` handoff so the current dashboard continues to work

---

## Design principles

1. Do not break the current quick analysis flow
2. Persist after success, but do not block the user if history save fails
3. Use the same ownership model as the rest of the app
4. Keep the cached analysis file as a transient retrieval layer if needed
5. Make the history screen lightweight by storing a compact snapshot plus the full analysis payload

---

## Current state to build on

Relevant files and behavior:
- `app/api/analyze-post/route.ts` generates the post analysis and returns an `id`
- `app/api/analyze-post/[id]/route.ts` reads the matching entry from `post_analysis_cache.json`
- `app/pages/appPages/[id]/postAnalyzer/page.tsx` requires `?analysisId=<id>` to render the analysis
- `app/pages/appPages/components/PostAnalyzer/*` components already consume `analysisId` for downstream actions
- `lib/storage.ts` already has server-backed history helpers for the Profile Analyzer pattern

Observed gap:
- Post Analyzer results are cached, but there is no persistent history collection or history page for post analyses

---

## Recommended target architecture

### Storage model

Add a dedicated MongoDB collection for post analysis history.

Suggested document shape:

```ts
interface PostAnalyzerHistoryDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  analysisId: string;
  platform: string;
  postUrl?: string;
  postAuthor?: string;
  postAuthorHandle?: string;
  postTitle?: string;
  postContent?: string;
  overallScore?: number;
  analysis: any;
  snapshot: {
    summary?: string;
    topHooks?: string[];
    topGaps?: string[];
    recommendedActions?: string[];
  };
  source?: "extension" | "web" | "manual" | "api";
  status: "completed" | "failed" | "processing";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  analyzedAt?: Date;
  tags?: string[];
  notes?: string;
}
```

### Why this shape

- `analysisId` links the persistent history record back to the cached analysis payload
- `snapshot` keeps the history list fast and cheap to render
- `analysis` stores the full payload for deep-dive reopen / compare / export workflows
- `accountId` keeps the history scoped to the active workspace/account

---

## Phase 1 — Schema and persistence foundation

### Files to create or update
- Create `lib/models/postAnalyzerHistory.ts`
- Update `lib/mongodb.ts` to add indexes
- Optionally extend `lib/types/analysis.ts` or add a new `lib/types/postAnalysis.ts`

### Indexes to add
- `{ userId: 1, accountId: 1, createdAt: -1 }`
- `{ userId: 1, accountId: 1, platform: 1 }`
- `{ userId: 1, analysisId: 1 }`
- `{ userId: 1, overallScore: -1 }`

### Model functions to implement
- `createPostAnalysisHistory(...)`
- `getPostAnalysisHistoryByAccount(userId, accountId, filters)`
- `getPostAnalysisHistoryById(id)`
- `getPostAnalysisHistoryByAnalysisId(analysisId)`
- `updatePostAnalysisHistoryMetadata(id, patch)`
- `deletePostAnalysisHistory(id, userId)`

### Notes
- Prefer a thin model wrapper around MongoDB, similar to the profile analyzer history model
- Keep all ownership checks in one place where possible

---

## Phase 2 — Backend API routes

### New routes to add
- `POST /api/analyze-post/save`
- `GET /api/analyze-post/history`
- `GET /api/analyze-post/history/[id]`
- `PATCH /api/analyze-post/history/[id]`
- `DELETE /api/analyze-post/history/[id]`

### Existing routes to update
- `POST /api/analyze-post`
- `GET /api/analyze-post/[id]`

### Planned behavior

#### `POST /api/analyze-post`
- Keep returning the immediate analysis id for the current flow
- After analysis succeeds, attempt a best-effort save to the history collection
- Do not fail the request if the history write fails
- Preserve the current file-cache write for compatibility if the rest of the app depends on it

#### `POST /api/analyze-post/save`
- Save a completed analysis as a durable history record
- Accept `accountId`, `analysisId`, `analysis`, `postData`, `snapshot?`, `source?`
- Verify ownership using auth and account lookup
- Return the saved history id plus the linked `analysisId`

#### `GET /api/analyze-post/history`
- Return paginated history for the authenticated user and account
- Support filters such as `platform`, `minScore`, date range, and search text if needed
- Return a lightweight list payload with snapshot data for the UI

#### `GET /api/analyze-post/history/[id]`
- Return the full history record for a saved post analysis
- Use ownership checks before returning data
- Allow the dashboard to reopen a historical record directly

#### `PATCH /api/analyze-post/history/[id]`
- Update metadata such as notes, tags, or pinned/baseline flags

#### `DELETE /api/analyze-post/history/[id]`
- Remove a saved post analysis
- Keep the delete behavior consistent with the profile analyzer history routes

---

## Phase 3 — Frontend integration

### Files to update
- `lib/storage.ts`
- `app/pages/appPages/[id]/postAnalyzer/page.tsx`
- `app/pages/appPages/[id]/postAnalyzer` child components that already accept `analysisId`
- `app/pages/appPages/history/page.tsx` or a new `app/pages/appPages/post-history/page.tsx`
- Sidebar navigation if a dedicated Post History entry is desired

### UI goals
- Show a history button inside Post Analyzer, matching the Profile Analyzer pattern
- Provide a history page/modal with:
  - timestamp
  - score
  - platform
  - post author / handle
  - compact summary
- Clicking a history item should reopen the dashboard with `analysisId` in the query string

### Data flow changes
- When a new post analysis completes, the redirect must keep `?analysisId=<id>`
- The history page should fetch the server-backed list, falling back to local cache only if needed
- The reopened dashboard should prefer history storage over the transient file cache when a record exists

### Suggested UX pattern
- Add a `History` button in the Post Analyzer landing/dashboard area
- The button can open either:
  - a modal showing the most recent analyses, or
  - a dedicated history page for larger lists
- For parity with Profile Analyzer, prefer a dedicated page once the history list gets beyond a handful of rows

---

## Phase 4 — Save/reopen workflow

### Required behavior
1. User runs post analysis from the extension or web app
2. `POST /api/analyze-post` returns `analysisId`
3. The client navigates to `/[id]/postAnalyzer?analysisId=<id>`
4. The page loads the cached analysis and renders the dashboard
5. The analysis is also saved into durable history for later browsing
6. History page can reopen that analysis by id

### Important rule
- The analysis should render immediately even if the history write is slow or fails
- History persistence must be non-blocking

---

## Phase 5 — Migration and backfill

### Why migration is needed
- Existing post analyses are currently only stored in `post_analysis_cache.json`
- Users may already have useful cached results that should be promoted into history

### Migration options
- Write a one-time script to import cached entries into the new collection
- Mark imported records with a source flag and preserve original timestamps
- Make the script idempotent by storing the source `analysisId` on the history record

### Suggested migration script
- `scripts/migrate-post-analysis-cache-to-history.ts`

### Migration rules
- Skip malformed entries
- Skip duplicates if a record for the same `analysisId` already exists
- Preserve chronological order where possible

---

## Phase 6 — Comparison, export, and future features

### Optional next features
- Compare two saved post analyses
- Export history as JSON or CSV
- Add tags and notes
- Add baseline selection for recurring post audits
- Add scheduled / recurring post analysis if needed later

### Recommended future routes
- `POST /api/analyze-post/compare-history`
- `POST /api/analyze-post/export`
- `POST /api/analyze-post/recurring` or a cron route if automation is needed

---

## Phase 7 — Testing plan

### Model tests
- Create and fetch history records
- Enforce ownership scoping
- Delete and update metadata

### API tests
- Save route returns a history id
- History listing returns only the authenticated user’s account items
- Reopen route returns the exact historical record
- Unauthorized and forbidden cases fail cleanly

### UI tests
- History button opens the history view
- Empty state renders when there is no history
- History list renders items from server data
- Clicking a history item reopens the dashboard with `analysisId`

### Integration tests
- Extension -> analyze-post -> save -> history page -> reopen
- Cache file fallback still works if the database is unavailable

---

## Phase 8 — Rollout and validation

### Recommended rollout sequence
1. Add schema/model/indexes
2. Add save and history routes
3. Add the history UI
4. Add migration script
5. Validate on a test account
6. Roll out to production behind a safe fallback

### Validation checklist
- New analyses appear in history after completion
- Old cached results can be migrated
- History page loads only the current account’s records
- Reopened records show the same analysis details as the original run
- `analysisId` is preserved in redirects and downstream component actions

---

## Risks and mitigations

- Large post analysis payloads can increase document size
- Use a compact snapshot for the list view and keep the full payload for detail view only

- The current cache file can drift from the database
- Treat the cache file as a temporary compatibility layer and make the database the source of truth for history

- Account mismatch can hide history records
- Always scope history queries to the active route account id, not the first account returned by `/api/accounts`

- A failed history write could hide saved work
- Keep persistence best-effort and never block the primary analysis response

---

## Suggested implementation order

1. Add `postAnalyzerHistory` model and indexes
2. Add save/history route handlers
3. Wire `POST /api/analyze-post` to write history best-effort
4. Add history page and button in the Post Analyzer UI
5. Add cache-to-history migration script
6. Add tests and validate the save/reopen flow

---

## Deliverable definition

This feature is done when:
- Every successful post analysis gets a durable history record
- Users can open a Post Analyzer history view from the app
- Clicking a history item reopens the analysis correctly
- Existing cached analyses can still be loaded by `analysisId`
- The profile analyzer history behavior and the post analyzer history behavior feel consistent in the UI

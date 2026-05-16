# Profile Analyzer History Persistence — Implementation Plan

## Executive summary

This document describes a production-ready plan to persist profile analyzer results (history) so analyses are saved to a database, can be queried by the app, compared over time, and managed securely.

Goals:
- Save each completed profile analysis to persistent storage
- Provide paginated, filterable access to analysis history
- Support full-analysis retrieval, metadata edits, and deletion
- Enable comparison/trends, recurring analyses, and exports
- Maintain security, audit logging, and retention policies

---

## Phases (high level)

1. Foundation & Schema Design
2. Backend API Routes
3. Frontend Integration
4. Testing & Quality
5. Background Jobs & Advanced Features
6. Security & Permissions
7. Migration & Rollout
8. Documentation & Handoff

---

## Phase 1 — Foundation & Schema Design

Files to create:
- `lib/models/profileAnalyzerHistory.ts`
- Update `lib/mongodb.ts` to add indexes
- Update `lib/types/analysis.ts` for history-related types

Schema (recommended MongoDB document example):

```ts
interface ProfileAnalyzerHistoryDocument {
  _id?: ObjectId;

  // Ownership
  userId: string;
  accountId: string;

  // Profile & analysis
  platform: "linkedin" | "x" | "facebook" | "instagram";
  profileUrl?: string;
  profileHandle: string;
  profileName?: string;

  // Scores
  overallScore: number;
  profileScore?: number;
  contentScore?: number;
  engagementScore?: number;
  growthScore?: number;

  // Full raw analysis payload
  analysisData: any;

  // Snapshot for quick listing
  snapshot: {
    quickFixes?: Array<{ headline: string; tag?: string }>;
    topStrengths?: string[];
    topWeaknesses?: string[];
    recommendedActions?: string[];
  };

  // Metadata
  source?: "extension" | "web" | "manual" | "api";
  status: "completed" | "failed" | "processing";
  errorMessage?: string;

  // Timing
  createdAt: Date;
  updatedAt: Date;
  analyzedAt?: Date;

  // Comparison metadata
  isBaseline?: boolean;
  comparisonMetadata?: { previousAnalysisId?: string; changeInScore?: number };

  // Tags & notes
  tags?: string[];
  notes?: string;
}
```

Recommended indexes to add in `lib/mongodb.ts` or equivalent:
- `{ userId: 1, accountId: 1, createdAt: -1 }`
- `{ userId: 1, accountId: 1, platform: 1 }`
- `{ userId: 1, overallScore: -1 }`

CRUD functions to implement in `lib/models/profileAnalyzerHistory.ts`:
- `createProfileAnalysisHistory(...)` → returns id
- `getAnalysisById(id)`
- `getAnalysisHistoryForAccount(userId, accountId, filters)`
- `getLatestAnalysisForProfile(userId, accountId, profileHandle, platform)`
- `updateAnalysisMetadata(id, update)`
- `deleteAnalysis(id, userId)`

---

## Phase 2 — Backend API Routes

Files to create/update:
- `app/api/analyze/save/route.ts` (POST)
- `app/api/analyze/history/route.ts` (GET)
- `app/api/analyze/[id]/route.ts` (GET, PATCH, DELETE)
- Update `app/api/analyze/[platform]/route.ts` to auto-save after analysis
- Update extension analyze route (if present) to auto-save
- Keep compatibility with `api/sessions` by mapping to new history store

Key endpoint behaviors:

POST /api/analyze/save
- Authenticated
- Accepts `accountId`, `platform`, `profileHandle`, `profileName`, `analysisData`, `source`, `profileUrl?`
- Extract top-level scores and snapshot for quick listing
- Insert into `profileAnalyzerHistory` collection
- Return `{ success: true, analysisId }`

GET /api/analyze/history
- Authenticated
- Query params: `accountId`, `platform?`, `minScore?`, `startDate?`, `endDate?`, `limit?`, `skip?`
- Returns paginated list with `snapshot` for each record and `total`/`hasMore`

GET /api/analyze/[id]
- Authenticated
- Ownership check
- Returns full `analysisData` and metadata

PATCH /api/analyze/[id]
- Authenticated + ownership
- Update notes/tags/isBaseline

DELETE /api/analyze/[id]
- Authenticated + ownership
- Soft or hard delete (project choice)

Auto-save integration
- After successful analysis flows (web, extension, manual), call createProfileAnalysisHistory. Failure to save should not block returning analysis to client but log error.

---

## Phase 3 — Frontend Integration

Files to update/create:
- `lib/storage.ts` (add `saveAnalysisToServer`, `fetchAnalysisHistory`, `fetchAnalysisFull`)
- `hooks/useAnalysisData.ts` (support `historyId` param to load saved analysis)
- `app/pages/appPages/history/page.tsx` (load list from server, filters)
- `app/pages/appPages/[id]/profileAnalyzer/analyzed-account/page.tsx` (support `historyId` query param)

UX suggestions:
- History list should show snapshot, score, platform, date, tags
- Clicking an item navigates to analyzed page with query `?historyId=...`
- Allow filters: platform, date range, min score, tags

---

## Phase 4 — Testing & Quality

Unit tests (model):
- `lib/models/profileAnalyzerHistory.test.ts` — CRUD tests

API integration tests:
- `__tests__/analyze-history.integration.test.ts` — POST/GET/PATCH/DELETE flows, auth checks

Frontend tests:
- `__tests__/history-page.test.ts` — component tests for listing and filters

E2E tests:
- `scripts/e2e-analyzer-history.test.ts` — full flow (analysis => saved => view)

---

## Phase 5 — Background Jobs & Advanced Features

Optional improvements:
- Recurring analysis job (`lib/jobs/recurringAnalysis.ts`) + cron route `app/api/cron/recurring-analysis/route.ts`
- Analysis comparison utility `lib/analysisComparison.ts` to compute deltas and insights
- Export endpoint `app/api/analyze/export/route.ts` (CSV/JSON)

---

## Phase 6 — Security & Permissions

Files to add:
- `lib/auth/analyzerAuth.ts` — `verifyAnalysisAccess`, `verifyAccountAccess`
- `lib/audit/analyzerAudit.ts` — log VIEW/CREATE/UPDATE/DELETE/EXPORT events
- `lib/policies/dataRetention.ts` — delete/archive old records

Authorization rules:
- Only account owners or authorized users can view/edit/delete analyses
- Audit each access for compliance

---

## Phase 7 — Migration & Rollout

Migration script:
- `scripts/migrate-analysis-sessions-to-history.ts` — migrate legacy `sessions` or local-storage blobs to new collection; mark migrated

Feature flags:
- `lib/featureFlags.ts` and environment flags (e.g. `NEXT_PUBLIC_ENABLE_ANALYZER_HISTORY`)

Rollout plan:
- Deploy to staging, run migrations dry-run
- Beta group (10%) → Monitor errors, latency, DB storage
- 50% → 100% rollout after stability

Monitoring:
- API success rates, save latency, DB growth, index usage

---

## Phase 8 — Documentation & Handoff

Files to update/create:
- `app overview/API_REFERENCE.md` — add `Profile Analyzer History API` section
- `docs/ANALYZER_HISTORY_GUIDE.md` — developer guide and migration notes

---

## Implementation checklist

Phase 1: Foundation
- [ ] Create `lib/models/profileAnalyzerHistory.ts`
- [ ] Add MongoDB indexes
- [ ] Update `lib/types/analysis.ts`

Phase 2: Backend
- [ ] Add `app/api/analyze/save/route.ts`
- [ ] Add `app/api/analyze/history/route.ts`
- [ ] Add `app/api/analyze/[id]/route.ts`
- [ ] Update existing analyze routes to auto-save

Phase 3: Frontend
- [ ] Update `lib/storage.ts` functions
- [ ] Update `hooks/useAnalysisData.ts`
- [ ] Update `history` page UI
- [ ] Update `analyzed-account` page to accept `historyId`

Phase 4: Testing
- [ ] Unit, integration, component, E2E tests

Phase 5: Advanced
- [ ] Recurring analysis / comparison / export (optional)

Phase 6: Security
- [ ] Authorization and audit logging
- [ ] Data retention

Phase 7: Migration
- [ ] Migration script and dry runs

Phase 8: Docs
- [ ] Update API docs and developer guide

---

## Key data fields recommended for a history record (example)

```json
{
  "userId": "user_123",
  "accountId": "account_456",
  "platform": "linkedin",
  "profileHandle": "john-doe",
  "profileName": "John Doe",
  "profileUrl": "https://linkedin.com/in/john-doe",
  "overallScore": 78,
  "profileScore": 85,
  "contentScore": 72,
  "analysisData": { /* full payload */ },
  "snapshot": { /* quick display fields */ },
  "source": "extension",
  "status": "completed",
  "createdAt": "2026-05-16T10:30:00Z",
  "analyzedAt": "2026-05-16T10:30:00Z",
  "tags": ["priority-client"],
  "notes": "Prepared for investor review"
}
```

---

## API response examples

`POST /api/analyze/save`:

```json
{ "success": true, "analysisId": "analysis_123abc", "message": "Analysis saved to history" }
```

`GET /api/analyze/history` (paginated):

```json
{
  "analyses": [ { "id": "analysis_123", "profileHandle": "john-doe", "overallScore": 78, "platform": "linkedin", "createdAt": "...", "snapshot": {} } ],
  "total": 47,
  "hasMore": true
}
```

`GET /api/analyze/[id]`:

```json
{ "id": "analysis_123", "profileHandle": "john-doe", "overallScore": 78, "analysisData": { /* full */ }, "snapshot": {}, "createdAt": "..." }
```

---

## Risks & mitigations

- Large `analysisData` size → compress or store in separate collection / object store
- Query performance at scale → snapshots for listing, index carefully
- Privacy & auth mistakes → strict ownership checks and audit logs
- Migration glitches → dry run and verification step

---

## Success metrics

- Analyses auto-saved within 2 seconds of completion
- History list loads <1s for 50 items
- Filtering <500ms
- 95%+ API success rate
- Full test coverage for critical flows

---

## Next steps

Pick database type (MongoDB or SQL/Prisma). Once chosen I can start Phase 1 and create the model and indexes, then proceed to API endpoints.


---

*Plan generated and saved to this repository.*

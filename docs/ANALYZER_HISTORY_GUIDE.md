# Profile Analyzer History — Developer Guide

This guide explains how to use the Profile Analyzer History feature, run migrations, and operate background jobs.

Contents
- Endpoints
- Data model
- Migration
- Cron job
- Comparison
- Export

Endpoints
- `POST /api/analyze/save` — Save an analysis (authenticated). Body: `accountId`, `analysisData`, optional `platform`, `profileHandle`, `profileName`.
- `GET /api/analyze/history?accountId=...` — List analyses (authenticated, paginated).
- `GET /api/analyze/[id]` — Get full saved analysis (authenticated, owns record).
- `PATCH /api/analyze/[id]` — Update metadata (`notes`, `tags`, `isBaseline`).
- `DELETE /api/analyze/[id]` — Delete analysis.
- `POST /api/analyze/export` — Export history as JSON or CSV. Body: `{ accountId, format }`.

Data model
- Collection: `profileAnalyzerHistory` — fields documented in `docs/ANALYZER_HISTORY_PLAN.md`.

Migration
1. Ensure `MONGO_URI` is set for your environment (staging/production).
2. Run the migration script to migrate legacy `analysis_sessions`:

```powershell
# from project root
node -r ts-node/register scripts/migrate-analysis-sessions-to-history.ts
```

The script marks migrated sessions with `_migratedToHistoryId` to make the process idempotent.

Cron job
- Route: `GET /api/cron/recurring-analysis` — protected via `x-cron-secret` header.
- Set `CRON_SECRET` env var and schedule a cron (e.g., GitHub Actions or external cron) to call the route.

Comparison
- Use `lib/analysisComparison.ts` → `compareAnalyses(baselineId, currentId)` to compute score delta and changes in strengths/weaknesses.

Export
- `POST /api/analyze/export` supports `{ format: "json" | "csv" }`.

Notes
- Large `analysisData` may grow; consider compressing or moving to object storage if necessary.
- All endpoints perform ownership checks using `lib/auth` and account lookups.

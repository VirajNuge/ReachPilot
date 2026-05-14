# Phase 2 — "Template Snap" for X (Twitter)

Overview

This document is a single-phase implementation plan that enables the Template Snap "📸 Snap" flow for X (formerly Twitter). It maps the extension capture, background coordination, backend integration, AI extract, storage, UX, and QA steps to concrete files and actions in this repo.

Why X first

- Short, high-velocity posts make structural patterns obvious (hooks, line breaks, micro-stories).
- The repo already contains X scraping logic and virtualization handling in the extension (`reachpilot-extension/content.js`).
- Extraction validation is fast: Gemini plus a JSON schema can produce repeatable blueprints.

Files to review (start points)

- Extension content/background: [reachpilot-extension/content.js](reachpilot-extension/content.js), [reachpilot-extension/background.js](reachpilot-extension/background.js), [reachpilot-extension/popup.tsx](reachpilot-extension/popup.tsx)
- Backend API: [app/api/extension/save-template/route.ts](app/api/extension/save-template/route.ts)
- Extraction library: [lib/postGeneration/templateExtractor.ts](lib/postGeneration/templateExtractor.ts)
- Template model: [lib/models/userSavedPostTemplate.ts](lib/models/userSavedPostTemplate.ts)

Goals

1. Add an X-specific Plasmo content script that captures the canonical post text + minimal metadata reliably (handles virtualization & shadow DOM fallbacks).
2. Send a single authenticated request from the extension background to the existing `POST /api/extension/save-template` route, reusing the current payload contract.
3. Tune the AI extraction prompt to optimize for X patterns (short hooks, thread-awareness, CTA types) and validate JSON output with current `parseAIJson()` + `validateTemplate()` style.
4. Provide immediate UX feedback in the extension popup and background (toasts, saved preview, retry on failure).
5. Ensure saved templates are indexed by platform, hooks, and category and surfaced in the dashboard.

Detailed implementation plan

Phase 2 — Tasks (ordered)

1) Review & audit (0.5 day)
- Inspect `reachpilot-extension/content.js` to confirm X selectors, virtualization handling, and `ANALYZE_POST`/`scrape_profile` handlers. The extension already includes a `TwitterStrategy` for scraping profile posts.
- Inspect `background.js` for message patterns (`post_extracted`, `post_error`) and retry/watchdog logic.
- Verify the backend route `app/api/extension/save-template/route.ts` matches the extension's expected payload (platform, postUrl, caption, mediaUrls, authorUsername, metrics).
- Verify `lib/postGeneration/templateExtractor.ts` implements the Gemini call and current JSON schema.

Deliverable: list of any selector mismatches, required small backend changes, or missing auth plumbing.

2) Extension Capture script (Plasmo) — `contents/x-snap.tsx` (1-2 days)
- Create a Plasmo content entry `contents/x-snap.tsx` that exports a capture function for a single X post page and for the popup "Analyze Post" button.
- Capture strategy:
  - Prefer: read the closest post container `article[data-testid="tweet"]` article node and call `postEl.innerText`.
  - Fallbacks:
    - If `innerText` returns empty or includes UI noise, recursively collect text-bearing `div` and `span` inside the post container.
    - If X uses Shadow DOM, use `querySelectorAll("article").forEach(a => a.shadowRoot?...)` fallback (try, but many pages don't expose shadowRoot across origins).
  - Thread handling:
    - Detect thread parts by looking for grouped `article` elements or reply containers; if multiple contiguous articles share the same author handle, capture them as a multi-part `caption` array or joined with "\n---THREAD---\n" marker.
- Payload shape:
  {
    platform: 'x',
    postUrl, // canonical tweet URL
    caption: string, // joined thread or single tweet innerText
    mediaUrls: string[], // optional
    authorUsername: string,
    metrics: { likes, replies, retweets, views? }
  }

- Security: do not collect private messages or user credentials.

Example code snippet (in MD):

```tsx
async function handleSnap(postEl: HTMLElement) {
  const rawContent = postEl.innerText || collectTextFallback(postEl);
  const sourceUrl = window.location.href;
  const author = postEl.querySelector('a[href*="/status/"]')?.getAttribute('href')?.split('/')?.[1] || '';
  const metrics = {
    likes: parseNumber(postEl.querySelector('[data-testid="like"]')?.innerText),
    replies: parseNumber(postEl.querySelector('[data-testid="reply"]')?.innerText),
    retweets: parseNumber(postEl.querySelector('[data-testid="retweet"]')?.innerText),
  };

  chrome.runtime.sendMessage({
    type: 'SAVE_TEMPLATE_REQUEST',
    payload: { rawContent, sourceUrl, platform: 'x', authorUsername: author, metrics }
  });
}
```

3) Background wiring & delivery (0.5 day)
- Add a `SAVE_TEMPLATE_REQUEST` handler in `background.js` that:
  - Receives the payload from content script
  - Persists a short local state for retry/backoff
  - Forwards to `fetch(`${APP_URL}/api/extension/save-template`, { method: 'POST', body: JSON.stringify(...) })` attaching current cookies/session (background context has capability to call extension-authenticated endpoints).
  - Transmit success/failure back to popup via `chrome.runtime.sendMessage({ action: 'template_saved', data })` or error codes for UI.
- Retries: implement exponential backoff (max 3 tries) and show the user a retry toast.
- Watchdog: reuse existing `resetWatchdog()` pattern so long operations don't leave stale state.

4) Backend acceptance & small adapter (0.5 day)
- The backend route `app/api/extension/save-template/route.ts` already exists and expects `caption` + `platform`. Ensure the extension sends `caption: rawContent` and maps metrics keys to the expected schema.
- If needed, add a thin adapter route `app/api/extension/save-template/x` (optional) to preprocess X-specific fields (e.g. parse views or retweet formats) prior to calling `extractTemplateFromPost()` to keep the generic route stable.

5) AI extraction tuning (1 day)
- Create a specialized X prompt variant in `lib/postGeneration/templateExtractor.ts` or a small wrapper `buildXExtractionPrompt()` to emphasize:
  - Short hook extraction (1-2 lines)
  - Line-break / thread structure detection
  - Micro-story vs one-liner classification
  - CTA types specific to X (reply, quote, like, follow, retweet)
- Keep the same JSON output schema used by `templateExtractor` (name, description, category, structure, hooks, cta, tone, psychologyTriggers).
- Test the prompt locally with a set of representative tweets/threads and iterate until JSON output is stable.

Suggested X Architect Prompt (short):

> You are a world-class short-form social strategist. Given the raw text of a single X post or a short thread, return only valid JSON with fields: name, description, category (list: micro_story, listicle, contrarian, thread, opinion, question), structure (3-4 sentence framework), hooks (array), cta (string), tone, psychologyTriggers. Replace entities with variables like [Niche], [Metric], [Audience]. Do not output any other text.

6) Storage & indexing (0.5 day)
- The `userSavedPostTemplate` model already supports `platformVariants`, `sourcePost`, and `template`. Ensure X-saves set `source: 'extension_capture'` and index `platformVariants.platform` and `template.hooks` for search.
- Add a small `normalizedHandle` field or ensure `sourcePost.authorUsername` is present for ownership and dedupe checks.

7) Extension popup UX & feedback (0.5 day)
- When user clicks "Analyze Post" in the popup (or clicks Snap from a context menu), show a loading state and disable repeat clicks.
- On success, show a toast: "✅ Saved to ReachPilot — Open in Dashboard" and optionally a quick preview (name, top hook, CTA).
- On failure, show descriptive errors: "Extraction failed — try a clearer post" or "Network error — retry".

8) Tests & QA (1 day)
- Unit test the prompt builder and `parseAIJson()` path using sample X posts (happy path + malformed outputs).
- E2E manual tests:
  - Single tweet with a clear hook
  - Thread of 3 tweets (same author) — verify joined capture and extraction
  - Tweets with lots of emoji/line breaks
  - Tweets with quoted tweets (ensure quoted content is ignored or optional)
- Security check: ensure extension never sends cookies other than domain auth and never stores PII beyond public author handle.

9) Rollout & telemetry (0.5 day)
- Add a small telemetry event when a snap is saved (extension background -> `POST /api/telemetry` or log to server): fields: platform, success/failure, confidence (if returned by backend), duration.
- Feature flag rollout: gate X Snap behind a feature flag in the popup or user account settings for staged rollout.

Validation & acceptance criteria

- A user can click "Snap" on an X post and the extension saves the template via the existing backend route.
- Saved template appears in the Template Library with platform X and shows hooks/CTA/tone.
- Confidence threshold set in `app/api/extension/save-template/route.ts` is enforced (backend rejects low-confidence extractions).
- Extension displays clear success/error UX and retries transient failures.

Implementation notes & pitfalls

- Virtualized DOM: X uses virtualization; ensure content script harvests `article[data-testid="tweet"]` and uses scroll-and-harvest when scraping profile pages. For single-post pages (status URL) reading one article should be stable.
- Quoted tweets and embedded media: treat quoted tweets as separate sources. Prefer capturing only the author's text unless user explicitly chooses to include quoted content.
- Thread detection: define a simple heuristic: contiguous `article` nodes sharing the same author handle and adjacent in DOM → treat as thread. Avoid absorbing replies/interactions.
- Rate limits & privacy: the extension must not call LLMs directly, and background should call only our server to avoid exposing keys.

API payload example (what extension sends)

```json
{
  "platform": "x",
  "postUrl": "https://x.com/user/status/12345",
  "caption": "First line hook\nSecond line body\n...",
  "mediaUrls": ["https://pbs.twimg.com/media/xxx.jpg"],
  "authorUsername": "user",
  "authorName": "Display Name",
  "metrics": { "likes": 120, "replies": 12, "retweets": 8 }
}
```

Developer checklist (concrete git tasks)

- [ ] Create `reachpilot-extension/contents/x-snap.tsx` (Plasmo content entry)
- [ ] Update `reachpilot-extension/background.js` to handle `SAVE_TEMPLATE_REQUEST` and forward to app
- [ ] Add small adapter in `app/api/extension/save-template/route.ts` to accept X-specific keys (if needed)
- [ ] Add `buildXExtractionPrompt()` or `promptVariant: 'x'` branch in `lib/postGeneration/templateExtractor.ts` and test with sample tweets
- [ ] Add popup UX changes in `reachpilot-extension/popup.tsx` to call snap on active tab
- [ ] Add unit tests for `parseAIJson()` + X prompt output
- [ ] Add telemetry logging path and feature flag

Estimated effort

- Total: 4–6 developer-days (audit + implementation + QA)

Next steps (what I'll do if you'd like me to continue)

- I can scaffold `reachpilot-extension/contents/x-snap.tsx` and add the `SAVE_TEMPLATE_REQUEST` handler to `background.js` with the exact message contract, then run quick static checks.

---

Plan authored from repo context; main touchpoints: [reachpilot-extension/content.js](reachpilot-extension/content.js), [reachpilot-extension/background.js](reachpilot-extension/background.js), [app/api/extension/save-template/route.ts](app/api/extension/save-template/route.ts), [lib/postGeneration/templateExtractor.ts](lib/postGeneration/templateExtractor.ts), [lib/models/userSavedPostTemplate.ts](lib/models/userSavedPostTemplate.ts)
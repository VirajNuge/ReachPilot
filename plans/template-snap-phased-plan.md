# X Contextual Math Feature Plan

## Feature summary

This feature turns X post engagement into contextual math instead of raw vanity numbers. The extension should surface a small set of local scores that help users judge whether a post is shallow, viral, controversial, or algorithmically strong without calling any AI service.

The goal is not to explain the post with generated language. The goal is to compute simple, defensible metrics in the browser and show them as lightweight hover pills on X posts.

## Product goal

When a user hovers over an X post, ReachPilot should show a compact set of stat pills such as:

- Virality score
- Discussion intensity
- Quality score
- Algorithm weight
- Platform benchmark badge

These scores should be derived from visible engagement numbers and simple formulas. The result should feel instant, local, and trustworthy.

## What the feature should answer

The feature should help a user answer four questions at a glance:

1. Is this post getting meaningful engagement, or just likes?
2. Is this post being shared enough to escape the existing audience?
3. Is this post sparking discussion or controversy?
4. How strong is this post when comments and shares are weighted more heavily than likes?

## Core calculations

### 1. Engagement Quality Index

Formula:

$$\frac{\text{Comments} + \text{Shares}}{\text{Likes}}$$

Purpose:

- Measures whether engagement is deep or shallow.
- High likes with very low comments and shares should produce a weak quality score.

Suggested interpretation:

- Above 0.2: High value content
- 0.05 to 0.2: Mixed quality
- Below 0.05: Shallow or click-bait style engagement

Implementation note:

- Return `0` when likes are missing or `0` to avoid divide-by-zero behavior.
- Treat shares as reposts when the UI exposes X terminology.

### 2. Virality Velocity

Formula:

$$\frac{\text{Shares}}{\text{Followers}} \times 1000$$

Purpose:

- Measures amplification relative to audience size.
- Lets a smaller account be compared more fairly against a larger one.

Suggested interpretation:

- 10 or above: Viral potential
- 2 to 10: Healthy amplification
- Below 2: Echo chamber behavior

Implementation note:

- If follower count cannot be read, show the pill as unavailable rather than guessing.
- If follower count is `0` or unavailable, display a safe fallback like `n/a`.

### 3. Controversy and Discussion Ratio

Formula:

$$\frac{\text{Comments}}{\text{Likes}}$$

Purpose:

- Shows whether the post is prompting debate, disagreement, or active discussion.

Suggested interpretation:

- 0.5 to 1.0: Hot topic
- Above 1.0: Warning, likely controversial or heavily debated
- Below 0.1: Safe or passive

Implementation note:

- Use this as a label-driving score, not a moral judgment.
- The UI copy should stay neutral and descriptive.

### 4. Algorithm Weight Score

Formula:

$$\text{Likes} + (\text{Comments} \times 4) + (\text{Shares} \times 10)$$

Purpose:

- Produces one weighted number that reflects platform value more realistically than likes alone.
- Gives shares the heaviest weight because they expand reach more directly.

Suggested interpretation:

- This is the main comparison number for internal ranking and card ordering.
- It should not be presented as a universal absolute score unless the platform and visible counts are known.

Implementation note:

- This score is only useful if the counts are normalized consistently.
- The score should be shown alongside the raw counts so the user can audit it mentally.

## Benchmark logic

The feature should compare the post against platform-specific standards, not one generic threshold for all platforms.

Recommended baseline thresholds:

- LinkedIn: good engagement rate above 2.0%
- Instagram: good engagement rate above 1.0%
- Threads: good engagement rate above 1.5%
- X: good engagement rate above 0.15%

For X specifically, use the benchmark as a context badge rather than a hard score gate.

Suggested badge logic for X:

- Above benchmark: Strong for X
- Near benchmark: Average for X
- Below benchmark: Weak for X

## UI direction

The UI should stay minimal and readable. The feature should not add a dense analytics table.

Recommended presentation:

- Show small stat pills on hover.
- Keep labels short and visual.
- Use color sparingly and consistently.
- Prefer one-line labels with optional tooltips for explanation.

Example pills:

- Rocket icon for Virality
- Chat icon for Discussion
- Diamond or badge icon for Quality
- Weight or bar icon for Algorithm Power

The hover state should feel instant and lightweight, not like a dashboard takeover.

## Data requirements

To compute the scores, the extension needs these inputs when available:

- likes
- comments
- shares or reposts
- follower count
- post URL
- platform name

Optional fields that improve confidence:

- author handle
- post type, such as single post or thread
- timestamp
- visible view count if the DOM exposes it cleanly

## Data acquisition strategy for X

The extension should prioritize visible DOM text and stable containers over brittle selectors.

Recommended approach:

1. Read the post container as a whole.
2. Extract `innerText` and parse visible counts.
3. Fall back to smaller labeled regions if the container is virtualized.
4. Avoid any hidden or inferred values.
5. If a metric cannot be read safely, omit it from the pill instead of fabricating a number.

Important rule:

- The feature should not depend on AI or remote computation.
- All formulas should run locally in the browser.

## Component plan

### AnalyticsPill component

Create a single reusable component for the X hover analytics surface.

Responsibilities:

- Accept `likes`, `comments`, `shares`, and `followers` as props.
- Compute all derived metrics locally.
- Decide which pills to show and which to suppress.
- Format values for display.

Suggested output shape:

- virality
- quality
- discussionRatio
- algorithmWeight
- benchmarkLabel

### Helper logic

The scoring helper should be a pure function with safe defaults.

Behavior rules:

- Never throw if a value is missing.
- Never divide by zero.
- Return `null` or `undefined` for unavailable metrics.
- Keep formatting separate from arithmetic.

## Phase plan

### Phase 0: Define the X scoring contract

Goal: lock the formulas, thresholds, and fallback behavior before touching the UI.

Tasks:

- Define one shared score model for X analytics.
- Decide how each metric behaves when a count is missing.
- Standardize number parsing for likes, comments, shares, and followers.
- Decide whether follower count is required for the virality pill or optional.
- Document the exact copy for each score state.

Acceptance criteria:

- Every score has a deterministic formula.
- Every score has a fallback when a required input is missing.
- The model is small enough to run in the content script without delays.

### Phase 1: Build the local math engine

Goal: implement the scoring helpers before wiring the UI.

Tasks:

- Add a pure helper module for post vitals.
- Implement EQI, Virality Velocity, Discussion Ratio, and Algorithm Weight Score.
- Add safe parsing for comma-separated or shorthand counts.
- Add formatting helpers for compact display.
- Add a benchmark helper for platform comparison labels.

Acceptance criteria:

- The helper returns correct values for known test cases.
- Division by zero and missing data are handled safely.
- The module can be unit tested without DOM access.

### Phase 2: Wire X DOM extraction

Goal: capture the visible engagement counts on X reliably enough to support the math layer.

Tasks:

- Identify the X post container used by the snap flow.
- Extract visible likes, comments, shares, and follower count when available.
- Prefer a broad text capture path first, then narrow parsing.
- Add fallback logic for virtualization and expanded threads.
- Normalize extracted counts into numbers before passing them to the scoring helper.

Acceptance criteria:

- The extension can read the metrics needed for the score engine on a real X post.
- Missing follower count does not break the rest of the pills.
- The extraction path does not depend on AI or backend requests.

### Phase 3: Build the hover pill UI

Goal: show the scores in a small, readable overlay on hover.

Tasks:

- Create the `AnalyticsPill` component.
- Display only the pills that have enough data to be meaningful.
- Add compact label text for each metric.
- Add tooltips or helper copy only where needed.
- Keep the layout small enough not to block the post content.

Acceptance criteria:

- Hovering a post shows a compact analytics row.
- The pills are readable on desktop and do not require scrolling.
- The UI still feels like part of X, not a separate dashboard.

### Phase 4: Add benchmark-aware labeling

Goal: compare X posts against the 2026 platform standard.

Tasks:

- Add X-specific benchmark thresholds.
- Convert the engagement rate into badge states.
- Keep the benchmark label simple and explainable.
- Make sure threshold labels do not overclaim certainty.

Acceptance criteria:

- The UI can show whether a post is above, near, or below the X benchmark.
- The benchmark logic is decoupled from the raw math formulas.

### Phase 5: Add ranking and reuse hooks

Goal: make the math useful beyond a hover display.

Tasks:

- Store the computed scores with the snapped post if that helps later sorting.
- Add an ordering strategy for posts based on Algorithm Weight Score.
- Expose a filter for high-quality or high-virality posts.
- Make the score data reusable by any future dashboard view.

Acceptance criteria:

- The feature can power both hover UI and later sorting.
- The stored data remains lightweight and normalized.

### Phase 6: Testing and hardening

Goal: make sure the math is stable across real-world input.

Tasks:

- Add unit tests for all score formulas.
- Add tests for missing data, zero values, and large counts.
- Add DOM extraction tests for the X parser if the codebase already has a test harness for content scripts.
- Validate the hover UI with mocked values.

Acceptance criteria:

- The math outputs are stable and predictable.
- The UI does not break when one metric is unavailable.
- The feature fails gracefully when X changes its DOM.

## Implementation order

Recommended order:

1. Define the scoring contract
2. Build the local math helpers
3. Wire X extraction
4. Render the hover pills
5. Add benchmark labels
6. Add ranking reuse hooks
7. Add tests and hardening

This order keeps the feature grounded in deterministic calculations before any UI polish.

## Risks and constraints

- X DOM structure can change frequently, so extraction should be defensive.
- Follower count may not always be visible, so virality must degrade gracefully.
- Visible counts can be missing, truncated, or virtualized, so the UI should not promise exactness when the data is incomplete.
- The feature should not depend on backend AI, because the point is fast local math.

## Definition of done

The feature is done when:

- Hovering over an X post shows the requested stat pills.
- The pills are computed locally from visible engagement data.
- EQI, Virality Velocity, Discussion Ratio, and Algorithm Weight Score all work.
- Platform benchmark labeling is present for X.
- Missing data does not crash the experience.
- The formulas are covered by tests.

## Next product step after this plan

After the X-only analytics layer is stable, the same math pattern can be generalized to other platforms with their own benchmark thresholds and extraction rules.


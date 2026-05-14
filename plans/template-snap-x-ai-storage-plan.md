# Template Snap Phase 3 - X AI Extraction and Template Storage Plan

## Goal

When a user clicks `Snap` on an X post, ReachPilot should read the post with Gemini, deconstruct it into a reusable writing template, save that template in MongoDB, and make it available later inside post generation so the user can write in the same style.

This plan is X-first. The same architecture can later be expanded to LinkedIn and other platforms, but the initial implementation should optimize for X thread/posts, hooks, and concise CTA patterns.

## Current Code That Already Exists

- Extension capture and button injection live in [reachpilot-extension/content.js](../reachpilot-extension/content.js) and [reachpilot-extension/background.js](../reachpilot-extension/background.js).
- The save endpoint already exists in [app/api/extension/save-template/route.ts](../app/api/extension/save-template/route.ts).
- Gemini extraction already exists in [lib/postGeneration/templateExtractor.ts](../lib/postGeneration/templateExtractor.ts).
- Template persistence already exists in [lib/models/userSavedPostTemplate.ts](../lib/models/userSavedPostTemplate.ts).

The plan below should extend those files instead of replacing them.

## Target User Flow

1. User opens X and clicks `Snap` on a specific post.
2. The extension captures the post text, author, metrics, media, and URL.
3. The extension sends the payload to `POST /api/extension/save-template`.
4. The backend uses Gemini to extract the underlying writing pattern.
5. The extracted structure is stored as a reusable template in MongoDB.
6. Later, when the user generates a post, they can choose that saved template as a writing style.

## What The AI Must Extract From X

X posts are usually compact, so the AI should focus on structure, not long summaries. The extractor should return:

- `name` - a short template name like `Contrarian Hook + Proof + CTA`
- `description` - one sentence on what the pattern does
- `category` - a normalized content type
- `structure` - a reusable framework the user can reapply
- `hooks` - the first-line or first-two-line hook patterns
- `cta` - the engagement or conversion action
- `tone` - the voice/style of the post
- `psychologyTriggers` - why the post works
- `requiredElements` - the minimum building blocks

For X specifically, the model should understand:

- line breaks and short paragraphs
- contrast / contrarian hooks
- micro-story arcs
- listicle formatting
- thread structure
- reply/quote/retweet CTA language
- emojis and punctuation used as attention cues

## Backend Plan

### 1. Keep `save-template` as the single entry point

The route in [app/api/extension/save-template/route.ts](../app/api/extension/save-template/route.ts) should remain the place where extension captures are validated, deduped, extracted, and saved.

### 2. Make the route X-aware

For X payloads, the route should treat these fields as first-class input:

- `platform: "x"`
- `postUrl`
- `caption`
- `authorUsername`
- `authorName`
- `metrics`
- `mediaUrls`

The route should continue to:

- authenticate the user
- reject missing/invalid payloads
- prevent duplicate saves by `postUrl`
- call Gemini extraction
- reject low-confidence extractions
- generate platform variants
- save the final record

### 3. Improve X-specific extraction behavior

Add an X-focused prompt branch in [lib/postGeneration/templateExtractor.ts](../lib/postGeneration/templateExtractor.ts), or a dedicated helper such as `buildXExtractionPrompt()`.

That prompt should bias Gemini toward:

- extracting the first hook line
- identifying whether the post is a thread, single post, or story post
- identifying the CTA type
- normalizing the structure into a reusable framework
- returning clean JSON only

### 4. Add X-specific confidence logic

For X, confidence should be higher when the output includes:

- a strong hook
- a clear structure
- at least one CTA
- a clear tone
- at least two psychology triggers

Confidence should be lower when the post is too short, pure media, or lacks clear structure.

### 5. Keep duplicate detection based on source URL

The current duplicate path in [app/api/extension/save-template/route.ts](../app/api/extension/save-template/route.ts) should remain the main check. For X, that is enough for the first version because the Snap button always captures a specific public post.

## Gemini Prompt Plan For X

The X prompt should ask Gemini to think like a social strategist, not a summarizer.

### The prompt should explicitly ask for:

- one reusable content blueprint
- the post’s hook logic
- the post’s structure in plain English
- the CTA pattern
- emotional or psychological drivers
- minimal categories appropriate for X

### Suggested X categories

The extractor can map X posts into categories such as:

- `contrarian`
- `micro_story`
- `listicle`
- `opinion`
- `question`
- `thread`
- `announcement`
- `how_to`

### Suggested X template output shape

```json
{
  "name": "Contrarian Hook + Proof + CTA",
  "description": "A short X post that opens with a surprising claim, supports it with one proof point, and ends with a reply-driven CTA.",
  "category": "thought_leadership",
  "structure": "Start with a sharp hook in sentence one. Follow with 1-3 short lines of proof, context, or tension. End with a CTA that asks for opinions or invites a reply.",
  "hooks": ["Most people get X wrong", "Here is the unpopular truth about X"],
  "cta": "Ask readers to reply with their experience or opinion.",
  "tone": "direct, punchy, confident",
  "psychologyTriggers": ["curiosity", "social proof", "contrarian framing"],
  "requiredElements": ["hook", "proof", "cta"]
}
```

## MongoDB Storage Plan

The template should be saved through [lib/models/userSavedPostTemplate.ts](../lib/models/userSavedPostTemplate.ts).

### Save fields that matter most for X

- `sourcePost.platform = "x"`
- `sourcePost.postUrl`
- `sourcePost.authorUsername`
- `sourcePost.authorName`
- `sourcePost.caption`
- `sourcePost.mediaUrls`
- `sourcePost.metrics`
- `template.name`
- `template.description`
- `template.category`
- `template.structure`
- `template.hooks`
- `template.cta`
- `template.tone`
- `template.psychologyTriggers`
- `platformVariants`
- `aiAnalysis.confidence`
- `metadata.source = "extension_capture"`

### Indexes to support fast reuse

The model should be optimized so templates can be found later by:

- `sourcePost.postUrl`
- `template.category`
- `platformVariants.platform`
- `template.hooks`
- `createdAt`

If needed, add a text/search-friendly index for `template.name`, `template.description`, and `template.hooks` so the post-generation UI can search by style.

## Post Generation Integration Plan

The saved X template must become a reusable writing style inside the generation flow.

### Required behavior

- show saved X templates in the template library
- allow the user to select one as the writing style for a new post
- pass the selected template into the generation prompt
- let the generator preserve the template’s hook, pacing, CTA, and tone
- allow partial reuse, not just copy-paste generation

### Suggested data passed into generation

When a user selects a saved template, the generator should receive:

- `templateId`
- `template.name`
- `template.category`
- `template.structure`
- `template.hooks`
- `template.cta`
- `template.tone`
- `template.psychologyTriggers`
- `sourcePost.platform`

The generation prompt should tell Gemini to use the template as a style blueprint, not as a verbatim source post.

## X-Specific UX Plan

After the Snap button is clicked:

- show `Snapping...`
- show `Reading post with Gemini...`
- show `Template saved` if success
- show the extracted template preview: name, hook, CTA, tone
- show an error if confidence is too low

The preview matters because X users need to know whether the post was understood as a pattern or just saved as raw text.

## Implementation Order

1. Confirm the X payload sent from `content.js` contains `caption`, `postUrl`, `authorUsername`, `authorName`, and `metrics`.
2. Add or refine the X prompt branch in [lib/postGeneration/templateExtractor.ts](../lib/postGeneration/templateExtractor.ts).
3. Keep confidence checks in [app/api/extension/save-template/route.ts](../app/api/extension/save-template/route.ts).
4. Save the extracted template with `metadata.source = "extension_capture"`.
5. Add or improve template-library search and reuse in post generation.
6. Add a preview card so users can see the extracted style immediately.

## Acceptance Criteria

- Clicking `Snap` on an X post saves a reusable template.
- The stored record includes source post data and extracted template structure.
- The template can be selected later during post generation.
- The generator uses the saved template as a writing style blueprint.
- Low-quality or unclear posts are rejected with a clear message.

## Notes And Risks

- X is highly variable, so the prompt needs to be strict about JSON and reusable structure.
- Threads may need separate handling later, but the first version can still extract a blueprint from the visible main post.
- Public-post capture is safest; do not attempt private or protected content.
- If X UI changes, the capture script may need selector updates, but the backend template flow should stay stable.

## Files Most Likely To Change

- [reachpilot-extension/content.js](../reachpilot-extension/content.js)
- [reachpilot-extension/background.js](../reachpilot-extension/background.js)
- [app/api/extension/save-template/route.ts](../app/api/extension/save-template/route.ts)
- [lib/postGeneration/templateExtractor.ts](../lib/postGeneration/templateExtractor.ts)
- [lib/models/userSavedPostTemplate.ts](../lib/models/userSavedPostTemplate.ts)
- post generation UI and prompt files under [app](../app) and [lib](../lib)

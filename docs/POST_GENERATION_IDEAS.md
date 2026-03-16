# Post Generation — Research Ideas & Improvement Directions

A living document for exploring how to make the post generation pipeline smarter, faster, and more effective. Use this as a starting point for research sprints.

---

## 1. Prompt Engineering & AI Model Quality

### Current State
The pipeline uses a multi-stage approach: Strategist → Captions → Platform Optimizers → Image Prompt. Each stage is a single-shot GPT-4o call with a handcrafted system prompt.

### Ideas to Research
- **Chain-of-thought prompting** — Ask the model to reason step-by-step before outputting the final caption. Research shows this improves quality on complex tasks (e.g., tone matching, audience adaptation).
- **Few-shot examples in prompts** — Inject 2–3 high-performing post examples into the caption prompt. The examples could be sourced from a curated library or from the user's own past successful posts.
- **Self-critique / reflection loop** — After generating captions, pass them back to GPT-4o with the instruction: "Review these captions against the strategy and score them. Improve the weakest one." Only the improved version surfaces.
- **Structured output (JSON mode + Zod)** — Replace freeform text parsing with strict JSON schema output to eliminate parse errors and enable richer structured responses.
- **Temperature tuning per stage** — Strategist benefits from low temperature (deterministic), hooks/captions from mid (creative), image prompts from higher (imaginative). Currently all likely use the same default.
- **Model routing** — Route simple/short-form posts to a cheaper model (GPT-4o mini) and only escalate to GPT-4o for complex tone/persona combos. Could cut costs 5–10x on easy generations.

---

## 2. Personalisation & Memory

### Current State
The user selects a persona, tone, and writing style. The pipeline has no memory across sessions.

### Ideas to Research
- **Post history memory** — Store past generated posts per user. Feed a summary (top 5 performing hooks, preferred CTA patterns, recurring themes) into the strategy prompt to personalise output over time.
- **Brand voice fingerprinting** — Let users paste 3–5 examples of their best posts. Use embeddings to extract a "voice fingerprint" (sentence length, emoji density, formality score, punctuation patterns). Inject these metrics as constraints into the caption prompt.
- **Dynamic persona evolution** — The persona profile (audience, goals, tone) could be auto-refined after each generation based on user edits. If the user always rewrites the hook, learn from that signal.
- **Saved caption snippets** — Let users save phrases, CTAs, or hook patterns they like. Surface them as suggestions in future generations.
- **Per-platform preferences** — Learn that this user always wants LinkedIn captions to be formal and under 200 words, but Instagram captions with 5+ emojis. Persist and apply automatically.

---

## 3. Hook & CTA Intelligence

### Current State
Hooks are generated as a fixed list of options with a style label. Selection replaces the opening line of the caption.

### Ideas to Research
- **Hook style library** — Build a taxonomy of hook styles (Question, Contrarian, Story, Statistic, Bold Statement, "I almost missed this…") backed by research on what drives engagement per platform. Surface the most relevant styles for the content type.
- **Data-driven hook ranking** — If analytics integration exists (or is added), rank hook styles by their historical CTR for this user's audience. Show the top-performing style first.
- **CTA variation testing** — Generate 3 CTA variants (soft ask, direct ask, curiosity gap) and let the user pick. Track which CTAs the user keeps across sessions to learn their preference.
- **Hook A/B suggestions** — For a single post, generate two full captions with different hooks. Present as a side-by-side comparison so the user can pick, rather than swapping hooks in isolation.

---

## 4. Platform Algorithm Awareness

### Current State
Platform optimisers adjust tone and format. LinkedIn gets formal, Instagram gets casual + emojis.

### Ideas to Research
- **Character/word limit enforcement** — Hard-enforce character limits per platform (Twitter/X: 280, LinkedIn: 3,000 recommended, Instagram: 2,200 max but 125 visible). Surface a visible counter in the UI.
- **Hashtag strategy per platform** — Research shows Instagram performs best with 3–5 niche hashtags (not 30). LinkedIn hashtags should be broad. Twitter hashtags should be 1–2. Generate platform-appropriate hashtag sets automatically.
- **Optimal post format detection** — Detect whether the content type suits a list post, a story post, a single bold claim, or a carousel. Suggest the format before generating captions.
- **Carousel / thread generation** — For content that lends itself to series (e.g., "5 lessons from…"), offer to generate a carousel script (slide-by-slide) or a Twitter/X thread. Currently only single-post captions are supported.
- **Algorithm timing hints** — Surface research-backed best times to post per platform and audience (e.g., LinkedIn: Tue–Thu 8–10am, Instagram: Wed/Fri 11am). Not personalised, but better than nothing.

---

## 5. Visual / Image Generation

### Current State
The pipeline generates a single image prompt → calls a text-to-image API → renders in the output dashboard.

### Ideas to Research
- **Brand kit integration** — Let users upload their brand colours (hex codes) and logo. Inject these as hard constraints into the image prompt. Research how DALL-E 3 / Stable Diffusion handle colour constraint prompts.
- **Image style presets** — Offer named style presets (Minimal, Bold, Photography, Illustration, Data Visualisation) that map to proven prompt suffixes. Users pick a style, not a raw prompt.
- **Multiple image variants** — Generate 3–4 image options instead of 1. Cheap with batched API calls. The user picks their favourite, which also provides implicit preference data.
- **Image-caption coherence scoring** — After generating both the caption and image, run a quick VQA (visual question answering) pass: "Does this image match the caption's message?" Score coherence and flag mismatches.
- **Image editing / regeneration with feedback** — After seeing the image, let users type feedback ("make it more minimal", "remove the person", "use blue tones"). Pass the feedback + original prompt to the image API as an edit instruction.
- **Text-on-image overlays** — For quote posts or stats posts, optionally composite the hook text onto the image as a styled overlay. Research canvas/sharp integration for server-side compositing.

---

## 6. Content Strategy & Trend Awareness

### Current State
The Strategist prompt is static — it uses the persona + topic input with no real-world context.

### Ideas to Research
- **Trend injection** — Before the Strategist call, fetch current trending topics for the user's niche using a search API (Perplexity, Exa, or Google Trends). Inject the top 3 trends as optional context. Let the user toggle this on/off.
- **Competitor post analysis** — Let users paste a competitor's post or profile URL. Extract tone, structure, and engagement patterns. Use these as "what works in this niche" context for the Strategist.
- **Content pillar balancing** — Track how many posts the user has generated per content pillar (Educational, Promotional, Inspirational, Behind-the-scenes). Surface a "you've been posting mostly Promotional — consider Educational next" nudge.
- **Evergreen vs. timely detection** — Classify whether the generated content is time-sensitive or evergreen. Suggest scheduling timely posts immediately and batching evergreen ones.
- **Topic clustering** — If the user generates multiple posts around similar topics, surface a suggestion: "You have 4 posts about AI tools — consider a content series."

---

## 7. Analytics & Feedback Loop

### Current State
No analytics. There is no mechanism to learn from what posts perform well.

### Ideas to Research
- **Post performance tracking** — After a post is published (via integration or manual entry), let users log its performance metrics (impressions, likes, comments, shares). Store these against the generation config (persona, tone, platform, hook style used).
- **Generation-to-performance correlation** — Aggregate performance data across users (anonymised) to identify which hook styles, tones, and content types correlate with higher engagement per platform. Feed back into hook ranking and strategy suggestions.
- **A/B test support** — Generate two caption variants, let the user publish both (split audience), and track which performs better. Over time, identify winning patterns for this user's audience.
- **Content score validation** — The current pipeline computes a `contentScore`. Research whether this score correlates with actual post performance once analytics data is available. Calibrate the scoring model accordingly.

---

## 8. Workflow & Collaboration

### Current State
Single-user, synchronous generation. One post at a time.

### Ideas to Research
- **Draft save & resume** — Auto-save generation state (form inputs, strategy, captions) so users can leave mid-session and return. Currently all state is lost on page reload.
- **Team review workflow** — For teams, route generated posts to an approval queue before publishing. Reviewers can approve, reject, or leave comments. Research how to model this without over-engineering.
- **Bulk generation** — Let users input a content calendar (CSV or form with 5–10 topics + dates) and generate all posts in a batch. Parallelise API calls. Surface results in a review dashboard.
- **Template sharing** — Let users publish their best-performing writing style / tone combos as community templates. Others can discover and use them.
- **Export formats** — Export generated posts as: clipboard text, Notion page, Google Docs, or direct scheduling tool integration (Buffer, Later, Hootsuite).

---

## 9. Content Calendar & Planning

### Current State
No planning layer. The tool generates on-demand, one post at a time.

### Ideas to Research
- **Calendar view** — Display a monthly/weekly calendar where generated posts are pinned to dates. Drag-and-drop rescheduling.
- **Series planning** — "Generate a 5-post series on [topic]" — the model plans the arc (intro → deep dive → case study → myth-busting → CTA) and generates all 5 posts in sequence with internal narrative consistency.
- **Posting frequency recommendations** — Based on the selected platforms, suggest an optimal posting cadence (e.g., LinkedIn: 3x/week, Instagram: 5x/week). Help users fill the calendar to that cadence.
- **Repurposing engine** — Take one long-form piece (blog post, YouTube transcript) and auto-generate 5 derivative social posts (key quote, stat, insight, CTA, behind-the-scenes angle).

---

## 10. Multi-language & Localisation

### Current State
All generation is in English. No localisation support.

### Ideas to Research
- **Language selection** — Add a language picker to the form. Pass the target language as a constraint in all prompts. Research how well GPT-4o maintains tone/persona across languages (Spanish, French, Portuguese, German, Arabic are high-value markets).
- **Cultural adaptation** — Language translation is not enough. Research prompt strategies for cultural adaptation (different humour conventions, formality norms, platform usage patterns by region).
- **RTL platform support** — For Arabic/Hebrew, image layouts and text overlays need RTL-aware rendering. Research CSS + canvas implications.
- **Locale-aware hashtags** — Hashtag strategy differs by language community. Generate localised hashtag sets, not English ones for non-English posts.

---

## 11. UX & Interface Improvements

### Current State
Single-panel form on the left, output on the right. Linear generation flow.

### Ideas to Research
- **Progressive disclosure** — Hide advanced options (image style, custom CTA, tone sliders) behind an "Advanced" toggle. Reduce cognitive load for new users.
- **Inline editing** — Let users edit captions directly in the output panel. Detect edits and offer "regenerate from this point" (e.g., only re-run platform optimisers, not the full pipeline).
- **Undo / version history** — Keep the last N generations in memory. Let users step back to a previous version without regenerating.
- **Keyboard shortcuts** — Power users should be able to trigger generation, copy captions, and switch platform tabs without touching the mouse.
- **Mobile responsiveness** — The current split-panel layout breaks on mobile. Research a stacked layout with a bottom sheet for the output panel on small screens.
- **Onboarding tour** — First-time users don't know what "Strategist" means or how the pipeline works. Research an interactive walkthrough that explains each stage as it runs.

---

## Priority Matrix (Suggested)

| Idea | Impact | Effort | Research Priority |
|---|---|---|---|
| Few-shot examples in prompts | High | Low | ⭐⭐⭐⭐⭐ |
| Brand voice fingerprinting | High | Medium | ⭐⭐⭐⭐⭐ |
| Draft save & resume | High | Low | ⭐⭐⭐⭐⭐ |
| Multiple image variants | High | Low | ⭐⭐⭐⭐ |
| Hashtag strategy per platform | Medium | Low | ⭐⭐⭐⭐ |
| Post history memory | High | Medium | ⭐⭐⭐⭐ |
| Carousel / thread generation | High | High | ⭐⭐⭐ |
| Analytics & feedback loop | Very High | High | ⭐⭐⭐ |
| Trend injection | Medium | Medium | ⭐⭐⭐ |
| Multi-language support | Medium | High | ⭐⭐ |
| Team review workflow | Medium | High | ⭐⭐ |

---

*Last updated: March 2026*

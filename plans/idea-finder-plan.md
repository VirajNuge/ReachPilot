# Social Media Post Idea Finder — Feature Plan

> **Status**: Planning  
> **Date**: April 10, 2026  
> **Scope**: End-to-end feature design — no code implementation  
> **Depends on**: Persona system, Profile Analyzer, Post Generation pipeline, Question Mine

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing State Audit](#2-existing-state-audit)
3. [Sub-Features & Idea Archetypes](#3-sub-features--idea-archetypes)
4. [Data Sources Inventory (RAG Context)](#4-data-sources-inventory-rag-context)
5. [Multi-Source RAG Pipeline Architecture](#5-multi-source-rag-pipeline-architecture)
6. [Google Search Grounding Integration](#6-google-search-grounding-integration)
7. [AI Prompt Engineering Strategy](#7-ai-prompt-engineering-strategy)
8. [API Route Design](#8-api-route-design)
9. [UI/UX Component Plan](#9-uiux-component-plan)
10. [Database Schema Extensions](#10-database-schema-extensions)
11. [Integration with Existing Features](#11-integration-with-existing-features)
12. [Feedback Loop: Analysis → Discovery → Generation → Execution → Re-Analysis](#12-feedback-loop)
13. [Phased Implementation Roadmap](#13-phased-implementation-roadmap)
14. [Risk & Mitigation](#14-risk--mitigation)
15. [Appendix: File Reference Map](#15-appendix-file-reference-map)

---

## 1. Executive Summary

The Idea Finder is a multi-modal idea generation engine that produces persona-aware, trend-grounded, platform-optimized content ideas. It replaces the current mock UI (`generateIdeas` page uses `setTimeout` with fake data) and the shell-only `explorePostsIdeas` page with a real AI backend.

**Core value proposition**: Instead of generic "post about X" suggestions, the Idea Finder generates ideas that are:
- **Voice-Matched** — styled to the user's persona tone, writing samples, and brand archetype
- **Trend-Grounded** — backed by real-time Google Search data, not stale training data
- **Analysis-Informed** — leveraging existing profile analysis (ideaBank, viralRecipe, postDNA, contentPillars)
- **Audience-Targeted** — incorporating crowdPersonas, psychTriggers, and questionCloud data
- **Actionable** — each idea includes a hook, format suggestion, visual direction, and CTA

**Three core engines**:

| Engine | Description | Data Sources |
|--------|-------------|--------------|
| **Voice-Match Generator** | Ideas that sound like the user's brand voice | Persona + writingSamples + voiceSpectrum |
| **Trend-Jacker** | Ride current trends with brand-relevant angles | Google Search Grounding + Exploding Topics + contentPillars |
| **Repurpose Engine** | Remix existing high-performing content into new formats | postGenerations history + postDNA + analysis ideaBank |

---

## 2. Existing State Audit

### What Exists (UI shells — no real backend)

| Page | Route | Current State |
|------|-------|---------------|
| Find Post Ideas | `/{id}/generateIdeas` | BriefingForm → `setTimeout` mock → IdeaGrid with fake data |
| Explore Trending | `/{id}/explorePostsIdeas` | DiscoveryEngine UI shell, MasonryFeed, RemixModal — no API |
| Question Mine | `/{id}/questionMine` | **Functional** — mines Reddit, Google PAA, Quora via `/api/question-mine` |
| Idea Planner | Embedded in generateIdeas | Kanban board (Idea Bank → Drafting → Published) — localStorage only |

### Existing Components to Reuse

| Component | Location | Reuse Plan |
|-----------|----------|------------|
| `BriefingForm.tsx` | `components/GenerateIdeas/` | Extend with new input fields (trend toggle, idea archetype selector) |
| `IdeaCard.tsx` / `IdeaGrid.tsx` | `components/GenerateIdeas/Board/` | Adapt card to show grounding sources, confidence score |
| `BlueprintModal.tsx` | `components/GenerateIdeas/` | Extend to show full idea blueprint with sources |
| `IdeaPlanner.tsx` | `components/IdeaPlanner/` | Migrate from localStorage to MongoDB persistence |
| `GhostDraftModal.tsx` | `components/GhostDraftModal/` | Reuse for idea → draft conversion |
| `DiscoveryEngine.tsx` | `components/ExplorePostsIdeas/` | Wire to real trending data API |
| `RemixModal.tsx` | `components/ExplorePostsIdeas/` | Connect to Repurpose Engine |

### Existing AI Pipeline Pattern to Follow

Every AI route in ReachPilot follows this pattern:
```
Auth → Fetch Persona → buildContentGenerationContext(persona) → Build Prompt → Gemini Call → Parse JSON → Return
```

Key files that define this pattern:
- `lib/personaPromptBuilder.ts` — `buildContentGenerationContext()` 
- `lib/postGenerationPrompts.ts` — stage-by-stage prompt builders with strict JSON output shapes
- `lib/parseAIJson.ts` — robust JSON parsing from LLM output
- `lib/aiConfig.ts` — `AI_MODELS.TEXT` = `gemini-2.0-flash`
- `app/api/post-generation/hooks/route.ts` — simplest persona-aware generation example
- `app/api/analyze/route.tsx` — streaming + schema enforcement example

---

## 3. Sub-Features & Idea Archetypes

### 3.1 Five Idea Archetype Modes

Each mode produces ideas with different strategic angles:

#### Mode 1: Voice-Match Generator
> "Generate ideas that sound exactly like me"

- Pulls persona writingSamples, voiceSpectrum.signatureWords, toneSliders
- Analyzes writing patterns (hook style, sentence length, emoji usage) from postDNA
- Outputs ideas pre-styled to the user's voice — ready to draft without rewriting

**Input**: Topic/niche (optional) + Persona context (automatic)  
**Output**: 5-8 ideas with hooks written in the user's actual voice

#### Mode 2: Trend-Jacker
> "Find what's trending and give me my angle on it"

- Uses Google Search Grounding for real-time trend data
- Cross-references trends against user's contentPillars and contentThemes
- Filters trends by relevance to user's audience (crowdPersonas, audienceSegments)
- Returns only trends the user can credibly comment on

**Input**: Niche/industry + Platform + Virality threshold  
**Output**: 5-10 trending topics with user-specific angles + source citations

#### Mode 3: Repurpose Engine
> "What can I remix from my existing content?"

- Scans postGenerations history for high-scoring content (contentScore > threshold)
- Identifies format transformation opportunities (post → thread, caption → carousel, text → video script)
- Suggests "sequel" ideas based on high-engagement topics from postDNA
- Recommends content that performed well on one platform for cross-posting to another

**Input**: Platform filter + Content type filter  
**Output**: 5-8 repurpose suggestions with original content reference + new format + new hook

#### Mode 4: Gap Filler
> "What topics should I be covering but haven't?"

- Compares user's contentPillars against analysis.competitorGap data
- Uses questionCloud (audience questions) to find unanswered topics
- Cross-references with analysis.keywords.missing
- Identifies content pillar imbalances

**Input**: Automatic (based on analysis data)  
**Output**: 5-8 gap ideas with reasoning ("Your audience asks about X but you've never posted about it")

#### Mode 5: Prism Mode (Multi-Angle Explosion)
> "Take one topic and give me 10 different angles"

- Already partially conceptualized in the existing BriefingForm (Standard vs Prism toggle)
- Takes a single topic and generates ideas across multiple frameworks:
  - Controversial take
  - Educational breakdown
  - Personal story angle
  - Data/statistic-driven
  - Listicle format
  - Behind-the-scenes
  - Myth-busting
  - Case study
  - Prediction/forecast
  - Question/poll

**Input**: Single topic + Platform  
**Output**: 8-12 ideas, each with a different angle framework labeled

### 3.2 Cross-Mode Features (Apply to All Modes)

- **Platform Optimization**: Each idea tagged with best platform + platform-specific constraints
- **Confidence Score**: 0-100 based on how well the idea matches persona + audience + trend data
- **Source Attribution**: For Trend-Jacker, show Google Search grounding sources
- **Quick Draft**: One-click to send any idea to the Post Generation pipeline
- **Save to Planner**: Add to Kanban board (Idea Bank → Drafting → Published)
- **Feedback Signal**: User can 👍/👎 ideas to improve future generation

---

## 4. Data Sources Inventory (RAG Context)

### 4.1 Internal Data Sources (MongoDB + Cache)

#### Tier 1: High-Value Context (always include)

| Source | Collection / Location | Key Fields for Prompts | Retrieval |
|--------|----------------------|----------------------|-----------|
| **Persona** | `personas` | personaName, userRole, uniquePOV, productsServices, writingSamples (1-3 posts), contentThemes, toneSliders, coreValues, brandArchetype, favoriteInfluencer, influencerStyle, doNotTalk | `getPersonaByUserAndAccount(userId, accountId)` |
| **Analysis IdeaBank** | `analysis_sessions` | `data.ideaBank[]` — array of `{ concept, impact }` already generated by analyzer | `db.collection("analysis_sessions").find({ userId }).sort({ timestamp: -1 }).limit(1)` |
| **Viral Recipe** | `analysis_sessions` | `data.viralRecipe[]` — proven hook/format combos with `whyItWorked` | Same query, extract `.data.viralRecipe` |
| **Content Pillars** | `analysis_sessions` | `data.contentPillars[]` — pillar name, score, topPosts, recommendations | Same query, extract `.data.contentPillars` |

#### Tier 2: Valuable Context (include when available)

| Source | Collection / Location | Key Fields | Retrieval |
|--------|----------------------|------------|-----------|
| **Post DNA** | `analysis_sessions` | `data.postDNA[]` — hookType, format, topic, verdict per post | Same analysis query |
| **Voice Spectrum** | `analysis_sessions` | `data.voiceSpectrum` — signatureWords, avoidWords, styleTraits | Same analysis query |
| **Question Cloud** | `analysis_sessions` | `data.questionCloud[]` — keyword nodes representing audience questions | Same analysis query |
| **Psych Triggers** | `analysis_sessions` | `data.psychTriggers[]` — psychological engagement patterns | Same analysis query |
| **Crowd Personas** | `analysis_sessions` | `data.crowdPersonas[]` — audience segment profiles | Same analysis query |
| **Post History** | `postGenerations` | Last N generated posts — captions, hooks, contentScore, hashtags, platforms | `db.collection("postGenerations").find({ userId, accountId }).sort({ createdAt: -1 }).limit(10)` |

#### Tier 3: Supplementary Context (include selectively)

| Source | Collection / Location | Key Fields | When to Use |
|--------|----------------------|------------|-------------|
| **Post Analysis Cache** | `post_analysis_cache.json` (file) | Per-post analysis with hookCTA, retention, sentiment, viral velocity | Repurpose Engine mode |
| **Saved Brand Styles** | `savedBrandStyles` | Visual + writing presets | When generating visual direction |
| **Admin Templates** | `adminCaptionTemplates` | Platform-specific caption templates | Template-backed idea suggestions |
| **Connected Platforms** | `social_connections` | Which platforms user has connected | Platform filtering + constraints |
| **Competitor Gap** | `analysis_sessions` | `data.competitorGap` | Gap Filler mode |

### 4.2 External Data Sources (Real-Time)

| Source | Method | Data Type | Cost |
|--------|--------|-----------|------|
| **Google Search** (via Gemini Grounding) | `tools: [{ googleSearch: {} }]` in Gemini config | Real-time trending topics, news, viral content | Included in Gemini API cost |
| **Reddit** | Free JSON API (`reddit.com/.json`) | Community discussions, emerging topics | Free |
| **Google PAA** | SerpAPI | "People Also Ask" questions | SerpAPI pricing |
| **Quora** | SerpAPI | Popular questions by topic | SerpAPI pricing |
| **Exploding Topics API** | REST API | Emerging trend forecasts (12mo predictions) | $249+/mo (future consideration) |
| **Google Trends API** | REST API (launched 2025) | Interest-over-time, regional trends | TBD pricing (future consideration) |

### 4.3 Context Budget Strategy

Not all context fits in a single prompt. Budget tokens by mode:

| Mode | Tier 1 | Tier 2 | Tier 3 | External | Estimated Context Tokens |
|------|--------|--------|--------|----------|-------------------------|
| Voice-Match | ✅ Full | ✅ voiceSpectrum, postDNA | ❌ | ❌ | ~2,000-3,000 |
| Trend-Jacker | ✅ Lite | ✅ contentPillars | ❌ | ✅ Google Search | ~2,500-4,000 |
| Repurpose | ✅ Lite | ✅ postDNA, postHistory | ✅ postAnalysisCache | ❌ | ~3,000-4,000 |
| Gap Filler | ✅ Lite | ✅ questionCloud, pillars | ✅ competitorGap | ❌ | ~2,000-3,000 |
| Prism | ✅ Full | ✅ voiceSpectrum | ❌ | Optional | ~2,000-3,000 |

---

## 5. Multi-Source RAG Pipeline Architecture

### 5.1 High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INPUT                             │
│  BriefingForm: topic, audience, platform, mode, vibe        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONTEXT ORCHESTRATOR                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Persona      │  │ Analysis     │  │ Post History     │  │
│  │ Fetcher      │  │ Fetcher      │  │ Fetcher          │  │
│  │              │  │              │  │                  │  │
│  │ personas DB  │  │ analysis_    │  │ postGenerations  │  │
│  │ → context    │  │ sessions DB  │  │ DB → recent      │  │
│  │   builder    │  │ → ideaBank,  │  │   outputs        │  │
│  │              │  │   pillars,   │  │                  │  │
│  │              │  │   viralRecipe│  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                 │                  │              │
│         ▼                 ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            CONTEXT ASSEMBLER                        │    │
│  │  Selects fields by mode → token budget → compacts   │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   PROMPT BUILDER                            │
│                                                             │
│  buildIdeaFinderPrompt({                                    │
│    mode: "trend-jacker" | "voice-match" | ...,              │
│    personaContext: string,                                   │
│    analysisContext: string,                                  │
│    userInput: { topic, audience, platform, vibe },          │
│    constraints: { count, platform rules }                   │
│  })                                                         │
│                                                             │
│  → Returns structured prompt with:                          │
│    - System instructions + mode-specific rules              │
│    - Assembled RAG context                                  │
│    - Exact JSON output schema                               │
│    - "ONLY return valid JSON" enforcement                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    GEMINI ENGINE                             │
│                                                             │
│  Model: gemini-2.5-flash (or AI_MODELS.TEXT)                │
│                                                             │
│  For Trend-Jacker mode:                                     │
│    config.tools = [{ googleSearch: {} }]                    │
│    → Gemini searches the web in real-time                   │
│    → Returns groundingMetadata with sources                 │
│                                                             │
│  For all modes:                                             │
│    generationConfig.responseMimeType = "application/json"   │
│    generationConfig.responseSchema = ideaFinderSchema       │
│    → Gemini returns structured JSON validated by schema     │
│                                                             │
│  Parse: parseAIJson(response.text()) as fallback            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  POST-PROCESSOR                              │
│                                                             │
│  1. Validate JSON structure against TypeScript types         │
│  2. Assign unique IDs to each idea                          │
│  3. Calculate confidence scores                              │
│  4. Attach grounding sources (Trend-Jacker mode)            │
│  5. Attach platform-specific metadata                       │
│  6. Deduplicate against recent postGenerations              │
│  7. Optionally cache results                                │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     UI LAYER                                │
│                                                             │
│  IdeaGrid → IdeaCards (with source badges, confidence)      │
│  BlueprintModal (full idea detail + sources + draft CTA)    │
│  IdeaPlanner (Kanban persistence in MongoDB)                │
│  GhostDraftModal (send to Post Generation pipeline)         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Context Orchestrator — `lib/ideaFinder/contextOrchestrator.ts`

```typescript
// Proposed interface
interface IdeaFinderContext {
  persona: {
    summary: string;         // Compact persona summary (name, role, POV, products)
    audience: string;        // Audience segments, goals, pain points
    voice: string;           // Tone sliders, writing style, signature words
    writingSamples: string[]; // 1-3 actual writing samples
    doNotTalk: string[];     // Topics to avoid
  };
  analysis: {
    ideaBank: Array<{ concept: string; impact: string }>;
    contentPillars: Array<{ name: string; score: number }>;
    viralRecipe: Array<{ hookType: string; whyItWorked: string }>;
    questionCloud: Array<{ keyword: string; weight: number }>;
    postDNA: Array<{ hookType: string; format: string; topic: string; verdict: string }>;
    voiceSpectrum: { signatureWords: string[]; avoidWords: string[] };
  };
  postHistory: {
    recentPosts: Array<{ caption: string; hooks: string[]; contentScore: number; platform: string }>;
    topPerformers: Array<{ caption: string; contentScore: number; whyItWorked: string }>;
  };
  platform: {
    target: string;          // "instagram" | "linkedin" | "x" | "facebook"
    constraints: string;     // Platform-specific rules from PLATFORM_INTELLIGENCE
  };
}
```

The orchestrator fetches all data in parallel:
1. `getPersonaByUserAndAccount()` — from `lib/models/persona.ts`
2. `db.collection("analysis_sessions").findOne()` — latest analysis
3. `db.collection("postGenerations").find().limit(10)` — recent posts
4. `db.collection("social_connections").find()` — connected platforms

Then the **Context Assembler** selects and compacts fields based on the active mode and token budget.

### 5.3 Context Assembly Rules by Mode

**Voice-Match**: Heavy on persona voice data. Include full writingSamples, voiceSpectrum, toneSliders, postDNA hookTypes. Light on analysis.  
**Trend-Jacker**: Light on persona (just contentThemes + contentPillars for relevance filter). Heavy on external (Google Search grounding does the work). Include audienceSegments for trend filtering.  
**Repurpose**: Heavy on post history. Include all recent postGenerations with captions, hooks, scores. Include postDNA for format analysis. Light on persona.  
**Gap Filler**: Heavy on analysis. Include competitorGap, questionCloud, missing keywords, content pillar scores. Include audience pain points.  
**Prism**: Balanced. Include persona voice + contentPillars + audience data. Medium weight on everything.

---

## 6. Google Search Grounding Integration

### 6.1 SDK Migration Note

The codebase currently uses `@google/generative-ai` (older SDK). Google Search Grounding requires `@google/genai` (new SDK, already installed as v1.44.0). 

**Decision**: Use `@google/genai` for the Idea Finder's Trend-Jacker mode specifically. The rest of the Idea Finder can use either SDK — but for consistency, consider migrating Idea Finder entirely to `@google/genai`.

### 6.2 Implementation Pattern

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Trend-Jacker call with Google Search Grounding
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: trendJackerPrompt,
  config: {
    tools: [{ googleSearch: {} }],
    // Note: Cannot combine responseSchema with googleSearch tool
    // Must use parseAIJson for structured output parsing
  },
});

// Extract grounding metadata
const candidate = response.candidates?.[0];
const text = candidate?.content?.parts?.[0]?.text || '';
const groundingMetadata = candidate?.groundingMetadata;

const sources = groundingMetadata?.groundingChunks?.map(chunk => ({
  title: chunk.web?.title || '',
  url: chunk.web?.uri || '',
})) || [];

const searchQueries = groundingMetadata?.webSearchQueries || [];
```

### 6.3 Grounding Metadata Structure

```typescript
interface GroundingMetadata {
  webSearchQueries: string[];           // Queries Gemini executed
  groundingChunks: Array<{              // Source citations
    web: { uri: string; title: string };
  }>;
  groundingSupports: Array<{            // Maps text segments to sources
    segment: { startIndex: number; endIndex: number };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }>;
  searchEntryPoint: {                   // Required Google attribution
    renderedContent: string;            // HTML/CSS to display
  };
}
```

### 6.4 Important Constraints

1. **Cannot combine `responseSchema` with `googleSearch` tool** — When grounding is enabled, use prompt-based JSON enforcement + `parseAIJson` instead of schema enforcement
2. **Google attribution required** — Must display `searchEntryPoint.renderedContent` in UI per ToS
3. **Model support** — Use `gemini-2.5-flash` or newer for best grounding quality
4. **Cost** — Grounding adds per-search billing; cache trending results aggressively (TTL: 1-4 hours)

### 6.5 Caching Strategy for Trending Data

```
Trend request → Check cache (Redis/memory, keyed by topic+platform+date)
  → Cache HIT  → Return cached ideas (< 4 hours old)
  → Cache MISS → Call Gemini with grounding → Cache result → Return
```

Consider a simple in-memory or file-based cache initially (similar to existing `post_analysis_cache.json` pattern), upgrading to Redis if needed.

---

## 7. AI Prompt Engineering Strategy

### 7.1 Prompt Architecture

Follow the existing `lib/postGenerationPrompts.ts` pattern: each mode gets a dedicated prompt builder function that outputs a structured prompt with:
1. **System Role** — defines the AI's persona (social media strategist)
2. **RAG Context Block** — assembled persona + analysis data
3. **Task Instructions** — mode-specific generation rules
4. **Output Schema** — exact JSON shape the model must return
5. **Enforcement Rules** — "ONLY return valid JSON", no markdown, no explanations

### 7.2 Proposed File: `lib/ideaFinder/promptBuilders.ts`

#### Voice-Match Prompt Structure
```
SYSTEM: You are a social media content strategist who deeply understands brand voice replication.

## BRAND CONTEXT
{personaContext from buildContentGenerationContext()}

## VOICE ANALYSIS
Signature words: {voiceSpectrum.signatureWords}
Avoid words: {voiceSpectrum.avoidWords}
Hook style most used: {postDNA top hookTypes}
Tone profile: Formal/Casual={toneSliders.formalCasual}, Serious/Playful={...}

## WRITING SAMPLES (study these carefully)
Sample 1: "{writingSamples[0]}"
Sample 2: "{writingSamples[1]}"

## YOUR TASK
Generate {count} social media post ideas for {platform} about {topic}.
Each idea MUST sound like it was written by this exact person — match their:
- Hook style (based on VOICE ANALYSIS)
- Sentence patterns (short/long based on sentenceLength)
- Emoji usage ({emojiUsage level})
- Signature phrases ({signatureWords})

DO NOT generate ideas about: {doNotTalk topics}

## OUTPUT FORMAT
ONLY return valid JSON. No markdown. No explanations. This exact shape:
{
  "ideas": [
    {
      "title": "short idea title (5-8 words)",
      "hook": "the opening hook written in their voice",
      "angle": "the strategic angle (educational/controversial/story/etc)",
      "format": "post | carousel | thread | reel | story",
      "platform": "{platform}",
      "whyItFits": "1 sentence on why this matches their brand",
      "suggestedCTA": "call to action suggestion",
      "visualDirection": "brief visual/image suggestion",
      "confidenceScore": 0-100
    }
  ]
}
```

#### Trend-Jacker Prompt Structure
```
SYSTEM: You are a trend-spotting social media strategist. You identify trending topics 
and craft brand-relevant angles. You MUST use real-time data from Google Search.

## BRAND CONTEXT (abbreviated)
Name: {personaName}  |  Role: {userRole}  |  Industry: {industry}
Content Pillars: {contentPillars.map(p => p.name).join(', ')}
Content Themes: {contentThemes.join(', ')}
Audience: {audienceSegments.join(', ')}

## YOUR TASK
1. Search for currently trending topics related to: {topic/niche}
2. Filter trends by relevance to this brand's content pillars and audience
3. For each relevant trend, generate a unique post idea angle that this brand can credibly own
4. Include ONLY trends from the last 7 days
5. Prioritize trends with high virality potential for {platform}

DO NOT suggest trends outside this brand's expertise areas.
DO NOT suggest generic ideas that any brand could post.
Each idea MUST connect the trend to this specific brand's unique POV: "{uniquePOV}"

## OUTPUT FORMAT
ONLY return valid JSON. No markdown. No explanations. This exact shape:
{
  "ideas": [
    {
      "title": "short idea title",
      "hook": "opening hook connecting trend to brand",
      "trendTopic": "the trending topic being leveraged",
      "trendContext": "why this topic is trending right now (1 sentence)",
      "angle": "how this brand specifically relates to the trend",
      "format": "post | carousel | thread | reel | story",
      "platform": "{platform}",
      "urgency": "high | medium | low (how time-sensitive is this trend)",
      "suggestedCTA": "call to action",
      "visualDirection": "image/visual suggestion",
      "confidenceScore": 0-100
    }
  ]
}
```

#### Repurpose Engine Prompt Structure
```
SYSTEM: You are a content repurposing expert. You analyze existing high-performing content 
and suggest creative ways to remix it into new formats and platforms.

## BRAND VOICE
{compact persona context}

## EXISTING CONTENT LIBRARY
{recent postGenerations with captions, hooks, contentScores, platforms}

## POST DNA ANALYSIS
{postDNA data — what hook types, formats, topics perform best}

## YOUR TASK
Analyze the EXISTING CONTENT LIBRARY above and suggest {count} repurpose ideas:
1. Identify the highest-performing content (by contentScore)
2. Suggest format transformations (e.g., text post → carousel, caption → thread)
3. Suggest platform migrations (e.g., LinkedIn post → Twitter thread)
4. Suggest "sequel" ideas (follow-up content to high performers)
5. Suggest "compilation" ideas (combine multiple related posts)

## OUTPUT FORMAT
{strict JSON schema with originalContentRef, newFormat, newPlatform, remixStrategy, newHook}
```

#### Gap Filler Prompt Structure
```
SYSTEM: You are a content gap analyst. You identify topics a brand should be covering 
but hasn't, based on audience demand and competitive analysis.

## BRAND CONTEXT
{persona summary}

## CONTENT PILLAR ANALYSIS
{contentPillars with scores — identify underperforming pillars}

## AUDIENCE QUESTIONS (unanswered)
{questionCloud keywords}

## MISSING KEYWORDS
{analysis.keywords.missing}

## COMPETITOR GAPS
{competitorGap data}

## YOUR TASK
Identify {count} content gaps — topics this brand's audience needs but the brand hasn't covered.
Prioritize by: audience demand (questionCloud weight) × brand relevance (pillar alignment).

## OUTPUT FORMAT
{strict JSON schema with gapTopic, audienceDemandSignal, reason, suggestedIdea, hook, format}
```

### 7.3 JSON Output Schema (TypeScript Type)

```typescript
// Unified idea type across all modes
interface GeneratedIdea {
  id: string;                    // Generated post-parse
  title: string;                 // 5-8 word title
  hook: string;                  // Opening hook line
  angle: string;                 // Strategic angle description
  format: 'post' | 'carousel' | 'thread' | 'reel' | 'story' | 'video';
  platform: string;              // Target platform
  whyItFits: string;             // Why this matches the brand
  suggestedCTA: string;          // Call to action suggestion
  visualDirection: string;       // Image/visual suggestion
  confidenceScore: number;       // 0-100

  // Mode-specific fields (optional)
  trendTopic?: string;           // Trend-Jacker: what trend
  trendContext?: string;         // Trend-Jacker: why trending
  urgency?: 'high' | 'medium' | 'low';  // Trend-Jacker: time sensitivity
  originalContentRef?: string;   // Repurpose: reference to original
  remixStrategy?: string;        // Repurpose: how to remix
  gapTopic?: string;             // Gap Filler: the gap identified
  audienceDemandSignal?: string; // Gap Filler: evidence of demand
  angleFramework?: string;       // Prism: which framework (controversial, educational, etc.)

  // Grounding metadata (attached post-parse)
  sources?: Array<{ title: string; url: string }>;
  searchQueries?: string[];
  groundedAt?: Date;
}

interface IdeaFinderResponse {
  ideas: GeneratedIdea[];
  mode: string;
  generatedAt: Date;
  tokenUsage?: { prompt: number; completion: number };
  groundingAvailable: boolean;
}
```

---

## 8. API Route Design

### 8.1 Route: `POST /api/idea-finder/generate`

**Primary endpoint — handles all 5 modes.**

```
POST /api/idea-finder/generate
Content-Type: application/json

Request Body:
{
  "mode": "voice-match" | "trend-jacker" | "repurpose" | "gap-filler" | "prism",
  "topic": string,              // Optional for gap-filler (auto-derived)
  "platform": "instagram" | "linkedin" | "x" | "facebook" | "all",
  "audience": string,           // Optional override
  "vibe": string,               // Optional tone override
  "count": number,              // 5-12, default 8
  "accountId": string           // Required — scopes persona + data
}

Response:
{
  "success": true,
  "data": IdeaFinderResponse
}
```

**Implementation flow:**
1. Authenticate via `getAuthFromCookies()`
2. Fetch persona via `getPersonaByUserAndAccount(userId, accountId)`
3. Fetch latest analysis session from `analysis_sessions` collection
4. Fetch recent postGenerations (for Repurpose/Voice-Match modes)
5. Build context via Context Orchestrator (mode-aware field selection)
6. Build prompt via mode-specific prompt builder
7. Call Gemini:
   - Trend-Jacker: `@google/genai` with `tools: [{ googleSearch: {} }]`
   - Other modes: `@google/generative-ai` with `responseSchema` enforcement
8. Parse response via `parseAIJson()` or schema validation
9. Post-process: assign IDs, attach grounding sources, calculate scores
10. Return `IdeaFinderResponse`

### 8.2 Route: `POST /api/idea-finder/save`

**Saves an idea to the Idea Planner (MongoDB).**

```
POST /api/idea-finder/save
{
  "idea": GeneratedIdea,
  "status": "idea-bank" | "drafting" | "published",
  "accountId": string
}
```

### 8.3 Route: `GET /api/idea-finder/saved`

**Retrieves saved ideas for the Kanban planner.**

```
GET /api/idea-finder/saved?accountId={id}&status={status}
```

### 8.4 Route: `POST /api/idea-finder/feedback`

**Records user feedback (👍/👎) on generated ideas for future quality improvement.**

```
POST /api/idea-finder/feedback
{
  "ideaId": string,
  "feedback": "positive" | "negative",
  "accountId": string
}
```

### 8.5 Route: `POST /api/idea-finder/to-draft`

**Converts an idea to a Post Generation input and redirects to the post generation pipeline.**

```
POST /api/idea-finder/to-draft
{
  "idea": GeneratedIdea,
  "accountId": string
}

Response:
{
  "success": true,
  "postGenerationId": string,
  "redirectUrl": "/{id}/postGeneration/{postGenerationId}"
}
```

### 8.6 Route: `GET /api/idea-finder/trending-cache`

**Returns cached trending topics (avoids repeated Gemini grounding calls).**

```
GET /api/idea-finder/trending-cache?niche={niche}&platform={platform}

Response:
{
  "cached": true,
  "cachedAt": Date,
  "expiresAt": Date,
  "trends": Array<{ topic, context, sources }>
}
```

---

## 9. UI/UX Component Plan

### 9.1 Page: Find Post Ideas (`/{id}/generateIdeas`)

**Current**: BriefingForm → mock IdeaGrid  
**Planned**: Enhanced BriefingForm → Real AI → Rich IdeaGrid

#### Updated BriefingForm
- Add **Mode Selector** (5 tabs or radio group): Voice-Match, Trend-Jacker, Repurpose, Gap Filler, Prism
- Keep existing fields: Topic input, Audience input, Goal selector, Vibe selector
- Add **Platform Selector** (replaces the existing one — wire to actual platform logic)
- Add **Count Slider** (5-12 ideas, default 8)
- Mode-specific UI:
  - Trend-Jacker: Show "Powered by Google Search" badge, optional date range filter
  - Repurpose: Show "Based on your last N posts" info badge
  - Gap Filler: Auto-populate topic from analysis gaps, show "Based on your analysis" badge
  - Prism: Single topic input only, show framework preview chips

#### Enhanced IdeaCard
- Add **Confidence Badge** (green/yellow/red based on score 0-100)
- Add **Source Chips** (for Trend-Jacker: clickable source links from grounding)
- Add **Mode Tag** (small chip: "Voice-Match", "Trend", "Repurpose", etc.)
- Add **Quick Actions**:
  - 💾 Save to Planner (→ `POST /api/idea-finder/save`)
  - ✏️ Quick Draft (→ opens GhostDraftModal or redirects to Post Generation)
  - 👍/👎 Feedback buttons (→ `POST /api/idea-finder/feedback`)
  - 📋 Copy hook text

#### BlueprintModal (Expanded)
- Show full idea details: hook, angle, format, CTA, visual direction
- Show **Why This Fits** section with persona alignment explanation
- Show **Sources** section (for grounded ideas) with clickable links
- Show **Suggested Visual** section with image direction
- "Generate Draft" CTA button → sends to Post Generation pipeline

### 9.2 Page: Explore Trending (`/{id}/explorePostsIdeas`)

**Current**: DiscoveryEngine UI shell with no backend  
**Planned**: Wire to Trend-Jacker mode API

#### DiscoveryEngine Updates
- Wire **Platform Matrix** to actual platform selection → API call
- Wire **Virality Thresholds** to confidence score filtering (post-generation)
- Wire **Trend Filters** to topic/niche filtering in API request

#### MasonryFeed Updates
- Render actual Trend-Jacker results as cards
- Each card shows: trend topic, brand angle, sources, urgency badge
- Click → RemixModal for turning trend into a post idea

#### RemixModal Updates
- Pre-populate with trend context + brand angle
- "Remix This" → calls Repurpose Engine with the trend as input
- "Generate Post" → sends to Post Generation pipeline

### 9.3 Component: IdeaPlanner (Kanban)

**Current**: localStorage-only Kanban  
**Planned**: MongoDB-backed Kanban

- Migrate from localStorage to `/api/idea-finder/saved` endpoint
- Three columns: Idea Bank → Drafting → Published
- Drag-and-drop updates status via `PATCH /api/idea-finder/save`
- "Published" column shows link to actual post generation result

### 9.4 New Component: TrendingBanner

A small banner/strip on the generateIdeas page showing:
- "🔥 Trending in your niche: {top 3 trend topics}" 
- Auto-refreshed from trending cache
- Click any trend → auto-fills BriefingForm in Trend-Jacker mode

### 9.5 New Component: IdeaFeedbackToast

After 👍/👎 on an idea:
- Show brief toast: "Got it — we'll tune future ideas"
- No blocking UI — fire-and-forget API call

---

## 10. Database Schema Extensions

### 10.1 New Collection: `savedIdeas`

```typescript
interface SavedIdeaDocument {
  _id: ObjectId;
  userId: string;
  accountId: string;
  idea: GeneratedIdea;           // Full idea object
  status: 'idea-bank' | 'drafting' | 'published';
  mode: string;                  // Which mode generated this
  postGenerationId?: string;     // If converted to draft
  feedback?: 'positive' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}
```

### 10.2 New Collection: `ideaGenerationLogs`

For analytics and feedback loop improvement:

```typescript
interface IdeaGenerationLogDocument {
  _id: ObjectId;
  userId: string;
  accountId: string;
  mode: string;
  input: {
    topic: string;
    platform: string;
    audience?: string;
    vibe?: string;
    count: number;
  };
  output: {
    ideaCount: number;
    avgConfidence: number;
    groundingUsed: boolean;
    tokenUsage: { prompt: number; completion: number };
  };
  feedbackSummary?: {
    positive: number;
    negative: number;
  };
  createdAt: Date;
}
```

### 10.3 New Collection: `trendingCache`

```typescript
interface TrendingCacheDocument {
  _id: ObjectId;
  niche: string;
  platform: string;
  trends: Array<{
    topic: string;
    context: string;
    sources: Array<{ title: string; url: string }>;
    urgency: string;
  }>;
  searchQueries: string[];
  createdAt: Date;
  expiresAt: Date;               // TTL index: auto-delete after 4 hours
}
```

### 10.4 Index Plan

Add to `lib/mongodb.ts` `ensureIndexes()`:

```typescript
// savedIdeas
db.collection('savedIdeas').createIndex({ userId: 1, accountId: 1, status: 1 });
db.collection('savedIdeas').createIndex({ createdAt: -1 });

// ideaGenerationLogs
db.collection('ideaGenerationLogs').createIndex({ userId: 1, createdAt: -1 });

// trendingCache — TTL index for auto-expiry
db.collection('trendingCache').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.collection('trendingCache').createIndex({ niche: 1, platform: 1 });
```

---

## 11. Integration with Existing Features

### 11.1 Profile Analyzer → Idea Finder

The Profile Analyzer already generates an `ideaBank` array in the strategy schema:
```typescript
ideaBank: [{ concept: string, impact: string }]
```

**Integration**: 
- Idea Finder reads the latest `analysis_sessions` document and uses `ideaBank` as seed concepts
- The Gap Filler mode uses `competitorGap`, `questionCloud`, and `keywords.missing` from analysis
- Voice-Match uses `voiceSpectrum` and `postDNA` from analysis
- After Idea Finder generates new ideas, they could optionally feed back into the analysis refresh

### 11.2 Post Generation → Idea Finder

**Forward flow** (Idea → Draft):
- "Quick Draft" on any idea → creates a `PostGenerationInput` pre-filled with:
  - `objective` from idea angle
  - `coreMessage` from idea hook
  - `platforms` from idea platform
  - `tones` from persona toneSliders
- Opens Post Generation page with pre-filled input

**Reverse flow** (Post History → Ideas):
- Repurpose Engine reads `postGenerations` collection for high-scoring past content
- Voice-Match reads recent captions to identify writing patterns

### 11.3 Question Mine → Idea Finder

Question Mine already fetches real questions from Reddit, Google PAA, and Quora.

**Integration**:
- Gap Filler mode can call Question Mine internally to supplement `questionCloud` with fresh questions
- "Convert to Idea" button on Question Mine results → sends question to Voice-Match mode as topic
- Shared data: Question Mine results can be cached and used as supplementary context

### 11.4 Chatbot → Idea Finder

The existing chatbot (`/api/chatbot`) uses persona context for conversations.

**Integration**:
- User can ask chatbot "Give me post ideas about X" → chatbot routes to Idea Finder API internally
- Or simpler: chatbot suggests "Try the Idea Finder for more structured ideas" when it detects idea-seeking intent

### 11.5 Sidebar Navigation Updates

Current sidebar "Idea Finder" group:
```
📡 Idea Finder
  ├── 🔍 Explore Trending    → /{id}/explorePostsIdeas
  ├── 💡 Find Post Ideas     → /{id}/generateIdeas
  └── ❓ Question Mine        → /{id}/questionMine
```

Add:
```
📡 Idea Finder
  ├── 💡 Find Post Ideas     → /{id}/generateIdeas      (PRIMARY — all 5 modes)
  ├── 🔥 Explore Trending    → /{id}/explorePostsIdeas  (Trend-Jacker focused view)
  ├── 📋 Idea Planner        → /{id}/ideaPlanner        (Kanban board — new page)
  └── ❓ Question Mine        → /{id}/questionMine       (unchanged)
```

---

## 12. Feedback Loop

### The Virtuous Cycle: Analysis → Discovery → Generation → Execution → Re-Analysis

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  ANALYSIS   │────▶│  DISCOVERY   │────▶│  GENERATION  │
│             │     │              │     │              │
│ Profile     │     │ Idea Finder  │     │ Post Gen     │
│ Analyzer    │     │ (5 modes)    │     │ Pipeline     │
│             │     │              │     │              │
│ Output:     │     │ Output:      │     │ Output:      │
│ ideaBank    │     │ GeneratedIdea│     │ PostPackage  │
│ postDNA     │     │ with hook,   │     │ with caption,│
│ viralRecipe │     │ angle, CTA   │     │ image, etc   │
│ voiceData   │     │              │     │              │
└──────┬──────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                                         ▼
       │                                ┌──────────────┐
       │                                │  EXECUTION   │
       │                                │              │
       │                                │ User posts   │
       │                                │ to social    │
       │                                │ media        │
       │                                │              │
       │                                └──────┬───────┘
       │                                       │
       │           ┌──────────────┐            │
       └───────────│ RE-ANALYSIS  │◀───────────┘
                   │              │
                   │ New profile  │
                   │ analysis     │
                   │ with updated │
                   │ engagement   │
                   │ data         │
                   └──────────────┘
```

### How Feedback Improves Over Time

1. **Analysis Phase**: Profile Analyzer runs → produces ideaBank, postDNA, viralRecipe, voiceSpectrum
2. **Discovery Phase**: Idea Finder uses analysis data as RAG context → generates persona-aware ideas
3. **Generation Phase**: User selects idea → Post Generation pipeline creates the actual post
4. **Execution Phase**: User publishes post to social media
5. **Re-Analysis Phase**: User re-runs Profile Analyzer with new engagement data → updated metrics
6. **Loop**: Updated analysis feeds back into Idea Finder with fresher signals

### Feedback Signals Collected

| Signal | Source | How It's Used |
|--------|--------|---------------|
| 👍/👎 on ideas | Idea Finder UI | Stored in `savedIdeas.feedback`; future: adjust confidence scoring |
| Ideas saved to planner | Idea Planner | Indicates high-quality ideas; reinforce similar patterns |
| Ideas converted to drafts | GhostDraftModal | Strongest signal — user actually used the idea |
| Post contentScore | Post Generation | Score of the generated post; feeds back into "what works" |
| Re-analysis metrics | Profile Analyzer | Updated postDNA, viralRecipe show what actually performed |

---

## 13. Phased Implementation Roadmap

### Phase 1: Foundation (MVP) — ~3-5 days

**Goal**: Get one mode working end-to-end with the existing UI.

- [ ] Create `lib/ideaFinder/` directory structure:
  - `contextOrchestrator.ts` — fetches and assembles RAG context
  - `promptBuilders.ts` — prompt builders for all modes
  - `types.ts` — GeneratedIdea, IdeaFinderResponse types
- [ ] Implement `POST /api/idea-finder/generate` route (Voice-Match mode only)
  - Auth → persona fetch → context build → Gemini call → parse → return
- [ ] Wire existing `BriefingForm.tsx` to call the real API (replace `setTimeout` mock)
- [ ] Wire existing `IdeaGrid.tsx` / `IdeaCard.tsx` to render real results
- [ ] Add mode selector to BriefingForm (Voice-Match active, others disabled/coming-soon)

### Phase 2: Trend-Jacker + Grounding — ~2-3 days

**Goal**: Add real-time trending capability.

- [ ] Implement Trend-Jacker mode in prompt builders
- [ ] Use `@google/genai` SDK with `tools: [{ googleSearch: {} }]`
- [ ] Add grounding source display to IdeaCard (source chips)
- [ ] Implement trending cache (`trendingCache` collection + TTL index)
- [ ] Wire `explorePostsIdeas` page DiscoveryEngine to Trend-Jacker API
- [ ] Add TrendingBanner component to generateIdeas page

### Phase 3: Repurpose + Gap Filler — ~2-3 days

**Goal**: Complete all 5 modes.

- [ ] Implement Repurpose Engine mode (reads postGenerations history)
- [ ] Implement Gap Filler mode (reads analysis gaps + questionCloud)
- [ ] Implement Prism mode (multi-angle explosion)
- [ ] Enable all 5 mode tabs in BriefingForm

### Phase 4: Persistence + Planner — ~2 days

**Goal**: Save ideas and manage them in a Kanban board.

- [ ] Create `savedIdeas` MongoDB collection + model
- [ ] Implement `POST /api/idea-finder/save` and `GET /api/idea-finder/saved`
- [ ] Migrate IdeaPlanner from localStorage to MongoDB
- [ ] Create dedicated Idea Planner page (`/{id}/ideaPlanner`)
- [ ] Add "Save to Planner" quick action on IdeaCards

### Phase 5: Draft Pipeline Integration — ~1-2 days

**Goal**: One-click from idea to post draft.

- [ ] Implement `POST /api/idea-finder/to-draft` route
- [ ] Map GeneratedIdea → PostGenerationInput conversion
- [ ] Wire GhostDraftModal to use the new endpoint
- [ ] Add "Generate Draft" CTA in BlueprintModal

### Phase 6: Feedback + Analytics — ~1-2 days

**Goal**: Collect signals to improve quality over time.

- [ ] Implement feedback API (`POST /api/idea-finder/feedback`)
- [ ] Create `ideaGenerationLogs` collection for analytics
- [ ] Add 👍/👎 buttons to IdeaCards
- [ ] Log generation metrics (mode, count, confidence, token usage)

### Phase 7: Polish + Advanced — Future

- [ ] Integrate Exploding Topics API for predictive trends
- [ ] Integrate Google Trends API for trend validation
- [ ] Implement streaming responses for large idea batches
- [ ] Add idea de-duplication against past generations
- [ ] A/B test prompt variations and track which produce higher-feedback ideas
- [ ] Question Mine integration (convert questions to idea inputs)

---

## 14. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Google Search Grounding + responseSchema incompatibility** | Can't enforce JSON schema when grounding is enabled | Use prompt-based JSON enforcement + parseAIJson for Trend-Jacker mode; schema enforcement for other modes |
| **Grounding cost overruns** | Excessive Gemini API bills from repeated trend searches | Aggressive caching (4-hour TTL), rate limiting per user, trending cache collection |
| **Persona data missing** | New users have no persona → poor idea quality | Graceful degradation: generate generic ideas with a "Set up your persona for personalized ideas" CTA |
| **Analysis data missing** | User hasn't run Profile Analyzer → no ideaBank, viralRecipe | Same graceful degradation; Gap Filler and Repurpose modes show "Run Profile Analyzer first" prompt |
| **LLM returns malformed JSON** | Parse failure → 500 error | parseAIJson handles malformed JSON; add retry logic (1 retry with "fix your JSON" prompt) |
| **Idea quality inconsistency** | Some modes produce better ideas than others | Track per-mode feedback ratios; iterate prompt engineering on low-performing modes |
| **Rate limiting by Gemini** | 429 errors during peak usage | Implement exponential backoff; queue requests; cache aggressively |
| **SDK version conflicts** | `@google/genai` vs `@google/generative-ai` coexist | Isolate: Trend-Jacker uses `@google/genai`, other modes use existing `@google/generative-ai`; plan future migration |

---

## 15. Appendix: File Reference Map

### Files to Create

| File | Purpose |
|------|---------|
| `lib/ideaFinder/types.ts` | GeneratedIdea, IdeaFinderResponse, IdeaFinderContext types |
| `lib/ideaFinder/contextOrchestrator.ts` | Fetches persona + analysis + postHistory, assembles mode-aware context |
| `lib/ideaFinder/promptBuilders.ts` | Mode-specific prompt builders (5 modes) |
| `lib/ideaFinder/trendingCache.ts` | Trending data cache logic (read/write/TTL) |
| `lib/models/savedIdea.ts` | SavedIdeaDocument model + CRUD functions |
| `lib/models/ideaGenerationLog.ts` | IdeaGenerationLogDocument model |
| `app/api/idea-finder/generate/route.ts` | Main generation endpoint |
| `app/api/idea-finder/save/route.ts` | Save idea to planner |
| `app/api/idea-finder/saved/route.ts` | Get saved ideas |
| `app/api/idea-finder/feedback/route.ts` | Record user feedback |
| `app/api/idea-finder/to-draft/route.ts` | Convert idea to post generation input |
| `app/api/idea-finder/trending-cache/route.ts` | Cached trending data endpoint |

### Files to Modify

| File | Change |
|------|--------|
| `app/pages/appPages/[id]/generateIdeas/page.tsx` | Replace mock with real API call, add mode selector |
| `app/pages/appPages/components/GenerateIdeas/BriefingForm.tsx` | Add mode tabs, platform wiring |
| `app/pages/appPages/components/GenerateIdeas/Board/IdeaCard.tsx` | Add confidence badge, source chips, quick actions |
| `app/pages/appPages/components/GenerateIdeas/BlueprintModal.tsx` | Add sources section, "Generate Draft" CTA |
| `app/pages/appPages/[id]/explorePostsIdeas/page.tsx` | Wire to Trend-Jacker API |
| `app/pages/appPages/components/ExplorePostsIdeas/DiscoveryEngine.tsx` | Wire filters to API params |
| `app/pages/appPages/components/IdeaPlanner/IdeaPlanner.tsx` | Migrate from localStorage to MongoDB |
| `app/pages/appPages/components/Sidebar/Sidebar.tsx` | Add Idea Planner link |
| `lib/mongodb.ts` | Add new collection indexes in ensureIndexes() |

### Files to Reference (Read-Only)

| File | What It Provides |
|------|-----------------|
| `lib/personaPromptBuilder.ts` | `buildContentGenerationContext()` — reuse for persona injection |
| `lib/postGenerationPrompts.ts` | Prompt structure patterns to follow |
| `lib/parseAIJson.ts` | JSON parsing utility to reuse |
| `lib/aiConfig.ts` | AI_MODELS.TEXT model constant |
| `lib/models/persona.ts` | PersonaDocument interface + getPersonaByUserAndAccount |
| `lib/analysisSchema.ts` | Analysis schema structure (ideaBank, viralRecipe, etc.) |
| `lib/types/analysis.ts` | RawAnalysisData type (all analysis sub-types) |
| `app/api/post-generation/hooks/route.ts` | Simplest persona-aware AI call pattern |
| `app/api/analyze/route.tsx` | Streaming + schema enforcement pattern |
| `app/api/analyze-post/route.ts` | File-based caching pattern |

---

*End of Feature Plan*

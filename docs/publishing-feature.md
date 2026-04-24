# Publishing & Scheduling Feature — Removed Overview

> **Status**: Removed. This document captures the full design and implementation so it can be rebuilt later.

---

## What It Was

A three-panel content scheduling dashboard embedded inside the main app shell (Sidebar + TopMenu provided by layout). The page lived at `/[id]/publishing` and used a fixed-height, overflow-hidden layout (`h-full`) so it never scrolled — the panels each managed their own internal scrolling.

---

## Page Layout (`publishing/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: "Content Planner" title + "+ New Post" CTA             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Drafts      │  Scheduled   │  Published   │  Today's Posts     │
│  (stat card) │  (stat card) │  (stat card) │  (stat card)       │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌─────────────────────────┐  ┌────────────┐  │
│  │ StagingSide  │  │    CalendarGrid          │  │ PostContext│  │
│  │ bar (260px)  │  │    (flex-1)              │  │ Panel      │  │
│  │              │  │                          │  │ (320px)    │  │
│  │              │  │                          │  │ (only when │  │
│  │              │  │                          │  │  post sel.)│  │
│  └──────────────┘  └─────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Page background**: `bg-[#F4F7FA]`, padding `p-5`, gap `gap-4`

**State managed at page level**:
- `drafts: PostDraft[]` — posts in the queue
- `scheduledPosts: PostDraft[]` — posts dropped onto the calendar
- `selectedPost: PostDraft | null` — post clicked in calendar, triggers PostContextPanel

**Handlers**:
- `handleDragStart(e, draft)` — sets `dataTransfer` with `draftId`
- `handleDropDraft(draftId, date)` — moves draft → scheduledPosts at 09:00
- `handleCreateNew()` — prepends blank draft to queue
- `handleUpdatePost(updatedPost)` — replaces post in scheduledPosts
- `handleDeletePost(postId)` — removes from scheduledPosts, clears selection

**Mock data** (3 seeded drafts):
```ts
{ id: "1", title: "Carousel: 5 Growth Hacks", platforms: ["linkedin", "instagram"], status: "draft" }
{ id: "2", title: "Team Update", platforms: ["linkedin"], status: "draft" }
{ id: "3", title: "Quick Thought", platforms: ["twitter"], status: "draft" }
```

---

## Data Types (`types.ts`)

```ts
export type Platform = "linkedin" | "twitter" | "instagram" | "facebook" | "threads" | "pinterest";

export interface PostDraft {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  status: "draft" | "scheduled" | "published";
  scheduledDate?: Date;
  media: string[];         // array of image URLs
}
```

---

## Component 1: StagingSidebar

**File**: `components/Publishing/StagingSidebar.tsx`  
**Width**: `w-[260px]`, full height card

### Responsibility
Left-column content queue. Lists all drafts. User drags a draft card onto the calendar to schedule it.

### Features
- **Header**: "CONTENT QUEUE" label + post count + `<Plus>` icon button (creates new blank draft)
- **Search bar**: filters by title or content text
- **Filter tabs**: All / Drafts / Scheduled — each with numeric count badge
- **Draft cards**: draggable (`draggable`, `onDragStart`), show platform icons, title, content preview, status badge
- **Footer**: `"{N} drafts · {N} scheduled"` summary line
- **Empty state**: different copy for search-empty vs tab-empty

### Platform icon mapping
| Platform | Icon | Color |
|---|---|---|
| linkedin | FaLinkedin | `#0077B5` |
| twitter | FaTwitter | `#1DA1F2` |
| instagram | FaInstagram | `#E1306C` |
| facebook | FaFacebook | `#1877F2` |
| threads | FaAt | black |
| pinterest | FaPinterest | `#E60023` |

---

## Component 2: CalendarGrid

**File**: `components/Publishing/CalendarGrid.tsx`  
**Width**: `flex-1 min-w-0`, full height card

### Responsibility
Center column. Renders a monthly calendar. Accepts drag-drop of drafts onto day cells to schedule them.

### Features
- **Month navigation**: `<ChevronLeft>` / `<ChevronRight>` buttons + "Today" jump button (visible when not on current month)
- **Header stat pills**: green pill for total scheduled count, blue pill for today's post count
- **Weekday row**: Sun–Sat labels
- **42-cell grid** (6 rows × 7 cols): padding null-cells for month alignment
- **Day cells**: `onDragOver` / `onDragLeave` / `onDrop` handlers; `data-dragover` attribute for CSS highlight; today highlighted with `bg-[#0052FF]` circle on date number
- **Post chips** per day: show scheduled time + platform icons; max 2 shown, `+N` overflow badge

### Calendar math
```ts
const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
// Pad to 42 cells with null entries
```

---

## Component 3: PostContextPanel

**File**: `components/Publishing/PostContextPanel.tsx`  
**Width**: `w-[320px]`, full height card (only rendered when `selectedPost !== null`)

### Responsibility
Right-column editor. Shows when user clicks a scheduled post chip on the calendar. Allows editing and deleting the post.

### Features
- **Header**: post title + "Scheduled" badge + close `<X>` button
- **Title input**: editable text field
- **Platform toggles**: 3-col grid of toggle buttons with platform-specific active colors
- **Best-time hint**: amber info block showing best posting time for the first selected platform
- **Scheduled time**: `input[type=time]` + date pill + timezone display via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- **Caption textarea**: with character counter and progress bar (blue → amber → red as limit approaches)
- **Media preview**: image carousel with prev/next arrows; fallback upload drop zone
- **Save button**: disabled when over character limit
- **Delete button**: removes post entirely

### Character limits per platform
| Platform | Limit |
|---|---|
| LinkedIn | 3,000 |
| Twitter | 280 |
| Instagram | 2,200 |
| Facebook | 63,206 |
| Threads | 500 |
| Pinterest | 500 |

### Best posting times
| Platform | Suggestion |
|---|---|
| LinkedIn | Tue–Thu · 8–10 AM |
| Twitter | Wed–Fri · 9 AM–3 PM |
| Instagram | Mon, Wed · 11 AM–1 PM |
| Facebook | Wed · 1–4 PM |
| Threads | Mon–Fri · 9 AM–12 PM |
| Pinterest | Sat–Sun · 8–11 PM |

---

## Design System Used

All components follow the PostAnalyzer design system:

| Token | Value |
|---|---|
| Page background | `bg-[#F4F7FA]` |
| Card container | `bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]` |
| Section label | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` |
| Card title | `text-lg font-bold text-[#1A1D23] leading-none` |
| Primary text | `text-[#1A1D23]` |
| Icon badge | `w-10 h-10 rounded-[14px] bg-[#0052FF] text-white` |
| Inner bg | `bg-[#F4F7FA] rounded-2xl` |
| Green badge | `bg-[#F3FFE5] text-[#4D8C00]` |
| Blue badge | `bg-[#EEF3FF] text-[#0052FF]` |
| Primary button | `bg-[#0052FF] hover:bg-[#003DD4] text-white rounded-2xl font-bold shadow-[0_4px_14px_rgba(0,82,255,0.2)]` |
| Input field | `bg-[#F4F7FA] rounded-2xl border-transparent focus:ring-2 focus:ring-[#0052FF]/20` |

---

## Files That Were Removed

```
app/pages/appPages/components/Publishing/
├── types.ts
├── StagingSidebar.tsx
├── CalendarGrid.tsx
└── PostContextPanel.tsx

app/pages/appPages/[id]/publishing/
└── page.tsx

app/[id]/publishing/
└── page.tsx           ← re-export only: export { default } from "../../pages/appPages/[id]/publishing/page"
```

**Also cleaned up**: `getTitle` entry for `/publishing` in `app/[id]/layout.tsx`

---

## To Rebuild

1. Re-create `types.ts` with the `Platform` and `PostDraft` types above.
2. Build `StagingSidebar`, `CalendarGrid`, `PostContextPanel` as described above.
3. Create `app/pages/appPages/[id]/publishing/page.tsx` as the orchestrator page.
4. Create `app/[id]/publishing/page.tsx` as the re-export shim.
5. Add back `"Scheduling & Publishing"` to `getTitle` in `app/[id]/layout.tsx`.
6. Add a nav item in `Sidebar.tsx` pointing to `/{id}/publishing` (was removed earlier in the project).

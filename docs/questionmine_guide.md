# QuestionMine Feature - Implementation Guide

This guide teaches you how to implement React state management for the QuestionMine feature. All UI is already built - you just need to add the logic!

---

## 📁 Files Overview

| File                | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `page.tsx`          | Main page - orchestrates state and passes props |
| `MinerInput.tsx`    | Search input + source selection                 |
| `QuestionFeed.tsx`  | Displays mined questions                        |
| `SolutionModal.tsx` | AI draft generator modal                        |

---

## Step 1: Main Page State (`page.tsx`)

### 1.1 Add Imports

```tsx
import React, { useState } from "react";
```

### 1.2 Add State Variables

```tsx
const [isMining, setIsMining] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(
  null
);
```

> **Tip**: Import `QuestionItem` type from `QuestionFeed.tsx`

### 1.3 Add Handlers

```tsx
// Called when user clicks "Start Excavation"
const handleSearch = (term: string, sources: string[]) => {
  console.log("Excavating:", term, sources);
  setIsMining(true);

  // Simulate API delay
  setTimeout(() => {
    setIsMining(false);
  }, 2500);
};

// Called when user clicks "Draft Solution" on a question
const handleSolve = (question: QuestionItem) => {
  setSelectedQuestion(question);
  setIsModalOpen(true);
};
```

### 1.4 Pass Props to Components

```tsx
<MinerInput onSearch={handleSearch} isMining={isMining} />

<QuestionFeed isMining={isMining} onSolve={handleSolve} />

<SolutionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  question={selectedQuestion}
/>
```

---

## Step 2: MinerInput Component

### 2.1 Add State

```tsx
const [searchTerm, setSearchTerm] = useState("");
const [sources, setSources] = useState<string[]>(["reddit", "quora"]);
```

### 2.2 Add Toggle Function

```tsx
const toggleSource = (id: string) => {
  if (sources.includes(id)) {
    setSources(sources.filter((s) => s !== id));
  } else {
    setSources([...sources, id]);
  }
};
```

### 2.3 Add Search Handler

```tsx
const handleSearch = () => {
  if (searchTerm.trim().length > 2) {
    onSearch?.(searchTerm, sources);
  }
};
```

### 2.4 Wire Up the Input

```tsx
<input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
  ...
/>
```

### 2.5 Wire Up Source Buttons

```tsx
const isActive = sources.includes(p.id);
// ...
<button onClick={() => toggleSource(p.id)}>
```

### 2.6 Wire Up Action Button

```tsx
<button
  onClick={handleSearch}
  disabled={isMining || searchTerm.length < 3 || sources.length === 0}
  className={`
    ${
      searchTerm.length >= 3 && sources.length > 0 && !isMining
        ? "bg-orange-600 hover:bg-orange-700 text-white ..."
        : "bg-gray-100 text-gray-400 cursor-not-allowed ..."
    }
  `}
>
  {isMining ? (
    <>
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Digging Deep...
    </>
  ) : (
    <>
      <Pickaxe
        size={20}
        className={searchTerm.length >= 3 ? "animate-bounce" : ""}
      />
      Start Excavation
    </>
  )}
</button>
```

---

## Step 3: QuestionFeed Component

### 3.1 Add State

```tsx
const [questions, setQuestions] = useState<QuestionItem[]>([]);
```

### 3.2 Add useEffect

```tsx
import { useState, useEffect } from "react";

useEffect(() => {
  if (isMining) {
    setQuestions([]); // Clear while mining
  } else {
    if (questions.length === 0) {
      const timer = setTimeout(() => {
        setQuestions(MOCK_QUESTIONS);
      }, 500);
      return () => clearTimeout(timer);
    }
  }
}, [isMining]);
```

### 3.3 Add Conditional Rendering

```tsx
// 1. MINING STATE
if (isMining) {
  return <SkeletonLoader />;
}

// 2. EMPTY STATE
if (questions.length === 0) {
  return <EmptyState />;
}

// 3. RESULTS STATE
return (
  <div className="space-y-4 max-w-3xl mx-auto pb-40">
    {questions.map((q) => (
      <QuestionCard key={q.id} q={q} />
    ))}
    <div className="text-center py-6">
      <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-600 transition-colors">
        Load more threads
      </button>
    </div>
  </div>
);
```

---

## Step 4: SolutionModal Component

### 4.1 Add State

```tsx
const [loading, setLoading] = useState(true);
const [draft, setDraft] = useState("");
```

### 4.2 Add useEffect for AI Generation

```tsx
useEffect(() => {
  if (isOpen && question) {
    setLoading(true);

    setTimeout(() => {
      setDraft(
        `Stop worrying about the "${question.title.substring(0, 20)}..."\n\n` +
          `I see so many people stressing about this, but here is the truth:\n` +
          `The anxiety you feel isn't about the problem itself. It's about lack of clarity.\n\n` +
          `Here is the 3-step fix I use:\n` +
          `1. Audit your current situation.\n` +
          `2. Remove the friction points (usually manual tasks).\n` +
          `3. Double down on what works.\n\n` +
          `Don't overcomplicate it. 👊\n\n` +
          `#Advice #Growth #ProblemSolving`
      );
      setLoading(false);
    }, 1500);
  }
}, [isOpen, question]);
```

### 4.3 Add Loading State Render

```tsx
{loading ? (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10 backdrop-blur-sm">
    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
    <p className="text-sm font-medium text-gray-500 animate-pulse">
      Analyzing pain point & drafting...
    </p>
  </div>
) : (
  <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="AI draft will appear here..."
      ...
    />
  </div>
)}
```

---

## 🧪 Testing Checklist

- [ ] Type a keyword and see button become active
- [ ] Toggle source buttons on/off
- [ ] Click "Start Excavation" and see skeleton loaders
- [ ] Questions appear after mining completes
- [ ] Click "Draft Solution" opens modal
- [ ] Modal shows loading spinner, then AI draft
- [ ] Can edit the draft text
- [ ] Close button works

---

## 💡 Key Concepts Used

| Concept               | Where Used                                        |
| --------------------- | ------------------------------------------------- |
| `useState`            | All 4 files for local state                       |
| `useEffect`           | QuestionFeed (data fetch), SolutionModal (AI gen) |
| Conditional Rendering | Mining/Empty/Results states                       |
| Props                 | Passing handlers down from page                   |
| Callbacks             | `onSearch`, `onSolve`, `onClose`                  |
| Array Methods         | `filter`, `includes` for sources                  |

Good luck! 🚀

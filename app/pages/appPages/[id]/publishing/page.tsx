"use client";

import React, { useState } from "react";
import TopMenu from "../../components/topMenu/topMenu";
import StagingSidebar from "../../components/Publishing/StagingSidebar";
import CalendarGrid from "../../components/Publishing/CalendarGrid";
import PostContextPanel from "../../components/Publishing/PostContextPanel";
import { PostDraft } from "../../components/Publishing/types";

// --- MOCK DATA (With Carousels & Multi-Platform) ---
const INITIAL_DRAFTS: PostDraft[] = [
  {
    id: "1",
    title: "Carousel: 5 Growth Hacks",
    content:
      "Here are the 5 pillars of growth you need to know. Swipe to learn more 👉",
    platforms: ["linkedin", "instagram"],
    status: "draft",
    media: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=500&q=80",
    ],
  },
  {
    id: "2",
    title: "Team Update",
    content: "We are expanding! Welcome to our new designers.",
    platforms: ["linkedin"],
    status: "draft",
    media: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80",
    ],
  },
  {
    id: "3",
    title: "Quick Thought",
    content: "AI isn't replacing you. A person using AI is.",
    platforms: ["twitter"],
    status: "draft",
    media: [], // Text only
  },
];

export default function PublishingPage() {
  const [drafts, setDrafts] = useState<PostDraft[]>(INITIAL_DRAFTS);
  const [scheduledPosts, setScheduledPosts] = useState<PostDraft[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostDraft | null>(null);

  const handleDragStart = (e: React.DragEvent, draft: PostDraft) => {
    e.dataTransfer.setData("draftId", draft.id);
  };

  const handleDropDraft = (draftId: string, date: Date) => {
    const draftToMove = drafts.find((d) => d.id === draftId);

    if (draftToMove) {
      setDrafts(drafts.filter((d) => d.id !== draftId));

      // Default time to 9 AM if dropping for the first time
      date.setHours(9, 0, 0, 0);

      const newPost = {
        ...draftToMove,
        status: "scheduled",
        scheduledDate: date,
      } as PostDraft;
      setScheduledPosts([...scheduledPosts, newPost]);
      setSelectedPost(newPost);
    }
  };

  // Create Blank Draft
  const handleCreateNew = () => {
    const newDraft: PostDraft = {
      id: Date.now().toString(),
      title: "New Post",
      content: "",
      platforms: ["linkedin"], // Default
      status: "draft",
      media: [],
    };
    setDrafts([newDraft, ...drafts]);
  };

  const handleUpdatePost = (updatedPost: PostDraft) => {
    setScheduledPosts((posts) =>
      posts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts((posts) => posts.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  return (
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Scheduling & Publishing"
          tokens={2000}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* COL A: STAGING SIDEBAR */}
        <StagingSidebar
          drafts={drafts}
          onDraftDragStart={handleDragStart}
          onCreateNew={handleCreateNew}
        />

        {/* COL B: CALENDAR GRID */}
        <div className="flex-1 bg-gray-50 p-6 h-full overflow-hidden">
          <CalendarGrid
            scheduledPosts={scheduledPosts}
            onDropDraft={handleDropDraft}
            onPostClick={(post) => setSelectedPost(post)}
          />
        </div>

        {/* COL C: CONTEXT PANEL */}
        <PostContextPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={handleUpdatePost}
          onDelete={handleDeletePost}
        />
      </div>
    </div>
  );
}

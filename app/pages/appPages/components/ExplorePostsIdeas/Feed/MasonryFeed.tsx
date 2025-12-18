"use client";

import React, { useState, useEffect } from "react";
import { Ghost } from "lucide-react";
import TrendCard, { TrendPost } from "./TrendCard";

// --- INTERFACE ---
// This defines the communication channel with the parent Page
interface MasonryFeedProps {
  onRemixRequest: (post: TrendPost) => void;
}

export default function MasonryFeed({ onRemixRequest }: MasonryFeedProps) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TrendPost[]>([]);

  // --- 1. MOCK DATA SIMULATION ---
  useEffect(() => {
    // Simulate API network delay
    const timer = setTimeout(() => {
      setPosts([
        {
          id: "1",
          platform: "twitter",
          author: {
            name: "Elon Musk",
            handle: "@elonmusk",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elon",
          },
          content: {
            text: "AI is advancing faster than anyone realizes. By 2026, compute will outpace biology. Are we ready?",
          },
          metrics: { likes: 450000, comments: 12000, shares: 89000 },
          analysis: {
            velocity: "Exploding",
            hook_strength: 95,
            reason: "Urgency + Future Pace",
          },
          timestamp: "2h ago",
        },
        {
          id: "2",
          platform: "pinterest",
          author: {
            name: "Design Daily",
            handle: "@designdaily",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design",
          },
          content: {
            image:
              "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
            text: "Minimalist workspace setups for 2025. The era of cable management is over.",
          },
          metrics: { likes: 1200, comments: 45, shares: 3000 },
          analysis: {
            velocity: "Rising",
            hook_strength: 80,
            reason: "Aesthetic Aspiration",
          },
          timestamp: "1d ago",
        },
        {
          id: "3",
          platform: "linkedin",
          author: {
            name: "Satya Nadella",
            handle: "CEO @ Microsoft",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Satya",
          },
          content: {
            text: "Empathy is not a soft skill. It is the hardest skill we learn. In the age of AI, our humanity is our competitive advantage.",
          },
          metrics: { likes: 85000, comments: 4000, shares: 12000 },
          analysis: {
            velocity: "Stable",
            hook_strength: 88,
            reason: "Leadership Insight",
          },
          timestamp: "5h ago",
        },
        {
          id: "4",
          platform: "instagram",
          author: {
            name: "Travel Lens",
            handle: "@travellens",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Travel",
          },
          content: {
            image:
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
            text: "Switzerland is unreal 🏔️ #travel #nature",
          },
          metrics: { likes: 45000, comments: 320, shares: 1500 },
          analysis: {
            velocity: "Rising",
            hook_strength: 75,
            reason: "High Visual Impact",
          },
          timestamp: "8h ago",
        },
        {
          id: "5",
          platform: "twitter",
          author: {
            name: "TechCrunch",
            handle: "@TechCrunch",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TC",
          },
          content: {
            text: "BREAKING: Apple announces new Vision Pro integration with OpenAI. Here's what it means for devs.",
          },
          metrics: { likes: 12000, comments: 800, shares: 4500 },
          analysis: {
            velocity: "Exploding",
            hook_strength: 92,
            reason: "Newsjack Opportunity",
          },
          timestamp: "10m ago",
        },
        {
          id: "6",
          platform: "facebook",
          author: {
            name: "Mark Zuckerberg",
            handle: "Meta",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
          },
          content: {
            text: "Building the future of connection requires open source. Llama 4 is now available for researchers.",
          },
          metrics: { likes: 21000, comments: 5000, shares: 1200 },
          analysis: {
            velocity: "Stable",
            hook_strength: 85,
            reason: "Open Source Announcement",
          },
          timestamp: "30m ago",
        },
      ]);
      setLoading(false);
    }, 1500); // 1.5s Fake Load Delay

    return () => clearTimeout(timer);
  }, []);

  // --- 2. SKELETON LOADING STATE ---
  if (loading) {
    return (
      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="break-inside-avoid bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-2 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            {/* Random heights to simulate masonry look during loading */}
            <div
              className={`w-full bg-gray-100 rounded-xl animate-pulse ${
                i % 2 === 0 ? "h-64" : "h-24"
              }`}
            />
            <div className="flex justify-between pt-2">
              <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- 3. EMPTY STATE ---
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
        <Ghost size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">No trends found for this topic.</p>
        <button className="mt-4 text-indigo-600 font-bold text-xs hover:underline">
          Reset Filters
        </button>
      </div>
    );
  }

  // --- 4. THE REAL FEED ---
  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-40">
      {posts.map((post) => (
        // 'break-inside-avoid' prevents CSS columns from chopping a card in half
        <div key={post.id} className="break-inside-avoid">
          {/* We pass the onRemixRequest directly to the card */}
          <TrendCard post={post} onRemix={onRemixRequest} />
        </div>
      ))}

      {/* End of Feed Signal */}
      <div className="break-inside-avoid py-12 text-center opacity-50">
        <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
          End of results
        </p>
      </div>
    </div>
  );
}

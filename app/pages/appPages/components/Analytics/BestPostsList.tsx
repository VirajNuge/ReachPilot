"use client";

import React from "react";
import { Image } from "lucide-react";
import type { BestPost } from "@/lib/analytics/types";

export default function BestPostsList({ posts }: { posts: BestPost[] | undefined }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
        <div className="text-sm text-slate-500">No top posts available for the selected range.</div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)] max-h-[420px] overflow-y-auto">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Best posts (30d)</div>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.postId} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
            <div className="w-14 h-10 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
              {post.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
              ) : (
                <Image size={20} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#000100] truncate">{post.caption ?? "(No caption)"}</div>
              <div className="text-xs text-slate-500">{post.platform} • {new Date(post.postedAt).toLocaleDateString()}</div>
            </div>
            <div className="text-sm font-black text-[#000100]">{post.metricValue}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

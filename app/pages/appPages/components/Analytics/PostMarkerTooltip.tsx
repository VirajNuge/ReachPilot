"use client";

import React from "react";
import { Image } from "lucide-react";
import type { PostEvent } from "@/lib/analytics/types";

export default function PostMarkerTooltip({ post }: { post: PostEvent | null }) {
  if (!post) return null;

  return (
    <div className="absolute right-6 top-6 z-50 w-[260px] rounded-lg border bg-white p-3 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden">
          {post.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.thumbnail} alt="post" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Image className="text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-[#000100] truncate">{post.platform}</div>
          <div className="text-xs text-slate-500">{new Date(post.postedAt).toLocaleString()}</div>
          <div className="mt-2 text-sm text-slate-700">
            {post.metrics ? `${post.metrics.likes ?? 0} likes • ${post.metrics.comments ?? 0} comments` : "No metrics"}
          </div>
        </div>
      </div>
    </div>
  );
}

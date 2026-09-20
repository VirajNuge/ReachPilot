import React from "react";
import SectionCard from "./SectionCard";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export interface BestPostItem {
  id: string;
  title: string;
  platform: string;
  engagementRate: number;
  postedAt: string;
}

interface BestPostsProps {
  posts: BestPostItem[];
}

const platformColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  linkedin:  { bg: "bg-[#0A66C2]/10", border: "border-[#0A66C2]/20", text: "text-[#0A66C2]", label: "LinkedIn" },
  x:         { bg: "bg-slate-100",     border: "border-slate-200",     text: "text-slate-800",  label: "X" },
  twitter:   { bg: "bg-slate-100",     border: "border-slate-200",     text: "text-slate-800",  label: "X" },
  instagram: { bg: "bg-[#E1306C]/10", border: "border-[#E1306C]/20", text: "text-[#E1306C]", label: "Instagram" },
  facebook:  { bg: "bg-[#1877F2]/10", border: "border-[#1877F2]/20", text: "text-[#1877F2]", label: "Facebook" },
};

function getPlatformStyle(platform: string) {
  return platformColors[platform?.toLowerCase()] || {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
    label: platform || "Post",
  };
}

function engagementColor(rate: number) {
  if (rate >= 5) return "text-emerald-700 bg-emerald-50 border-emerald-200/80";
  if (rate >= 2) return "text-blue-700 bg-blue-50 border-blue-200/80";
  return "text-slate-600 bg-slate-100 border-slate-200";
}

export default function BestPosts({ posts }: BestPostsProps) {
  const router = useRouter();
  const params = useParams();
  const rawAccountId = params?.id;
  const accountId = Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId ?? "1";

  return (
    <SectionCard
      title="Best Performing Posts"
      subtitle="Top posts by engagement rate"
      action={
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/analytics`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>View insights</span>
          <ArrowUpRight size={13} />
        </button>
      }
      noPadding
    >
      {posts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 shadow-xs">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm font-bold text-slate-800">No published posts yet</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
            Publish your first post to track engagement rates, audience reach, and top performers.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push(`/${accountId}/postGenerator`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Create first post</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {posts.map((post) => {
            const ps = getPlatformStyle(post.platform);
            const ec = engagementColor(post.engagementRate);
            return (
              <div
                key={post.id}
                className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Platform pill */}
                <span className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${ps.bg} ${ps.border} ${ps.text}`}>
                  {ps.label}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                    {post.title}
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">{post.postedAt}</div>
                </div>

                {/* Engagement badge */}
                <span className={`mt-0.5 shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full border ${ec}`}>
                  {post.engagementRate}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

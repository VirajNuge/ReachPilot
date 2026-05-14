import React from "react";
import SectionCard from "./SectionCard";

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

const platformColors: Record<string, { bg: string; text: string; label: string }> = {
  linkedin:  { bg: "bg-[#0A66C2]/8 border-[#0A66C2]/15",  text: "text-[#0A66C2]",  label: "LinkedIn"  },
  x:         { bg: "bg-slate-100/80 border-slate-200",     text: "text-slate-700",  label: "X"         },
  twitter:   { bg: "bg-slate-100/80 border-slate-200",     text: "text-slate-700",  label: "X"         },
  instagram: { bg: "bg-[#E1306C]/8 border-[#E1306C]/15",  text: "text-[#E1306C]",  label: "Instagram" },
  facebook:  { bg: "bg-[#1877F2]/8 border-[#1877F2]/15",  text: "text-[#1877F2]",  label: "Facebook"  },
};

function getPlatformStyle(platform: string) {
  return platformColors[platform?.toLowerCase()] || {
    bg: "bg-purple-50/80 border-purple-100",
    text: "text-purple-600",
    label: platform,
  };
}

function engagementColor(rate: number) {
  if (rate >= 5) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (rate >= 2) return "text-blue-600 bg-blue-50 border-blue-100";
  return "text-slate-500 bg-slate-100 border-slate-200";
}

export default function BestPosts({ posts }: BestPostsProps) {
  return (
    <SectionCard
      title="Best Performing Posts"
      subtitle="Top posts by engagement rate"
      action={
        <button className="text-[11px] font-semibold text-[#9C4BFF] hover:text-[#7B2FFF] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors">
          View insights
        </button>
      }
      noPadding
    >
      <div className="divide-y divide-slate-100">
        {posts.map((post) => {
          const ps = getPlatformStyle(post.platform);
          const ec = engagementColor(post.engagementRate);
          return (
            <div
              key={post.id}
              className="flex items-start gap-3.5 px-6 py-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              {/* Platform pill */}
              <span className={`mt-0.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border ${ps.bg} ${ps.text}`}>
                {ps.label}
              </span>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1A1D23] line-clamp-2 leading-snug group-hover:text-[#9C4BFF] transition-colors">
                  {post.title}
                </p>
                <div className="text-[11px] text-slate-400 font-medium mt-1">{post.postedAt}</div>
              </div>

              {/* Engagement badge */}
              <span className={`mt-0.5 flex-shrink-0 text-[12px] font-black px-2.5 py-1 rounded-xl border ${ec}`}>
                {post.engagementRate}%
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

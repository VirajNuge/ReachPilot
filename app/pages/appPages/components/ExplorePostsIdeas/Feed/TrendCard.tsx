"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Wand2,
  Bookmark,
  ExternalLink,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Hash,
  TrendingUp,
  Zap,
} from "lucide-react";

// --- TYPES ---
export interface TrendPost {
  id: string;
  platform: "twitter" | "linkedin" | "instagram" | "pinterest" | "facebook";
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: {
    text?: string; // For text-first platforms
    image?: string; // For visual platforms
    videoThumbnail?: string;
  };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
  analysis: {
    velocity: "Exploding" | "Rising" | "Stable";
    hook_strength: number; // 0-100 score
    reason: string; // e.g. "Controversial Take"
  };
  timestamp: string;
}

interface TrendCardProps {
  post: TrendPost;
  onRemix: (post: TrendPost) => void;
}

export default function TrendCard({ post, onRemix }: TrendCardProps) {
  const [saved, setSaved] = useState(false);

  // Helper: Format numbers (1200 -> 1.2k)
  const formatMetric = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  // Helper: Get Platform Branding
  const getPlatformStyle = () => {
    switch (post.platform) {
      case "twitter":
        return {
          icon: <Twitter size={14} />,
          color: "text-black bg-gray-100",
          border: "group-hover:border-gray-400",
        };
      case "linkedin":
        return {
          icon: <Linkedin size={14} />,
          color: "text-[#0077B5] bg-blue-50",
          border: "group-hover:border-[#0077B5]",
        };
      case "instagram":
        return {
          icon: <Instagram size={14} />,
          color: "text-pink-600 bg-pink-50",
          border: "group-hover:border-pink-300",
        };
      case "pinterest":
        return {
          icon: <Hash size={14} />,
          color: "text-[#E60023] bg-red-50",
          border: "group-hover:border-[#E60023]",
        };
      case "facebook":
        return {
          icon: <Facebook size={14} />,
          color: "text-[#1877F2] bg-blue-50",
          border: "group-hover:border-[#1877F2]",
        };
      default:
        return {
          icon: <Hash size={14} />,
          color: "text-gray-600 bg-gray-100",
          border: "group-hover:border-gray-300",
        };
    }
  };

  const pStyle = getPlatformStyle();

  return (
    <div
      className={`group relative break-inside-avoid mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${pStyle.border}`}
    >
      {/* === 1. HEADER (Author & Platform) === */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Meta */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 leading-tight">
              {post.author.name}
            </h4>
            <p className="text-[10px] text-gray-500">
              {post.author.handle} • {post.timestamp}
            </p>
          </div>
        </div>
        {/* Platform Badge */}
        <div className={`p-1.5 rounded-lg ${pStyle.color}`}>{pStyle.icon}</div>
      </div>

      {/* === 2. CONTENT AREA === */}
      <div className="px-4 pb-2">
        {/* Text Content (Twitter/LinkedIn priority) */}
        {post.content.text && (
          <p
            className={`text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium ${
              post.content.image ? "mb-3 line-clamp-3" : "mb-4"
            }`}
          >
            {post.content.text}
          </p>
        )}

        {/* Visual Content (Instagram/Pinterest priority) */}
        {post.content.image && (
          <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-100 aspect-auto">
            <img
              src={post.content.image}
              alt="Trend Visual"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {/* Visual Badge */}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              MEDIA
            </div>
          </div>
        )}
      </div>

      {/* === 3. AI ANALYTICS BAR (The "Clear Idea") === */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
            <Zap size={14} fill="currentColor" />
          </div>
          <div className="flex-1">
            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
              Viral Driver
            </span>
            <span className="text-xs font-bold text-indigo-900">
              {post.analysis.reason}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
              <TrendingUp size={10} /> {post.analysis.velocity}
            </span>
          </div>
        </div>
      </div>

      {/* === 4. FOOTER METRICS === */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-default">
            <Heart size={14} /> {formatMetric(post.metrics.likes)}
          </span>
          <span className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-default">
            <MessageCircle size={14} /> {formatMetric(post.metrics.comments)}
          </span>
          <span className="flex items-center gap-1 hover:text-green-500 transition-colors cursor-default">
            <Share2 size={14} /> {formatMetric(post.metrics.shares)}
          </span>
        </div>

        {/* Save Bookmark */}
        <button
          onClick={() => setSaved(!saved)}
          className={`transition-colors p-1 rounded-md hover:bg-gray-100 ${
            saved ? "text-indigo-600 fill-indigo-600" : "hover:text-gray-900"
          }`}
        >
          <Bookmark size={16} />
        </button>
      </div>

      {/* === 5. HOVER OVERLAY (Hero Action) === */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={() => onRemix(post)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          <Wand2 size={18} />
          Remix with AI
        </button>
        <button className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:text-gray-900 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
          View Original <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

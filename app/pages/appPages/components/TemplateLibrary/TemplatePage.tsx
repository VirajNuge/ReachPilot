"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, X, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

type TemplateCategory =
  | "how_to"
  | "listicle"
  | "thought_leadership"
  | "product_launch"
  | "behind_the_scenes"
  | "testimonial"
  | "engagement_question"
  | "personal_story"
  | "announcement"
  | "myth_busting"
  | "motivational"
  | "promotional";

type TemplatePlatform = "linkedin" | "x" | "instagram_post" | "facebook";

interface PlatformTemplateVariant {
  platform: TemplatePlatform;
  structure: string;
  examplePost?: string;
  characterLimit?: number;
}

interface CaptionTemplate {
  _id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platforms: TemplatePlatform[];
  platformVariants: PlatformTemplateVariant[];
  isBundle: boolean;
  matchKeywords: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface TemplatePageProps {
  accountId: string;
  onSelectTemplate: (templateId: string) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string; emoji: string }[] = [
  { value: "how_to", label: "How To", emoji: "📖" },
  { value: "listicle", label: "Listicle", emoji: "📋" },
  { value: "thought_leadership", label: "Thought Leadership", emoji: "💡" },
  { value: "product_launch", label: "Product Launch", emoji: "🚀" },
  { value: "behind_the_scenes", label: "Behind the Scenes", emoji: "🎬" },
  { value: "testimonial", label: "Testimonial", emoji: "⭐" },
  { value: "engagement_question", label: "Engagement Question", emoji: "💬" },
  { value: "personal_story", label: "Personal Story", emoji: "📝" },
  { value: "announcement", label: "Announcement", emoji: "📢" },
  { value: "myth_busting", label: "Myth Busting", emoji: "⚡" },
  { value: "motivational", label: "Motivational", emoji: "🔥" },
  { value: "promotional", label: "Promotional", emoji: "📣" },
];

const PLATFORM_OPTIONS: { value: TemplatePlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "instagram_post", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  how_to: "bg-sky-100 text-sky-700",
  listicle: "bg-violet-100 text-violet-700",
  thought_leadership: "bg-indigo-100 text-indigo-700",
  product_launch: "bg-orange-100 text-orange-700",
  behind_the_scenes: "bg-pink-100 text-pink-700",
  testimonial: "bg-yellow-100 text-yellow-700",
  engagement_question: "bg-teal-100 text-teal-700",
  personal_story: "bg-purple-100 text-purple-700",
  announcement: "bg-red-100 text-red-700",
  myth_busting: "bg-amber-100 text-amber-700",
  motivational: "bg-emerald-100 text-emerald-700",
  promotional: "bg-rose-100 text-rose-700",
};

const PLATFORM_COLORS: Record<TemplatePlatform, string> = {
  linkedin: "bg-blue-100 text-blue-700",
  x: "bg-slate-100 text-slate-700",
  instagram_post: "bg-pink-100 text-pink-700",
  facebook: "bg-indigo-100 text-indigo-700",
};

// ── Preview Drawer ────────────────────────────────────────────────────────────

function TemplatePreviewDrawer({
  template,
  onClose,
  onSelect,
}: {
  template: CaptionTemplate;
  onClose: () => void;
  onSelect: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TemplatePlatform | null>(
    template.platforms[0] ?? null
  );
  const [expandedPlatform, setExpandedPlatform] = useState<TemplatePlatform | null>(
    template.platforms[0] ?? null
  );

  const catInfo = CATEGORY_OPTIONS.find((c) => c.value === template.category);
  const activeVariant = template.platformVariants.find((v) => v.platform === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${CATEGORY_COLORS[template.category] ?? "bg-slate-100 text-slate-600"}`}>
                {catInfo?.emoji} {catInfo?.label}
              </span>
              {template.isBundle && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF]">
                  Bundle
                </span>
              )}
            </div>
            <h2 className="text-[20px] font-black text-[#1A1D23] mt-1">{template.name}</h2>
            <p className="text-[13px] text-slate-500 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-xl hover:bg-slate-50 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Tabs */}
        {template.platforms.length > 0 && (
          <div className="flex gap-1 px-7 pt-4 shrink-0 border-b border-slate-100 pb-0">
            {template.platforms.map((p) => {
              const label = PLATFORM_OPTIONS.find((o) => o.value === p)?.label ?? p;
              const isActive = activeTab === p;
              return (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={`px-4 py-2.5 text-[13px] font-bold rounded-t-xl transition-colors cursor-pointer border-none border-b-2 -mb-px ${
                    isActive
                      ? "bg-[#0052FF]/5 text-[#0052FF] border-b-2 border-[#0052FF]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-b-transparent"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Variant Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {activeVariant ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Structure / Prompt Framework
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                  {activeVariant.structure}
                </div>
              </div>
              {activeVariant.examplePost && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Example Post
                  </p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeVariant.examplePost}
                  </div>
                </div>
              )}
              {activeVariant.characterLimit && (
                <p className="text-[12px] text-slate-400 font-medium">
                  Character limit: {activeVariant.characterLimit.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-slate-400">No structure defined for this platform yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
          >
            Close
          </button>
          <button
            onClick={() => { onSelect(); onClose(); }}
            className="flex-1 py-3 bg-[#0052FF] hover:bg-[#0047FF] text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none shadow-[0_4px_14px_rgba(0,82,255,0.2)]"
          >
            Use This Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const TemplatePage: React.FC<TemplatePageProps> = ({ accountId: _accountId, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<CaptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [selectedPlatform, setSelectedPlatform] = useState<TemplatePlatform | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<CaptionTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedPlatform !== "all") params.set("platform", selectedPlatform);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/caption-templates?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPlatform, search]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPlatform("all");
  };

  const hasFilters = search.trim() || selectedCategory !== "all" || selectedPlatform !== "all";

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-20 shrink-0">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] placeholder:text-slate-400 outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer border-none ${selectedCategory === "all" ? "bg-[#0052FF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All Categories
          </button>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer border-none ${selectedCategory === c.value ? "bg-[#0052FF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Platform pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer border-none ${selectedPlatform === "all" ? "bg-[#1A1D23] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All Platforms
          </button>
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPlatform(p.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer border-none ${selectedPlatform === p.value ? "bg-[#1A1D23] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-semibold mb-3">{error}</p>
            <button onClick={fetchTemplates} className="text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse h-[180px]">
                <div className="h-5 bg-slate-200 rounded w-36 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Layers size={28} className="text-slate-300" />
            </div>
            <p className="text-[16px] font-bold text-slate-400 mb-1">No templates found</p>
            <p className="text-[13px] text-slate-400 mb-5">
              {hasFilters ? "Try adjusting your filters or search" : "No caption templates have been added yet"}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#0052FF]/10 text-[#0052FF] text-[13px] font-bold rounded-xl cursor-pointer border-none hover:bg-[#0052FF]/20 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
            {templates.map((t) => {
              const catInfo = CATEGORY_OPTIONS.find((c) => c.value === t.category);
              return (
                <div
                  key={t._id}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#0052FF]/20 transition-all cursor-pointer"
                  onClick={() => setPreviewTemplate(t)}
                >
                  {/* Category + Bundle badge */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${CATEGORY_COLORS[t.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {catInfo?.emoji} {catInfo?.label}
                    </span>
                    {t.isBundle && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF]">
                        Bundle
                      </span>
                    )}
                  </div>

                  {/* Name + description */}
                  <h3 className="text-[15px] font-black text-[#1A1D23] mb-1 group-hover:text-[#0052FF] transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{t.description}</p>

                  {/* Platform pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.platforms.map((p) => (
                      <span key={p} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PLATFORM_COLORS[p] ?? "bg-slate-100 text-slate-600"}`}>
                        {PLATFORM_OPTIONS.find((o) => o.value === p)?.label ?? p}
                      </span>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}
                      className="flex-1 py-2 text-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border-none"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectTemplate(t._id); }}
                      className="flex-1 py-2 text-[12px] font-bold text-white bg-[#0052FF] hover:bg-[#0047FF] rounded-xl transition-colors cursor-pointer border-none shadow-[0_2px_8px_rgba(0,82,255,0.2)]"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Drawer */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewDrawer
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onSelect={() => onSelectTemplate(previewTemplate._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatePage;

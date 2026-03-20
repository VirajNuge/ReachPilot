"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Layers, X, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ── Types (inline, matching lib/models/captionTemplates.ts) ─────────────────

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
  bestForObjectives: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  { value: "x", label: "X / Twitter" },
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

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "how_to" as TemplateCategory,
  platforms: [] as TemplatePlatform[],
  platformVariants: [] as PlatformTemplateVariant[],
  isBundle: true,
  matchKeywords: "",
  bestForObjectives: "",
  isActive: true,
  sortOrder: 0,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${checked ? "bg-[#0052FF]" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CaptionTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CaptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CaptionTemplate | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedVariants, setExpandedVariants] = useState<Record<TemplatePlatform, boolean>>({
    linkedin: true, x: true, instagram_post: true, facebook: true,
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/caption-templates", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load caption templates");
      const data = await res.json();
      setTemplates(data.templates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // ── Sync platform variants when platforms change ────────────────────────────
  const syncVariants = (platforms: TemplatePlatform[], existing: PlatformTemplateVariant[]): PlatformTemplateVariant[] => {
    return platforms.map((p) => {
      const found = existing.find((v) => v.platform === p);
      return found ?? { platform: p, structure: "", examplePost: "" };
    });
  };

  const handlePlatformToggle = (platform: TemplatePlatform) => {
    const current = form.platforms;
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setForm((f) => ({
      ...f,
      platforms: next,
      platformVariants: syncVariants(next, f.platformVariants),
    }));
  };

  const updateVariant = (platform: TemplatePlatform, field: "structure" | "examplePost", value: string) => {
    setForm((f) => ({
      ...f,
      platformVariants: f.platformVariants.map((v) =>
        v.platform === platform ? { ...v, [field]: value } : v
      ),
    }));
  };

  const openAdd = () => {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (t: CaptionTemplate) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      description: t.description,
      category: t.category,
      platforms: [...t.platforms],
      platformVariants: t.platformVariants.map((v) => ({ ...v })),
      isBundle: t.isBundle,
      matchKeywords: t.matchKeywords.join(", "),
      bestForObjectives: t.bestForObjectives.join(", "),
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/caption-templates/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchTemplates();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.platforms.length === 0) { setFormError("Select at least one platform"); return; }
    const incompleteVariant = form.platformVariants.find((v) => !v.structure.trim());
    if (incompleteVariant) {
      setFormError(`Add a structure for ${PLATFORM_OPTIONS.find(p => p.value === incompleteVariant.platform)?.label ?? incompleteVariant.platform}`);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        matchKeywords: form.matchKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        bestForObjectives: form.bestForObjectives.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const url = editingTemplate
        ? `/api/admin/caption-templates/${editingTemplate._id}`
        : "/api/admin/caption-templates";
      const method = editingTemplate ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Save failed"); return; }
      setModalOpen(false);
      fetchTemplates();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryInfo = (cat: TemplateCategory) =>
    CATEGORY_OPTIONS.find((c) => c.value === cat) ?? { label: cat, emoji: "📄" };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Caption Templates</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">Caption Templates</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#0052FF] hover:bg-[#0047FF] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer border-none shadow-[0_4px_14px_rgba(0,82,255,0.2)]"
          >
            <Plus size={15} /> Add New Template
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Shield size={14} className="text-[#0052FF]" />
            <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-[15px] text-slate-500 font-medium mb-8">
          Manage caption template bundles for AI post generation
        </p>

        {error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-semibold">{error}</p>
            <button onClick={fetchTemplates} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
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
          <div className="text-center py-20">
            <Layers size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-slate-400">No caption templates yet</p>
            <p className="text-[13px] text-slate-400 mt-1">Create your first template bundle</p>
            <button
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white text-[14px] font-bold rounded-xl mx-auto cursor-pointer border-none hover:bg-[#0047FF] transition-colors"
            >
              <Plus size={16} /> Add Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => {
              const catInfo = getCategoryInfo(t.category);
              return (
                <div key={t._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] font-black text-[#1A1D23] truncate">{t.name}</h3>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.name)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${CATEGORY_COLORS[t.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {catInfo.emoji} {catInfo.label}
                    </span>
                    {t.isBundle && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF]">
                        Bundle
                      </span>
                    )}
                  </div>

                  {t.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {t.platforms.map((p) => (
                        <span key={p} className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${PLATFORM_COLORS[p] ?? "bg-slate-100 text-slate-600"}`}>
                          {PLATFORM_OPTIONS.find((o) => o.value === p)?.label ?? p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
                <h2 className="text-[20px] font-black text-[#1A1D23]">
                  {editingTemplate ? "Edit Template" : "Add Caption Template"}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-xl hover:bg-slate-50">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                {formError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-[13px] font-semibold text-red-600">{formError}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Product Launch Bundle"
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description *
                  </label>
                  <textarea
                    required rows={2} value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Briefly describe this template..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TemplateCategory }))}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Platforms *
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PLATFORM_OPTIONS.map((p) => (
                      <button
                        key={p.value} type="button"
                        onClick={() => handlePlatformToggle(p.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors cursor-pointer border ${form.platforms.includes(p.value) ? "bg-[#0052FF] text-white border-[#0052FF]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Variants */}
                {form.platforms.length > 0 && (
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Platform Structures
                    </label>
                    <div className="space-y-3">
                      {form.platformVariants.map((variant) => {
                        const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === variant.platform)?.label ?? variant.platform;
                        const isExpanded = expandedVariants[variant.platform];
                        return (
                          <div key={variant.platform} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedVariants((prev) => ({ ...prev, [variant.platform]: !prev[variant.platform] }))}
                              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left cursor-pointer border-none"
                            >
                              <span className={`text-[13px] font-bold px-2.5 py-0.5 rounded-full ${PLATFORM_COLORS[variant.platform] ?? "bg-slate-100 text-slate-600"}`}>
                                {platformLabel}
                              </span>
                              {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-3 space-y-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Structure / Prompt Framework *
                                  </label>
                                  <textarea
                                    rows={4} required value={variant.structure}
                                    onChange={(e) => updateVariant(variant.platform, "structure", e.target.value)}
                                    placeholder="Describe the post structure, tone guidelines, and formatting rules for this platform..."
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors resize-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Example Post (optional)
                                  </label>
                                  <textarea
                                    rows={3} value={variant.examplePost ?? ""}
                                    onChange={(e) => updateVariant(variant.platform, "examplePost", e.target.value)}
                                    placeholder="Paste a sample post demonstrating this template..."
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors resize-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Match Keywords */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Match Keywords <span className="text-slate-400 font-normal normal-case">(comma-separated)</span>
                  </label>
                  <input
                    type="text" value={form.matchKeywords}
                    onChange={(e) => setForm((f) => ({ ...f, matchKeywords: e.target.value }))}
                    placeholder="launch, product, reveal, new feature..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Best For Objectives */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Best For Objectives <span className="text-slate-400 font-normal normal-case">(comma-separated)</span>
                  </label>
                  <input
                    type="text" value={form.bestForObjectives}
                    onChange={(e) => setForm((f) => ({ ...f, bestForObjectives: e.target.value }))}
                    placeholder="brand_awareness, product_launch, lead_generation..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number" min={0} value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="block w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1D23]">Bundle</p>
                      <p className="text-[12px] text-slate-400">Show all platform variants as one card</p>
                    </div>
                    <Toggle checked={form.isBundle} onChange={(v) => setForm((f) => ({ ...f, isBundle: v }))} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1D23]">Active</p>
                      <p className="text-[12px] text-slate-400">Make this template available for selection</p>
                    </div>
                    <Toggle checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-[#0052FF] hover:bg-[#0047FF] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {saving ? "Saving..." : editingTemplate ? "Save Changes" : "Create Template"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

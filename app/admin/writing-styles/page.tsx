"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, PenSquare, X, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface WritingStyle {
  _id: string;
  name: string;
  description: string;
  toneProfile: {
    formalCasual: number;
    seriousPlayful: number;
    inspiringInformative: number;
    dataDriven: number;
  };
  sentenceLength: string[];
  emojiUsage: string;
  hashtagIntensity: string;
  ctas: string[];
  examplePost: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  toneProfile: { formalCasual: 50, seriousPlayful: 50, inspiringInformative: 50, dataDriven: 50 },
  sentenceLength: ["medium"] as string[],
  emojiUsage: "minimal",
  hashtagIntensity: "low",
  ctas: [] as string[],
  examplePost: "",
  isActive: true,
};

const SENTENCE_LENGTH_OPTIONS = ["short", "medium", "long"];
const CTA_OPTIONS = [
  { value: "comment_cta", label: "Comment CTA" },
  { value: "visit_link", label: "Visit Link" },
  { value: "dm_us", label: "DM Us" },
  { value: "sign_up", label: "Sign Up" },
  { value: "follow_for_more", label: "Follow For More" },
  { value: "save_this_post", label: "Save This Post" },
  { value: "share_with_friend", label: "Share With Friend" },
];

const EMOJI_COLORS: Record<string, string> = {
  none: "bg-slate-100 text-slate-600",
  minimal: "bg-blue-100 text-blue-700",
  moderate: "bg-orange-100 text-orange-700",
  heavy: "bg-pink-100 text-pink-700",
};

const HASHTAG_COLORS: Record<string, string> = {
  none: "bg-slate-100 text-slate-600",
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-[#0052FF]/10 text-[#0052FF]",
};

function ToneSlider({ label: sliderLabel, leftLabel, rightLabel, value, onChange }: {
  label: string; leftLabel: string; rightLabel: string; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{sliderLabel}</label>
        <span className="text-[12px] font-bold text-[#0052FF]">{value}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400 w-14 text-right">{leftLabel}</span>
        <input
          type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[#0052FF] h-1.5 cursor-pointer"
        />
        <span className="text-[11px] text-slate-400 w-14">{rightLabel}</span>
      </div>
    </div>
  );
}

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

export default function WritingStylesPage() {
  const router = useRouter();
  const [styles, setStyles] = useState<WritingStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<WritingStyle | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchStyles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/writing-styles", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load writing styles");
      const data = await res.json();
      setStyles(data.styles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchStyles(); }, [fetchStyles]);

  const openAdd = () => {
    setEditingStyle(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (style: WritingStyle) => {
    setEditingStyle(style);
    setForm({
      name: style.name,
      description: style.description,
      toneProfile: { ...style.toneProfile },
      sentenceLength: [...style.sentenceLength],
      emojiUsage: style.emojiUsage,
      hashtagIntensity: style.hashtagIntensity,
      ctas: [...style.ctas],
      examplePost: style.examplePost || "",
      isActive: style.isActive,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete writing style "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/writing-styles/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      fetchStyles();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const url = editingStyle ? `/api/admin/writing-styles/${editingStyle._id}` : "/api/admin/writing-styles";
      const method = editingStyle ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Save failed"); return; }
      setModalOpen(false);
      fetchStyles();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const togglePill = (arr: string[], val: string, setArr: (v: string[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Top Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Writing Styles</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">Writing Styles</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#0052FF] hover:bg-[#0047FF] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer border-none shadow-[0_4px_14px_rgba(0,82,255,0.2)]"
          >
            <Plus size={15} /> Add New Style
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Shield size={14} className="text-[#0052FF]" />
            <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-[15px] text-slate-500 font-medium mb-8">Manage writing style presets for AI post generation</p>

        {error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-semibold">{error}</p>
            <button onClick={fetchStyles} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : styles.length === 0 ? (
          <div className="text-center py-20">
            <PenSquare size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-slate-400">No writing styles yet</p>
            <p className="text-[13px] text-slate-400 mt-1">Create your first writing style preset</p>
            <button onClick={openAdd} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white text-[14px] font-bold rounded-xl mx-auto cursor-pointer border-none hover:bg-[#0047FF] transition-colors">
              <Plus size={16} /> Add Style
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {styles.map((style) => (
              <div key={style._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-black text-[#1A1D23]">{style.name}</h3>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{style.description}</p>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(style)}
                      className="p-1.5 text-slate-400 hover:text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(style._id, style.name)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${EMOJI_COLORS[style.emojiUsage] ?? "bg-slate-100 text-slate-600"}`}>
                    {style.emojiUsage} emoji
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${HASHTAG_COLORS[style.hashtagIntensity] ?? "bg-slate-100 text-slate-600"}`}>
                    {style.hashtagIntensity} hashtags
                  </span>
                </div>
                {style.sentenceLength?.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-2">Sentences: {style.sentenceLength.join(", ")}</p>
                )}
              </div>
            ))}
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
                  {editingStyle ? "Edit Writing Style" : "Add Writing Style"}
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
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Style Name *</label>
                  <input
                    type="text" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Bold Professional, Casual Storyteller..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    required rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Briefly describe this writing style..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors resize-none"
                  />
                </div>

                {/* Tone Sliders */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">Tone Profile</label>
                  <div className="space-y-4">
                    <ToneSlider label="Register" leftLabel="Formal" rightLabel="Casual" value={form.toneProfile.formalCasual} onChange={(v) => setForm(f => ({ ...f, toneProfile: { ...f.toneProfile, formalCasual: v } }))} />
                    <ToneSlider label="Mood" leftLabel="Serious" rightLabel="Playful" value={form.toneProfile.seriousPlayful} onChange={(v) => setForm(f => ({ ...f, toneProfile: { ...f.toneProfile, seriousPlayful: v } }))} />
                    <ToneSlider label="Purpose" leftLabel="Inspiring" rightLabel="Informative" value={form.toneProfile.inspiringInformative} onChange={(v) => setForm(f => ({ ...f, toneProfile: { ...f.toneProfile, inspiringInformative: v } }))} />
                    <ToneSlider label="Approach" leftLabel="Emotional" rightLabel="Data-Driven" value={form.toneProfile.dataDriven} onChange={(v) => setForm(f => ({ ...f, toneProfile: { ...f.toneProfile, dataDriven: v } }))} />
                  </div>
                </div>

                {/* Sentence Length */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sentence Length</label>
                  <div className="flex gap-2 flex-wrap">
                    {SENTENCE_LENGTH_OPTIONS.map(opt => (
                      <button key={opt} type="button"
                        onClick={() => togglePill(form.sentenceLength, opt, (v) => setForm(f => ({ ...f, sentenceLength: v })))}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold capitalize transition-colors cursor-pointer border ${form.sentenceLength.includes(opt) ? "bg-[#0052FF] text-white border-[#0052FF]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji & Hashtag */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Emoji Usage</label>
                    <select value={form.emojiUsage} onChange={(e) => setForm(f => ({ ...f, emojiUsage: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="minimal">Minimal</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hashtag Intensity</label>
                    <select value={form.hashtagIntensity} onChange={(e) => setForm(f => ({ ...f, hashtagIntensity: e.target.value }))}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* CTAs */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Default CTAs</label>
                  <div className="flex gap-2 flex-wrap">
                    {CTA_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => togglePill(form.ctas, opt.value, (v) => setForm(f => ({ ...f, ctas: v })))}
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-colors cursor-pointer border ${form.ctas.includes(opt.value) ? "bg-[#0052FF] text-white border-[#0052FF]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example Post */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Example Post (optional)</label>
                  <textarea
                    rows={4} value={form.examplePost} onChange={(e) => setForm(f => ({ ...f, examplePost: e.target.value }))}
                    placeholder="Paste a sample post that demonstrates this writing style..."
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-[#1A1D23] outline-none focus:border-[#0052FF] transition-colors resize-none"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1D23]">Active</p>
                    <p className="text-[12px] text-slate-400">Make this style available for selection</p>
                  </div>
                  <Toggle checked={form.isActive} onChange={(v) => setForm(f => ({ ...f, isActive: v }))} />
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
                    {saving ? "Saving..." : editingStyle ? "Save Changes" : "Create Style"}
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

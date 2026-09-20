import React, { useEffect, useState } from "react";
import type { DashboardConfig } from "../../[id]/dashboard/hooks/useDashboardConfig";

const SECTION_LABELS: Record<string, string> = {
  analytics: "Analytics snapshot",
  publishing: "Publishing pipeline",
  activity: "Recent activity",
  calendar: "Content calendar",
  posts: "Best posts",
  ideas: "Idea finder",
  templates: "Templates",
  profile: "Profile score",
  recommendations: "Recommendations",
};

const DEFAULT_SECTION_ORDER = [
  "analytics",
  "publishing",
  "activity",
  "calendar",
  "posts",
  "ideas",
  "templates",
  "profile",
  "recommendations",
];

interface DashboardSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardConfig | null;
  onSave: (nextConfig: Partial<DashboardConfig>) => Promise<void>;
}

export default function DashboardSettingsPanel({
  isOpen,
  onClose,
  config,
  onSave,
}: DashboardSettingsPanelProps) {
  const [saving, setSaving] = useState(false);
  const [columns, setColumns] = useState(config?.layout.columns || 2);
  const [hiddenSections, setHiddenSections] = useState<string[]>(config?.layout.hiddenSections || []);
  const [period, setPeriod] = useState(config?.timeRange.default || "7days");

  useEffect(() => {
    if (!config) return;
    setColumns(config.layout.columns || 2);
    setHiddenSections(config.layout.hiddenSections || []);
    setPeriod(config.timeRange.default || "7days");
  }, [config]);

  if (!isOpen) return null;

  const toggleSection = (key: string) => {
    setHiddenSections((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await onSave({
        layout: { ...config.layout, columns, hiddenSections },
        timeRange: { ...config.timeRange, default: period },
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await onSave({
        layout: { ...config.layout, columns: 2, sectionOrder: DEFAULT_SECTION_ORDER, hiddenSections: [] },
        timeRange: { ...config.timeRange, default: "7days" },
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/30"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="dashboard-settings-title">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5">
          <div>
            <h2 id="dashboard-settings-title" className="text-lg font-bold text-slate-950">Dashboard settings</h2>
            <p className="mt-1 text-sm text-slate-500">Choose what your workspace shows first.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dashboard settings" className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">×</button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Layout density</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[2, 3, 4].map((value) => (
                <button key={value} type="button" onClick={() => setColumns(value as 2 | 3 | 4)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${columns === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}>
                  {value} columns
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Default time range</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["7days", "30days", "90days", "all"].map((value) => (
                <button key={value} type="button" onClick={() => setPeriod(value as DashboardConfig["timeRange"]["default"])} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${period === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}>
                  {value === "7days" ? "7 days" : value === "30days" ? "30 days" : value === "90days" ? "90 days" : "All time"}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Visible sections</legend>
            <div className="mt-3 space-y-2">
              {DEFAULT_SECTION_ORDER.map((key) => {
                const isVisible = !hiddenSections.includes(key);
                return (
                  <button key={key} type="button" onClick={() => toggleSection(key)} aria-pressed={isVisible} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <span className="text-sm font-semibold text-slate-800">{SECTION_LABELS[key]}</span>
                    <span className={`text-xs font-semibold ${isVisible ? "text-blue-700" : "text-slate-400"}`}>{isVisible ? "Visible" : "Hidden"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={handleReset} disabled={saving} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Reset defaults</button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

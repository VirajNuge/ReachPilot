import React, { useEffect, useMemo, useState } from "react";

const SECTION_LABELS: Record<string, string> = {
  kpi: "KPI bar",
  activity: "Recent activity",
  analytics: "Analytics snapshot",
  calendar: "Content calendar",
  posts: "Best posts",
  ideas: "Idea finder",
  templates: "Templates",
  profile: "Profile score",
  publishing: "Publishing pipeline",
  recommendations: "Recommendations",
};

interface DashboardSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    layout: {
      columns: number;
      hiddenSections: string[];
    };
    timeRange: {
      default: "7days" | "30days" | "90days" | "all";
    };
  } | null;
  onSave: (nextConfig: any) => Promise<void>;
}

export default function DashboardSettingsPanel({
  isOpen,
  onClose,
  config,
  onSave,
}: DashboardSettingsPanelProps) {
  const [saving, setSaving] = useState(false);
  const sectionKeys = useMemo(() => Object.keys(SECTION_LABELS), []);

  const [columns, setColumns] = useState(config?.layout.columns || 2);
  const [hiddenSections, setHiddenSections] = useState<string[]>(
    config?.layout.hiddenSections || []
  );
  const [period, setPeriod] = useState(config?.timeRange.default || "7days");

  useEffect(() => {
    if (!config) return;
    setColumns(config.layout.columns || 2);
    setHiddenSections(config.layout.hiddenSections || []);
    setPeriod(config.timeRange.default || "7days");
  }, [config]);

  if (!isOpen) return null;

  const toggleSection = (key: string) => {
    setHiddenSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await onSave({
      layout: {
        ...config.layout,
        columns,
        hiddenSections,
      },
      timeRange: {
        ...config.timeRange,
        default: period,
      },
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6">
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1A1D23]">Dashboard settings</h2>
            <p className="text-sm text-slate-500">Customize your dashboard layout</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
              Layout columns
            </div>
            <div className="mt-3 flex gap-3">
              {[2, 3, 4].map((value) => (
                <button
                  key={value}
                  onClick={() => setColumns(value)}
                  className={`px-4 py-2 rounded-[12px] text-sm font-semibold border ${
                    columns === value
                      ? "bg-[#9C4BFF] text-white border-[#9C4BFF]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {value} columns
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
              Default time range
            </div>
            <div className="mt-3 flex gap-3 flex-wrap">
              {["7days", "30days", "90days", "all"].map((value) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value as any)}
                  className={`px-4 py-2 rounded-[12px] text-sm font-semibold border ${
                    period === value
                      ? "bg-[#0052FF] text-white border-[#0052FF]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
              Visible sections
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {sectionKeys.map((key) => {
                const isHidden = hiddenSections.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleSection(key)}
                    className={`border rounded-[12px] px-4 py-3 text-left ${
                      isHidden
                        ? "bg-slate-100 text-slate-500 border-slate-200"
                        : "bg-white text-[#1A1D23] border-[#9C4BFF]"
                    }`}
                  >
                    <div className="text-sm font-semibold">{SECTION_LABELS[key]}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {isHidden ? "Hidden" : "Visible"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] text-sm font-semibold border border-slate-200 text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-[12px] text-sm font-semibold bg-[#9C4BFF] text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

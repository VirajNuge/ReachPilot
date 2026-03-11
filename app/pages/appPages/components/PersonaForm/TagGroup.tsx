"use client";

interface TagGroupProps {
  label: string;
  tags: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
}

export const TagGroup = ({
  label,
  tags,
  selected,
  onChange,
  multi = true,
}: TagGroupProps) => {
  const toggle = (tag: string) => {
    if (!multi) {
      onChange(selected.includes(tag) ? [] : [tag]);
      return;
    }
    if (selected.includes(tag)) onChange(selected.filter((t) => t !== tag));
    else onChange([...selected, tag]);
  };
  return (
    <div className="mb-6">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`px-4 py-2 rounded-2xl text-[12px] font-bold transition-all border-none ${
                active
                  ? "bg-[#0052FF] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)]"
                  : "bg-[#F8FAFC] text-slate-500 hover:bg-[#F1F5F9] hover:text-[#1A1D23]"
              }`}
            >
              {active && "✓ "}{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

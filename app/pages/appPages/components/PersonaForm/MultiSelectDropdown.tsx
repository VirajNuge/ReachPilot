"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { BsChevronRight } from "react-icons/bs";
import { Check } from "lucide-react";

type DropdownOption =
  | string
  | {
      value: string;
      label?: string;
      description?: string;
    };

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOption[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  hint,
  allowCustom = true,
  customPlaceholder = "Type and press Enter to add a custom option",
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) => {
        if (typeof option === "string") {
          return { value: option, label: option, description: "" };
        }
        return {
          value: option.value,
          label: option.label || option.value,
          description: option.description || "",
        };
      }),
    [options]
  );

  const normalizedSelected = useMemo(
    () => selected.filter((value, idx) => selected.indexOf(value) === idx),
    [selected]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (option: string) => {
    if (normalizedSelected.includes(option)) {
      onChange(normalizedSelected.filter((s) => s !== option));
    } else {
      onChange([...normalizedSelected, option]);
    }
  };

  const addCustomValue = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    const exists = normalizedSelected.some(
      (item) => item.toLowerCase() === value.toLowerCase()
    );
    if (!exists) {
      onChange([...normalizedSelected, value]);
    }
    setQuery("");
  };

  const filteredOptions = normalizedOptions.filter((option) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      option.label.toLowerCase().includes(q) ||
      option.value.toLowerCase().includes(q) ||
      option.description.toLowerCase().includes(q)
    );
  });

  const shouldShowCustomHint =
    allowCustom &&
    query.trim().length > 0 &&
    !normalizedOptions.some(
      (option) => option.label.toLowerCase() === query.trim().toLowerCase()
    ) &&
    !normalizedSelected.some(
      (item) => item.toLowerCase() === query.trim().toLowerCase()
    );

  const displayValue =
    normalizedSelected.length === 0
      ? ""
      : normalizedSelected.length === 1
      ? normalizedSelected[0]
      : `${normalizedSelected[0]} +${normalizedSelected.length - 1} more`;

  return (
    <div className="mb-5 relative" ref={ref}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      {hint && (
        <p className="text-[11px] text-slate-400 mb-2">{hint}</p>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (open) setQuery("");
        }}
        className="w-full px-5 py-3.5 rounded-2xl border-none bg-[#F8FAFC] hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#0052FF]/20 focus:shadow-[0_4px_20px_rgba(0,82,255,0.05)] outline-none transition-all text-[13px] font-medium text-left flex items-center justify-between"
      >
        <span className={normalizedSelected.length === 0 ? "text-slate-400" : "text-[#1A1D23]"}>
          {normalizedSelected.length === 0 ? placeholder : displayValue}
        </span>
        <BsChevronRight
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? "rotate-[270deg]" : "rotate-90"}`}
          size={11}
        />
      </button>

      {/* Selected chips */}
      {normalizedSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {normalizedSelected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(item);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20 hover:line-through transition-colors cursor-pointer border-none outline-none"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 bg-[#F8FAFC]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (allowCustom) {
                    addCustomValue(query);
                  }
                }
              }}
              placeholder={customPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#0052FF]/20 outline-none transition-all text-[12px] text-[#1A1D23] placeholder:text-slate-400"
            />
            {shouldShowCustomHint && (
              <button
                type="button"
                onClick={() => addCustomValue(query)}
                className="mt-2 text-[11px] font-semibold text-[#0052FF] hover:text-blue-700 bg-transparent border-none p-0"
              >
                Press Enter to add: &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
            {filteredOptions.length === 0 && (
              <div className="px-5 py-4 text-[12px] text-slate-400">
                No matching options.
              </div>
            )}
            {filteredOptions.map((option) => {
              const isSelected = normalizedSelected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left text-[13px] font-medium transition-colors border-b border-slate-50 last:border-b-0 ${
                    isSelected
                      ? "bg-[#0052FF]/5 text-[#0052FF]"
                      : "text-slate-700 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="flex-1 pr-3">
                    <span className="block">{option.label}</span>
                    {option.description && (
                      <span className="block mt-0.5 text-[11px] text-slate-400 font-medium">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check size={14} className="text-[#0052FF] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

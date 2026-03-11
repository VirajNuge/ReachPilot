"use client";

import { useState, useRef, useEffect } from "react";
import { BsChevronRight } from "react-icons/bs";
import { Check } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}

export const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  hint,
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const displayValue =
    selected.length === 0
      ? ""
      : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1} more`;

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
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3.5 rounded-2xl border-none bg-[#F8FAFC] hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#0052FF]/20 focus:shadow-[0_4px_20px_rgba(0,82,255,0.05)] outline-none transition-all text-[13px] font-medium text-left flex items-center justify-between"
      >
        <span className={selected.length === 0 ? "text-slate-400" : "text-[#1A1D23]"}>
          {selected.length === 0 ? placeholder : displayValue}
        </span>
        <BsChevronRight
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? "rotate-[270deg]" : "rotate-90"}`}
          size={11}
        />
      </button>

      {/* Selected chips (shown below trigger when multiple selected) */}
      {selected.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0052FF]/10 text-[#0052FF]"
            >
              {item}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(item); }}
                className="ml-0.5 text-[#0052FF]/60 hover:text-[#0052FF] transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
          <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left text-[13px] font-medium transition-colors border-b border-slate-50 last:border-b-0 ${
                    isSelected
                      ? "bg-[#0052FF]/5 text-[#0052FF]"
                      : "text-slate-700 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span>{option}</span>
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

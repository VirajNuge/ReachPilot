"use client";

import { BsChevronRight } from "react-icons/bs";
import { inputClass } from "./constants";

interface FormSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export const FormSelect = ({
  label,
  options,
  value,
  onChange,
}: FormSelectProps) => (
  <div className="mb-5">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none cursor-pointer`}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <BsChevronRight className="rotate-90" size={11} />
      </div>
    </div>
  </div>
);

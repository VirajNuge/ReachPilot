"use client";

import { inputClass } from "./constants";

interface FormTextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  height?: string;
  hint?: string;
}

export const FormTextArea = ({
  label,
  placeholder,
  value,
  onChange,
  height = "h-24",
  hint,
}: FormTextAreaProps) => (
  <div className="mb-5">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    {hint && <p className="text-[11px] text-slate-400 mb-2">{hint}</p>}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-none ${height}`}
    />
  </div>
);

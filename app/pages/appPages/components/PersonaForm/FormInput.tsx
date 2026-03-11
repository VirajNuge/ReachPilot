"use client";

import { inputClass } from "./constants";

interface FormInputProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

export const FormInput = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  hint,
}: FormInputProps) => (
  <div className="mb-5">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    {hint && <p className="text-[11px] text-slate-400 mb-2">{hint}</p>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  </div>
);

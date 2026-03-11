"use client";

interface ToneSliderProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}

export const ToneSlider = ({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: ToneSliderProps) => (
  <div className="mb-5 flex items-center gap-4">
    <span className="w-24 text-right text-[11px] font-bold text-slate-500 shrink-0">{leftLabel}</span>
    <div className="flex-1 relative">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#0052FF]"
      />
    </div>
    <span className="w-24 text-[11px] font-bold text-slate-500 shrink-0">{rightLabel}</span>
  </div>
);

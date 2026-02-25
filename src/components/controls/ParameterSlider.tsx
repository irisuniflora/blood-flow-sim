import * as Slider from '@radix-ui/react-slider';
import { useState } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  unit?: string;
  hint?: string;
}

export function ParameterSlider({ label, value, min, max, step, onChange, disabled, unit, hint }: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm text-slate-300">{label}</label>
          {hint && (
            <span
              className="text-[10px] text-slate-500 cursor-help select-none w-3.5 h-3.5 rounded-full border border-slate-600 inline-flex items-center justify-center hover:text-slate-300 hover:border-slate-400 transition-colors"
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}
            >
              ?
            </span>
          )}
        </div>
        <span className="text-sm font-mono text-blue-400">
          {value}{unit && <span className="text-slate-500 ml-0.5">{unit}</span>}
        </span>
      </div>
      {showHint && hint && (
        <p className="text-[11px] text-slate-500 mb-2 leading-snug">{hint}</p>
      )}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="relative grow rounded-full h-1.5 bg-slate-700">
          <Slider.Range className="absolute rounded-full h-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 rounded-full bg-white shadow-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </Slider.Root>
    </div>
  );
}

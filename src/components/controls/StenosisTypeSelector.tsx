import type { StenosisType } from '../../engine/types';

interface Props {
  value: StenosisType;
  onChange: (type: StenosisType) => void;
  disabled?: boolean;
}

const types: { value: StenosisType; label: string; desc: string }[] = [
  { value: 'normal', label: '정상', desc: '일직선 채널' },
  { value: 'symmetric', label: '균일 협착', desc: '대칭 좁아짐' },
  { value: 'eccentric', label: '편심 협착', desc: '한쪽만 돌출' },
  { value: 'multi', label: '다중 협착', desc: '두 군데 협착' },
  { value: 'gradual', label: '점진적', desc: '완만한 진입' },
  { value: 'sharp', label: '급격한', desc: '급격한 진입' },
];

export function StenosisTypeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="mb-5">
      <label className="text-sm text-slate-300 mb-2 block">협착 유형</label>
      <div className="space-y-1">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            disabled={disabled}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              value === t.value
                ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                : 'bg-slate-800/50 border border-transparent hover:bg-slate-700/50 text-slate-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="font-medium">{t.label}</span>
            <span className="text-xs ml-2 opacity-60">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

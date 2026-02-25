import { useSimulationStore } from '../../store/simulation-store';

interface Props {
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function SimulationControls({ onRun, onStop, onReset }: Props) {
  const status = useSimulationStore((s) => s.status);
  const progress = useSimulationStore((s) => s.progress);

  const isRunning = status === 'running';
  const progressPercent = progress.total > 0 ? (progress.step / progress.total) * 100 : 0;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={onRun}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors"
          >
            ▶ 시뮬레이션 실행
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-colors"
          >
            ■ 중지
          </button>
        )}
        <button
          onClick={onReset}
          disabled={isRunning}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          초기화
        </button>
      </div>

      {/* Progress bar */}
      {(isRunning || status === 'complete') && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Step {progress.step.toLocaleString()}</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {status === 'complete' && (
        <p className="text-xs text-green-400 text-center">시뮬레이션 완료</p>
      )}
    </div>
  );
}

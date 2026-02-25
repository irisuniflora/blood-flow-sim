import { useSimulationStore } from '../../store/simulation-store';
import { ParameterSlider } from '../controls/ParameterSlider';
import { StenosisTypeSelector } from '../controls/StenosisTypeSelector';
import { SimulationControls } from '../controls/SimulationControls';
import type { StenosisType } from '../../engine/types';

interface Props {
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function Sidebar({ onRun, onStop, onReset }: Props) {
  const config = useSimulationStore((s) => s.config);
  const setConfig = useSimulationStore((s) => s.setConfig);
  const status = useSimulationStore((s) => s.status);
  const comparisonEnabled = useSimulationStore((s) => s.comparisonEnabled);
  const toggleComparison = useSimulationStore((s) => s.toggleComparison);
  const isRunning = status === 'running';

  const updateGeometry = (partial: Record<string, unknown>) => {
    setConfig({
      geometry: { ...config.geometry, ...partial },
    } as never);
  };

  return (
    <aside className="w-72 bg-slate-900/80 border-r border-slate-700/50 p-4 overflow-y-auto flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">파라미터 설정</h2>
        <p className="text-xs text-slate-500">시뮬레이션 조건을 조절합니다</p>
      </div>

      <StenosisTypeSelector
        value={config.geometry.stenosisType}
        onChange={(type: StenosisType) => updateGeometry({ stenosisType: type })}
        disabled={isRunning}
      />

      {config.geometry.stenosisType !== 'normal' && (
        <ParameterSlider
          label="협착률"
          value={config.geometry.stenosisRatio}
          min={0.1}
          max={0.8}
          step={0.05}
          onChange={(v) => updateGeometry({ stenosisRatio: v })}
          disabled={isRunning}
          hint="혈관 직경 대비 좁아지는 비율. 0.5 = 50% 협착"
        />
      )}

      <div className="border-t border-slate-700/50 pt-4 mt-2">
        <ParameterSlider
          label="완화 시간 (τ)"
          value={config.tau}
          min={0.55}
          max={1.5}
          step={0.01}
          onChange={(v) => setConfig({ tau: v })}
          disabled={isRunning}
          hint="점성도 ν = (τ−0.5)/3. 클수록 점성 증가, 유동이 느려짐"
        />

        <ParameterSlider
          label="유입 속도"
          value={config.uInlet}
          min={0.01}
          max={0.2}
          step={0.005}
          onChange={(v) => setConfig({ uInlet: v })}
          disabled={isRunning}
          hint="입구 포물선 프로파일의 최대 속도 (격자 단위). Re에 직접 비례"
        />

        <ParameterSlider
          label="시뮬레이션 스텝"
          value={config.maxSteps}
          min={500}
          max={10000}
          step={500}
          onChange={(v) => setConfig({ maxSteps: v })}
          disabled={isRunning}
          hint="총 반복 횟수. 많을수록 정상상태에 가까워지나 시간 증가"
        />
      </div>

      <div className="border-t border-slate-700/50 pt-4 mt-2">
        <ParameterSlider
          label="격자 가로 (nx)"
          value={config.nx}
          min={400}
          max={1200}
          step={100}
          onChange={(v) => setConfig({ nx: v })}
          disabled={isRunning}
          hint="혈관 길이 방향 격자 수. 클수록 정밀하나 연산 시간 증가"
        />

        <ParameterSlider
          label="격자 세로 (ny)"
          value={config.ny}
          min={80}
          max={300}
          step={20}
          onChange={(v) => setConfig({ ny: v })}
          disabled={isRunning}
          hint="혈관 직경 방향 격자 수. Re 계산 시 특성 길이로 사용"
        />
      </div>

      {/* Comparison toggle */}
      <div className="border-t border-slate-700/50 pt-4 mt-2">
        <button
          onClick={toggleComparison}
          disabled={isRunning}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
            comparisonEnabled
              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
              : 'bg-slate-800/50 border border-transparent hover:bg-slate-700/50 text-slate-400'
          } disabled:opacity-50`}
        >
          비교 모드 {comparisonEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="mt-auto">
        <SimulationControls onRun={onRun} onStop={onStop} onReset={onReset} />
      </div>
    </aside>
  );
}

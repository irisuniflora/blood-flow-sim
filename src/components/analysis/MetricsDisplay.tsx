import { useSimulationStore } from '../../store/simulation-store';
import { formatNumber, formatPercent } from '../../utils/format';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

function MetricCard({ label, value, unit, color = 'text-blue-400' }: MetricCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-mono font-bold ${color}`}>
        {value}
        {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export function MetricsDisplay() {
  const results = useSimulationStore((s) => s.analysisResults);

  if (!results) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
        <p className="text-sm text-slate-500 text-center">
          시뮬레이션 완료 후 분석 결과가 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">정량 분석 결과</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="레이놀즈 수 (Re)"
          value={formatNumber(results.reynoldsNumber, 1)}
          color={results.reynoldsNumber > 2000 ? 'text-red-400' : 'text-green-400'}
        />
        <MetricCard
          label="유량"
          value={formatNumber(results.flowRate, 3)}
          color="text-blue-400"
        />
        <MetricCard
          label="압력 강하"
          value={formatNumber(results.pressureDrop, 5)}
          color="text-yellow-400"
        />
        <MetricCard
          label="최대 WSS"
          value={formatNumber(results.wssStats.max, 5)}
          color="text-red-400"
        />
        <MetricCard
          label="재순환 길이"
          value={formatNumber(results.recirculationLength, 0)}
          unit="격자"
          color="text-purple-400"
        />
        <MetricCard
          label="Poiseuille 오차"
          value={formatPercent(results.poiseuilleComparison.errorPercent)}
          color={results.poiseuilleComparison.errorPercent < 5 ? 'text-green-400' : 'text-orange-400'}
        />
      </div>
    </div>
  );
}

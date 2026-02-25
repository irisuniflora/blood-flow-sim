import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSimulationStore } from '../../store/simulation-store';

export function WSSChart() {
  const results = useSimulationStore((s) => s.analysisResults);

  if (!results) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm bg-slate-900 rounded-xl border border-slate-700/50">
        시뮬레이션 완료 후 WSS 그래프가 표시됩니다
      </div>
    );
  }

  // Downsample for performance
  const step = Math.max(1, Math.floor(results.wssUpper.length / 200));
  const data = [];
  for (let x = 0; x < results.wssUpper.length; x += step) {
    data.push({
      x,
      upper: results.wssUpper[x],
      lower: results.wssLower[x],
    });
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        벽면 전단 응력 (Wall Shear Stress)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="x" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: '위치 (x)', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'WSS', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="upper" stroke="#ef4444" name="상벽 WSS" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="lower" stroke="#3b82f6" name="하벽 WSS" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../../store/simulation-store';
import { renderVelocityMagnitude } from '../../visualization/render-velocity';
import { renderVorticity } from '../../visualization/render-vorticity';
import { renderStreamlines } from '../../visualization/render-streamlines';
import { viridis, coolwarm } from '../../visualization/colormap';
import type { SimulationFrame, StenosisType } from '../../engine/types';
import type { WorkerResult } from '../../worker/messages';

const COMPARISON_TYPES: { value: StenosisType; label: string }[] = [
  { value: 'normal', label: '정상 혈관' },
  { value: 'symmetric', label: '균일 협착' },
  { value: 'eccentric', label: '편심 협착' },
];

function ComparisonSlot({ stenosisType, label }: { stenosisType: StenosisType; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [frame, setFrame] = useState<SimulationFrame | null>(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const config = useSimulationStore((s) => s.config);
  const vizMode = useSimulationStore((s) => s.vizMode);
  const comparisonEnabled = useSimulationStore((s) => s.comparisonEnabled);

  // Launch worker on mount
  useEffect(() => {
    if (!comparisonEnabled) return;

    const worker = new Worker(
      new URL('../../worker/simulation.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResult>) => {
      const msg = e.data;
      if (msg.type === 'PROGRESS') setProgress(Math.floor((msg.step / msg.totalSteps) * 100));
      if (msg.type === 'FRAME') setFrame(msg.data);
      if (msg.type === 'COMPLETE') { setFrame(msg.data); setIsRunning(false); }
    };

    // Start simulation
    const simConfig = {
      ...config,
      geometry: { ...config.geometry, stenosisType },
      maxSteps: Math.min(config.maxSteps, 3000), // Cap for comparison
    };
    worker.postMessage({ type: 'INIT', config: simConfig });
    worker.postMessage({ type: 'RUN', steps: simConfig.maxSteps, reportEvery: 100 });
    setIsRunning(true);
    setProgress(0);
    setFrame(null);

    return () => { worker.terminate(); workerRef.current = null; };
  }, [comparisonEnabled, config.nx, config.ny, config.tau, config.uInlet, stenosisType]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== frame.nx || canvas.height !== frame.ny) {
      canvas.width = frame.nx;
      canvas.height = frame.ny;
    }

    const mode = vizMode === 'wss' ? 'velocity' : vizMode;
    switch (mode) {
      case 'velocity': renderVelocityMagnitude(ctx, frame, viridis); break;
      case 'vorticity': renderVorticity(ctx, frame, coolwarm); break;
      case 'streamlines': renderStreamlines(ctx, frame, viridis); break;
    }
  }, [frame, vizMode]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {isRunning && (
          <span className="text-xs text-blue-400 font-mono">{progress}%</span>
        )}
        {!isRunning && frame && (
          <span className="text-xs text-green-400">완료</span>
        )}
      </div>
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
        {frame ? (
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ aspectRatio: `${frame.nx} / ${frame.ny}` }}
          />
        ) : (
          <div
            className="flex items-center justify-center text-slate-500 text-xs"
            style={{ aspectRatio: `${config.nx} / ${config.ny}` }}
          >
            {isRunning ? `계산 중... ${progress}%` : '대기 중'}
          </div>
        )}
      </div>
    </div>
  );
}

export function ComparisonView() {
  return (
    <div className="bg-slate-900/30 rounded-xl border border-slate-700/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-4">조건 비교 (정상 vs 균일 vs 편심)</h3>
      <div className="flex gap-3">
        {COMPARISON_TYPES.map((t) => (
          <ComparisonSlot key={t.value} stenosisType={t.value} label={t.label} />
        ))}
      </div>
    </div>
  );
}

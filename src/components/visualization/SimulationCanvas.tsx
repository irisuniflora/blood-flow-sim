import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSimulationStore } from '../../store/simulation-store';

export function SimulationCanvas() {
  const canvasRef = useCanvasRenderer();
  const frame = useSimulationStore((s) => s.currentFrame);
  const config = useSimulationStore((s) => s.config);

  const aspectRatio = config.nx / config.ny;

  return (
    <div className="relative w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg shadow-black/20">
      {!frame ? (
        <div
          className="flex items-center justify-center text-slate-500 text-sm"
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-30">🫀</div>
            <p>시뮬레이션을 실행하면 여기에 결과가 표시됩니다</p>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ aspectRatio: `${frame.nx} / ${frame.ny}` }}
        />
      )}
    </div>
  );
}

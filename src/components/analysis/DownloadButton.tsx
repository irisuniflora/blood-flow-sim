import { useSimulationStore } from '../../store/simulation-store';
import { downloadCanvas, downloadJSON } from '../../utils/download';

export function DownloadButton() {
  const results = useSimulationStore((s) => s.analysisResults);
  const config = useSimulationStore((s) => s.config);

  const handleDownloadImage = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      downloadCanvas(canvas, `blood-flow-${config.geometry.stenosisType}.png`);
    }
  };

  const handleDownloadData = () => {
    if (results) {
      const data = {
        config,
        analysis: {
          flowRate: results.flowRate,
          pressureDrop: results.pressureDrop,
          reynoldsNumber: results.reynoldsNumber,
          recirculationLength: results.recirculationLength,
          wssStats: results.wssStats,
          poiseuilleComparison: results.poiseuilleComparison,
        },
      };
      downloadJSON(data, `blood-flow-${config.geometry.stenosisType}.json`);
    }
  };

  if (!results) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadImage}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
      >
        PNG 저장
      </button>
      <button
        onClick={handleDownloadData}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
      >
        JSON 저장
      </button>
    </div>
  );
}

import { useSimulationStore } from '../../store/simulation-store';
import { VisualizationTabs } from '../visualization/VisualizationTabs';
import { SimulationCanvas } from '../visualization/SimulationCanvas';
import { WSSChart } from '../visualization/WSSChart';
import { MetricsDisplay } from '../analysis/MetricsDisplay';
import { DownloadButton } from '../analysis/DownloadButton';
import { ComparisonView } from '../visualization/ComparisonView';

export function MainPanel() {
  const vizMode = useSimulationStore((s) => s.vizMode);
  const comparisonEnabled = useSimulationStore((s) => s.comparisonEnabled);

  return (
    <main className="flex-1 p-6 overflow-y-auto space-y-4">
      {/* Visualization tabs and download */}
      <div className="flex items-center justify-between">
        <VisualizationTabs />
        <DownloadButton />
      </div>

      {/* Visualization area */}
      {vizMode === 'wss' ? (
        <>
          <SimulationCanvas />
          <WSSChart />
        </>
      ) : (
        <SimulationCanvas />
      )}

      {/* Analysis metrics */}
      <MetricsDisplay />

      {/* Comparison view */}
      {comparisonEnabled && <ComparisonView />}
    </main>
  );
}

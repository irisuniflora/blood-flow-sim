import * as Tabs from '@radix-ui/react-tabs';
import { useSimulationStore } from '../../store/simulation-store';
import type { VizMode } from '../../engine/types';

const tabs: { value: VizMode; label: string }[] = [
  { value: 'velocity', label: '속도장' },
  { value: 'streamlines', label: '유선' },
  { value: 'vorticity', label: '와류도' },
  { value: 'wss', label: 'WSS' },
];

export function VisualizationTabs() {
  const vizMode = useSimulationStore((s) => s.vizMode);
  const setVizMode = useSimulationStore((s) => s.setVizMode);

  return (
    <Tabs.Root value={vizMode} onValueChange={(v) => setVizMode(v as VizMode)}>
      <Tabs.List className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2 text-sm rounded-md transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 hover:text-white"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}

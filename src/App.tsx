import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainPanel } from './components/layout/MainPanel';
import { HelpModal } from './components/HelpModal';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const { run, stop, reset } = useSimulation();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 bg-slate-900/80 border-b border-slate-700/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🫀</span>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              혈류 시뮬레이터
            </h1>
            <p className="text-[10px] text-slate-500 leading-tight">
              Lattice Boltzmann Method — 동맥 협착 유동 분석
            </p>
          </div>
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          className="px-4 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-lg transition-colors"
        >
          ? 도움말
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onRun={run} onStop={stop} onReset={reset} />
        <MainPanel />
      </div>

      {/* Help modal */}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

export default App;

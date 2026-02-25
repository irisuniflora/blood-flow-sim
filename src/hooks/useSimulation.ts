import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '../store/simulation-store';
import type { WorkerResult } from '../worker/messages';

export function useSimulation() {
  const workerRef = useRef<Worker | null>(null);
  const store = useSimulationStore;

  useEffect(() => {
    const worker = new Worker(
      new URL('../worker/simulation.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent<WorkerResult>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'PROGRESS':
          store.getState().setProgress(msg.step, msg.totalSteps);
          break;
        case 'FRAME':
          store.getState().setCurrentFrame(msg.data);
          break;
        case 'COMPLETE':
          store.getState().setCurrentFrame(msg.data);
          store.getState().setAnalysisResults(msg.analysis);
          store.getState().setStatus('complete');
          break;
        case 'ERROR':
          console.error('Simulation error:', msg.message);
          store.getState().setStatus('idle');
          break;
      }
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const run = useCallback(() => {
    const { config } = store.getState();
    const worker = workerRef.current;
    if (!worker) return;

    store.getState().setStatus('running');
    store.getState().setProgress(0, config.maxSteps);
    store.getState().setAnalysisResults(null);

    worker.postMessage({ type: 'INIT', config });
    worker.postMessage({
      type: 'RUN',
      steps: config.maxSteps,
      reportEvery: 50,
    });
  }, []);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: 'STOP' });
    store.getState().setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.postMessage({ type: 'RESET' });
    store.getState().setStatus('idle');
    store.getState().setCurrentFrame(null);
    store.getState().setAnalysisResults(null);
    store.getState().setProgress(0, 0);
  }, []);

  return { run, stop, reset };
}

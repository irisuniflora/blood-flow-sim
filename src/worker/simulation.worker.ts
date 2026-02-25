import { LBMSolver } from '../engine/lbm-solver';
import { createGeometry } from '../engine/geometry';
import { computeAnalysis } from '../engine/analysis';
import type { WorkerCommand } from './messages';

let solver: LBMSolver | null = null;
let running = false;
let simConfig: { tau: number; uInlet: number } = { tau: 0.6, uInlet: 0.1 };

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT': {
      const { nx, ny, tau, uInlet, geometry } = msg.config;
      simConfig = { tau, uInlet };
      const walls = createGeometry(nx, ny, geometry);
      solver = new LBMSolver(nx, ny, tau, uInlet);
      solver.setGeometry(walls);
      solver.initialize();
      break;
    }

    case 'RUN': {
      if (!solver) {
        self.postMessage({ type: 'ERROR', message: 'Solver not initialized' });
        return;
      }
      running = true;
      const { steps, reportEvery } = msg;
      let currentStep = 0;

      function runBatch() {
        if (!solver || !running) return;

        const batchEnd = Math.min(currentStep + reportEvery, steps);
        for (let s = currentStep; s < batchEnd; s++) {
          solver.step();
        }
        currentStep = batchEnd;

        // Send progress
        self.postMessage({ type: 'PROGRESS', step: currentStep, totalSteps: steps });

        // Send frame (structured clone, no transfer — avoids detach issues)
        const frame = solver.getFrame();
        self.postMessage({ type: 'FRAME', data: frame });

        if (currentStep < steps && running) {
          setTimeout(runBatch, 0);
        } else if (currentStep >= steps) {
          const finalFrame = solver.getFrame();
          const analysis = computeAnalysis(finalFrame, simConfig.tau, simConfig.uInlet);
          self.postMessage({ type: 'COMPLETE', data: finalFrame, analysis });
          running = false;
        }
      }

      runBatch();
      break;
    }

    case 'STOP':
      running = false;
      break;

    case 'RESET':
      solver = null;
      running = false;
      break;
  }
};

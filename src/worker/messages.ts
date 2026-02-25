import type { SimulationConfig, SimulationFrame, AnalysisResults } from '../engine/types';

export type WorkerCommand =
  | { type: 'INIT'; config: SimulationConfig }
  | { type: 'RUN'; steps: number; reportEvery: number }
  | { type: 'STOP' }
  | { type: 'RESET' };

export type WorkerResult =
  | { type: 'PROGRESS'; step: number; totalSteps: number }
  | { type: 'FRAME'; data: SimulationFrame }
  | { type: 'COMPLETE'; data: SimulationFrame; analysis: AnalysisResults }
  | { type: 'ERROR'; message: string };

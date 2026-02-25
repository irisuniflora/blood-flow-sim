import { create } from 'zustand';
import type {
  SimulationConfig,
  SimulationFrame,
  AnalysisResults,
  VizMode,
  SimulationStatus,
  StenosisType,
} from '../engine/types';

interface SimulationStore {
  config: SimulationConfig;
  status: SimulationStatus;
  progress: { step: number; total: number };
  currentFrame: SimulationFrame | null;
  analysisResults: AnalysisResults | null;
  vizMode: VizMode;
  comparisonEnabled: boolean;

  setConfig: (partial: Partial<SimulationConfig>) => void;
  setGeometryConfig: (type: StenosisType, ratio: number) => void;
  setStatus: (status: SimulationStatus) => void;
  setProgress: (step: number, total: number) => void;
  setCurrentFrame: (frame: SimulationFrame | null) => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  setVizMode: (mode: VizMode) => void;
  toggleComparison: () => void;
}

const defaultConfig: SimulationConfig = {
  nx: 800,
  ny: 160,
  tau: 0.6,
  uInlet: 0.08,
  maxSteps: 5000,
  geometry: {
    stenosisType: 'symmetric',
    stenosisRatio: 0.5,
    stenosisPosition: 0.5,
    stenosisLength: 0.2,
  },
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  config: defaultConfig,
  status: 'idle',
  progress: { step: 0, total: 0 },
  currentFrame: null,
  analysisResults: null,
  vizMode: 'velocity',
  comparisonEnabled: false,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  setGeometryConfig: (type, ratio) =>
    set((state) => ({
      config: {
        ...state.config,
        geometry: {
          ...state.config.geometry,
          stenosisType: type,
          stenosisRatio: ratio,
        },
      },
    })),

  setStatus: (status) => set({ status }),
  setProgress: (step, total) => set({ progress: { step, total } }),
  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setAnalysisResults: (results) => set({ analysisResults: results }),
  setVizMode: (mode) => set({ vizMode: mode }),
  toggleComparison: () => set((state) => ({ comparisonEnabled: !state.comparisonEnabled })),
}));

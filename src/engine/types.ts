export interface SimulationConfig {
  nx: number;
  ny: number;
  tau: number;
  uInlet: number;
  maxSteps: number;
  geometry: GeometryConfig;
}

export interface GeometryConfig {
  stenosisType: StenosisType;
  stenosisRatio: number;
  stenosisPosition: number;
  stenosisLength: number;
}

export type StenosisType = 'normal' | 'symmetric' | 'eccentric' | 'multi' | 'gradual' | 'sharp';

export interface SimulationFrame {
  ux: Float64Array;
  uy: Float64Array;
  rho: Float64Array;
  walls: Uint8Array;
  step: number;
  nx: number;
  ny: number;
}

export interface AnalysisResults {
  flowRate: number;
  pressureDrop: number;
  wssUpper: Float64Array;
  wssLower: Float64Array;
  wssStats: { mean: number; max: number; min: number; maxPos: number };
  recirculationLength: number;
  reynoldsNumber: number;
  poiseuilleComparison: {
    theoretical: number;
    simulated: number;
    errorPercent: number;
  };
}

export type VizMode = 'velocity' | 'streamlines' | 'vorticity' | 'wss';

export type SimulationStatus = 'idle' | 'running' | 'complete';

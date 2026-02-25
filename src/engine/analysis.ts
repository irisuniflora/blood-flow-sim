import type { SimulationFrame, AnalysisResults } from './types';

function safeNum(v: number): number {
  return isFinite(v) ? v : 0;
}

export function computeAnalysis(frame: SimulationFrame, tau: number, uInlet: number): AnalysisResults {
  const { ux, rho, walls, nx, ny } = frame;
  const nu = (tau - 0.5) / 3;

  const flowRate = computeFlowRate(ux, walls, nx, ny, Math.floor(nx / 2));
  const pressureDrop = computePressureDrop(rho, walls, nx, ny);
  const { upper: wssUpper, lower: wssLower } = computeWSS(ux, walls, nx, ny, nu);
  const wssStats = computeWSSStats(wssUpper, wssLower, nx);
  const recirculationLength = computeRecirculationLength(ux, walls, nx, ny);
  const reynoldsNumber = computeReynoldsNumber(uInlet, ny, nu);
  const poiseuilleComparison = comparePoiseuille(flowRate, uInlet, ny);

  return {
    flowRate: safeNum(flowRate),
    pressureDrop: safeNum(pressureDrop),
    wssUpper,
    wssLower,
    wssStats,
    recirculationLength: safeNum(recirculationLength),
    reynoldsNumber: safeNum(reynoldsNumber),
    poiseuilleComparison,
  };
}

function computeFlowRate(
  ux: Float64Array, walls: Uint8Array,
  nx: number, ny: number, xPos: number,
): number {
  let flow = 0;
  for (let y = 0; y < ny; y++) {
    const idx = y * nx + xPos;
    if (walls[idx] === 0) {
      const v = ux[idx];
      if (isFinite(v)) flow += v;
    }
  }
  return flow;
}

function computePressureDrop(
  rho: Float64Array, walls: Uint8Array,
  nx: number, ny: number,
): number {
  let pInlet = 0, pOutlet = 0;
  let nIn = 0, nOut = 0;
  for (let y = 0; y < ny; y++) {
    const idxIn = y * nx + 1;
    const idxOut = y * nx + (nx - 2);
    if (walls[idxIn] === 0 && isFinite(rho[idxIn])) { pInlet += rho[idxIn] / 3; nIn++; }
    if (walls[idxOut] === 0 && isFinite(rho[idxOut])) { pOutlet += rho[idxOut] / 3; nOut++; }
  }
  return nIn > 0 && nOut > 0 ? pInlet / nIn - pOutlet / nOut : 0;
}

function computeWSS(
  ux: Float64Array, walls: Uint8Array,
  nx: number, ny: number, nu: number,
): { upper: Float64Array; lower: Float64Array } {
  const upper = new Float64Array(nx);
  const lower = new Float64Array(nx);
  for (let x = 0; x < nx; x++) {
    for (let y = 0; y < ny - 1; y++) {
      if (walls[y * nx + x] === 1 && walls[(y + 1) * nx + x] === 0) {
        const v = ux[(y + 1) * nx + x];
        if (isFinite(v)) upper[x] = Math.abs(nu * v);
        break;
      }
    }
    for (let y = ny - 1; y > 0; y--) {
      if (walls[y * nx + x] === 1 && walls[(y - 1) * nx + x] === 0) {
        const v = ux[(y - 1) * nx + x];
        if (isFinite(v)) lower[x] = Math.abs(nu * v);
        break;
      }
    }
  }
  return { upper, lower };
}

function computeWSSStats(
  upper: Float64Array, lower: Float64Array, nx: number,
): { mean: number; max: number; min: number; maxPos: number } {
  let sum = 0, max = 0, min = Infinity, maxPos = 0, count = 0;
  for (let x = 0; x < nx; x++) {
    const val = (upper[x] + lower[x]) / 2;
    if (val > 0 && isFinite(val)) {
      sum += val; count++;
      if (val > max) { max = val; maxPos = x; }
      if (val < min) { min = val; }
    }
  }
  return { mean: count > 0 ? sum / count : 0, max, min: min === Infinity ? 0 : min, maxPos };
}

function computeRecirculationLength(
  ux: Float64Array, walls: Uint8Array, nx: number, ny: number,
): number {
  let stenosisEnd = 0;
  for (let x = nx - 1; x >= 0; x--) {
    for (let y = 2; y < ny - 2; y++) {
      if (walls[y * nx + x] === 1) { stenosisEnd = x; break; }
    }
    if (stenosisEnd > 0) break;
  }
  if (stenosisEnd === 0) return 0;

  let lastReversed = stenosisEnd;
  for (let x = stenosisEnd + 1; x < nx; x++) {
    for (let y = 1; y < ny - 1; y++) {
      const idx = y * nx + x;
      if (walls[idx] === 0 && isFinite(ux[idx]) && ux[idx] < -1e-6) {
        lastReversed = x;
        break;
      }
    }
  }
  return lastReversed - stenosisEnd;
}

function computeReynoldsNumber(uInlet: number, ny: number, nu: number): number {
  return (uInlet * (ny - 2)) / nu;
}

function comparePoiseuille(
  simulatedFlow: number, uInlet: number, ny: number,
): { theoretical: number; simulated: number; errorPercent: number } {
  const H = ny - 2;
  const theoretical = (2 / 3) * uInlet * H;
  const errorPercent = theoretical > 0
    ? Math.abs((simulatedFlow - theoretical) / theoretical) * 100 : 0;
  return {
    theoretical: safeNum(theoretical),
    simulated: safeNum(simulatedFlow),
    errorPercent: safeNum(errorPercent),
  };
}

import { Q, CX, CY, W } from './constants';
import type { SimulationFrame } from './types';

export class LBMSolver {
  readonly nx: number;
  readonly ny: number;
  readonly tau: number;
  readonly omega: number;
  readonly uInlet: number;

  private f: Float64Array[];
  private fTemp: Float64Array[];
  private rho: Float64Array;
  private ux: Float64Array;
  private uy: Float64Array;
  private walls: Uint8Array;
  private currentStep: number;

  constructor(nx: number, ny: number, tau: number, uInlet: number) {
    this.nx = nx;
    this.ny = ny;
    this.tau = Math.max(tau, 0.55);
    this.omega = 1.0 / this.tau;
    this.uInlet = uInlet;
    this.currentStep = 0;

    const size = nx * ny;
    this.f = Array.from({ length: Q }, () => new Float64Array(size));
    this.fTemp = Array.from({ length: Q }, () => new Float64Array(size));
    this.rho = new Float64Array(size);
    this.ux = new Float64Array(size);
    this.uy = new Float64Array(size);
    this.walls = new Uint8Array(size);
  }

  setGeometry(walls: Uint8Array): void {
    this.walls.set(walls);
  }

  initialize(): void {
    const { nx, ny, uInlet } = this;
    const size = nx * ny;

    this.rho.fill(1.0);

    // Parabolic inlet profile as initial condition
    for (let y = 0; y < ny; y++) {
      const yNorm = y / (ny - 1);
      const u = uInlet * 4 * yNorm * (1 - yNorm);
      for (let x = 0; x < nx; x++) {
        const idx = y * nx + x;
        if (this.walls[idx] === 0) {
          this.ux[idx] = u;
        }
      }
    }

    // Set equilibrium distributions
    for (let idx = 0; idx < size; idx++) {
      const r = this.rho[idx];
      const vx = this.walls[idx] === 1 ? 0 : this.ux[idx];
      const vy = 0;
      const usq = vx * vx + vy * vy;
      for (let i = 0; i < Q; i++) {
        const cu = CX[i] * vx + CY[i] * vy;
        this.f[i][idx] = W[i] * r * (1.0 + 3.0 * cu + 4.5 * cu * cu - 1.5 * usq);
      }
    }
  }

  private collide(): void {
    const { nx, ny, omega, walls } = this;
    const size = nx * ny;

    for (let idx = 0; idx < size; idx++) {
      if (walls[idx] === 1) continue;

      const r = this.rho[idx];
      if (r <= 0 || !isFinite(r)) continue;

      const vx = this.ux[idx];
      const vy = this.uy[idx];
      if (!isFinite(vx) || !isFinite(vy)) continue;

      const usq = vx * vx + vy * vy;

      for (let i = 0; i < Q; i++) {
        const cu = CX[i] * vx + CY[i] * vy;
        const feq = W[i] * r * (1.0 + 3.0 * cu + 4.5 * cu * cu - 1.5 * usq);
        this.f[i][idx] += omega * (feq - this.f[i][idx]);
      }
    }
  }

  private stream(): void {
    const { nx, ny } = this;

    // Save pre-streaming state
    for (let i = 0; i < Q; i++) {
      this.fTemp[i].set(this.f[i]);
    }

    // Stream: pull scheme - f[i](x,y) = fTemp[i](x-cx, y-cy)
    for (let i = 1; i < Q; i++) {
      const cx = CX[i];
      const cy = CY[i];
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const sx = x - cx;
          const sy = y - cy;
          if (sx >= 0 && sx < nx && sy >= 0 && sy < ny) {
            this.f[i][y * nx + x] = this.fTemp[i][sy * nx + sx];
          }
        }
      }
    }
  }

  private applyBounceBack(): void {
    const { f, fTemp, walls, nx, ny } = this;
    const OPP = [0, 3, 4, 1, 2, 7, 8, 5, 6];
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const idx = y * nx + x;
        if (walls[idx] !== 1) continue;
        for (let i = 0; i < Q; i++) {
          f[i][idx] = fTemp[OPP[i]][idx];
        }
      }
    }
  }

  private applyZouHeInlet(): void {
    const { f, rho, ux, uy, walls, nx, ny, uInlet } = this;
    for (let y = 1; y < ny - 1; y++) {
      const idx = y * nx; // x=0
      if (walls[idx] === 1) continue;

      const yNorm = y / (ny - 1);
      const uTarget = uInlet * 4.0 * yNorm * (1.0 - yNorm);

      ux[idx] = uTarget;
      uy[idx] = 0;

      const rhoIn =
        (f[0][idx] + f[2][idx] + f[4][idx] +
          2.0 * (f[3][idx] + f[6][idx] + f[7][idx])) /
        (1.0 - uTarget);

      if (!isFinite(rhoIn) || rhoIn <= 0) {
        rho[idx] = 1.0;
        continue;
      }
      rho[idx] = rhoIn;

      f[1][idx] = f[3][idx] + (2.0 / 3.0) * rhoIn * uTarget;
      f[5][idx] = f[7][idx] + (1.0 / 6.0) * rhoIn * uTarget - 0.5 * (f[2][idx] - f[4][idx]);
      f[8][idx] = f[6][idx] + (1.0 / 6.0) * rhoIn * uTarget + 0.5 * (f[2][idx] - f[4][idx]);
    }
  }

  private applyZouHeOutlet(): void {
    const { f, rho, ux, uy, walls, nx, ny } = this;
    const rhoOut = 1.0;
    for (let y = 1; y < ny - 1; y++) {
      const idx = y * nx + (nx - 1);
      if (walls[idx] === 1) continue;

      const uOut = -1.0 +
        (f[0][idx] + f[2][idx] + f[4][idx] +
          2.0 * (f[1][idx] + f[5][idx] + f[8][idx])) / rhoOut;

      if (!isFinite(uOut)) continue;
      ux[idx] = uOut;
      uy[idx] = 0;
      rho[idx] = rhoOut;

      f[3][idx] = f[1][idx] - (2.0 / 3.0) * rhoOut * uOut;
      f[7][idx] = f[5][idx] - (1.0 / 6.0) * rhoOut * uOut + 0.5 * (f[2][idx] - f[4][idx]);
      f[6][idx] = f[8][idx] - (1.0 / 6.0) * rhoOut * uOut - 0.5 * (f[2][idx] - f[4][idx]);
    }
  }

  private computeMacroscopic(): void {
    const { walls } = this;
    const size = this.nx * this.ny;

    for (let idx = 0; idx < size; idx++) {
      if (walls[idx] === 1) {
        this.rho[idx] = 0;
        this.ux[idx] = 0;
        this.uy[idx] = 0;
        continue;
      }

      let r = 0;
      let vx = 0;
      let vy = 0;
      for (let i = 0; i < Q; i++) {
        const fi = this.f[i][idx];
        r += fi;
        vx += CX[i] * fi;
        vy += CY[i] * fi;
      }

      if (r > 1e-10 && isFinite(r)) {
        this.rho[idx] = r;
        this.ux[idx] = vx / r;
        this.uy[idx] = vy / r;
      } else {
        // Recovery: reset to equilibrium rest state
        this.rho[idx] = 1.0;
        this.ux[idx] = 0;
        this.uy[idx] = 0;
      }
    }
  }

  step(): void {
    this.collide();
    this.stream();
    this.applyBounceBack();
    this.applyZouHeInlet();
    this.applyZouHeOutlet();
    this.computeMacroscopic();
    this.currentStep++;
  }

  getFrame(): SimulationFrame {
    return {
      ux: new Float64Array(this.ux),
      uy: new Float64Array(this.uy),
      rho: new Float64Array(this.rho),
      walls: new Uint8Array(this.walls),
      step: this.currentStep,
      nx: this.nx,
      ny: this.ny,
    };
  }

  getVorticity(): Float64Array {
    const { nx, ny, ux, uy, walls } = this;
    const vorticity = new Float64Array(nx * ny);
    for (let y = 1; y < ny - 1; y++) {
      for (let x = 1; x < nx - 1; x++) {
        const idx = y * nx + x;
        if (walls[idx] === 1) continue;
        vorticity[idx] =
          (uy[y * nx + (x + 1)] - uy[y * nx + (x - 1)]) / 2 -
          (ux[(y + 1) * nx + x] - ux[(y - 1) * nx + x]) / 2;
      }
    }
    return vorticity;
  }

  getNu(): number {
    return (this.tau - 0.5) / 3;
  }
}

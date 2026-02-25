import type { SimulationFrame } from '../engine/types';

export function renderVelocityMagnitude(
  ctx: CanvasRenderingContext2D,
  frame: SimulationFrame,
  colormap: Uint8Array,
): void {
  const { ux, uy, walls, nx, ny } = frame;
  const size = nx * ny;

  // Find max velocity magnitude (skip NaN/wall)
  let maxMag = 0;
  for (let i = 0; i < size; i++) {
    if (walls[i] === 1) continue;
    const vx = ux[i], vy = uy[i];
    if (!isFinite(vx) || !isFinite(vy)) continue;
    const mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > maxMag) maxMag = mag;
  }
  if (maxMag < 1e-10) maxMag = 1;

  const imageData = ctx.createImageData(nx, ny);
  const pixels = imageData.data;

  for (let i = 0; i < size; i++) {
    const pi = i * 4;
    if (walls[i] === 1) {
      pixels[pi] = 30; pixels[pi + 1] = 32; pixels[pi + 2] = 42; pixels[pi + 3] = 255;
      continue;
    }
    const vx = ux[i], vy = uy[i];
    if (!isFinite(vx) || !isFinite(vy)) {
      pixels[pi + 3] = 255;
      continue;
    }
    const mag = Math.sqrt(vx * vx + vy * vy);
    const norm = Math.min(255, Math.max(0, Math.floor((mag / maxMag) * 255)));
    const ci = norm * 4;
    pixels[pi] = colormap[ci];
    pixels[pi + 1] = colormap[ci + 1];
    pixels[pi + 2] = colormap[ci + 2];
    pixels[pi + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

import type { SimulationFrame } from '../engine/types';

function bilinearVelocity(
  ux: Float64Array, uy: Float64Array, nx: number, ny: number,
  x: number, y: number,
): [number, number] {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || ix >= nx - 1 || iy < 0 || iy >= ny - 1) return [0, 0];

  const fx = x - ix;
  const fy = y - iy;

  const i00 = iy * nx + ix;
  const i10 = iy * nx + ix + 1;
  const i01 = (iy + 1) * nx + ix;
  const i11 = (iy + 1) * nx + ix + 1;

  const vx = ux[i00] * (1 - fx) * (1 - fy) + ux[i10] * fx * (1 - fy) +
    ux[i01] * (1 - fx) * fy + ux[i11] * fx * fy;
  const vy = uy[i00] * (1 - fx) * (1 - fy) + uy[i10] * fx * (1 - fy) +
    uy[i01] * (1 - fx) * fy + uy[i11] * fx * fy;

  return [isFinite(vx) ? vx : 0, isFinite(vy) ? vy : 0];
}

function traceStreamline(
  ux: Float64Array, uy: Float64Array, walls: Uint8Array,
  nx: number, ny: number, startX: number, startY: number,
): { x: number; y: number; speed: number }[] {
  const points: { x: number; y: number; speed: number }[] = [];
  let x = startX, y = startY;
  const dt = 0.5;
  const maxLen = nx * 2;

  for (let step = 0; step < maxLen; step++) {
    if (x < 1 || x >= nx - 2 || y < 1 || y >= ny - 2) break;
    const idx = Math.floor(y) * nx + Math.floor(x);
    if (walls[idx] === 1) break;

    const [k1x, k1y] = bilinearVelocity(ux, uy, nx, ny, x, y);
    const speed = Math.sqrt(k1x * k1x + k1y * k1y);
    if (speed < 1e-8) break;

    const [k2x, k2y] = bilinearVelocity(ux, uy, nx, ny, x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
    const [k3x, k3y] = bilinearVelocity(ux, uy, nx, ny, x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
    const [k4x, k4y] = bilinearVelocity(ux, uy, nx, ny, x + dt * k3x, y + dt * k3y);

    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    points.push({ x, y, speed });
  }
  return points;
}

export function renderStreamlines(
  ctx: CanvasRenderingContext2D,
  frame: SimulationFrame,
  bgColormap: Uint8Array,
): void {
  const { ux, uy, walls, nx, ny } = frame;
  const size = nx * ny;

  // Dimmed velocity background
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
    const mag = (isFinite(vx) && isFinite(vy)) ? Math.sqrt(vx * vx + vy * vy) : 0;
    const norm = Math.min(255, Math.max(0, Math.floor((mag / maxMag) * 255)));
    const ci = norm * 4;
    pixels[pi] = Math.floor(bgColormap[ci] * 0.25);
    pixels[pi + 1] = Math.floor(bgColormap[ci + 1] * 0.25);
    pixels[pi + 2] = Math.floor(bgColormap[ci + 2] * 0.25);
    pixels[pi + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  // Draw streamlines
  const numSeeds = Math.min(30, Math.floor(ny / 5));
  ctx.lineWidth = 0.8;

  for (let s = 0; s < numSeeds; s++) {
    const seedY = 2 + ((ny - 4) / (numSeeds + 1)) * (s + 1);
    const points = traceStreamline(ux, uy, walls, nx, ny, 3, seedY);
    if (points.length < 3) continue;

    ctx.beginPath();
    ctx.moveTo(3, seedY);
    for (let p = 0; p < points.length; p++) {
      ctx.lineTo(points[p].x, points[p].y);
    }

    // Color by average speed
    const avgSpeed = points.reduce((sum, p) => sum + p.speed, 0) / points.length;
    const alpha = Math.min(1, 0.3 + (avgSpeed / maxMag) * 0.7);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
    ctx.stroke();

    // Arrowhead at end
    if (points.length >= 5) {
      const last = points[points.length - 1];
      const prev = points[points.length - 5];
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
      const arrowLen = 3;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(last.x - arrowLen * Math.cos(angle - 0.35), last.y - arrowLen * Math.sin(angle - 0.35));
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(last.x - arrowLen * Math.cos(angle + 0.35), last.y - arrowLen * Math.sin(angle + 0.35));
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.stroke();
    }
  }
}

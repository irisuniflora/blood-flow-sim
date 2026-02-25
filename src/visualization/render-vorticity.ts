import type { SimulationFrame } from '../engine/types';

function computeVorticity(frame: SimulationFrame): Float64Array {
  const { ux, uy, walls, nx, ny } = frame;
  const vorticity = new Float64Array(nx * ny);
  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const idx = y * nx + x;
      if (walls[idx] === 1) continue;
      const duyDx = (uy[y * nx + (x + 1)] - uy[y * nx + (x - 1)]) / 2;
      const duxDy = (ux[(y + 1) * nx + x] - ux[(y - 1) * nx + x]) / 2;
      const v = duyDx - duxDy;
      vorticity[idx] = isFinite(v) ? v : 0;
    }
  }
  return vorticity;
}

export function renderVorticity(
  ctx: CanvasRenderingContext2D,
  frame: SimulationFrame,
  colormap: Uint8Array,
): void {
  const { walls, nx, ny } = frame;
  const size = nx * ny;
  const vorticity = computeVorticity(frame);

  const imageData = ctx.createImageData(nx, ny);
  const pixels = imageData.data;

  let maxAbs = 0;
  for (let i = 0; i < size; i++) {
    if (walls[i] === 1) continue;
    const abs = Math.abs(vorticity[i]);
    if (abs > maxAbs) maxAbs = abs;
  }
  if (maxAbs < 1e-12) maxAbs = 1;

  for (let i = 0; i < size; i++) {
    const pi = i * 4;
    if (walls[i] === 1) {
      pixels[pi] = 30; pixels[pi + 1] = 32; pixels[pi + 2] = 42; pixels[pi + 3] = 255;
      continue;
    }
    const norm = Math.min(255, Math.max(0, Math.floor(((vorticity[i] / maxAbs) + 1) * 127.5)));
    const ci = norm * 4;
    pixels[pi] = colormap[ci];
    pixels[pi + 1] = colormap[ci + 1];
    pixels[pi + 2] = colormap[ci + 2];
    pixels[pi + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

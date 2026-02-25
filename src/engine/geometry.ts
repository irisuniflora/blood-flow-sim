import type { GeometryConfig } from './types';

export function createChannel(nx: number, ny: number): Uint8Array {
  const walls = new Uint8Array(nx * ny);
  // Top and bottom walls
  for (let x = 0; x < nx; x++) {
    walls[x] = 1;                    // y=0 (top)
    walls[(ny - 1) * nx + x] = 1;   // y=ny-1 (bottom)
  }
  return walls;
}

export function addSymmetricStenosis(
  walls: Uint8Array,
  nx: number,
  ny: number,
  ratio: number,
  position: number,
  length: number,
): void {
  const centerX = Math.floor(position * nx);
  const halfLen = Math.floor(length * nx / 2);
  const maxNarrowing = Math.floor((ny / 2) * ratio);

  for (let x = centerX - halfLen; x <= centerX + halfLen; x++) {
    if (x < 1 || x >= nx - 1) continue;
    const t = (x - (centerX - halfLen)) / (2 * halfLen);
    const narrowing = Math.floor(maxNarrowing * (1 - Math.cos(2 * Math.PI * t)) / 2);

    // Top wall extension
    for (let y = 0; y <= narrowing; y++) {
      walls[y * nx + x] = 1;
    }
    // Bottom wall extension
    for (let y = ny - 1 - narrowing; y < ny; y++) {
      walls[y * nx + x] = 1;
    }
  }
}

export function addEccentricStenosis(
  walls: Uint8Array,
  nx: number,
  ny: number,
  ratio: number,
  position: number,
  length: number,
): void {
  const centerX = Math.floor(position * nx);
  const halfLen = Math.floor(length * nx / 2);
  const maxNarrowing = Math.floor((ny / 2) * ratio);

  for (let x = centerX - halfLen; x <= centerX + halfLen; x++) {
    if (x < 1 || x >= nx - 1) continue;
    const t = (x - (centerX - halfLen)) / (2 * halfLen);
    const narrowing = Math.floor(maxNarrowing * (1 - Math.cos(2 * Math.PI * t)) / 2);

    // Only top wall narrows
    for (let y = 0; y <= narrowing; y++) {
      walls[y * nx + x] = 1;
    }
  }
}

export function addMultiStenosis(
  walls: Uint8Array,
  nx: number,
  ny: number,
  ratio: number,
  length: number,
): void {
  addSymmetricStenosis(walls, nx, ny, ratio, 0.35, length);
  addSymmetricStenosis(walls, nx, ny, ratio * 0.7, 0.65, length);
}

export function addGradualStenosis(
  walls: Uint8Array,
  nx: number,
  ny: number,
  ratio: number,
  position: number,
): void {
  // Long, gradual narrowing with cosine profile
  addSymmetricStenosis(walls, nx, ny, ratio, position, 0.4);
}

export function addSharpStenosis(
  walls: Uint8Array,
  nx: number,
  ny: number,
  ratio: number,
  position: number,
): void {
  const centerX = Math.floor(position * nx);
  const halfLen = Math.floor(0.05 * nx);
  const maxNarrowing = Math.floor((ny / 2) * ratio);

  // Sharp rectangular stenosis with short tapered edges
  const taperLen = Math.max(3, Math.floor(halfLen / 2));

  for (let x = centerX - halfLen - taperLen; x <= centerX + halfLen + taperLen; x++) {
    if (x < 1 || x >= nx - 1) continue;

    let narrowing: number;
    if (x < centerX - halfLen) {
      // Entry taper
      const t = (x - (centerX - halfLen - taperLen)) / taperLen;
      narrowing = Math.floor(maxNarrowing * t);
    } else if (x > centerX + halfLen) {
      // Exit taper
      const t = (centerX + halfLen + taperLen - x) / taperLen;
      narrowing = Math.floor(maxNarrowing * t);
    } else {
      narrowing = maxNarrowing;
    }

    for (let y = 0; y <= narrowing; y++) {
      walls[y * nx + x] = 1;
    }
    for (let y = ny - 1 - narrowing; y < ny; y++) {
      walls[y * nx + x] = 1;
    }
  }
}

export function createGeometry(nx: number, ny: number, config: GeometryConfig): Uint8Array {
  const walls = createChannel(nx, ny);

  switch (config.stenosisType) {
    case 'normal':
      break;
    case 'symmetric':
      addSymmetricStenosis(walls, nx, ny, config.stenosisRatio, config.stenosisPosition, config.stenosisLength);
      break;
    case 'eccentric':
      addEccentricStenosis(walls, nx, ny, config.stenosisRatio, config.stenosisPosition, config.stenosisLength);
      break;
    case 'multi':
      addMultiStenosis(walls, nx, ny, config.stenosisRatio, config.stenosisLength);
      break;
    case 'gradual':
      addGradualStenosis(walls, nx, ny, config.stenosisRatio, config.stenosisPosition);
      break;
    case 'sharp':
      addSharpStenosis(walls, nx, ny, config.stenosisRatio, config.stenosisPosition);
      break;
  }

  return walls;
}

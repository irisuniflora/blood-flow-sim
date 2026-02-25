// Pre-computed colormap lookup tables (256 entries, RGBA)

function interpolateColor(
  t: number,
  stops: [number, number, number, number][],
): [number, number, number, number] {
  const n = stops.length - 1;
  const idx = t * n;
  const i = Math.min(Math.floor(idx), n - 1);
  const f = idx - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [
    Math.round(a[0] + f * (b[0] - a[0])),
    Math.round(a[1] + f * (b[1] - a[1])),
    Math.round(a[2] + f * (b[2] - a[2])),
    Math.round(a[3] + f * (b[3] - a[3])),
  ];
}

function buildLUT(stops: [number, number, number, number][]): Uint8Array {
  const lut = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const color = interpolateColor(i / 255, stops);
    lut[i * 4] = color[0];
    lut[i * 4 + 1] = color[1];
    lut[i * 4 + 2] = color[2];
    lut[i * 4 + 3] = color[3];
  }
  return lut;
}

// Viridis-like colormap (dark purple -> teal -> yellow)
export const viridis = buildLUT([
  [68, 1, 84, 255],
  [72, 35, 116, 255],
  [64, 67, 135, 255],
  [52, 94, 141, 255],
  [33, 145, 140, 255],
  [53, 183, 121, 255],
  [109, 205, 89, 255],
  [180, 222, 44, 255],
  [253, 231, 37, 255],
]);

// Coolwarm diverging (blue -> white -> red)
export const coolwarm = buildLUT([
  [59, 76, 192, 255],
  [98, 130, 234, 255],
  [141, 176, 254, 255],
  [184, 208, 249, 255],
  [221, 221, 221, 255],
  [245, 196, 173, 255],
  [244, 154, 123, 255],
  [222, 96, 77, 255],
  [180, 4, 38, 255],
]);

// Jet colormap (blue -> cyan -> green -> yellow -> red)
export const jet = buildLUT([
  [0, 0, 131, 255],
  [0, 0, 255, 255],
  [0, 128, 255, 255],
  [0, 255, 255, 255],
  [128, 255, 128, 255],
  [255, 255, 0, 255],
  [255, 128, 0, 255],
  [255, 0, 0, 255],
  [128, 0, 0, 255],
]);

export type ColormapName = 'viridis' | 'coolwarm' | 'jet';

export function getColormap(name: ColormapName): Uint8Array {
  switch (name) {
    case 'viridis': return viridis;
    case 'coolwarm': return coolwarm;
    case 'jet': return jet;
  }
}

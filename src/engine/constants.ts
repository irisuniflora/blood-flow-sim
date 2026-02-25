// D2Q9 Lattice Boltzmann constants
// Directions: 0=rest, 1=E, 2=N, 3=W, 4=S, 5=NE, 6=NW, 7=SW, 8=SE

export const Q = 9;

export const CX = new Int8Array([0, 1, 0, -1, 0, 1, -1, -1, 1]);
export const CY = new Int8Array([0, 0, 1, 0, -1, 1, 1, -1, -1]);

export const W = new Float64Array([
  4 / 9,
  1 / 9, 1 / 9, 1 / 9, 1 / 9,
  1 / 36, 1 / 36, 1 / 36, 1 / 36,
]);

// Opposite direction indices (for bounce-back)
export const OPP = new Uint8Array([0, 3, 4, 1, 2, 7, 8, 5, 6]);

export const CS2 = 1 / 3;

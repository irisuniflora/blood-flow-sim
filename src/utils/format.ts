export function formatNumber(value: number, decimals: number = 4): string {
  if (Math.abs(value) < 0.001 && value !== 0) {
    return value.toExponential(2);
  }
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

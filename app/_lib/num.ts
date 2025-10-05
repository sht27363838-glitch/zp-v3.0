export const num = (v: any): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[,\s]/g,''));
  return Number.isFinite(n) ? n : 0;
};

export const fmt = (n: number, digits = 0): string => {
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const pct = (n: number, digits = 1): string => {
  if (!Number.isFinite(n)) n = 0;
  return `${(n * 100).toFixed(digits)}%`;
};

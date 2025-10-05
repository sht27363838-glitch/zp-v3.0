// app/_lib/num.ts
export function num(v: any): number {
  const n = typeof v === "string" ? v.replace(/[, ]/g, "") : v;
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function fmt(n: number, digits = 0): string {
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function pct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) n = 0;
  return (n * 100).toFixed(digits) + "%";
}

/** 1,234 → 1.23K / 1,234,567 → 1.23M */
export function kfmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) n = 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(digits) + "B";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(digits) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(digits) + "K";
  return sign + fmt(abs, digits);
}

'use client'

export function num(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function fmt(v: number, options?: Intl.NumberFormatOptions): string {
  const nf = new Intl.NumberFormat('ko-KR', options || { maximumFractionDigits: 0 });
  return nf.format(Number(v) || 0);
}

export function pct(v: number, digits = 1): string {
  if (!isFinite(v)) return '0%';
  return (v * 100).toFixed(digits) + '%';
}

// Thousands/Millions short formatter: 12,300 -> 12.3K, 1,200,000 -> 1.2M
export function kfmt(v: number): string {
  const n = Number(v) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

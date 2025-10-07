// app/_lib/num.ts
export const num = (v: any): number => {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// 금액 포맷: 1,234,567
export const fmt = (v: number): string =>
  (isFinite(v) ? Math.round(v) : 0).toLocaleString();

// 퍼센트 포맷: 기본 소수 1자리. pct(0.123) -> "12.3%"
export const pct = (ratio: number, digits = 1): string => {
  const n = Number.isFinite(ratio) ? ratio : 0;
  return (n * 100).toFixed(digits) + '%';
};

// 천단위 약식 (예: 1234000 -> "1.23M")
export const kfmt = (v: number, digits = 2): string => {
  const n = num(v);
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(digits) + 'B';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(digits) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(digits) + 'K';
  return n.toString();
};

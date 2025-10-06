// 숫자 유틸(계약 고정)
export const num = (v: any): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g,''));
  return isNaN(n) ? 0 : n;
};
export const fmt = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n || 0);
export const kfmt = (n: number) => {
  const x = n || 0;
  if (Math.abs(x) >= 1_000_000_000) return (x/1_000_000_000).toFixed(1)+'B';
  if (Math.abs(x) >= 1_000_000) return (x/1_000_000).toFixed(1)+'M';
  if (Math.abs(x) >= 1_000) return (x/1_000).toFixed(1)+'k';
  return String(x);
};
export const pct = (a: number, b: number) => b ? a / b : 0;

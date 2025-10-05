// app/_lib/num.ts
export const num = (v: any)=> Number(String(v||'').replace(/[, ]/g,'')) || 0;
export const fmt = (v: number)=> (isNaN(v)?0:v).toLocaleString();
export const kfmt = (v: number)=> {
  const n = isNaN(v)?0:v;
  if (Math.abs(n) >= 1_000_000) return (n/1_000_000).toFixed(1)+'M';
  if (Math.abs(n) >= 1_000) return (n/1_000).toFixed(1)+'k';
  return String(n);
};
export const pct = (v: number)=> `${((isNaN(v)?0:v)*100).toFixed(2)}%`;

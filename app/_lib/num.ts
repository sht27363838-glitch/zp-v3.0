'use client'
export const num = (v: any): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v||'').replace(/[^0-9\.-]/g,''));
  return isNaN(n) ? 0 : n;
};
export const pct = (v:number, d=1)=> (v*100).toFixed(d)+'%';
export const kfmt = (v:number)=>{
  const abs = Math.abs(v);
  if (abs>=1e9) return (v/1e9).toFixed(2)+'B';
  if (abs>=1e6) return (v/1e6).toFixed(2)+'M';
  if (abs>=1e3) return (v/1e3).toFixed(1)+'k';
  return v.toFixed(0);
};

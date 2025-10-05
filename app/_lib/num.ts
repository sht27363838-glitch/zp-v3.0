export const num = (v:any)=>{ if(v==null) return 0; const n = parseFloat(String(v).replace(/,/g,'')); return Number.isFinite(n)?n:0; };
export const fmt = (n:number)=> n.toLocaleString('ko-KR',{maximumFractionDigits:2});
export const pct = (v:number)=> (v*100).toLocaleString('ko-KR',{maximumFractionDigits:2})+'%';

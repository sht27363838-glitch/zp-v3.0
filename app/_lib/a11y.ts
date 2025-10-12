// 간단 대비 체크(개발 중 콘솔 경고)
export function checkContrastOnce() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
  const txt = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#0b1220';
  const bg  = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';
  const ratio = contrastRatio(hex(txt), hex(bg));
  if (ratio < 4.5) console.warn(`[a11y] Text contrast ${ratio.toFixed(2)}:1 < 4.5:1 (WCAG AA) — 색상 변수를 조정하세요.`);
  function hex(s:string){ return s.startsWith('#')? s : '#000000'; }
  function luminance(h:string){
    const rgb=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928? v/12.92:Math.pow((v+.055)/1.055,2.4));
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  }
  function contrastRatio(a:string,b:string){ const L1=luminance(a), L2=luminance(b); const [hi,lo]=L1>L2?[L1,L2]:[L2,L1]; return (hi+0.05)/(lo+0.05); }
}

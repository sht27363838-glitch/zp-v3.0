export const num = (v: any, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? d : n;
};

export const fmt = (v: number, digits = 2) => {
  if (!isFinite(v)) return '0';
  // 금액/지표 공용 포맷(천단위 콤마)
  return Number(v).toLocaleString('ko-KR', { maximumFractionDigits: digits });
};

export const pct = (v: number, digits = 2) =>
  `${(v * 100).toFixed(digits)}%`;

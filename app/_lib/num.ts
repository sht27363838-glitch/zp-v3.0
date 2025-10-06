// app/_lib/num.ts

/** 숫자 변환: NaN/Infinity 방지 */
export function num(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 통화/숫자 포맷 (간단 버전) */
export function fmt(n: number, locale = 'ko-KR'): string {
  return Number(num(n)).toLocaleString(locale)
}

/** 퍼센트 표기: 두 번째 인자는 옵션(기본 1자리) */
export function pct(x: number, digits: number = 1): string {
  const v = num(x) * 100
  return v.toFixed(digits) + '%'
}

/** 퍼센트 1자리 헬퍼 */
export function pct1(x: number): string {
  return pct(x, 1)
}

/** k/M/B 축약 표기 */
export function kfmt(n: number, digits: number = 1): string {
  const v = num(n)
  const a = Math.abs(v)
  if (a >= 1e9) return (v / 1e9).toFixed(digits) + 'B'
  if (a >= 1e6) return (v / 1e6).toFixed(digits) + 'M'
  if (a >= 1e3) return (v / 1e3).toFixed(digits) + 'k'
  return v.toFixed(digits)
}

export type { } // TS 모듈로 인식시키기용 (빈 export)

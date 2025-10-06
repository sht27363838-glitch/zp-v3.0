// app/_lib/kpi.ts
import { parseCsv, type CsvRow, type CsvTable } from './readCsv'
import { num } from './num'

/** KPI 원시행을 숫자형으로 정규화한 형태 */
export type NormRow = {
  date?: string
  channel?: string
  visits: number
  clicks: number
  carts: number
  orders: number
  revenue: number
  ad_cost: number
  returns: number
  reviews: number
}

/** KPI 합계/지표 */
export type KpiAgg = {
  total: NormRow
  ROAS: number
  CR: number
  AOV: number
  returnsRate: number
}

/** CsvTable -> NormRow[] 변환 (숫자 변환 포함) */
export function rowsFromTable(tbl: CsvTable): NormRow[] {
  return tbl.rows.map((r: CsvRow) => ({
    date: (r as any).date,
    channel: (r as any).channel,
    visits: num((r as any).visits),
    clicks: num((r as any).clicks),
    carts: num((r as any).carts),
    orders: num((r as any).orders),
    revenue: num((r as any).revenue),
    ad_cost: num((r as any).ad_cost),
    returns: num((r as any).returns),
    reviews: num((r as any).reviews),
  }))
}

/** raw CSV 문자열 -> NormRow[] */
export function rowsFromRaw(raw: string): NormRow[] {
  const table = parseCsv(raw || '')
  return rowsFromTable(table)
}

/** NormRow[] 합계 및 주요 KPI 계산 */
export function computeKpi(rows: NormRow[]): KpiAgg {
  const total: NormRow = {
    visits: 0, clicks: 0, carts: 0, orders: 0, revenue: 0, ad_cost: 0, returns: 0, reviews: 0,
  }
  for (const r of rows) {
    total.visits += r.visits || 0
    total.clicks += r.clicks || 0
    total.carts += r.carts || 0
    total.orders += r.orders || 0
    total.revenue += r.revenue || 0
    total.ad_cost += r.ad_cost || 0
    total.returns += r.returns || 0
    total.reviews += r.reviews || 0
  }

  const ROAS = total.ad_cost ? total.revenue / total.ad_cost : 0
  const CR = total.visits ? total.orders / total.visits : 0
  const AOV = total.orders ? total.revenue / total.orders : 0
  const returnsRate = total.orders ? total.returns / total.orders : 0

  return { total, ROAS, CR, AOV, returnsRate }
}

/** 날짜 문자열을 안전하게 비교 가능한 키로 */
function dkey(s?: string) {
  // YYYY-MM-DD 가정. 형식 불량일 때는 가장 과거로 취급
  return /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? (s as string) : '0000-00-00'
}

/** 최근 N일 추출(날짜 기준 합산) */
export function lastNDays(rows: NormRow[], n: number): NormRow[] {
  // 날짜별 합산 후 최신 n개의 날짜만 반환
  const byDate = new Map<string, NormRow>()
  for (const r of rows) {
    const k = dkey(r.date)
    const o = byDate.get(k) || {
      date: k, channel: undefined,
      visits: 0, clicks: 0, carts: 0, orders: 0, revenue: 0, ad_cost: 0, returns: 0, reviews: 0
    }
    o.visits += r.visits || 0
    o.clicks += r.clicks || 0
    o.carts += r.carts || 0
    o.orders += r.orders || 0
    o.revenue += r.revenue || 0
    o.ad_cost += r.ad_cost || 0
    o.returns += r.returns || 0
    o.reviews += r.reviews || 0
    byDate.set(k, o)
  }
  const dates = [...byDate.keys()].sort((a,b)=> a<b?1:-1) // 최신 → 과거
  const pick = dates.slice(0, Math.max(0,n)).reverse()    // 과거 → 최신
  return pick.map(k => byDate.get(k)!)
}

// 기존 series 함수 자리에 이걸로 교체
export function series(rows: NormRow[], metric: keyof NormRow, n: number = 30): number[] {
  const picked = lastNDays(rows, n)
  return picked.map(r => Number((r as any)[metric] || 0))
}

}

/** 요약치(합계+KPI) — 선택적으로 최근 N일만 대상으로 계산 */
export function summarize(rows: NormRow[], n?: number): KpiAgg {
  const scope = n ? lastNDays(rows, n) : rows
  return computeKpi(scope)
}

/** === 기존 페이지 호환용 별칭(Shim) === */
/** CSV -> NormRow[] : app/page.tsx가 기대하는 이름 */
export function computeKpiRows(raw: string): NormRow[] {
  return rowsFromRaw(raw)
}

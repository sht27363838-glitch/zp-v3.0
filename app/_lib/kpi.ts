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

/** raw CSV 문자열에서 곧바로 KPI 산출 */
export function computeKpiFromRaw(raw: string): KpiAgg {
  return computeKpi(rowsFromRaw(raw))
}

/** 채널별 합계 테이블 (C1, growth용) */
export type ChannelAgg = {
  channel: string
  clicks: number
  spend: number
  orders: number
  revenue: number
  ROAS: number
  CPA: number
  CTR: number
}

export function groupByChannel(rows: NormRow[]): ChannelAgg[] {
  const by: Record<string, Omit<ChannelAgg, 'ROAS' | 'CPA' | 'CTR'>> = {}
  let totalVisitsByChannel: Record<string, number> = {}

  for (const r of rows) {
    const ch = r.channel || 'unknown'
    const o = (by[ch] ||= { channel: ch, clicks: 0, spend: 0, orders: 0, revenue: 0 })
    o.clicks += r.clicks || 0
    o.spend += r.ad_cost || 0
    o.orders += r.orders || 0
    o.revenue += r.revenue || 0
    totalVisitsByChannel[ch] = (totalVisitsByChannel[ch] || 0) + (r.visits || 0)
  }

  return Object.values(by).map(o => {
    const ROAS = o.spend ? o.revenue / o.spend : 0
    const CPA = o.orders ? o.spend / o.orders : 0
    const CTR = totalVisitsByChannel[o.channel] ? (o.clicks || 0) / totalVisitsByChannel[o.channel] : 0
    return { ...o, ROAS, CPA, CTR }
  })
}

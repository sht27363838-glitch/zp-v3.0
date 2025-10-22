// app/_lib/heat.ts
export type HMRow = {
  [k: string]: any
  date?: string
  channel?: string
  product?: string
  visits?: number
  clicks?: number
  orders?: number
  ad_cost?: number
}

export type CellAgg = { visits: number; clicks: number; orders: number; ad_cost: number }

export function collectCategories(rows: HMRow[], key: keyof HMRow, fallback = 'unknown'){
  const s = new Set<string>()
  for(const r of rows) s.add(String((r as any)[key] ?? fallback))
  return Array.from(s).sort()
}

export function accumulateMatrix(
  rows: HMRow[],
  xKey: keyof HMRow,
  yKey: keyof HMRow,
  yFallback='generic',
  xFallback='unknown'
){
  const m = new Map<string, CellAgg>()
  for(const r of rows){
    const x = String((r as any)[xKey] ?? xFallback)
    const y = String((r as any)[yKey] ?? yFallback)
    const k = `${y}|${x}`
    const cur = m.get(k) ?? { visits:0, clicks:0, orders:0, ad_cost:0 }
    cur.visits += Number(r.visits ?? 0)
    cur.clicks += Number(r.clicks ?? 0)
    cur.orders += Number(r.orders ?? 0)
    cur.ad_cost += Number(r.ad_cost ?? 0)
    m.set(k, cur)
  }
  return m
}

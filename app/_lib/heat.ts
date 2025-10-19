// app/_lib/heat.ts
export type HeatInput = {
  date: string
  channel: string
  visits: number
  orders: number
  ad_cost: number
}

export type HeatAgg = { visits: number; orders: number; cost: number }

/** O(N) one-pass 집계: (date|channel) 키별 누적 */
export function aggregateHeat(rows: HeatInput[]) {
  const agg = new Map<string, HeatAgg>()
  for (const r of rows) {
    const k = `${r.date}|${r.channel}`
    const o = agg.get(k) ?? { visits: 0, orders: 0, cost: 0 }
    o.visits += r.visits || 0
    o.orders += r.orders || 0
    o.cost   += r.ad_cost || 0
    agg.set(k, o)
  }
  return agg
}

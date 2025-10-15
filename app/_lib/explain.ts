// app/_lib/explain.ts
'use client'
import { parseCsv, readCsvOrDemo, type CsvRow } from './readCsv'
import { num, pct } from './num'

const KEY = '__explain.cache.v1'

export function getHomeExplain(): string {
  try{
    const cached = sessionStorage.getItem(KEY); if(cached) return cached
    const raw = readCsvOrDemo('kpi_daily'); const { rows=[] } = parseCsv(raw)
    if((rows as CsvRow[]).length<2) return '데이터가 부족합니다.'

    const recent = (rows as CsvRow[]).slice(-30)
    const byCh = new Map<string, {rev:number; clicks:number; orders:number}>()
    for(const r of recent){
      const ch = String(r.channel||'unknown')
      const o = byCh.get(ch) || {rev:0, clicks:0, orders:0}
      o.rev+=num(r.revenue); o.clicks+=num(r.clicks); o.orders+=num(r.orders)
      byCh.set(ch, o)
    }
    const arr = [...byCh.entries()].map(([k,v])=>({ch:k, rev:v.rev, cr: v.clicks? v.orders/v.clicks:0}))
      .sort((a,b)=> b.rev-a.rev).slice(0,3)
    const msg = `최근 30일 상위 채널: ` + arr.map(a=> `${a.ch}(${pct(a.cr,1)})`).join(', ')
    sessionStorage.setItem(KEY, msg)
    return msg
  }catch{ return '요약 생성 실패' }
}

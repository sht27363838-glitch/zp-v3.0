// app/_lib/guards.ts
'use client'
import { readCsvOrDemo, parseCsv, type CsvRow } from './readCsv'
import { num } from './num'

export type AlertFlags = {
  roasLow: boolean
  crDrop: boolean
  returnsSpike: boolean
}

function aggregate(rows: CsvRow[]) {
  let visits=0, clicks=0, orders=0, revenue=0, ad=0, returns=0
  for (const r of rows) {
    visits+=num(r.visits); clicks+=num(r.clicks); orders+=num(r.orders)
    revenue+=num(r.revenue); ad+=num(r.ad_cost); returns+=num(r.returns)
  }
  const roas = ad? revenue/ad : 0
  const cr   = visits? orders/visits : 0
  const rr   = orders? returns/orders : 0
  return { roas, cr, rr }
}

/** 오늘 vs 어제 간단 비교 + 임계치 */
export function getAlertFlags(): AlertFlags {
  try{
    const raw = readCsvOrDemo('kpi_daily')
    const { rows=[] } = raw? parseCsv(raw) : { rows:[] as CsvRow[] }
    if(rows.length<2) return { roasLow:false, crDrop:false, returnsSpike:false }

    const today = aggregate((rows as CsvRow[]).slice(-1))
    const prev7 = aggregate((rows as CsvRow[]).slice(-8,-1)) // 최근 7일 평균 근사
    const roasLow = today.roas < 1.2
    const crDrop  = prev7.cr>0 ? (today.cr/prev7.cr) < 0.8 : false
    const returnsSpike = prev7.rr>0 ? (today.rr/prev7.rr) > 1.5 : today.rr>0.08
    return { roasLow, crDrop, returnsSpike }
  }catch{ return { roasLow:false, crDrop:false, returnsSpike:false } }
}

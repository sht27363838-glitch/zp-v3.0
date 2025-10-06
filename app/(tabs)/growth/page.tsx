'use client'
import React, {useMemo} from 'react'
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv'
import { num, pct } from '../../_lib/num'

type Kpi = {
  date?: string
  channel?: string
  visits?: string
  clicks?: string
  orders?: string
  revenue?: string
  ad_cost?: string
}

export default function Growth(){
  const raw = readCsvLS('kpi_daily') || ''
  const data: CsvRows = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
    [raw]
  )
  const rows = data.rows as Kpi[]

  // 채널별 집계
  const by: Record<string, {channel:string; clicks:number; spend:number; orders:number; revenue:number}> = {}
  for (const r of rows) {
    const ch = r.channel || 'unknown'
    const o = (by[ch] ||= {channel: ch, clicks:0, spend:0, orders:0, revenue:0})
    o.clicks  += num(r.clicks)
    o.spend   += num(r.ad_cost)
    o.orders  += num(r.orders)
    o.revenue += num(r.revenue)
  }

  const list = Object.values(by).map(r=>{
    const CPA  = r.orders? r.spend / r.orders : 0
    const ROAS = r.spend? r.revenue / r.spend : 0
    const CTR  = 0 // impressions 미사용 버전
    return { ...r, CPA, ROAS, CTR }
  }).sort((a,b)=> (b.ROAS||0) - (a.ROAS||0))

  return (
    <div className="page">
      <h1>Growth (C1)</h1>

      <div className="table-wrap" style={{maxHeight:480, overflow:'auto'}}>
        <table className="league">
          <thead>
            <tr>
              <th>채널</th><th>클릭</th><th>주문</th><th>매출</th><th>비용</th><th>ROAS</th><th>CPA</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r,i)=>(
              <tr key={i}>
                <td>{r.channel}</td>
                <td>{r.clicks}</td>
                <td>{r.orders}</td>
                <td>{r.revenue}</td>
                <td>{r.spend}</td>
                <td>{pct(r.ROAS)}</td>
                <td>{r.CPA.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

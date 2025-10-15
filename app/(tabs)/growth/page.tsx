'use client'

import { sourceTag } from '@lib/csvSafe'
import React, {useMemo} from 'react'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv, type CsvRow, type CsvTable } from '@lib/readCsv'
import { validate } from '@lib/csvSafe'
import { num, fmt, pct } from '@lib/num'
import VirtualTable from '../../_components/VirtualTable'
import ErrorBanner from '@cmp/ErrorBanner'
import Pager from '@cmp/Pager'
import ExportBar from '@cmp/ExportBar'

export default function Growth(){
  const raw = readCsvOrDemo('kpi_daily')
  const data: CsvTable = useMemo(()=> parseCsv(raw), [raw])
  const check = validate('kpi_daily', data)

  type Agg = { channel:string; visits:number; clicks:number; spend:number; orders:number; revenue:number }
  const by: Record<string, Agg> = {}
  for(const r of data.rows as CsvRow[]){
    const ch = (r.channel as string) || 'unknown'
    const o = (by[ch] ||= {channel:ch, visits:0, clicks:0, spend:0, orders:0, revenue:0})
    o.visits+=num(r.visits); o.clicks+=num(r.clicks); o.spend+=num(r.ad_cost)
    o.orders+=num(r.orders); o.revenue+=num(r.revenue)
  }

  const rows = Object.values(by)
    .map(o=>{
      const ROAS = o.spend? o.revenue/o.spend : 0
      const CPA  = o.orders? o.spend/o.orders : 0
      const CTR  = o.visits? o.clicks/o.visits : 0
      return {...o, ROAS, CPA, CTR}
    })
    .sort((a,b)=> b.ROAS - a.ROAS)

  const pct1 = (v:number)=> pct(v,1)

  return (
    <div className="page">
     <div style={{display:'flex', alignItems:'center', gap:8}}>
  <h1>채널 리그(ROAS/CPA/CTR)</h1>
       <ExportBar selector=".page" />
  <span className="badge">{sourceTag('kpi_daily')}</span>
</div>


      {!check.ok && (
        <ErrorBanner tone="warn" title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`} show />
      )}

      {rows.length===0 ? (
        <div className="skeleton" />
      ) : (
        <Pager data={rows} pageSize={50} render={(page)=>(
          <VirtualTable
  rows={rows}
  className="table"
  header={
    <thead>
      <tr>
        <th>채널</th><th>방문</th><th>클릭</th><th>주문</th>
        <th>매출</th><th>광고비</th><th>ROAS</th><th>CPA</th><th>CTR</th>
      </tr>
    </thead>
  }
  renderRow={(r)=>(
    <tr key={r.channel}>
      <td>{r.channel}</td>
      <td>{fmt(r.visits)}</td>
      <td>{fmt(r.clicks)}</td>
      <td>{fmt(r.orders)}</td>
      <td>{fmt(r.revenue)}</td>
      <td>{fmt(r.spend)}</td>
      <td>{pct1(r.ROAS)}</td>
      <td>{fmt(r.CPA)}</td>
      <td>{pct1(r.CTR)}</td>
    </tr>
        )}/>
      )}
    </div>
  )
}

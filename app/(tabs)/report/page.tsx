'use client'

import Pager from '../../_components/Pager'
import React, { useMemo } from 'react'
import { readCsvOrDemo, parseCsv, type CsvRow } from '../../_lib/readCsv'
import { num, fmt } from '../../_lib/num'
import KpiTile from '../../_components/KpiTile'
import ScrollWrap from '../../_components/ScrollWrap'

const pct1 = (v: number): string => `${(v * 100).toFixed(1)}%`

function readLastMonthProfit(): number {
  const raw = readCsvOrDemo('settings') || ''
  if (!raw) return 1_000_000
  const data = parseCsv(raw)
  const row = (data.rows?.[0] as any) || {}
  const p = Number(row.last_month_profit ?? 0)
  return isFinite(p) && p > 0 ? p : 1_000_000
}

export default function ReportPage() {
  // ✅ 데모 대체 로더
  const raw = readCsvOrDemo('kpi_daily')

  const data = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [] as string[], rows: [] as CsvRow[] }),
    [raw]
  )

  let visits = 0, clicks = 0, orders = 0, revenue = 0, adCost = 0, returns = 0
  for (const r of data.rows) {
    visits += num(r.visits); clicks += num(r.clicks); orders += num(r.orders)
    revenue += num(r.revenue); adCost += num(r.ad_cost); returns += num(r.returns)
  }

  const ROAS = adCost ? revenue / adCost : 0
  const CR = visits ? orders / visits : 0
  const AOV = orders ? revenue / orders : 0
  const returnsRate = orders ? returns / orders : 0
  const lastMonthProfit = readLastMonthProfit()

  return (
    <div className="page">
      <h1>지휘소(C0) — 요약</h1>

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      {data.rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div style={{ marginTop: 16 }}>
          <h2 className="mb-2">최근 지표 표</h2>
         <Pager data={rows} pageSize={50} render={(page)=>(
  <ScrollWrap>
    <table className="table">
      <thead>
        <tr>
          <th>채널</th><th>방문</th><th>클릭</th><th>주문</th>
          <th>매출</th><th>광고비</th><th>ROAS</th><th>CPA</th><th>CTR</th>
        </tr>
      </thead>
      <tbody>
        {page.map((r)=>(
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
        ))}
      </tbody>
    </table>
  </ScrollWrap>
)}/>

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        <p className="text-sm">
          데이터 원본: <code>kpi_daily.csv</code>, 기준 순익: <code>settings.csv</code> (<code>last_month_profit</code>)
        </p>
      </div>
    </div>
  )
}

'use client'
export const dynamic = 'force-dynamic'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'

type RowAgg = {
  channel: string
  clicks: number
  spend: number
  orders: number
  revenue: number
}

export default function Growth() {
  const raw = readCsvLS('kpi_daily') || ''
  // 항상 {headers, rows} 형태로 통일
  const data: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])

  // 채널 집계
  const by: Record<string, RowAgg> = {}
  let totalOrders = 0
  for (const r of data.rows as any[]) {
    const ch = r.channel || 'unknown'
    const o = (by[ch] ||= { channel: ch, clicks: 0, spend: 0, orders: 0, revenue: 0 })
    o.clicks += num(r.clicks)
    o.spend += num(r.ad_cost)
    o.orders += num(r.orders)
    o.revenue += num(r.revenue)
    totalOrders += num(r.orders)
  }

  // 테이블 데이터 + 정렬(ROAS desc)
  const rows = Object.values(by)
    .map(r => {
      const CPA = r.orders ? (r.spend || 0) / r.orders : 0
      const CTR = 0 // visits 컬럼 없이 단순 표시 유지(원하면 visits로 대체 가능)
      const ROAS = r.spend ? r.revenue / r.spend : 0
      return { ...r, CPA, CTR, ROAS }
    })
    .sort((a, b) => (b.ROAS || 0) - (a.ROAS || 0))

  return (
    <div className="pad">
      <h2 className="title">C1 — 채널 리그</h2>

      <div style={{ maxHeight: 520, overflow: 'auto' }}>
        <table className="league">
          <thead>
            <tr>
              <th>채널</th>
              <th>클릭</th>
              <th>주문</th>
              <th>매출</th>
              <th>광고비</th>
              <th>ROAS</th>
              <th>CPA</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.channel}>
                <td>{r.channel}</td>
                <td>{fmt(r.clicks)}</td>
                <td>{fmt(r.orders)}</td>
                <td>{fmt(r.revenue)}</td>
                <td>{fmt(r.spend)}</td>
                <td>{pct(r.ROAS)}</td>
                <td>{fmt(r.CPA)}</td>
                <td>{pct(r.CTR)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', opacity: 0.7 }}>
                  업로드된 <code>kpi_daily</code> 데이터가 없습니다. Tools에서 CSV를 넣어주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-dim">총 주문: {fmt(totalOrders)}</div>
    </div>
  )
}

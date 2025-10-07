'use client'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvRow } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'

type Agg = {
  channel: string
  visits: number
  clicks: number
  spend: number
  orders: number
  revenue: number
}

export default function Growth() {
  // 로컬스토리지에서 kpi_daily CSV 원문 읽기
  const raw = readCsvLS('kpi_daily') || ''

  // 한 번만 파싱 (SSR 안전)
  const data = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [] as string[], rows: [] as CsvRow[] }),
    [raw]
  )

  // 채널별 집계
  const by: Record<string, Agg> = {}
  for (const r of data.rows) {
    const ch = (r.channel as string) || 'unknown'
    const o =
      (by[ch] ||= {
        channel: ch,
        visits: 0,
        clicks: 0,
        spend: 0,
        orders: 0,
        revenue: 0,
      })
    o.visits += num(r.visits)
    o.clicks += num(r.clicks)
    o.spend += num(r.ad_cost)
    o.orders += num(r.orders)
    o.revenue += num(r.revenue)
  }

  // 표용 최종 리스트 (지표 계산)
  const rows = Object.values(by)
    .map((o) => {
      const ROAS = o.spend ? o.revenue / o.spend : 0
      const CPA = o.orders ? o.spend / o.orders : 0
      const CTR = o.visits ? o.clicks / o.visits : 0
      return { ...o, ROAS, CPA, CTR }
    })
    .sort((a, b) => b.ROAS - a.ROAS)

  // 퍼센트 표기(소수 1자리) 헬퍼
  const pct1 = (v: number) => pct(v, 1)

  return (
    <div className="page">
      <h1>채널 리그(ROAS/CPA/CTR)</h1>

           {/* 스켈레톤 or 표(스크롤 래퍼) */}
      {rows.length === 0 ? (
        <div className="skeleton" style={{height:160}} />
      ) : (
        <div className="scroll">
          <table className="table league">
            <thead>
              <tr>
                <th>채널</th>
                <th>방문</th>
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
              {rows.map((r) => (
                <tr key={r.channel}>
                  <td>{r.channel}</td>
                  <td>{fmt(r.visits)}</td>
                  <td>{fmt(r.clicks)}</td>
                  <td>{fmt(r.orders)}</td>
                  <td>{fmt(r.revenue)}</td>
                  <td>{fmt(r.spend)}</td>
                  <td>{pct(r.ROAS,1)}</td>
                  <td>{fmt(r.CPA)}</td>
                  <td>{pct(r.CTR,1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

// app/(tabs)/growth/page.tsx
'use client'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvRow, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import ScrollWrap from '../../_components/ScrollWrap'

// ⬇️ 추가: 캐시형 파서 + Pager
import { parseCsvCached } from '../../_lib/csvSafe'
import Pager from '../../_components/Pager'

type Agg = {
  channel: string
  visits: number
  clicks: number
  spend: number
  orders: number
  revenue: number
}

export default function Growth() {
  const raw = readCsvLS('kpi_daily') || ''

  // ⬇️ 교체: 기존 parseCsv → 캐시형 파서로
  // const data: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])
  const data: CsvTable = useMemo(() => parseCsvCached('kpi_daily'), [raw])

  // 채널별 집계
  const by: Record<string, Agg> = {}
  for (const r of data.rows as CsvRow[]) {
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

  // 표용 리스트 (지표 계산)
  const rows = Object.values(by)
    .map((o) => {
      const ROAS = o.spend ? o.revenue / o.spend : 0
      const CPA = o.orders ? o.spend / o.orders : 0
      const CTR = o.visits ? o.clicks / o.visits : 0
      return { ...o, ROAS, CPA, CTR }
    })
    .sort((a, b) => b.ROAS - a.ROAS)

  // 퍼센트 문자열(소수 1자리)
  const pct1 = (v: number) => pct(v, 1)

  return (
    <div className="page">
      <h1>채널 리그(ROAS/CPA/CTR)</h1>

      {rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        // ⬇️ 표 전체를 Pager로 감싸 페이징 (DOM 폭주 방지)
        <Pager data={rows} pageSize={50} render={(page) => (
          <ScrollWrap>
            <table className="table">
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
                {page.map((r) => (
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
        )} />
      )}
    </div>
  )
}

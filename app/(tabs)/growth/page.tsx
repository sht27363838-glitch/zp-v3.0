// app/(tabs)/growth/page.tsx
'use client'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvRow, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import ScrollWrap from '../../_components/ScrollWrap'
import ErrorBanner from '../../_components/ErrorBanner'

// ⬇️ 캐시 파서 & 페이저가 실제로 존재할 때만 사용
// (없다면 두 줄 import 를 지우고, 아래 useMemo/JSX 주석의 "대체안"을 쓰세요)
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

  // ⬇️ 캐시형 파서 사용 (없으면 아래 주석 해제해 대체안 사용)
  const data: CsvTable = useMemo(() => parseCsvCached('kpi_daily'), [raw])
  // 🔁 대체안:
  // const data: CsvTable = useMemo(
  //   () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
  //   [raw]
  // )

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
    o.visits  += num(r.visits)
    o.clicks  += num(r.clicks)
    o.spend   += num(r.ad_cost)
    o.orders  += num(r.orders)
    o.revenue += num(r.revenue)
  }

  // 표용 리스트 (지표 계산)
  const rows = Object.values(by)
    .map((o) => {
      const ROAS = o.spend ? o.revenue / o.spend : 0
      const CPA  = o.orders ? o.spend / o.orders : 0
      const CTR  = o.visits ? o.clicks / o.visits : 0
      return { ...o, ROAS, CPA, CTR }
    })
    .sort((a, b) => b.ROAS - a.ROAS)

  // 퍼센트 문자열(소수 1자리)
  const pct1 = (v: number) => pct(v, 1)

  return (
    <div className="page">
      <h1>채널 리그(ROAS/CPA/CTR)</h1>

      {rows.length === 0 ? (
        <>
          <div className="skeleton" />
          <ErrorBanner
            tone="info"
            title="데이터 없음"
            message="kpi_daily.csv가 비어 있습니다. Tools에서 데모 업로드 후 확인하세요."
          />
        </>
      ) : (
        // ⬇️ Pager가 있을 때
        <Pager
          data={rows}
          pageSize={50}
          render={(page) => (
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
          )}
        />

        // 🔁 Pager가 없다면, 위 Pager 블록 대신 아래 대체안을 사용:
        // <ScrollWrap>
        //   <table className="table"> ... rows.map(...) ... </table>
        // </ScrollWrap>
      )}
    </div>
  )
}

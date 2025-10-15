// app/(tabs)/growth/page.tsx
'use client'

import React, { useMemo } from 'react'
import { readCsvOrDemo, parseCsv, type CsvRow, type CsvTable } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'
import ErrorBanner from '@cmp/ErrorBanner'
import { validate } from '@lib/csvSafe'

export default function Growth() {
  const raw = readCsvOrDemo('kpi_daily')
  const data: CsvTable = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
    [raw]
  )
  const check = validate('kpi_daily', data)

  type Agg = {
    channel: string
    visits: number
    clicks: number
    spend: number
    orders: number
    revenue: number
  }
  const by: Record<string, Agg> = {}
  for (const r of data.rows as CsvRow[]) {
    const ch = (r.channel as string) || 'unknown'
    const o =
      (by[ch] ||= { channel: ch, visits: 0, clicks: 0, spend: 0, orders: 0, revenue: 0 })
    o.visits += num(r.visits)
    o.clicks += num(r.clicks)
    o.spend += num(r.ad_cost)
    o.orders += num(r.orders)
    o.revenue += num(r.revenue)
  }

  const rows = Object.values(by)
    .map((o) => {
      const ROAS = o.spend ? o.revenue / o.spend : 0
      const CPA = o.orders ? o.spend / o.orders : 0
      const CTR = o.visits ? o.clicks / o.visits : 0
      return { ...o, ROAS, CPA, CTR }
    })
    .sort((a, b) => b.ROAS - a.ROAS)

  const pct1 = (v: number) => pct(v, 1)

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1>채널 리그(ROAS/CPA/CTR)</h1>
        <ExportBar selector="#growth-table" />
      </div>

      {!check.ok && (
        <ErrorBanner
          tone="warn"
          title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`}
          show
        />
      )}

      {rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div id="growth-table" style={{ marginTop: 12 }}>
          <VirtualTable
            className="table"
            rows={rows}
            // height/rowHeight는 컴포넌트 API에 없을 수 있으니 제거(빌드 에러 방지)
            header={
              <>
                {/* 열 폭 고정: 숫자열은 넓게 */}
                <colgroup>
                  <col className="min" />   {/* 채널 */}
                  <col />                   {/* 방문 */}
                  <col />                   {/* 클릭 */}
                  <col />                   {/* 주문 */}
                  <col className="wide" />  {/* 매출 */}
                  <col className="wide" />  {/* 광고비 */}
                  <col />                   {/* ROAS */}
                  <col className="wide" />  {/* CPA */}
                  <col />                   {/* CTR */}
                </colgroup>
                <thead>
                  <tr>
                    <th>채널</th>
                    <th className="num">방문</th>
                    <th className="num">클릭</th>
                    <th className="num">주문</th>
                    <th className="num">매출</th>
                    <th className="num">광고비</th>
                    <th className="num">ROAS</th>
                    <th className="num">CPA</th>
                    <th className="num">CTR</th>
                  </tr>
                </thead>
              </>
            }
            rowKey={(r) => r.channel}
            renderRow={(r) => (
              <tr>
                <td>{r.channel}</td>
                <td className="num">{fmt(r.visits)}</td>
                <td className="num">{fmt(r.clicks)}</td>
                <td className="num">{fmt(r.orders)}</td>
                <td className="num">{fmt(r.revenue)}</td>
                <td className="num">{fmt(r.spend)}</td>
                <td className="num">{pct1(r.ROAS)}</td>
                <td className="num">{fmt(r.CPA)}</td>
                <td className="num">{pct1(r.CTR)}</td>
              </tr>
            )}
          />
        </div>
      )}
    </div>
  )
}

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
  const data: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])
  const check = validate('kpi_daily', data)

  type Agg = { channel: string; visits: number; clicks: number; spend: number; orders: number; revenue: number }
  const by: Record<string, Agg> = {}
  for (const r of data.rows as CsvRow[]) {
    const ch = (r.channel as string) || 'unknown'
    const o = (by[ch] ||= { channel: ch, visits: 0, clicks: 0, spend: 0, orders: 0, revenue: 0 })
    o.visits  += num(r.visits)
    o.clicks  += num(r.clicks)
    o.spend   += num(r.ad_cost)
    o.orders  += num(r.orders)
    o.revenue += num(r.revenue)
  }

  const rows = Object.values(by)
    .map(o => {
      const ROAS = o.spend ? o.revenue / o.spend : 0
      const CPA  = o.orders ? o.spend / o.orders : 0
      const CTR  = o.visits ? o.clicks / o.visits : 0
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
            height={420}
            rowHeight={40}
            rowKey={(r) => (r as any).channel}
            columns={[
              { key: 'channel', header: '채널',   width: 140,                        sortable: true },
              { key: 'visits',  header: '방문',   width: 110, className: 'num',      sortable: true, render: r => fmt((r as any).visits) },
              { key: 'clicks',  header: '클릭',   width: 110, className: 'num',      sortable: true, render: r => fmt((r as any).clicks) },
              { key: 'orders',  header: '주문',   width: 110, className: 'num',      sortable: true, render: r => fmt((r as any).orders) },
              { key: 'revenue', header: '매출',   width: 130, className: 'num',      sortable: true, render: r => fmt((r as any).revenue) },
              { key: 'spend',   header: '광고비', width: 130, className: 'num',      sortable: true, render: r => fmt((r as any).spend) },
              { key: 'ROAS',    header: 'ROAS',   width: 110, className: 'num',      sortable: true, render: r => pct1((r as any).ROAS) },
              { key: 'CPA',     header: 'CPA',    width: 130, className: 'num',      sortable: true, render: r => fmt((r as any).CPA) },
              { key: 'CTR',     header: 'CTR',    width: 110, className: 'num',      sortable: true, render: r => pct1((r as any).CTR) },
            ]}
          />
        </div>
      )}
    </div>
  )
}

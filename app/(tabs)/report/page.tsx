'use client'

import React, { useMemo } from 'react'
import { sourceTag, readCsvOrDemo, validate } from '@lib/csvSafe'
import { parseCsv, type CsvRow } from '@lib/readCsv'
import { num, fmt } from '@lib/num'
import KpiTile from '@cmp/KpiTile'
import ErrorBanner from '@cmp/ErrorBanner'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'

const pct1 = (v:number)=> `${(v*100).toFixed(1)}%`

function readLastMonthProfit(): number {
  const raw = readCsvOrDemo('settings') || ''
  if (!raw) return 1_000_000
  try {
    const rows = parseCsv(raw).rows as any[]
    const p = Number(rows?.[0]?.last_month_profit ?? 0)
    return isFinite(p) && p > 0 ? p : 1_000_000
  } catch { return 1_000_000 }
}

export default function ReportPage(){
  const raw  = readCsvOrDemo('kpi_daily')
  const data = useMemo(()=> parseCsv(raw), [raw])
  const check = validate('kpi_daily', data)

  let visits=0, clicks=0, orders=0, revenue=0, adCost=0, returns=0
  for(const r of data.rows as CsvRow[]){
    visits += num(r.visits);  clicks += num(r.clicks); orders += num(r.orders)
    revenue += num(r.revenue); adCost += num(r.ad_cost); returns += num(r.returns)
  }
  const ROAS = adCost ? revenue / adCost : 0
  const CR   = visits ? orders / visits : 0
  const AOV  = orders ? revenue / orders : 0
  const returnsRate = orders ? returns / orders : 0
  const lastMonthProfit = readLastMonthProfit()

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>지휘소(C0) — 요약</h1>
        <ExportBar selector=".kpi-grid" />
        <span className="badge">{sourceTag('kpi_daily')}</span>
      </div>

      {!check.ok && (
        <ErrorBanner tone="warn" title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`} show />
      )}

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      <h2 className="mb-2" style={{ marginTop: 16 }}>최근 지표 표</h2>
      <ExportBar selector="#report-table" />

      {(data.rows as CsvRow[]).length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div id="report-table">
          <VirtualTable<CsvRow>
            className="table"
            rows={(data.rows as CsvRow[]).slice(-500).reverse()}
            height={480}
            rowHeight={40}
            rowKey={(r, i)=> `${String(r.date ?? '')}-${String(r.channel ?? '')}-${i}`}
            columns={[
              { key: 'date',    header: '날짜',  width: 120, render: r => String(r.date ?? '') },
              { key: 'channel', header: '채널',  width: 140, render: r => String(r.channel ?? '') },
              { key: 'visits',  header: '방문',  className:'num', width: 110, render: r => fmt(r.visits) },
              { key: 'clicks',  header: '클릭',  className:'num', width: 110, render: r => fmt(r.clicks) },
              { key: 'orders',  header: '주문',  className:'num', width: 110, render: r => fmt(r.orders) },
              { key: 'revenue', header: '매출',  className:'num', width: 130, render: r => fmt(r.revenue) },
              { key: 'ad_cost', header: '광고비', className:'num', width: 130, render: r => fmt(r.ad_cost) },
              { key: 'returns', header: '반품',  className:'num', width: 110, render: r => fmt(r.returns) },
            ]}
          />
        </div>
      )}

      <div style={{marginTop:16, opacity:.8}}>
        <p className="text-sm">데이터 원본: <code>kpi_daily.csv</code></p>
      </div>
    </div>
  )
}

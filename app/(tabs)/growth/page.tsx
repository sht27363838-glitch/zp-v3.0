// app/(tabs)/growth/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { readCsvOrDemo, parseCsv, type CsvRow, type CsvTable } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'
import ErrorBanner from '@cmp/ErrorBanner'
import { validate } from '@lib/csvSafe'
import Modal from '@cmp/Modal'
import Spark from '@cmp/Spark'

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

  // ===== 드릴다운 상태 =====
  const [open, setOpen] = useState(false)
  const [ch, setCh] = useState<string>('')

  const last30ByChannel = useMemo(() => {
    if (!ch) return []
    // 날짜 오름차순 정렬 후 최근 30일 필터 → revenue 시리즈
    const all = (data.rows as CsvRow[])
      .filter(r => String(r.channel || '') === ch)
      .slice()
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
    const last30 = all.slice(-30)
    return last30.map(r => num(r.revenue))
  }, [data.rows, ch])

  const chSummary = useMemo(() => {
    if (!ch) return { rev: 0, orders: 0, spend: 0, roas: 0 }
    let rev=0, orders=0, spend=0
    for (const r of data.rows as CsvRow[]) {
      if (String(r.channel || '') !== ch) continue
      rev += num(r.revenue); orders += num(r.orders); spend += num(r.ad_cost)
    }
    return { rev, orders, spend, roas: spend ? rev/spend : 0 }
  }, [data.rows, ch])

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
              {
                key: 'channel',
                header: '채널',
                width: 140,
                sortable: true,
                render: (r:any) => (
                  <button
                    className="btn"
                    style={{ padding:'4px 8px', background:'transparent', border:'var(--border)' }}
                    onClick={() => { setCh(r.channel); setOpen(true) }}
                  >
                    {r.channel}
                  </button>
                ),
              },
              { key: 'visits',  header: '방문',   className: 'num', width: 110, sortable: true, render: (r:any)=> fmt(r.visits) },
              { key: 'clicks',  header: '클릭',   className: 'num', width: 110, sortable: true, render: (r:any)=> fmt(r.clicks) },
              { key: 'orders',  header: '주문',   className: 'num', width: 110, sortable: true, render: (r:any)=> fmt(r.orders) },
              { key: 'revenue', header: '매출',   className: 'num', width: 130, sortable: true, render: (r:any)=> fmt(r.revenue) },
              { key: 'spend',   header: '광고비', className: 'num', width: 130, sortable: true, render: (r:any)=> fmt(r.spend) },
              { key: 'ROAS',    header: 'ROAS',   className: 'num', width: 110, sortable: true, render: (r:any)=> pct1(r.ROAS) },
              { key: 'CPA',     header: 'CPA',    className: 'num', width: 130, sortable: true, render: (r:any)=> fmt(r.CPA) },
              { key: 'CTR',     header: 'CTR',    className: 'num', width: 110, sortable: true, render: (r:any)=> pct1(r.CTR) },
            ]}
          />
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title={`드릴다운 — ${ch}`}>
        <div className="row" style={{ gap:16, alignItems:'center', marginBottom:8 }}>
          <span className="badge">매출 {fmt(chSummary.rev)}</span>
          <span className="badge">주문 {fmt(chSummary.orders)}</span>
          <span className="badge">ROAS {(chSummary.roas||0).toFixed(2)}</span>
        </div>
        <Spark series={last30ByChannel} width={620} height={120}/>
      </Modal>
    </div>
  )
}


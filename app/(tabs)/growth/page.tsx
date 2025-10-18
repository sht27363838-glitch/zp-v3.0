// app/(tabs)/growth/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { readCsvOrDemo, parseCsv, type CsvRow, type CsvTable } from '@lib/readCsv'
import { validate } from '@lib/csvSafe'
import { num, fmt, pct } from '@lib/num'
import ExportBar from '@cmp/ExportBar'
import ErrorBanner from '@cmp/ErrorBanner'
import VirtualTable from '@cmp/VirtualTable'

export default function Growth() {
  // 원본 로드/검증
  const raw = readCsvOrDemo('kpi_daily')
  const data: CsvTable = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
    [raw]
  )
  const check = validate('kpi_daily', data)

  // ===== 필터 상태 =====
  const [query, setQuery] = useState('')                 // 채널/자유 검색
  const [sel, setSel]   = useState<Set<string>>(new Set()) // 선택 채널 (비어있으면 전체)

  // 유니크 채널
  const channels = useMemo(()=>{
    const s = new Set<string>()
    for (const r of data.rows as CsvRow[]) s.add(String(r.channel||'').trim() || 'unknown')
    return Array.from(s).sort()
  }, [data.rows])

  // 최근 500건(최신 우선) → 필터
  const baseRows = useMemo(
    ()=> (data.rows as CsvRow[]).slice(-500).reverse(),
    [data.rows]
  )

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return baseRows.filter(r=>{
      const ch = String(r.channel||'').trim()
      if (q && !(ch.toLowerCase().includes(q))) return false
      if (sel.size>0 && !sel.has(ch)) return false
      return true
    })
  },[baseRows, query, sel])

  // 채널 토글 핸들러
  const toggleChannel = (ch:string)=>{
    setSel(prev=>{
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch); else next.add(ch)
      return next
    })
  }
  const clearFilters = ()=>{ setQuery(''); setSel(new Set()) }

  // ===== 집계(필터 결과 기반) =====
  type Agg = { channel: string; visits: number; clicks: number; spend: number; orders: number; revenue: number }
  const by: Record<string, Agg> = {}
  for (const r of filtered as CsvRow[]) {
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
      {/* 제목 + 내보내기 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1>채널 리그(ROAS/CPA/CTR)</h1>
        <ExportBar selector="#growth-table" />
      </div>

      {/* 스키마 검증 경고 */}
      {!check.ok && (
        <ErrorBanner
          tone="warn"
          title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`}
          show
        />
      )}

      {/* ===== 필터 바 ===== */}
      <div className="card" style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', margin:'12px 0'}}>
        <div className="row" style={{gap:6, flexWrap:'wrap'}}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="채널 검색"
            style={{padding:'8px 10px', borderRadius:8, border:'var(--border)', background:'transparent', color:'var(--text)'}}
          />
          <button className="btn" onClick={clearFilters}>필터 초기화</button>
        </div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', alignItems:'center'}}>
          {channels.map(ch=>{
            const on = sel.has(ch)
            return (
              <button
                key={ch}
                className="badge"
                onClick={()=>toggleChannel(ch)}
                style={{
                  cursor:'pointer',
                  borderColor: on? 'var(--primary)' : 'rgba(255,255,255,.12)',
                  background: on? 'rgba(79,227,193,.12)' : 'rgba(255,255,255,.06)'
                }}
                aria-pressed={on}
              >
                {ch}
              </button>
            )
          })}
          {channels.length>0 && (
            <button className="badge" onClick={()=>setSel(new Set())} style={{cursor:'pointer'}}>전체</button>
          )}
          <span className="muted" style={{marginLeft:'auto'}}>표시 {rows.length} / {Object.keys(by).length || 0} 채널</span>
        </div>
      </div>

      {/* ===== 표 ===== */}
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
              { key: 'channel', header: '채널',   width: 140, sortable: true },
              { key: 'visits',  header: '방문',   className: 'num', width: 110, sortable: true, render: r => fmt((r as any).visits) },
              { key: 'clicks',  header: '클릭',   className: 'num', width: 110, sortable: true, render: r => fmt((r as any).clicks) },
              { key: 'orders',  header: '주문',   className: 'num', width: 110, sortable: true, render: r => fmt((r as any).orders) },
              { key: 'revenue', header: '매출',   className: 'num', width: 130, sortable: true, render: r => fmt((r as any).revenue) },
              { key: 'spend',   header: '광고비', className: 'num', width: 130, sortable: true, render: r => fmt((r as any).spend) },
              { key: 'ROAS',    header: 'ROAS',   className: 'num', width: 110, sortable: true, render: r => pct1((r as any).ROAS) },
              { key: 'CPA',     header: 'CPA',    className: 'num', width: 130, sortable: true, render: r => fmt((r as any).CPA) },
              { key: 'CTR',     header: 'CTR',    className: 'num', width: 110, sortable: true, render: r => pct1((r as any).CTR) },
            ]}
          />
        </div>
      )}
    </div>
  )
}

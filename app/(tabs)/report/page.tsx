// app/(tabs)/report/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
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
  // 원본 로드/검증
  const raw  = readCsvOrDemo('kpi_daily')
  const data = useMemo(()=> parseCsv(raw), [raw])
  const check = validate('kpi_daily', data)

  // KPI 합계
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

  // ===== 필터 상태 =====
  const [query, setQuery] = useState('')          // 채널/자유 검색
  const [from, setFrom]   = useState('')          // YYYY-MM-DD
  const [to, setTo]       = useState('')
  const [sel, setSel]     = useState<Set<string>>(new Set()) // 선택 채널 (비어있으면 전체)

  // 유니크 채널
  const channels = useMemo(()=>{
    const s = new Set<string>()
    for(const r of data.rows as CsvRow[]) s.add(String(r.channel||'').trim() || 'unknown')
    return Array.from(s).sort()
  },[data.rows])

  // 최근 500건(최신 우선) → 필터
  const baseRows = useMemo(
    ()=> (data.rows as CsvRow[]).slice(-500).reverse(),
    [data.rows]
  )

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return baseRows.filter(r=>{
      const d = String(r.date||'')
      const ch = String(r.channel||'').trim()
      if (from && d < from) return false
      if (to && d > to) return false
      if (q && !(ch.toLowerCase().includes(q))) return false
      if (sel.size>0 && !sel.has(ch)) return false
      return true
    })
  },[baseRows, query, from, to, sel])

  const toggleChannel = (ch:string)=>{
    setSel(prev=>{
      const next = new Set(prev)
      if(next.has(ch)) next.delete(ch); else next.add(ch)
      return next
    })
  }
  const clearFilters = ()=>{
    setQuery(''); setFrom(''); setTo(''); setSel(new Set())
  }

  return (
    <div className="page">
      {/* 제목 + 전체 KPI 캡처용 ExportBar + 데이터 소스 배지 */}
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>지휘소(C0) — 요약</h1>
        <ExportBar selector=".kpi-grid" />
        <span className="badge">{sourceTag('kpi_daily')}</span>
      </div>

      {/* 스키마 검증 결과(누락 컬럼 안내) */}
      {!check.ok && (
        <ErrorBanner
          tone="warn"
          title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`}
          show
        />
      )}

      {/* KPI 그리드 */}
      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      {/* 표 섹션 */}
      <h2 className="mb-2" style={{ marginTop: 16 }}>최근 지표 표</h2>

      {/* ===== 필터 바 ===== */}
      <div className="card" style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:10}}>
        <div className="row" style={{gap:6, flexWrap:'wrap'}}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="채널 검색"
            style={{padding:'8px 10px', borderRadius:8, border:'var(--border)', background:'transparent', color:'var(--text)'}}
          />
          <input
            type="date" value={from}
            onChange={e=>setFrom(e.target.value)}
            style={{padding:'8px 10px', borderRadius:8, border:'var(--border)', background:'transparent', color:'var(--text)'}}
          />
          <span className="muted">~</span>
          <input
            type="date" value={to}
            onChange={e=>setTo(e.target.value)}
            style={{padding:'8px 10px', borderRadius:8, border:'var(--border)', background:'transparent', color:'var(--text)'}}
          />
          <button className="btn" onClick={clearFilters}>필터 초기화</button>
          <ExportBar selector="#report-table" /> {/* 표만 내보내기 */}
        </div>

        {/* 채널 토글 */}
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
          <span className="muted" style={{marginLeft:'auto'}}>표시 {filtered.length} / {baseRows.length}건</span>
        </div>
      </div>

      {/* ===== 테이블 ===== */}
      {filtered.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div id="report-table">
          <VirtualTable<CsvRow>
            className="table"
            rows={filtered}
            height={480}
            rowHeight={40}
            rowKey={(r, i)=> `${String(r.date ?? '')}-${String(r.channel ?? '')}-${i}`}
            columns={[
              { key: 'date',    header: '날짜',   width: 120,                            sortable: true, render: r => String(r.date ?? '') },
              { key: 'channel', header: '채널',   width: 140,                            sortable: true, render: r => String(r.channel ?? '') },
              { key: 'visits',  header: '방문',   width: 110, className:'num',           sortable: true, render: r => fmt(r.visits) },
              { key: 'clicks',  header: '클릭',   width: 110, className:'num',           sortable: true, render: r => fmt(r.clicks) },
              { key: 'orders',  header: '주문',   width: 110, className:'num',           sortable: true, render: r => fmt(r.orders) },
              { key: 'revenue', header: '매출',   width: 130, className:'num',           sortable: true, render: r => fmt(r.revenue) },
              { key: 'ad_cost', header: '광고비', width: 130, className:'num',           sortable: true, render: r => fmt(r.ad_cost) },
              { key: 'returns', header: '반품',   width: 110, className:'num',           sortable: true, render: r => fmt(r.returns) },
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

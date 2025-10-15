// app/(tabs)/commerce/page.tsx
'use client'

import React, { useMemo, useState, useDeferredValue } from 'react'
import { readCsvOrDemo } from '@lib/readCsv'
import { parseCsv, type CsvTable } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import useIdle from '@lib/useIdle'
import CohortSpark from '@cmp/CohortSpark'
import LtvCurve from '@cmp/LtvCurve'
import ExportBar from '@cmp/ExportBar'

type Row = Record<string, any>

export default function Commerce() {
  // 데모 대체 로더
  const raw = readCsvOrDemo('kpi_daily')
  const tbl: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])
  const rows = (tbl.rows as Row[]) || []

  // AOV 워터폴 (가벼움)
  const aovData = useMemo(() => {
    let carts = 0, orders = 0, revenue = 0
    for (const r of rows) { carts += num(r.carts); orders += num(r.orders); revenue += num(r.revenue) }
    return { carts, orders, revenue, aov: orders ? revenue / orders : 0 }
  }, [rows])

  // 지연 렌더링
  const idleReady = useIdle(500)
  const deferredRows = useDeferredValue(rows)

  // 히트맵 보조
  const [focus, setFocus] = useState<{ prod: string; ch: string } | null>(null)
  const xcats = useMemo(() => Array.from(new Set(rows.map(r => r.channel || 'unknown'))), [rows])
  const prods = useMemo(() => Array.from(new Set(rows.map(r => r.product || r.sku || 'generic'))), [rows])

  function cellValue(prod: string, ch: string) {
    let clicks = 0, orders = 0
    for (const r of rows) {
      if ((r.channel || 'unknown') === ch && (r.product || r.sku || 'generic') === prod) {
        clicks += num(r.clicks); orders += num(r.orders)
      }
    }
    return { clicks, orders, cr: clicks ? orders / Math.max(1, clicks) : 0 }
  }

  // 코호트/LTV
  const cohort = useMemo(() => {
    const weeks = 8
    return Array.from({ length: weeks }, (_, i) => {
      let s = 0; for (const r of rows) if ((num(r.week_index) || 0) === i) s += num(r.orders)
      return s
    })
  }, [rows])

  const cum = useMemo(() => { let s = 0; return cohort.map(v => (s += Number(v) || 0)) }, [cohort])

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1>C2 — 전환/커머스 레이더</h1>
        <ExportBar selector="#commerce-cards" />
      </div>

      <div id="commerce-cards" className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <b>AOV 워터폴</b>
            <span className="badge">{fmt(aovData.aov)} / 주문</span>
          </div>
          <div className="waterfall" style={{ display: 'flex', gap: 12 }}>
            {[
              { label: '장바구니', val: aovData.carts },
              { label: '주문', val: aovData.orders },
              { label: '매출', val: aovData.revenue },
            ].map((s, i) => (
              <div
                key={i}
                className="wf-seg"
                title={`${s.label}: ${fmt(s.val)}`}
                style={{
                  flex: 1, background: 'var(--panel)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow)', padding: 'var(--pad)'
                }}
              >
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontWeight: 700 }}>{fmt(s.val)}</div>
              </div>
            ))}
          </div>
        </div>

        {!idleReady ? (
          <div className="skeleton" style={{ height: 180 }} />
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
            <div className="card">
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>코호트(주간)</div>
              <CohortSpark series={cohort} />
            </div>
            <LtvCurve cum={cum} />
          </div>
        )}
      </div>

      {!idleReady ? (
        <div className="skeleton" style={{ height: 260, marginTop: 'var(--gap)' }} />
      ) : (
        <div className="card" style={{ marginTop: 'var(--gap)' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <b>상품 × 소스 히트맵 (CR)</b>
            {focus && <span className="badge">{focus.prod} / {focus.ch} — 클릭하면 상세</span>}
          </div>
          <div className="scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>상품 \ 소스</th>
                  {xcats.map(ch => <th key={ch}>{ch}</th>)}
                </tr>
              </thead>
              <tbody>
                {prods.map(p => (
                  <tr key={p}>
                    <td><b>{p}</b></td>
                    {xcats.map(ch => {
                      const v = cellValue(p, ch)
                      const heat = Math.min(1, v.cr * 3)
                      return (
                        <td key={ch}>
                          <button
                            className="cell"
                            onClick={() => setFocus({ prod: p, ch })}
                            aria-label={`CR ${pct(v.cr)} / 주문 ${fmt(v.orders)} / 클릭 ${fmt(v.clicks)}`}
                            style={{
                              width: '100%', padding: '8px',
                              background: `rgba(79,227,193,${0.08 + 0.35 * heat})`,
                              borderRadius: 8
                            }}
                          >
                            {pct(v.cr)}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {focus && (
            <div className="modal" onClick={() => setFocus(null)}>
              <div className="modal-body" onClick={e => e.stopPropagation()}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>{focus.prod} / {focus.ch}</b>
                  <button className="btn" onClick={() => setFocus(null)}>닫기</button>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>최근 추이</div>
                <CohortSpark
                  series={
                    deferredRows
                      .filter(r => (r.channel || 'unknown') === focus.ch && (r.product || r.sku || 'generic') === focus.prod)
                      .slice(-20)
                      .map(r => (num(r.orders) && num(r.clicks)) ? num(r.orders) / Math.max(1, num(r.clicks)) : 0)
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

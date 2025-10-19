'use client'

import React, { useMemo } from 'react'
import ExportBar from '@cmp/ExportBar'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv } from '@lib/readCsv'
import { fmt } from '@lib/num'

type Row = { date?: string; stable?: number; edge?: number; note?: string }

export default function RewardPage() {
  // ledger.csv 로드 (없으면 데모가 주입되어 있을 수 있음)
  const raw = readCsvOrDemo('ledger') || ''
  const rows = useMemo(() => {
    if (!raw) return [] as Row[]
    const { rows } = parseCsv(raw)
    return (rows as any[]).map(r => ({
      date: String(r.date ?? ''),
      stable: Number(r.stable ?? r.stable_reward ?? 0),
      edge: Number(r.edge ?? r.edge_reward ?? 0),
      note: String(r.note ?? ''),
    }))
  }, [raw])

  const sum = (k: keyof Row) => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0)
  const stableTotal = sum('stable')
  const edgeTotal = sum('edge')
  const total = stableTotal + edgeTotal
  const edgeRatio = total ? edgeTotal / total : 0

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <h1>C4 — 보상 엔진</h1>
        <ExportBar selector="#reward-section" />
        <span className="badge">DEMO</span>
      </div>

      <div id="reward-section" className="kpi-grid" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="muted">안정(Stable) 누적</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(stableTotal)}</div>
        </div>
        <div className="card">
          <div className="muted">엣지(Edge) 누적</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(edgeTotal)}</div>
        </div>
        <div className="card">
          <div className="muted">엣지 비중</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{(edgeRatio * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="muted" style={{ marginBottom: 8 }}>※ 최근 50건</div>
        {rows.length === 0 ? (
          <div className="skeleton" />
        ) : (
          <table className="table" style={{ width: '100%' }}>
            <colgroup>
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>일자</th>
                <th className="num">Stable</th>
                <th className="num">Edge</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(-50).reverse().map((r, i) => (
                <tr key={`${r.date}-${i}`}>
                  <td>{r.date}</td>
                  <td className="num">{fmt(r.stable)}</td>
                  <td className="num">{fmt(r.edge)}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

'use client'
import React, { useMemo } from 'react'
import ExportBar from '@cmp/ExportBar'
import { readCsvOrDemo, parseCsv } from '@lib/readCsv'
import { fmt } from '@lib/num'

type LedgerRow = {
  date?: string; channel?: string; product?: string;
  credit?: number; debit?: number; reason?: string;
}

export default function RewardPage() {
  const raw = readCsvOrDemo('ledger') || ''
  const rows = useMemo<LedgerRow[]>(() => raw ? (parseCsv(raw).rows as any[]) : [], [raw])

  const totalCredit = rows.reduce((s,r)=> s + Number(r.credit ?? 0), 0)
  const totalDebit  = rows.reduce((s,r)=> s + Number(r.debit  ?? 0), 0)

  const Empty = (
    <div className="card" style={{padding:14, background:'color-mix(in oklab, var(--panel) 85%, transparent)'}}>
      <b>데이터가 없습니다.</b>
      <div className="muted" style={{marginTop:6}}>
        도구 탭에서 <b>“데모 Ledger 주입”</b>을 눌러 테스트 데이터를 채우거나,
        CSV를 붙여 넣어 주세요.
      </div>
    </div>
  )

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>C4 — 보상 엔진</h1>
        <ExportBar selector="#reward-cards" />
      </div>

      <div id="reward-cards" className="kpi-grid">
        <div className="card"><div>안정(Stable) 누적</div><h2>{fmt(totalCredit)}</h2></div>
        <div className="card"><div>엣지(Edge) 누적</div><h2>{fmt(totalDebit)}</h2></div>
        <div className="card"><div>엣지 비중</div><h2>{totalCredit ? ((totalDebit/totalCredit)*100).toFixed(1)+'%' : '0.0%'}</h2></div>
      </div>

      <div style={{marginTop:12}}>
        {rows.length === 0 ? (
          Empty
        ) : (
          <div className="card">
            <div className="muted" style={{marginBottom:8}}>※ 최근 50건</div>
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th><th>채널</th><th>상품</th>
                  <th className="num">Credit</th><th className="num">Debit</th><th>사유</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(-50).reverse().map((r,i)=>(
                  <tr key={i}>
                    <td>{String(r.date ?? '')}</td>
                    <td>{String(r.channel ?? '')}</td>
                    <td>{String(r.product ?? '')}</td>
                    <td className="num">{fmt(r.credit)}</td>
                    <td className="num">{fmt(r.debit)}</td>
                    <td>{String(r.reason ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}



'use client'
export const dynamic = 'force-dynamic'

import Pager from '../../_components/Pager' 
import React, { useMemo, useState } from 'react'   // ← useMemo, useState 추가/정리
import { readCsvLS, parseCsv } from '../../_lib/readCsv'
import { num, fmt } from '../../_lib/num'
import { loadRules, evalGuards } from '../../_lib/rules'
import { appendLedger, lastTimeKey, markTime } from '../../_lib/ledger'
import ScrollWrap from '../../_components/ScrollWrap'
import ErrorBanner from '../../_components/ErrorBanner'
import DownloadCsv from '../../_components/DownloadCsv'


export default function RewardsPage() {
  const raw = readCsvLS('ledger') || ''
  const data = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])

  let stable = 0, edge = 0
  for (const r of data.rows as any[]) {
    stable += num((r as any).stable)
    edge   += num((r as any).edge)
  }
  const total = stable + edge
  const edgeShare = total ? edge / total : 0

  const kraw = readCsvLS('kpi_daily') || ''
  const kdata = useMemo(() => (kraw ? parseCsv(kraw) : { headers: [], rows: [] }), [kraw])
  let visits = 0, clicks = 0, orders = 0, revenue = 0, adCost = 0, returns = 0
  for (const r of kdata.rows as any[]) {
    visits  += num((r as any).visits)
    clicks  += num((r as any).clicks)
    orders  += num((r as any).orders)
    revenue += num((r as any).revenue)
    adCost  += num((r as any).ad_cost)
    returns += num((r as any).returns)
  }
  const CTR = visits ? clicks / visits : 0

  const rules = loadRules()
  const guards = evalGuards(
    { revenue, ad_cost: adCost, orders, visits, returns, ctr: CTR, freq: undefined },
    rules
  )

  const cooldownKey = 'dailyLoop.last'
  const last = lastTimeKey(cooldownKey)
  const canClick = Date.now() - last > (rules.triggers.dailyLoop.cooldownH * 3600_000)

  const [loading, setLoading] = useState(false)
  async function payoutDaily() {
    if (!canClick || loading) return
    try {
      setLoading(true)
      const lastMonthProfit = 1_000_000
      const cut = guards.returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
      const s = (rules.triggers.dailyLoop.stablePct / 100) * lastMonthProfit * cut
      const e = guards.adFatigue ? 0 : (rules.triggers.dailyLoop.edgePct / 100) * lastMonthProfit * cut
      appendLedger({
        date: new Date().toISOString().slice(0, 10),
        mission: 'Daily Loop',
        type: 'daily',
        stable: s, edge: e,
        note: guards.adFatigue ? 'EDGE LOCK' : (guards.returnsHigh ? 'PAYOUT CUT' : ''),
        lock_until: ''
      })
      markTime(cooldownKey)
      alert('✅ 보상 기록 완료 (일일)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pad">
      <h2 className="title">C4 — 보상 엔진</h2>

      <div className="row gap">
        <div className="card">
          <div className="label">안정(Stable) 누적</div>
          <div className="value">{fmt(stable)}</div>
        </div>
        <div className="card">
          <div className="label">엣지(Edge) 누적</div>
          <div className="value">{fmt(edge)}</div>
        </div>
        <div className="card">
          <div className="label">엣지 비중</div>
          <div className="value">{(edgeShare * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="row gap mt-4">
        <button
          className="btn primary"
          disabled={!canClick || loading}
          style={{ opacity: loading ? 0.6 : 1 }}
          onClick={payoutDaily}
        >
          {loading ? '처리 중…' : '보상 기록(일일)'}
        </button>
        {guards.adFatigue && <span className="badge warn">엣지 잠금</span>}
        {guards.returnsHigh && <span className="badge danger">보상 감액</span>}
      </div>

      <div className="mt-6">
        <div className="row" style={{ gap: 8, margin: '8px 0' }}>
          <DownloadCsv keyName="ledger" label="ledger.csv 다운로드" />
        </div>

        {data.rows.length === 0 && (
          <ErrorBanner
            tone="info"
            title="기록 없음"
            message="아직 ledger가 비어 있습니다. 상단 '보상 기록(일일)'로 기록을 남겨보세요."
          />
        )}

        {data.rows.length === 0 ? (
          <div className="skeleton" />
        ) : (
          <Pager data={rows} pageSize={50} render={(page)=>(
  <ScrollWrap>
    <table className="table">
      <thead>
        <tr>
          <th>채널</th><th>방문</th><th>클릭</th><th>주문</th>
          <th>매출</th><th>광고비</th><th>ROAS</th><th>CPA</th><th>CTR</th>
        </tr>
      </thead>
      <tbody>
        {page.map((r)=>(
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
)}/>
}

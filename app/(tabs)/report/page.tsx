// app/(tabs)/report/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import { loadRules, evalGuards } from '../../_lib/rules'
import { appendLedger, lastTimeKey, markTime } from '../../_lib/ledger'
import KpiTile from '../../_components/KpiTile'

function getSettingsProfit(): number {
  const raw = readCsvLS('settings') || ''
  if (!raw) return 1_000_000
  const data: CsvTable = parseCsv(raw)
  const row = data.rows?.[0] as any
  const p = Number(row?.last_month_profit ?? 0)
  return isFinite(p) && p > 0 ? p : 1_000_000
}

export default function Report() {
  const raw = readCsvLS('kpi_daily') || ''
  const data: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])

  let visits = 0, clicks = 0, orders = 0, revenue = 0, adCost = 0, returns = 0
  for (const r of data.rows) {
    visits += num((r as any).visits)
    clicks += num((r as any).clicks)
    orders += num((r as any).orders)
    revenue += num((r as any).revenue)
    adCost += num((r as any).ad_cost)
    returns += num((r as any).returns)
  }

  const ROAS = adCost ? revenue / adCost : 0
  const CR = visits ? orders / visits : 0
  const AOV = orders ? revenue / orders : 0
  const returnsRate = orders ? returns / orders : 0

  const rules = loadRules()
  const guards = evalGuards(
    { revenue, ad_cost: adCost, orders, visits, returns, freq: undefined, ctr: visits ? clicks / visits : 0 },
    rules
  )

  const lastMonthProfit = getSettingsProfit()
  const cooldownKey = 'dailyLoop.last'
  const last = lastTimeKey(cooldownKey)
  const canClick = Date.now() - last > rules.triggers.dailyLoop.cooldownH * 3600_000

  function payoutDaily() {
    if (!canClick) return
    const cut = guards.returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
    const stable = (rules.triggers.dailyLoop.stablePct / 100) * lastMonthProfit * cut
    const edge = guards.adFatigue ? 0 : (rules.triggers.dailyLoop.edgePct / 100) * lastMonthProfit * cut
    appendLedger({
      date: new Date().toISOString().slice(0, 10),
      mission: 'Daily Loop',
      type: 'daily',
      stable, edge,
      note: guards.adFatigue ? 'EDGE LOCK' : (guards.returnsHigh ? 'PAYOUT CUT' : ''),
      lock_until: ''
    })
    markTime(cooldownKey)
    alert('✅ 보상 기록 완료 (일일)')
  }

  return (
    <div className="pad">
      <h2 className="title">지휘소 C0</h2>

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct(ROAS)} />
        <KpiTile label="전환율" value={pct(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct(returnsRate)} />
        <KpiTile label="광고비" value={fmt(adCost)} />
      </div>

      <div className="row gap">
        <button className="btn primary" disabled={!canClick} onClick={payoutDaily}>보상 기록(일일)</button>
        {guards.adFatigue && <span className="badge warn">엣지 잠금</span>}
        {guards.returnsHigh && <span className="badge danger">보상 감액</span>}
      </div>

      <div className="mt-4 text-dim text-sm">
        쿨다운: {canClick ? '지금 가능' : '대기 중'} · 기준수익(전월): {fmt(lastMonthProfit)}
      </div>
    </div>
  )
}

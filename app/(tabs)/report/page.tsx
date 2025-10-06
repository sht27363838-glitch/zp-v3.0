'use client'

import React, {useMemo} from 'react'
import { readCsvLS, parseCsv } from '../../_lib/readCsv'
import { num, fmt, pct, kfmt  } from '../../_lib/num'

import { loadRules, evalGuards } from '../../_lib/rules'
import { appendLedger, lastTimeKey, markTime } from '../../_lib/ledger'

// 간단 KPI 타일
function Tile({label, value, sub}:{label:string; value:string; sub?:string}){
  return (
    <div className="card">
      <div className="muted text-xs">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub? <div className="text-xs muted">{sub}</div>: null}
    </div>
  )
}

export default function Report(){
  if (typeof window === 'undefined') return null

  // kpi_daily 로드/파싱 (로컬스토리지)
  const raw = readCsvLS('kpi_daily') || ''
  const rows = useMemo(()=> raw? parseCsv(raw): [], [raw])

  // 합계
  let visits=0, clicks=0, orders=0, revenue=0, adCost=0, returns=0
  for(const r of rows){
    visits  += num(r.visits)
    clicks  += num(r.clicks)
    orders  += num(r.orders)
    revenue += num(r.revenue)
    adCost  += num(r.ad_cost)
    returns += num(r.returns)
  }
  const ROAS = adCost? (revenue/adCost) : 0
  const CR   = visits? (orders/visits) : 0
  const AOV  = orders? (revenue/orders) : 0
  const CTR  = visits? (clicks/visits) : 0

  // 보상/룰 평가에 필요한 입력
  const rules = loadRules()
  const guards = evalGuards({
    revenue, ad_cost: adCost, orders, visits, returns, ctr: CTR
  }, rules)

  // 전월 순익(설정) — Tools/Settings 에서 저장
  const lastMonthProfit = Number(localStorage.getItem('last_month_profit') || 0)

  // 일일 루프 쿨다운
  const cooldownKey = 'dailyLoop.last'
  const last = lastTimeKey(cooldownKey)
  const canDaily = Date.now() - last > rules.triggers.dailyLoop.cooldownH*3600_000

  function payoutDaily(){
    if(!canDaily) return
    const cut = guards.returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
    const stable = (rules.triggers.dailyLoop.stablePct/100) * lastMonthProfit * cut
    const edge   = guards.adFatigue ? 0 : ((rules.triggers.dailyLoop.edgePct/100) * lastMonthProfit * cut)
    appendLedger({
      date: new Date().toISOString().slice(0,10),
      mission:'Daily Loop', type:'daily',
      stable, edge,
      note: guards.adFatigue? 'EDGE LOCK' : (guards.returnsHigh? 'PAYOUT CUT' : ''),
      lock_until:''
    })
    markTime(cooldownKey)
    alert('보상이 기록되었습니다.')
  }

  // UI
  return (
    <div className="page">
      <h1 className="title">C0 · Command Center</h1>

      <div className="grid grid-2 gap-2">
        <Tile label="매출" value={fmt(revenue)} />
        <Tile label="ROAS" value={ROAS.toFixed(2)} />
        <Tile label="전환율" value={pct(CR)} />
        <Tile label="AOV" value={fmt(AOV)} />
        <Tile label="반품률" value={pct(orders? returns/orders : 0)} />
        <Tile label="CTR" value={pct(CTR)} />
      </div>

      {/* 이상치 배지 */}
      <div className="flex gap-2 mt-2">
        {guards.adFatigue && <span className="badge warn">광고 피로(CTR↓)</span>}
        {guards.returnsHigh && <span className="badge danger">반품률 경보</span>}
      </div>

      {/* 원클릭 보상 버튼 + 배지 */}
      <div className="flex items-center gap-3 mt-3">
        <button className="btn primary" disabled={!canDaily || !lastMonthProfit} onClick={payoutDaily}>
          보상 기록(일일)
        </button>
        {!lastMonthProfit && <span className="badge info">설정에서 전월 순익 입력 필요</span>}
        {guards.adFatigue && <span className="badge warn">엣지 잠금</span>}
        {guards.returnsHigh && <span className="badge danger">보상 감액</span>}
      </div>

      <div className="card mt-4">
        <div className="muted text-sm">설명</div>
        <ul className="text-sm">
          <li>버튼은 쿨다운(24h)과 전월 순익 값이 있을 때만 활성화됩니다.</li>
          <li>광고 피로(CTR&lt;0.6%)면 엣지 보상 0으로 기입됩니다.</li>
          <li>반품률 &gt;3%면 보상이 50% 감액됩니다.</li>
        </ul>
      </div>
    </div>
  )
}

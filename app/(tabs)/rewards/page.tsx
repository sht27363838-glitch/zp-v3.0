'use client'

import React, {useMemo} from 'react'
import { readCsvLS, parseCsv } from '../../_lib/readCsv'
import { num, fmt } from '../../_lib/num'

import { loadRules, evalGuards } from '../../_lib/rules'
import { appendLedger, lastTimeKey, markTime } from '../../_lib/ledger'

type Row = { [k:string]: string|number }

export default function RewardsPage(){
  if (typeof window === 'undefined') return null 
  const rules = loadRules()
   const raw = readCsvLS('ledger') || ''
  const rows = useMemo(()=> raw? parseCsv(raw): [], [raw])

  // KPI 요약(보상 배지 판단용)
  const kraw = readCsvLS('kpi_daily') || ''
  const krows = useMemo(()=> kraw? parseCsv(kraw): [], [kraw])

  let visits=0, clicks=0, orders=0, revenue=0, adCost=0, returns=0
  for(const r of krows){
    visits  += num(r.visits)
    clicks  += num(r.clicks)
    orders  += num(r.orders)
    revenue += num(r.revenue)
    adCost  += num(r.ad_cost)
    returns += num(r.returns)
  }
  const CTR = visits? (clicks/visits) : 0
  const guards = evalGuards({ revenue, ad_cost:adCost, orders, visits, returns, ctr:CTR }, rules)

  // Ledger 표출
  const lraw = readCsvLS('ledger') || ''
  const ledger = useMemo<Row[]>(()=> lraw? parseCsv(lraw): [], [lraw])

  const lastMonthProfit = Number(localStorage.getItem('last_month_profit') || 0)

  // 주/월 쿨다운
  const wkKey = 'weeklyBoss.last', moKey = 'monthlyBoss.last'
  const canWeekly = Date.now() - lastTimeKey(wkKey) > rules.triggers.weeklyBoss.cooldownD*86400_000
  const canMonthly= Date.now() - lastTimeKey(moKey) > rules.triggers.monthlyBoss.cooldownD*86400_000

  function payoutWeekly(){
    if(!canWeekly) return
    const cut = guards.returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
    const stable = (rules.triggers.weeklyBoss.stablePct/100)*lastMonthProfit*cut
    const edge   = guards.adFatigue? 0 : ((rules.triggers.weeklyBoss.edgePct/100)*lastMonthProfit*cut)
    appendLedger({ date: new Date().toISOString().slice(0,10), mission:'Weekly Boss', type:'weekly', stable, edge, note: guards.adFatigue? 'EDGE LOCK' : (guards.returnsHigh? 'PAYOUT CUT' : ''), lock_until:'' })
    markTime(wkKey)
    alert('주간 보상이 기록되었습니다.')
  }
  function payoutMonthly(){
    if(!canMonthly) return
    const cut = guards.returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
    const stable = (rules.triggers.monthlyBoss.stablePct/100)*lastMonthProfit*cut
    const edge   = guards.adFatigue? 0 : ((rules.triggers.monthlyBoss.edgePct/100)*lastMonthProfit*cut)
    appendLedger({ date: new Date().toISOString().slice(0,10), mission:'Monthly Boss', type:'monthly', stable, edge, note: guards.adFatigue? 'EDGE LOCK' : (guards.returnsHigh? 'PAYOUT CUT' : ''), lock_until:'' })
    markTime(moKey)
    alert('월간 보상이 기록되었습니다.')
  }

  // 합계
  let stableSum=0, edgeSum=0
  for(const r of ledger){
    stableSum += num(r.stable)
    edgeSum   += num(r.edge)
  }

  return (
    <div className="page">
      <h1 className="title">C4 · Finance & Rewards</h1>

      {/* 배지 상태 */}
      <div className="flex gap-2">
        {guards.adFatigue && <span className="badge warn">엣지 잠금</span>}
        {guards.returnsHigh && <span className="badge danger">보상 감액</span>}
      </div>

      {/* 원클릭 보상 */}
      <div className="flex items-center gap-3 mt-3">
        <button className="btn" disabled={!canWeekly || !lastMonthProfit} onClick={payoutWeekly}>보상 기록(주간)</button>
        <button className="btn" disabled={!canMonthly || !lastMonthProfit} onClick={payoutMonthly}>보상 기록(월간)</button>
        {!lastMonthProfit && <span className="badge info">설정에서 전월 순익 입력 필요</span>}
      </div>

      {/* 합계 카드 */}
      <div className="grid grid-2 gap-2 mt-4">
        <div className="card"><div className="muted text-xs">안정 합계</div><div className="text-xl font-bold">{fmt(stableSum)}</div></div>
        <div className="card"><div className="muted text-xs">엣지 합계</div><div className="text-xl font-bold">{fmt(edgeSum)}</div></div>
      </div>

      {/* 원장 테이블 */}
      <div className="card mt-4">
        <div className="muted text-sm mb-2">보상 원장</div>
        <div style={{maxHeight: 360, overflow:'auto'}}>
          <table className="table">
            <thead>
              <tr><th>일자</th><th>미션</th><th>유형</th><th className="num">안정</th><th className="num">엣지</th><th>비고</th></tr>
            </thead>
            <tbody>
              {ledger.map((r,i)=>(
                <tr key={i}>
                  <td>{String(r.date||'')}</td>
                  <td>{String(r.mission||'')}</td>
                  <td>{String(r.type||'')}</td>
                  <td className="num">{fmt(num(r.stable))}</td>
                  <td className="num">{fmt(num(r.edge))}</td>
                  <td>{String(r.note||'')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-3">
        <div className="muted text-xs">안내</div>
        <ul className="text-sm">
          <li>버튼은 각 쿨다운(주/월)과 전월 순익 값이 있을 때만 활성화됩니다.</li>
          <li>광고 피로면 엣지 보상이 0으로 기록됩니다.</li>
          <li>반품률이 높으면 보상이 자동 감액됩니다.</li>
        </ul>
      </div>
    </div>
  )
}

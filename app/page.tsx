
'use client'
import React from 'react'
import { loadCSV } from './_lib/patch_loader'
import { computeKpi, fmt, capUsed, deltaRatio } from './_lib/patch_calc'

export default function C0(){
  const [state,setState] = React.useState<any>(null)
  React.useEffect(()=>{
    (async()=>{
      const kpi = await loadCSV('kpi_daily.csv')
      const led = await loadCSV('ledger.csv')
      const byDate:Record<string, any[]> = {}
      for(const r of kpi){ (byDate[r.date] ||= []).push(r) }
      const dates = Object.keys(byDate).sort()
      const recent = dates.slice(-1)[0]; const prev = dates.slice(-2)[0]
      const curKpi = computeKpi(byDate[recent]||[])
      const prevKpi = computeKpi(byDate[prev]||[])
      const AOV = curKpi.AOV, ROAS=curKpi.ROAS, CR=curKpi.CR, ret=curKpi.retRate
      const CPA = curKpi.total.orders? curKpi.total.ad_cost/curKpi.total.orders : 0
      const lastMonthProfit = Number(localStorage.getItem('last_month_profit')||0)
      const capRatio = Number((localStorage.getItem('cap_ratio')||'0.10'))
      const cap = capUsed(led as any, lastMonthProfit, capRatio)
      setState({curKpi, prevKpi, AOV, ROAS, CR, ret, CPA, cap, recent, prev})
    })()
  },[])

  if(!state) return <div className='container'><div className='card'>로딩…</div></div>

  const d = (label:string, cur:number, prev:number, fmtFn:(n:number)=>string)=>{
    const delta = deltaRatio(cur,prev); const cls = delta>=0?'up':'down'
    return <div className='kpi'><b>{label}</b><div className='v'>{fmtFn(cur)}</div><div className={`d ${cls}`}>{(delta*100).toFixed(1)}%</div></div>
  }

  return <div className='container'>
    <div className='kpis'>
      {d('매출', state.curKpi.total.revenue, state.prevKpi.total.revenue, fmt.n)}
      {d('ROAS', state.ROAS, state.prevKpi.ROAS, (n)=>n.toFixed(2))}
      {d('CR', state.CR, state.prevKpi.CR, (n)=> (n*100).toFixed(1)+'%')}
      {d('AOV', state.AOV, state.prevKpi.AOV, (n)=> fmt.n(Math.round(n)))}
      {d('반품률', state.ret, state.prevKpi.retRate, (n)=> (n*100).toFixed(1)+'%')}
      <div className='kpi'><b>보상총액</b><div className='v'>{fmt.n((state.cap.used)||0)}</div><div className='d'>Cap {Math.round((state.cap.ratio||0)*100)}%</div></div>
    </div>

    <div className='card'>
      <h3>보상 캡 사용률</h3>
      <div className='gauge' title={`집행합계 ${fmt.n(state.cap.used)}원 / 캡 ${fmt.n(state.cap.cap)}원`}>
        <div className='fill' style={{width: Math.min(100, Math.round((state.cap.ratio||0)*100))+'%'}} />
      </div>
      <div className='footer-muted'>집행합계 / (전월 순익 × 10%) — last={fmt.n(state.cap.used||0)}원</div>
    </div>

    <div className='card'>
      <h3>상태 → 판단 → 지시</h3>
      <div className='hint'>
        ROAS {state.ROAS.toFixed(2)}, CR {(state.CR*100).toFixed(2)}%, Cap {Math.round((state.cap.ratio||0)*100)}% / 안정 / 승자 유지, 내일 재평가
      </div>
    </div>
  </div>
}

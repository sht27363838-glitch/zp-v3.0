
'use client'
import React from 'react'
import Link from 'next/link'
import { loadCSV } from './_lib/patch_loader'
import { computeKpi, fmt, capUsed, deltaRatio, num } from './_lib/patch_calc'

type MetricKey = 'revenue'|'roas'|'cr'|'aov'|'returns'|'cap'

function Sparkline({points}:{points:number[]}){
  const w=240, h=48
  if(points.length===0) return <svg width={w} height={h}/>
  const max = Math.max(...points), min = Math.min(...points)
  const xStep = (w-8)/(points.length-1||1)
  const path = points.map((v,i)=>{
    const x = 4 + i*xStep
    const y = 4 + (h-8) * (1 - (max===min? 0.5 : (v-min)/(max-min)))
    return `${i===0?'M':'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return <svg width={w} height={h}>
    <path d={path} fill="none" stroke="#0EA5E9" strokeWidth="2" />
  </svg>
}

export default function C0(){
  const [state,setState] = React.useState<any>(null)
  const [detail,setDetail] = React.useState<{key:MetricKey,label:string}|null>(null)

  React.useEffect(()=>{
    (async()=>{
      const kpi = await loadCSV('kpi_daily.csv')
      const led = await loadCSV('ledger.csv')
      // by day aggregate
      const byDay:Record<string, any> = {}
      for(const r of kpi){
        const d = r.date
        const o = (byDay[d] ||= {visits:0, orders:0, revenue:0, ad_cost:0, returns:0})
        o.visits += num(r.visits); o.orders += num(r.orders); o.revenue += num(r.revenue)
        o.ad_cost += num(r.ad_cost); o.returns += num(r.returns)
      }
      const days = Object.keys(byDay).sort()
      const series = days.map(d=>{
        const x = byDay[d]
        const CR = x.visits? x.orders/x.visits : 0
        const AOV = x.orders? x.revenue/x.orders : 0
        const ROAS = x.ad_cost? x.revenue/x.ad_cost : 0
        const retRate = x.orders? x.returns/x.orders : 0
        return { date:d, revenue:x.revenue, roas:ROAS, cr:CR, aov:AOV, returns:retRate }
      })
      const recent = series.slice(-1)[0] || {revenue:0, roas:0, cr:0, aov:0, returns:0}
      const prev   = series.slice(-2)[0] || {revenue:0, roas:0, cr:0, aov:0, returns:0}

      const lastMonthProfit = Number(localStorage.getItem('last_month_profit')||0)
      const capRatio = Number((localStorage.getItem('cap_ratio')||'0.10'))
      const cap = capUsed(led as any, lastMonthProfit, capRatio)

      setState({series, recent, prev, cap})
    })()
  },[])

  if(!state) return <div className='container'><div className='card'>로딩…</div></div>

  const tile = (label:string, value:string, delta:number, onClick:()=>void)=>{
    const cls = delta>=0?'good':'bad'
    return <button className='kpi tile' onClick={onClick} aria-label={`${label} 상세 보기`}>
      <div className='t'>{label}</div>
      <div className='v'>{value}</div>
      <div className={'d '+cls}>{(delta*100).toFixed(1)}%</div>
    </button>
  }

  const cur = state.recent, prev = state.prev
  const tiles = [
    tile('매출', fmt.n(cur.revenue), deltaRatio(cur.revenue, prev.revenue), ()=> setDetail({key:'revenue',label:'매출'})),
    tile('ROAS', cur.roas.toFixed(2), deltaRatio(cur.roas, prev.roas), ()=> setDetail({key:'roas',label:'ROAS'})),
    tile('CR', (cur.cr*100).toFixed(2)+'%', deltaRatio(cur.cr, prev.cr), ()=> setDetail({key:'cr',label:'전환율'})),
    tile('AOV', fmt.n(Math.round(cur.aov)), deltaRatio(cur.aov, prev.aov), ()=> setDetail({key:'aov',label:'AOV'})),
    tile('반품률', (cur.returns*100).toFixed(1)+'%', deltaRatio(cur.returns, prev.returns), ()=> setDetail({key:'returns',label:'반품률'})),
    tile('보상총액', fmt.n(state.cap.used||0), deltaRatio(state.cap.used||0, 0), ()=> setDetail({key:'cap',label:'보상 캡 사용률'})),
  ]

  const pickSeries = (key:MetricKey)=> state.series.map((s:any)=> s[key]||0)

  return <div className='container'>
    <div className='kpis'>{tiles}</div>

    <div className='card'>
      <h3>보상 캡 사용률</h3>
      <div className='gauge' title={`집행합계 ${fmt.n(state.cap.used)}원 / 캡 ${fmt.n(state.cap.cap)}원`}>
        <div className='fill' style={{width: Math.min(100, Math.round((state.cap.ratio||0)*100))+'%'}} />
      </div>
      <div className='footer-muted'>집행합계 / (전월 순익 × 10%) — last={fmt.n(state.cap.used||0)}원</div>
    </div>

    {detail && <div className='drawer'>
      <div className='drawer-panel'>
        <div className='drawer-head'>
          <div className='drawer-title'>{detail.label} — 드릴다운</div>
          <button className='btn close' onClick={()=>setDetail(null)} aria-label='닫기'>✕</button>
        </div>
        <div className='drawer-body'>
          <Sparkline points={pickSeries(detail.key)} />
          <div className='hint' style={{marginTop:8}}>최근 {state.series.length}일 추이</div>
          <div style={{display:'flex', gap:8, marginTop:16, flexWrap:'wrap'}}>
            {(detail.key==='revenue' || detail.key==='roas' || detail.key==='cr') &&
              <Link href="/growth" className='btn primary'>C1 유입 열기</Link>}
            {detail.key==='aov' && <Link href="/commerce" className='btn primary'>C2 전환 열기</Link>}
            {detail.key==='returns' && <Link href="/ops" className='btn warn'>C5 운영(반품) 보기</Link>}
            {detail.key==='cap' && <Link href="/rewards" className='btn success'>C4 보상엔진 보기</Link>}
            <Link href="/report" className='btn'>주간 리포트</Link>
          </div>
        </div>
      </div>
      <div className='drawer-backdrop' onClick={()=>setDetail(null)} />
    </div>}

    <style jsx global>{`
      .tile{ background:#161A1E; border:1px solid #232A31; border-radius:14px; padding:12px 14px; text-align:left; }
      .tile .t{ color:#9BA7B4; font-size:12px; }
      .tile .v{ color:#E6EAF0; font-size:20px; font-weight:700; margin-top:2px; }
      .tile .d{ margin-top:4px; font-size:12px; }
      .tile .d.good{ color:#22C55E; }
      .tile .d.bad{ color:#EF4444; }
      .btn{ display:inline-block; padding:8px 12px; border-radius:12px; border:1px solid #2f3944; color:#E6EAF0; background:#232A31; font-weight:700; font-size:12px; }
      .btn.primary{ background:#0EA5E9; color:#0F1216; border-color:#0891B2; }
      .btn.success{ background:#22C55E; color:#0F1216; border-color:#16A34A; }
      .btn.warn{ background:#F59E0B; color:#0F1216; border-color:#D97706; }
      .btn.close{ background:#232A31; color:#E6EAF0; }
      .drawer{ position:fixed; inset:0; z-index:60; }
      .drawer-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.35); }
      .drawer-panel{ position:absolute; right:0; top:0; height:100%; width:360px; background:#161A1E; border-left:1px solid #232A31; padding:16px; box-shadow: -8px 0 24px rgba(0,0,0,.35); }
      .drawer-head{ display:flex; align-items:center; justify-content:space-between; }
      .drawer-title{ color:#E6EAF0; font-weight:800; }
      .drawer-body{ margin-top:12px; }
      .kpis{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap:12px; }
      .gauge{ height:12px; background:#232A31; border:1px solid #2f3944; border-radius:8px; overflow:hidden; }
      .gauge .fill{ height:100%; background:#0EA5E9; }
      .footer-muted{ color:#9BA7B4; font-size:12px; margin-top:6px; }
      @media (max-width: 960px){ .kpis{ grid-template-columns: repeat(2, minmax(0,1fr)); } .drawer-panel{ width:100%; } }
    `}</style>
  </div>
}

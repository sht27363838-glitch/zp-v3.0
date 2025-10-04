'use client'
import React from 'react'
import { loadCSV } from '../_lib/csv'
import { safe } from '../_lib/calc'

export default function Report(){
  const [kpi,setKpi]=React.useState<any[]>([])
  const [ledger,setLedger]=React.useState<any[]>([])
  const [range,setRange]=React.useState<'7d'|'30d'>('7d')

  React.useEffect(()=>{
    (async()=>{
      setKpi(await loadCSV('kpi_daily.csv') as any[])
      setLedger(await loadCSV('ledger.csv') as any[])
    })()
  },[])

  const days = range==='7d'? 7:30
  const sel = kpi.slice(-days)
  const agg = sel.reduce((a:any,r:any)=>({
    visits:a.visits+ +r.visits||0,
    clicks:a.clicks+ +r.clicks||0,
    carts:a.carts+ +r.carts||0,
    orders:a.orders+ +r.orders||0,
    revenue:a.revenue+ +r.revenue||0,
    ad_cost:a.ad_cost+ +r.ad_cost||0,
    returns:a.returns+ +r.returns||0
  }), {visits:0,clicks:0,carts:0,orders:0,revenue:0,ad_cost:0,returns:0})

  const roas = safe(agg.revenue, agg.ad_cost)
  const cr = safe(agg.orders, agg.visits)
  const aov = safe(agg.revenue, agg.orders)
  const rr = safe(agg.returns, agg.orders)

  const edge = ledger.reduce((s,r)=> s + (+r.edge_amt||0), 0)
  const stable = ledger.reduce((s,r)=> s + (+r.stable_amt||0), 0)
  const edgeShare = (edge+stable)===0? 0: edge/(edge+stable)

  const line1 = `ROAS ${roas.toFixed(2)}, CR ${(cr*100).toFixed(2)}%, AOV ${Math.round(aov).toLocaleString()}원.`
  const line2 = rr>0.03? '반품률이 3% 초과. PDP 상단에 클레임 Top3 노출 권고.' : '반품률 안정 범위.'
  const line3 = edgeShare>0.30? '엣지 비중 30% 초과. 리밸런싱 요망.' : '바벨 비중 정상 범위.'

  return <div className='report'>
    <div className='card'>
      <b>주간 리포트</b>
      <div className='hint'>브라우저 인쇄 → PDF 저장</div>
      <div style={{marginTop:8}}>
        <label><input type='radio' checked={range==='7d'} onChange={()=>setRange('7d')} /> 7일</label>
        &nbsp;&nbsp;<label><input type='radio' checked={range==='30d'} onChange={()=>setRange('30d')} /> 30일</label>
      </div>
    </div>
    <div className='grid cols-2'>
      <div className='card mono'>
        매출: {Math.round(agg.revenue).toLocaleString()}<br/>
        광고비: {Math.round(agg.ad_cost).toLocaleString()}<br/>
        ROAS: {roas.toFixed(2)}<br/>
        전환율: {(cr*100).toFixed(2)}%<br/>
        AOV: {Math.round(aov).toLocaleString()}<br/>
        반품률: {(rr*100).toFixed(2)}%<br/>
      </div>
      <div className='card mono'>
        안정 누적: {Math.round(stable).toLocaleString()}<br/>
        엣지 누적: {Math.round(edge).toLocaleString()}<br/>
        엣지 비중: {(edgeShare*100).toFixed(1)}%<br/>
      </div>
    </div>
    <div className='card mono'>
      ① {line1}<br/>② {line2}<br/>③ {line3}
    </div>
    <div className='badges'><button className='badge' onClick={()=>window.print()}>프린트 → PDF</button></div>
  </div>
}

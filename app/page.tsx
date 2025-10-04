'use client'
import { useEffect, useMemo, useState } from 'react'
import KpiCard from './_components/KpiCard'
import { loadCSV } from './_lib/csv'
import { roas, cr, aov, returnsRate } from './_lib/calc'

function Badge({type,children}:{type:'danger'|'warn'|'info'|'success',children:React.ReactNode}){
  return <span className={`badge ${type}`}>{children}</span>
}

export default function C0(){
  const [rows,setRows]=useState<any[]>([])
  const [cap,setCap]=useState({last:0,ratio:0.10})
  const [ledger,setLedger]=useState({stable:0,edge:0})

  useEffect(()=>{(async()=>{
    setRows(await loadCSV('kpi_daily.csv') as any[])
    const settings=await loadCSV('settings.csv')
    if(settings[0]) setCap({last:Number(settings[0].last_month_profit||0),ratio:Number(settings[0].cap_ratio||0.10)})
    const lrows=await loadCSV('ledger.csv')
    const sums=lrows.reduce((a:any,r:any)=>{a.stable+=Number(r.stable_amt||0);a.edge+=Number(r.edge_amt||0);return a;},{stable:0,edge:0})
    setLedger(sums)
  })()},[])

  const latest = useMemo(()=>{
    if(rows.length===0) return { visits:0, clicks:0, carts:0, orders:0, revenue:0, ad_cost:0, returns:0, freq:0 }
    const r = rows[rows.length-1]
    return {
      visits:+(r.visits||0), clicks:+(r.clicks||0), carts:+(r.carts||0), orders:+(r.orders||0),
      revenue:+(r.revenue||0), ad_cost:+(r.ad_cost||0), returns:+(r.returns||0), freq:+(r.freq||0)
    }
  },[rows])

  const edgeShare = (ledger.stable+ledger.edge)===0? 0 : ledger.edge/(ledger.stable+ledger.edge)
  const capUsed = cap.last*cap.ratio===0? 0 : (ledger.stable+ledger.edge)/(cap.last*cap.ratio)
  const ctr = latest.visits? latest.clicks/latest.visits : 0
  const cpa = latest.orders? latest.ad_cost/latest.orders : 0
  const returnsR = latest.orders? latest.returns/latest.orders : 0

  const cpaSpike = cpa>15000
  const ctrDrop = ctr<0.006
  const avg7 = rows.slice(-7).reduce((a:number,r:any)=>a + ((+r.orders? (+r.returns||0)/(+r.orders):0)),0) / Math.max(1, rows.slice(-7).length)
  const returnsHigh7 = avg7>0.03
  const avgFreq2 = rows.slice(-2).reduce((a:number,r:any)=> a + (+r.freq||0), 0) / Math.max(1, rows.slice(-2).length)
  const adFatigue = ctrDrop && avgFreq2>=3.0

  const state = `ROAS ${roas(latest).toFixed(2)}, CR ${(cr(latest)*100).toFixed(2)}%, Cap ${(capUsed*100).toFixed(0)}%`
  let assess = '안정'
  if(cpaSpike) assess = 'CAC 상승'
  else if(ctrDrop) assess = 'CTR 급락'
  else if(returnsHigh7) assess = '반품 경보'
  const command =
    cpaSpike ? '세트 A 중지, B 예산 20% 이동' :
    ctrDrop ? '새 훅 2건 제작, 피로 애드셋 오프' :
    returnsHigh7 ? 'PDP 상단 클레임 Top3 노출' :
    '승자 유지, 내일 재평가'

  return (<div>
    <div className='grid cols-3'>
      <KpiCard label='매출' value={latest.revenue}/>
      <KpiCard label='ROAS' value={Number(roas(latest).toFixed(2))}/>
      <KpiCard label='CR' value={Number((cr(latest)*100).toFixed(2))} suffix='%' />
      <KpiCard label='AOV' value={Number(aov(latest).toFixed(0))}/>
      <KpiCard label='반품률' value={Number((returnsRate(latest)*100).toFixed(2))} suffix='%' />
      <KpiCard label='보상총액' value={ledger.stable+ledger.edge}/>
    </div>

    <div style={{height:12}}/>
    <div className='card'>
      <b>보상 캡 사용률</b>
      <div className='gauge'><div style={{width:`${Math.min(100, Math.round(capUsed*100))}%`}}/></div>
      <div className='hint'>집행합계 / (전월 순익 × {Math.round(cap.ratio*100)}%) — last={cap.last.toLocaleString()}원</div>
    </div>

    <div style={{height:12}}/>
    <div className='badges'>
      {cpaSpike && <Badge type='danger'>CAC 스파이크</Badge>}
      {ctrDrop && <Badge type='warn'>CTR 급락</Badge>}
      {returnsHigh7 && <Badge type='warn'>반품률 7일 &gt; 3%</Badge>}
      {edgeShare>0.30 && <Badge type='info'>엣지 &gt; 30% (리밸런싱 필요)</Badge>}
      {adFatigue && <Badge type='info'>엣지 잠금(광고 피로)</Badge>}
      {returnsR>0.03 && <Badge type='danger'>보상 50% 감액(반품 7일 &gt; 3%)</Badge>}
    </div>

    <div style={{height:12}}/>
    <div className='card'>
      <b>상태 → 판단 → 지시</b>
      <div className='hint'>{state} / {assess} / {command}</div>
    </div>
  </div>)
}

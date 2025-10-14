'use client'
import TrendBadge from './_components/TrendBadge'
import InsightCard from './_components/InsightCard'
import React, {useMemo, useState} from 'react'
import { readCsvOrDemo } from './_lib/readCsv'
import { fmt, pct } from './_lib/num'
import { computeKpiRows, summarize, lastNDays, series } from './_lib/kpi'
import KpiTile from './_components/KpiTile'
import Modal from './_components/Modal'
import Spark from './_components/Spark'

export default function Home(){
  // ✅ 데모 대체 로더 사용
  const raw = readCsvOrDemo('kpi_daily')
  const rows = useMemo(()=> computeKpiRows(raw), [raw])
  const sumAll = summarize(rows)

  const capRaw = readCsvOrDemo('ledger') // ledger는 비어있으면 그냥 빈값
  const capAmt = useMemo(()=>{
    if(!capRaw) return 0
    const lines = capRaw.split('\n').slice(1).filter(Boolean)
    let s = 0; for(const ln of lines){ const cols = ln.split(','); s += Number(cols[3]||0)+Number(cols[4]||0) }
    return s
  },[capRaw])

  const [open,setOpen] = useState(false)
  const [topic,setTopic] = useState<'revenue'|'roas'|'cr'|'aov'|'returns'|'reward'>('revenue')
  const openDrill = (t: typeof topic)=>{ setTopic(t); setOpen(true) }

  const last7  = lastNDays(rows, 7)
  const last30 = lastNDays(rows, 30)

  // 지난 7일 & 그 직전 7일 합계
const prev7  = lastNDays(rows, 14).slice(0, 7)
const sum = (arr: typeof rows, key: 'revenue'|'orders'|'visits'|'ad_cost'|'returns') =>
  arr.reduce((s, r) => s + Number((r as any)[key] || 0), 0)

  const mapMetric = (t: typeof topic, xr: typeof rows)=>{
    if(t==='revenue') return series(xr, 'revenue')
    if(t==='returns') return series(xr, 'returns')
    if(t==='reward')  return []
    if(t==='aov'){ const v = xr.map(r=> r.orders? r.revenue/r.orders : 0); return v }
    if(t==='cr'){  const v = xr.map(r=> r.visits? r.orders/r.visits : 0); return v }
    if(t==='roas'){const v = xr.map(r=> r.ad_cost? r.revenue/(r.ad_cost||1) : 0); return v }
    return []
  }

  return (
    <div className="page">
      <h2>지휘소</h2>
      <div className="grid">
        <KpiTile label="매출"   value={fmt(sumAll.total.revenue)} onClick={()=>openDrill('revenue')}/>
        <KpiTile label="ROAS"   value={(sumAll.ROAS||0).toFixed(2)} onClick={()=>openDrill('roas')}/>
        <KpiTile label="CR"     value={pct(sumAll.CR||0)} onClick={()=>openDrill('cr')}/>
        <KpiTile label="AOV"    value={fmt(sumAll.AOV||0)} onClick={()=>openDrill('aov')}/>
        <KpiTile label="반품률" value={pct(sumAll.ReturnsRate||0)} onClick={()=>openDrill('returns')}/>
        <KpiTile label="보상총액" value={fmt(capAmt)} note="(ledger 합계)" onClick={()=>openDrill('reward')}/>
      </div>

      <div className="grid">
  <KpiTile
    label="매출"
    value={fmt(sumAll.total.revenue)}
    right={<TrendBadge now={sum(last7,'revenue')} prev={sum(prev7,'revenue')} />}
    onClick={()=>openDrill('revenue')}
  />
  <KpiTile
    label="ROAS"
    value={(sumAll.ROAS||0).toFixed(2)}
    right={<TrendBadge now={sum(last7,'revenue')/(sum(last7,'ad_cost')||1)}
                       prev={sum(prev7,'revenue')/(sum(prev7,'ad_cost')||1)} />}
    onClick={()=>openDrill('roas')}
  />
  <KpiTile
    label="반품률"
    value={pct(sumAll.ReturnsRate||0)}
    right={<TrendBadge invert now={(sum(last7,'returns')/(sum(last7,'orders')||1))}
                       prev={(sum(prev7,'returns')/(sum(prev7,'orders')||1))} />}
    onClick={()=>openDrill('returns')}
  />
  {/* 나머지 타일은 필요 시 동일 패턴으로 */}
</div>

      {/* 인사이트 카드 */}
      <div className="grid" style={{gridTemplateColumns:'1fr', gap:'var(--gap)', marginTop:12}}>
        <InsightCard title="주간 매출 추이" note="최근 7일"
          series={last7.map(r=> Number(r.revenue||0))}
        />
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={`드릴다운: ${topic.toUpperCase()}`}>
        <div className="tabs small">
          <span className="badge">최근 7일</span>
          <Spark series={mapMetric(topic,last7)} width={520} height={100}/>
          <span className="badge">최근 30일</span>
          <Spark series={mapMetric(topic,last30)} width={520} height={100}/>
        </div>
      </Modal>

      <style jsx>{`
        .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        @media (max-width:800px){ .grid{grid-template-columns:1fr 1fr} }
      `}</style>
    </div>
  )
}

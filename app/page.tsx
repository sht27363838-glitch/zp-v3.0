'use client'
import InsightCard from './_components/InsightCard'
import React, {useMemo, useState} from 'react';
import { readCsvLS } from './_lib/readCsv';
import { fmt, pct } from './_lib/num';
import { computeKpiRows, summarize, lastNDays, series } from './_lib/kpi';
import KpiTile from './_components/KpiTile';
import Modal from './_components/Modal';
import Spark from './_components/Spark';

export default function Home(){
  const raw = readCsvLS('kpi_daily');
  const rows = useMemo(()=> computeKpiRows(raw), [raw]);
  const sumAll = summarize(rows);
  const capRaw = readCsvLS('ledger');
  const capAmt = useMemo(()=>{
    if(!capRaw) return 0;
    const lines = capRaw.split('\n').slice(1).filter(Boolean);
    let s = 0; for(const ln of lines){ const cols = ln.split(','); s += Number(cols[3]||0)+Number(cols[4]||0) }
    return s;
  },[capRaw]);

  const [open,setOpen] = useState(false);
  const [topic,setTopic] = useState<'revenue'|'roas'|'cr'|'aov'|'returns'|'reward'>('revenue');
  const openDrill = (t: typeof topic)=>{ setTopic(t); setOpen(true); };

  // 7/30일 시리즈
  const last7  = lastNDays(rows, 7);
  const last30 = lastNDays(rows, 30);

  const mapMetric = (t: typeof topic, xr: typeof rows)=>{
    if(t==='revenue') return series(xr, 'revenue');
    if(t==='returns') return series(xr, 'returns');
    if(t==='reward')  return []; // 보상 타임라인은 C4에서 상세 (여긴 총액만)
    if(t==='aov'){ const v = xr.map(r=> r.orders? r.revenue/r.orders : 0); return v; }
    if(t==='cr'){  const v = xr.map(r=> r.visits? r.orders/r.visits : 0); return v; }
    if(t==='roas'){const v = xr.map(r=> r.ad_cost? r.revenue/(r.ad_cost||1) : 0); return v; }
    return [];
  };

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

      {/* ⬇️ 추가: 상단 미니 스파크 카드 */}
<InsightCard
  title="주간 매출 추이"
  note="최근 7일"
  series={last7.map(r => Number(r.revenue || 0))}
/>

{/* 선택: 30일 카드도 원하시면 하나 더 */}
<InsightCard
  title="30일 매출 추이"
  note="최근 30일"
  series={last30.map(r => Number(r.revenue || 0))}
/>

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
  );
}

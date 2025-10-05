'use client'
import React, {useMemo, useState} from 'react';
import KpiTile from '../../_components/KpiTile';
import { readCsvLS, parseCsv } from '../../_lib/readCsv';
import { num, kfmt, pct } from '../../_lib/num';

function useKpi(){
  const csv = readCsvLS('kpi_daily') || '';
  const rows = useMemo(()=> csv? parseCsv(csv): [], [csv]);
  const total = rows.reduce((a:any,r:any)=>{
    a.visits += num(r.visits); a.clicks += num(r.clicks); a.orders += num(r.orders);
    a.revenue += num(r.revenue); a.ad_cost += num(r.ad_cost); a.returns += num(r.returns);
    return a;
  }, {visits:0,clicks:0,orders:0,revenue:0,ad_cost:0,returns:0});
  const CR = total.visits? total.orders/total.visits : 0;
  const AOV = total.orders? total.revenue/total.orders : 0;
  const ROAS = total.ad_cost? total.revenue/total.ad_cost : 0;
  const Returns = total.orders? total.returns/total.orders : 0;

  const ledgerCsv = readCsvLS('ledger') || '';
  const ledgerRows = useMemo(()=> ledgerCsv? parseCsv(ledgerCsv): [], [ledgerCsv]);
  const rewardsPaid = ledgerRows.reduce((s:any,r:any)=> s + num(r.stable_amt) + num(r.edge_amt), 0);

  return {total, CR, AOV, ROAS, Returns, rewardsPaid, rows};
}

export default function Report(){
  const {total, CR, AOV, ROAS, Returns, rewardsPaid, rows} = useKpi();
  const [modal, setModal] = useState<null | {metric:string}>(null);

  const series = (days:number, key:'revenue'|'orders'|'visits'|'ad_cost'|'returns')=>{
    const tail = rows.slice(-days);
    return tail.map((r:any)=>({date: r.date, value: num(r[key])}));
  };

  const modalBody = ()=>{
    if (!modal) return null;
    const keyMap: any = {
      '매출': 'revenue', '주문': 'orders', '방문': 'visits', '광고비':'ad_cost', '반품':'returns'
    };
    const key = keyMap[modal.metric] || 'revenue';
    const last7 = series(7, key).reduce((s:any, x:any)=> s + x.value, 0);
    const last30 = series(30, key).reduce((s:any, x:any)=> s + x.value, 0);
    return (
      <div className="modal">
        <div className="modal-card">
          <h3>{modal.metric} 추이(합계)</h3>
          <table>
            <thead><tr><th>구간</th><th>합계</th></tr></thead>
            <tbody>
              <tr><td>최근 7일</td><td>{kfmt(last7)}</td></tr>
              <tr><td>최근 30일</td><td>{kfmt(last30)}</td></tr>
            </tbody>
          </table>
          <button className="btn" onClick={()=>setModal(null)}>닫기</button>
        </div>
      </div>
    )
  };

  return (
    <div className="page">
      <h1>Command Center</h1>
      <div className="grid kpis">
        <KpiTile label="매출" value={kfmt(total.revenue)} onClick={()=>setModal({metric:'매출'})} />
        <KpiTile label="ROAS" value={(ROAS||0).toFixed(2)} onClick={()=>setModal({metric:'매출'})} />
        <KpiTile label="CR" value={pct(CR)} onClick={()=>setModal({metric:'주문'})} />
        <KpiTile label="AOV" value={kfmt(AOV)} onClick={()=>setModal({metric:'주문'})} />
        <KpiTile label="반품률" value={pct(Returns)} onClick={()=>setModal({metric:'반품'})} />
        <KpiTile label="보상 총액" value={kfmt(rewardsPaid)} onClick={()=>setModal({metric:'매출'})} />
      </div>
      {modalBody()}
    </div>
  )
}

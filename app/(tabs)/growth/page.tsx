'use client'
import React, {useMemo} from 'react';
import { readCsvLS, parseCsv } from '../../_lib/readCsv';
import { num } from '../../_lib/num';

export default function Growth(){
  const raw = readCsvLS('kpi_daily');
  const rows = useMemo(()=> raw ? parseCsv(raw) : [], [raw]);

  const agg: Record<string, any> = {};
  for (const r of rows) {
    const ch = r.channel || 'unknown';
    const o = (agg[ch] ||= { channel: ch, clicks: 0, spend: 0, orders: 0, revenue: 0 });
    o.clicks += num(r.clicks);
    o.spend  += num(r.ad_cost);
    o.orders += num(r.orders);
    o.revenue+= num(r.revenue);
  }

  const list = Object.values(agg).map((r:any)=>{
    const CPA = r.orders ? (r.spend||0)/r.orders : 0;
    const ROAS = (r.spend||0) ? (r.revenue||0)/(r.spend||1) : 0;
    const CTR  = (r.clicks||0) / 1; // 노출 없는 CSV 기준
    const warn: string[] = [];
    if (ROAS < 1.5) warn.push('ROAS↓');
    if (CPA >  (r.revenue && r.orders ? (r.revenue/r.orders)*0.35 : 0)) warn.push('CPA↑');
    if (CTR < 0.01) warn.push('CTR↓');
    return {...r, CPA, ROAS, CTR, warn};
  }).sort((a:any,b:any)=> (b.ROAS||0) - (a.ROAS||0));

  return (
    <div className="page">
      <h2>채널 리그</h2>
      <div style={{overflow:'auto'}}>
        <table className="league">
          <thead>
            <tr>
              <th>채널</th><th>클릭</th><th>지출</th><th>주문</th><th>매출</th><th>ROAS</th><th>CPA</th><th>경보</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r:any)=>(
              <tr key={r.channel}>
                <td>{r.channel}</td>
                <td>{r.clicks}</td>
                <td>{Math.round(r.spend)}</td>
                <td>{r.orders}</td>
                <td>{Math.round(r.revenue)}</td>
                <td>{(r.ROAS||0).toFixed(2)}</td>
                <td>{Math.round(r.CPA||0)}</td>
                <td>{r.warn.map((w:string)=><span key={w} className={`badge ${w.includes('ROAS')?'danger':w.includes('CPA')?'warn':'info'}`}>{w}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

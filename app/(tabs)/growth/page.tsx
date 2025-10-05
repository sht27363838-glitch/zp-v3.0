'use client'
import React, {useMemo} from 'react';
import { readCsvLS, parseCsv } from '../../_lib/readCsv';
import { num } from '../../_lib/num';

export default function Growth(){
  const csv = readCsvLS('kpi_daily') || '';
  const rows = useMemo(()=> csv? parseCsv(csv): [], [csv]);

  const agg: Record<string, any> = {};
  let totalOrders = 0, totalRevenue = 0;
  for (const r of rows){
    const ch = (r.channel as string) || 'unknown';
    const o = agg[ch] ||= { channel: ch, clicks:0, spend:0, orders:0, revenue:0, visits:0 };
    o.clicks += num(r.clicks); o.spend += num(r.ad_cost); o.orders += num(r.orders);
    o.revenue += num(r.revenue); o.visits += num(r.visits);
    totalOrders += num(r.orders); totalRevenue += num(r.revenue);
  }
  const AOV = totalOrders? totalRevenue/totalOrders : 0;
  const list = Object.values(agg).map((r:any)=>{
    const ROAS = r.spend? r.revenue/r.spend : 0;
    const CPA = r.orders? r.spend/r.orders : 0;
    const CTR = r.visits? r.clicks/Math.max(1,r.visits) : 0;
    const warnCTR = CTR < 0.01;           // <1%
    const warnCPA = AOV>0 && CPA > AOV*0.35;
    return {...r, ROAS, CPA, CTR, warnCTR, warnCPA}
  }).sort((a:any,b:any)=> (b.ROAS||0)-(a.ROAS||0));

  return (
    <div className="page">
      <h1>채널 리그</h1>
      <div style={{overflow:'auto'}}>
        <table className="league">
          <thead>
            <tr><th>채널</th><th>ROAS</th><th>CPA</th><th>CTR</th><th>경보</th></tr>
          </thead>
          <tbody>
            {list.map((r:any)=>(
              <tr key={r.channel}>
                <td>{r.channel}</td>
                <td>{(r.ROAS||0).toFixed(2)}</td>
                <td>{Math.round(r.CPA||0).toLocaleString()}</td>
                <td>{(r.CTR*100).toFixed(2)}%</td>
                <td>
                  {r.warnCTR && <span className="badge warn">CTR↓</span>}
                  {r.warnCPA && <span className="badge danger">CPA↑</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client';

import React, { useMemo } from 'react';
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv';
import { num, pct } from '../../_lib/num';

type Row = {
  date?: string;
  channel?: string;
  visits?: string | number;
  clicks?: string | number;
  carts?: string | number;
  orders?: string | number;
  revenue?: string | number;
  ad_cost?: string | number;
  returns?: string | number;
  reviews?: string | number;
};

export default function ReportPage() {
  // 1) CSV 로드
  const raw = readCsvLS('kpi_daily') || '';

  // 2) ✅ parseCsv는 CsvRows(=배열)만 반환 → 기본값도 항상 []
  const rows: CsvRows = useMemo(() => (raw ? parseCsv(raw) : []), [raw]);

  // 3) 집계
  let visits = 0, clicks = 0, carts = 0, orders = 0, revenue = 0, adCost = 0, returns = 0, reviews = 0;
  for (const r of rows as Row[]) {
    visits  += num(r.visits);
    clicks  += num(r.clicks);
    carts   += num(r.carts);
    orders  += num(r.orders);
    revenue += num(r.revenue);
    adCost  += num(r.ad_cost);
    returns += num(r.returns);
    reviews += num(r.reviews);
  }

  const ROAS = adCost ? revenue / adCost : 0;
  const CR   = visits ? orders / visits : 0;
  const AOV  = orders ? revenue / orders : 0;
  const RtnR = orders ? returns / orders : 0;

  return (
    <div className="page">
      <h1>지휘소(요약)</h1>

      <div className="kpis grid" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <KpiCard label="매출"  value={`₩${Math.round(revenue).toLocaleString()}`} sub="Revenue (Σ)"/>
        <KpiCard label="ROAS"  value={`${ROAS.toFixed(2)}x`} sub="revenue / ad_cost"/>
        <KpiCard label="전환율" value={pct(CR)} sub="orders / visits"/>
        <KpiCard label="AOV"   value={`₩${Math.round(AOV).toLocaleString()}`} sub="revenue / orders"/>
        <KpiCard label="반품률" value={pct(RtnR)} sub="returns / orders"/>
        <KpiCard label="리뷰"  value={`${reviews.toLocaleString()}개`} sub="Reviews (Σ)"/>
      </div>

      <div style={{marginTop:16, maxHeight: 420, overflow: 'auto'}}>
        <table className="table compact">
          <thead>
            <tr>
              <th>date</th><th>channel</th><th>visits</th><th>clicks</th>
              <th>carts</th><th>orders</th><th>revenue</th><th>ad_cost</th>
              <th>returns</th><th>reviews</th>
            </tr>
          </thead>
          <tbody>
            {(rows as Row[]).map((r, i) => (
              <tr key={i}>
                <td>{r.date || ''}</td>
                <td>{r.channel || ''}</td>
                <td>{num(r.visits)}</td>
                <td>{num(r.clicks)}</td>
                <td>{num(r.carts)}</td>
                <td>{num(r.orders)}</td>
                <td>{Math.round(num(r.revenue)).toLocaleString()}</td>
                <td>{Math.round(num(r.ad_cost)).toLocaleString()}</td>
                <td>{num(r.returns)}</td>
                <td>{num(r.reviews)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="muted">데이터가 없습니다. Tools 탭에서 kpi_daily를 업로드/저장해 주세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({label, value, sub}:{label:string; value:string; sub?:string}){
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value" style={{fontSize:22, fontWeight:700}}>{value}</div>
      {sub && <div className="muted" style={{fontSize:12}}>{sub}</div>}
    </div>
  );
}

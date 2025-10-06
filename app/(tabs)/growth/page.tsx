'use client';

import React, { useMemo } from 'react';
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv';
import { num } from '../../_lib/num';

type Row = {
  channel?: string;
  clicks?: string | number;
  ad_cost?: string | number;
  orders?: string | number;
  revenue?: string | number;
  visits?: string | number;
};

export default function Growth() {
  // 로컬스토리지의 kpi_daily CSV → 문자열
  const raw = readCsvLS('kpi_daily') || '';

  // ✅ parseCsv는 CsvRows(배열)만 반환 → 기본값도 []로 통일
  const rows: CsvRows = useMemo(() => (raw ? parseCsv(raw) : []), [raw]);

  // 채널별 집계
  const by: Record<string, { channel: string; clicks: number; spend: number; orders: number; revenue: number; visits: number }> = {};
  let totalOrders = 0;
  let totalRevenue = 0;

  for (const r of rows as Row[]) {
    const ch = (r.channel || 'unknown') as string;
    const o = (by[ch] ||= { channel: ch, clicks: 0, spend: 0, orders: 0, revenue: 0, visits: 0 });
    o.clicks += num(r.clicks);
    o.spend  += num((r as any).ad_cost);
    o.orders += num(r.orders);
    o.revenue+= num(r.revenue);
    o.visits += num(r.visits);
    totalOrders += num(r.orders);
    totalRevenue+= num(r.revenue);
  }

  const list = Object.values(by).map(r => {
    const CPA  = r.orders ? (r.spend || 0) / r.orders : 0;
    const ROAS = r.spend ? (r.revenue || 0) / r.spend : 0;
    const CTR  = r.visits ? (r.clicks || 0) / r.visits : 0;
    return { ...r, CPA, ROAS, CTR };
  }).sort((a,b)=> (b.ROAS||0) - (a.ROAS||0));

  return (
    <div className="page">
      <h1>채널 리그</h1>

      <div style={{marginBottom:12}} className="muted">
        총 주문 {totalOrders.toLocaleString()}건 · 총 매출 ₩{totalRevenue.toLocaleString()}
      </div>

      <div style={{ maxHeight: 480, overflow: 'auto' }}>
        <table className="table league">
          <thead>
            <tr>
              <th>채널</th>
              <th>클릭</th>
              <th>광고비</th>
              <th>주문</th>
              <th>매출</th>
              <th>CTR</th>
              <th>CPA</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.channel}>
                <td>{r.channel}</td>
                <td>{r.clicks.toLocaleString()}</td>
                <td>₩{Math.round(r.spend).toLocaleString()}</td>
                <td>{r.orders.toLocaleString()}</td>
                <td>₩{Math.round(r.revenue).toLocaleString()}</td>
                <td>{(r.CTR*100).toFixed(2)}%</td>
                <td>₩{Math.round(r.CPA).toLocaleString()}</td>
                <td>{r.ROAS.toFixed(2)}x</td>
              </tr>
            ))}
            {list.length===0 && (
              <tr><td colSpan={8} className="muted">데이터가 없습니다. Tools 탭에서 kpi_daily를 업로드/저장해 주세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

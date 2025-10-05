'use client';

import { useMemo } from 'react';

// 간단 CSV/스토리지 유틸(도구 탭 업로드 전제)
function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift()!.split(',').map(s => s.trim());
  return lines.map((ln) => {
    const cols = ln.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const obj: any = {};
    header.forEach((h, i) => {
      let v = (cols[i] ?? '').replace(/^"(.*)"$/, '$1');
      if (['visits','clicks','carts','orders','revenue','ad_cost','returns'].includes(h)) {
        const n = Number(String(v).replace(/[^0-9.-]/g, ''));
        obj[h] = isNaN(n) ? 0 : n;
      } else { obj[h] = v; }
    });
    return obj;
  });
}
function loadCsv(name: string) {
  const raw = (typeof window !== 'undefined') ? localStorage.getItem(`csv::${name}`) : null;
  if (!raw) return [];
  try { return parseCsv(raw); } catch { return []; }
}
const num = (n:any)=> Number(n||0);

export default function Growth() {
  const rows = useMemo(()=>loadCsv('kpi_daily'), []);
  const by = useMemo(()=>{
    const m: Record<string, any> = {};
    rows.forEach((r:any)=>{
      const ch = r.channel || 'unknown';
      const o = (m[ch] ||= {channel: ch, visits:0, clicks:0, orders:0, revenue:0, ad_cost:0});
      o.visits  += num(r.visits);
      o.clicks  += num(r.clicks);
      o.orders  += num(r.orders);
      o.revenue += num(r.revenue);
      o.ad_cost += num(r.ad_cost);
    });
    const list = Object.values(m).map((r:any)=>{
      const ROAS = r.ad_cost ? r.revenue/r.ad_cost : 0;
      const CPA  = r.orders  ? r.ad_cost/r.orders   : 0;
      const CTR  = r.visits  ? r.clicks/r.visits     : 0;
      return {...r, ROAS, CPA, CTR};
    });
    list.sort((a:any,b:any)=> (b.ROAS||0)-(a.ROAS||0));
    return list;
  }, [rows]);

  const fmtPct = (v:number)=> (v*100).toFixed(2)+'%';

  return (
    <main style={{ padding:'24px', maxWidth:1200, margin:'0 auto' }}>
      <h1 style={{marginBottom:16}}>C1 유입 — 채널 리그</h1>

      {!rows.length && (
        <p className="badge">kpi_daily CSV를 먼저 업로드하세요(도구 탭).</p>
      )}

      <div style={{overflow:auto}}>
        <table className="league">
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>채널</th>
              <th>ROAS</th>
              <th>CPA</th>
              <th>CTR</th>
              <th>매출</th>
              <th>광고비</th>
              <th>주문</th>
              <th>방문</th>
              <th>경보</th>
            </tr>
          </thead>
          <tbody>
            {by.map((r:any)=> {
              const alerts: JSX.Element[] = [];
              if (r.CTR < 0.005) alerts.push(<span key="ctr" className="badge warn">CTR↓</span>);
              if (r.CPA  > 20000) alerts.push(<span key="cpa" className="badge dng">CPA↑</span>);
              return (
                <tr key={r.channel}>
                  <td style={{textAlign:'left',fontWeight:600}}>{r.channel}</td>
                  <td>{r.ROAS.toFixed(2)}</td>
                  <td>{Math.round(r.CPA).toLocaleString()}</td>
                  <td>{fmtPct(r.CTR)}</td>
                  <td>{Math.round(r.revenue).toLocaleString()}</td>
                  <td>{Math.round(r.ad_cost).toLocaleString()}</td>
                  <td>{r.orders.toLocaleString()}</td>
                  <td>{r.visits.toLocaleString()}</td>
                  <td style={{display:'flex',gap:8,justifyContent:'center'}}>{alerts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .league{ width:100%; border-collapse:collapse; background:#161A1E; border-radius:12px; overflow:hidden }
        .league th,.league td{ border-bottom:1px solid #2a2f35; padding:10px; text-align:right }
        .league thead th{ background:#13171b; }
        .league tr:hover td{ background:#111418 }
      `}</style>
    </main>
  );
}

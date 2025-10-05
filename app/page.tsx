// app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// ── 로컬 CSV 업로드(도구 탭) 기반 데이터 로딩 유틸 ──────────────────────────
function parseCsv(text: string) {
  // 아주 관대한 CSV 파서 (따옴표/콤마 기본 대응)
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift()!.split(',').map(s => s.trim());
  return lines.map((ln) => {
    const cols = ln.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const obj: any = {};
    header.forEach((h, i) => {
      let v = (cols[i] ?? '').replace(/^"(.*)"$/, '$1');
      // 숫자 컬럼은 숫자로
      if (['visits','clicks','carts','orders','revenue','ad_cost','returns','reviews','qty','price','discount','spend','impressions'].includes(h)) {
        const n = Number(String(v).replace(/[^0-9.-]/g, ''));
        obj[h] = isNaN(n) ? 0 : n;
      } else { obj[h] = v; }
    });
    return obj;
  });
}
function loadCsv(name: string) {
  // 도구 탭에서 저장하는 key 규칙: csv::<파일명>
  const raw = (typeof window !== 'undefined') ? localStorage.getItem(`csv::${name}`) : null;
  if (!raw) return [];
  try { return parseCsv(raw); } catch { return []; }
}
function loadLedgerTotal() {
  const rows = loadCsv('ledger'); // columns: stable_amt, edge_amt
  return rows.reduce((acc: number, r: any) => acc + (Number(r.stable_amt||0)+Number(r.edge_amt||0)), 0);
}
function number(n: number | undefined) {
  return (n ?? 0);
}

// ── KPI 계산 ─────────────────────────────────────────────────────────────────
function computeKpi(kpiRows: any[]) {
  // 일자 정렬
  const rows = [...kpiRows].sort((a,b)=> (a.date||'').localeCompare(b.date||''));
  const total = rows.reduce((acc:any,r:any)=>{
    acc.visits  += number(r.visits);
    acc.clicks  += number(r.clicks);
    acc.orders  += number(r.orders);
    acc.revenue += number(r.revenue);
    acc.ad_cost += number(r.ad_cost);
    acc.returns += number(r.returns);
    return acc;
  }, {visits:0, clicks:0, orders:0, revenue:0, ad_cost:0, returns:0});

  const ROAS = total.ad_cost ? total.revenue/total.ad_cost : 0;
  const CR   = total.visits ? total.orders/total.visits : 0;
  const AOV  = total.orders ? total.revenue/total.orders : 0;
  const RR   = total.orders ? total.returns/total.orders : 0;

  return { rows, total, ROAS, CR, AOV, RR };
}

// ── 간단 모달(의존성 無) ────────────────────────────────────────────────────
function Modal({open, title, onClose, children}:{open:boolean; title:string; onClose:()=>void; children:any}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="modal__backdrop" onClick={onClose}>
      <div className="modal__panel" onClick={(e)=>e.stopPropagation()}>
        <header className="modal__hdr">
          <h3>{title}</h3>
          <button className="btn" onClick={onClose}>닫기</button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
      <style jsx global>{`
        .modal__backdrop{position:fixed;inset:0;background:#0007;display:flex;align-items:center;justify-content:center;z-index:50}
        .modal__panel{width:min(900px,92vw);max-height:90vh;overflow:auto;background:#161A1E;border:1px solid #0ea5e955;border-radius:16px;padding:16px}
        .modal__hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .modal__body{padding-top:8px}
        .trend{width:100%;border-collapse:collapse}
        .trend th,.trend td{border-bottom:1px solid #2a2f35;padding:8px;text-align:right}
        .trend th:first-child,.trend td:first-child{text-align:left}
      `}</style>
    </div>
  );
}

// ── C0 화면 ────────────────────────────────────────────────────────────────
export default function C0() {
  const [openKey, setOpenKey] = useState<string| null>(null);

  const kpiRows = useMemo(()=>loadCsv('kpi_daily'), []);
  const kpi = useMemo(()=>computeKpi(kpiRows), [kpiRows]);
  const rewardsTotal = useMemo(()=>loadLedgerTotal(), []);
  const cards = useMemo(()=>[
    { key:'revenue',  label:'매출',      value: kpi.total.revenue,  fmt:'money' },
    { key:'roas',     label:'ROAS',      value: kpi.ROAS,            fmt:'roas'  },
    { key:'cr',       label:'CR',        value: kpi.CR,              fmt:'pct'   },
    { key:'aov',      label:'AOV',       value: kpi.AOV,             fmt:'money' },
    { key:'returns',  label:'반품률',     value: kpi.RR,              fmt:'pct'   },
    { key:'rewards',  label:'보상총액',    value: rewardsTotal,        fmt:'money' },
  ], [kpi, rewardsTotal]);

  // 7일/30일 추이용 집계
  const lastN = (n:number)=> {
    const rows = kpi.rows.slice(-n);
    const agg = rows.reduce((acc:any,r:any)=> {
      acc.revenue  += number(r.revenue);
      acc.ad_cost  += number(r.ad_cost);
      acc.orders   += number(r.orders);
      acc.visits   += number(r.visits);
      acc.returns  += number(r.returns);
      return acc;
    }, {revenue:0, ad_cost:0, orders:0, visits:0, returns:0});
    const roas = agg.ad_cost ? agg.revenue/agg.ad_cost : 0;
    const cr   = agg.visits  ? agg.orders/agg.visits : 0;
    const aov  = agg.orders  ? agg.revenue/agg.orders : 0;
    const rr   = agg.orders  ? agg.returns/agg.orders : 0;
    return { ...agg, roas, cr, aov, rr };
  };

  const trendRows = (n:number)=> {
    const rows = kpi.rows.slice(-n);
    return rows.map((r:any)=>({
      date:r.date,
      revenue:number(r.revenue),
      roas: (number(r.ad_cost) ? number(r.revenue)/number(r.ad_cost) : 0),
      cr:   (number(r.visits)  ? number(r.orders)/number(r.visits)   : 0),
      aov:  (number(r.orders)  ? number(r.revenue)/number(r.orders)  : 0),
      rr:   (number(r.orders)  ? number(r.returns)/number(r.orders)  : 0),
    }));
  };

  const fmt = (v:number, kind:string)=>{
    if (kind==='money') return v.toLocaleString();
    if (kind==='pct')   return (v*100).toFixed(2)+'%';
    if (kind==='roas')  return v.toFixed(2);
    return String(v);
  };

  return (
    <main style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>C0 지휘소</h1>

      {/* KPI 카드 그리드 */}
      <div className="grid">
        {cards.map(c=>(
          <button key={c.key} className="card" onClick={()=>setOpenKey(c.key)} aria-haspopup="dialog">
            <span className="card__label">{c.label}</span>
            <span className="card__value">{fmt(c.value, c.fmt)}</span>
          </button>
        ))}
      </div>

      {/* 안내 & 바로가기 */}
      <section className="panel">
        <div className="row">
          <span className="badge">상태 → 판단 → 지시</span>
          <span style={{opacity:.85}}>데이터가 없으면 값이 0으로 보입니다. <b>도구</b>에서 CSV(3종) 업로드 → <b>리포트</b>에서 결과 확인.</span>
        </div>
        <nav style={{display:'flex', gap:12, marginTop:10}}>
          <Link href="/report" className="btn">리포트</Link>
          <Link href="/growth" className="btn">C1 유입</Link>
          <Link href="/tools" className="btn">도구(업로드)</Link>
        </nav>
      </section>

      {/* 모달: 각 카드 클릭 시 7/30일 스냅샷 + 일별 테이블 */}
      <Modal open={!!openKey} title="추이 보기" onClose={()=>setOpenKey(null)}>
        <div className="row" style={{gap:12, flexWrap:'wrap'}}>
          <div className="mini">
            <div className="mini__hdr">최근 7일</div>
            <ul>
              <li>매출: {lastN(7).revenue.toLocaleString()}</li>
              <li>ROAS: {lastN(7).roas.toFixed(2)}</li>
              <li>CR: {(lastN(7).cr*100).toFixed(2)}%</li>
              <li>AOV: {Math.round(lastN(7).aov).toLocaleString()}</li>
              <li>반품률: {(lastN(7).rr*100).toFixed(2)}%</li>
            </ul>
          </div>
          <div className="mini">
            <div className="mini__hdr">최근 30일</div>
            <ul>
              <li>매출: {lastN(30).revenue.toLocaleString()}</li>
              <li>ROAS: {lastN(30).roas.toFixed(2)}</li>
              <li>CR: {(lastN(30).cr*100).toFixed(2)}%</li>
              <li>AOV: {Math.round(lastN(30).aov).toLocaleString()}</li>
              <li>반품률: {(lastN(30).rr*100).toFixed(2)}%</li>
            </ul>
          </div>
        </div>

        <h4 style={{marginTop:12}}>일별 추이 (최근 30일)</h4>
        <table className="trend">
          <thead>
            <tr><th>날짜</th><th>매출</th><th>ROAS</th><th>CR</th><th>AOV</th><th>반품률</th></tr>
          </thead>
          <tbody>
            {trendRows(30).map((r,i)=>(
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.revenue.toLocaleString()}</td>
                <td>{r.roas.toFixed(2)}</td>
                <td>{(r.cr*100).toFixed(2)}%</td>
                <td>{Math.round(r.aov).toLocaleString()}</td>
                <td>{(r.rr*100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>

      {/* 스타일(버튼/배지 카드 포함) */}
      <style jsx global>{`
        .grid{
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
          gap:12px; margin-bottom:16px;
        }
        .card{
          text-align:left; padding:14px; border-radius:12px;
          border:1px solid #2a2f35; background:#161A1E; color:#E6EAF0;
          cursor:pointer; transition:.15s border-color,.15s transform;
        }
        .card:hover{ border-color:#0EA5E9aa }
        .card:active{ transform: translateY(1px) }
        .card:focus-visible{ outline:none; box-shadow:0 0 0 3px #0EA5E955 }
        .card__label{ display:block; opacity:.8; margin-bottom:6px }
        .card__value{ font-size:20px; font-weight:600 }
        .panel{ border:1px solid #2a2f35; border-radius:12px; padding:14px; background:#161A1E }
        .row{ display:flex; align-items:center; gap:10px }
        .badge{
          display:inline-block; padding:6px 10px; border-radius:999px;
          border:1px solid #3b4046; background:#0EA5E91a; color:#E6EAF0; font-size:12px
        }
        .mini{ flex:1 1 240px; border:1px solid #2a2f35; border-radius:12px; padding:10px }
        .mini__hdr{ font-weight:600; margin-bottom:6px }
        .btn{
          display:inline-block; padding:10px 14px; border-radius:10px;
          border:1px solid #0ea5e955; background:#0ea5e91a; color:#e6eaf0;
          text-decoration:none; transition:.15s; outline:none;
        }
        .btn:hover{ border-color:#0ea5e9aa; background:#0ea5e933 }
        .btn:focus-visible{ box-shadow:0 0 0 3px #0ea5e955 }
        .btn[disabled]{ opacity:.45; cursor:not-allowed }
      `}</style>
    </main>
  );
}

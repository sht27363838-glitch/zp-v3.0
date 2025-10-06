'use client';

import React, { useMemo } from 'react';
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv';
import { num, fmt } from '../../_lib/num';

type LRow = {
  date?: string;
  quest_id?: string;
  mission?: string;
  type?: string; // daily/weekly/monthly
  stable_amt?: string | number;
  stable?: string | number; // 컬럼명이 stable인 경우도 대응
  edge_amt?: string | number;
  edge?: string | number;   // 컬럼명이 edge인 경우도 대응
  lock_until?: string;
  proof_url?: string;
  note?: string;
};

export default function RewardsPage() {
  // 1) CSV 로드
  const raw = readCsvLS('ledger') || '';

  // 2) ✅ parseCsv는 CsvRows(=배열) 반환 → 기본값도 항상 []
  const rows: CsvRows = useMemo(() => (raw ? parseCsv(raw) : []), [raw]);

  // 3) 합계
  let stable = 0, edge = 0;
  for (const r of rows as LRow[]) {
    stable += num((r.stable_amt ?? r.stable) as any);
    edge   += num((r.edge_amt ?? r.edge) as any);
  }
  const total = stable + edge;
  const edgeShare = total ? edge / total : 0;

  return (
    <div className="page">
      <h1>Rewards(C4)</h1>

      <div className="grid" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <Card label="안정(Stables) 합계" value={`₩${fmt(stable)}`} sub="Σ stable_amt" />
        <Card label="엣지(Edge) 합계" value={`₩${fmt(edge)}`} sub="Σ edge_amt" />
        <Card label="Edge 비중" value={(edgeShare*100).toFixed(1)+'%'} sub="edge / (stable+edge)" />
      </div>

      <div style={{marginTop:16, maxHeight: 420, overflow:'auto'}}>
        <table className="table compact">
          <thead>
            <tr>
              <th>date</th>
              <th>mission</th>
              <th>type</th>
              <th>stable</th>
              <th>edge</th>
              <th>lock_until</th>
              <th>note</th>
              <th>proof_url</th>
            </tr>
          </thead>
          <tbody>
            {(rows as LRow[]).map((r, i) => (
              <tr key={i}>
                <td>{r.date || ''}</td>
                <td>{r.mission || r.quest_id || ''}</td>
                <td>{r.type || ''}</td>
                <td>{fmt(num((r.stable_amt ?? r.stable) as any))}</td>
                <td>{fmt(num((r.edge_amt ?? r.edge) as any))}</td>
                <td>{r.lock_until || ''}</td>
                <td>{r.note || ''}</td>
                <td>{r.proof_url || ''}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  데이터가 없습니다. Tools 탭에서 <b>ledger</b> CSV를 업로드/저장해 주십시오.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({label, value, sub}:{label:string; value:string; sub?:string}){
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value" style={{fontSize:22, fontWeight:700}}>{value}</div>
      {sub && <div className="muted" style={{fontSize:12}}>{sub}</div>}
    </div>
  );
}

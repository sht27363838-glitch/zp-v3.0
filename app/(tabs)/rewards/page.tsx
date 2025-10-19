// app/(tabs)/reward/page.tsx
'use client'

import React, { useMemo } from 'react'
import ExportBar from '@cmp/ExportBar'
import { readCsvOrDemo, sourceTag } from '@lib/csvSafe'
import { parseCsv } from '@lib/readCsv'
import { fmt } from '@lib/num'

type L = { date?: string; type?: string; stable?: number; edge?: number; memo?: string }

export default function RewardPage(){
  const raw = readCsvOrDemo('ledger') || ''
  const parsed = useMemo(()=> raw ? parseCsv(raw) : { headers:[], rows:[] }, [raw])

  const list = useMemo(()=> {
    return (parsed.rows as any[]).map(r=>({
      date: String(r.date ?? ''),
      type: String(r.type ?? ''),
      stable: Number(r.stable ?? 0),
      edge: Number(r.edge ?? 0),
      memo: String(r.memo ?? ''),
    })) as L[]
  },[parsed.rows])

  const total = useMemo(()=>{
    let s=0,e=0
    for(const r of list){ s+=r.stable||0; e+=r.edge||0 }
    const ratio = (s+e) ? e/(s+e) : 0
    return { s, e, ratio }
  },[list])

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>C4 — 보상 엔진</h1>
        <ExportBar selector="#reward-area" />
        <span className="badge">{sourceTag('ledger')}</span>
      </div>

      <div id="reward-area" className="kpi-grid" style={{marginTop:12}}>
        <div className="card">
          <div className="muted">안정(Stable) 누적</div>
          <div style={{fontSize:24, fontWeight:700}}>{fmt(total.s)}</div>
        </div>
        <div className="card">
          <div className="muted">엣지(Edge) 누적</div>
          <div style={{fontSize:24, fontWeight:700}}>{fmt(total.e)}</div>
        </div>
        <div className="card">
          <div className="muted">엣지 비중</div>
          <div style={{fontSize:24, fontWeight:700}}>{(total.ratio*100).toFixed(1)}%</div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{marginTop:16}}>
          <b>기록이 없습니다.</b>
          <p className="muted" style={{marginTop:6}}>
            도구 탭 &gt; “데모 Ledger 주입”을 클릭하거나, <code>ledger.csv</code>를 붙여넣어 주세요.
          </p>
        </div>
      ) : (
        <div className="card" style={{marginTop:16, padding:0}}>
          <div className="scroll" style={{maxHeight:420, overflow:'auto'}}>
            <table className="table" style={{width:'100%'}}>
              <colgroup>
                <col width="140"/><col width="120"/><col width="140"/><col width="140"/><col />
              </colgroup>
              <thead>
                <tr>
                  <th>날짜</th><th>유형</th>
                  <th className="num">Stable</th>
                  <th className="num">Edge</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(-50).reverse().map((r,i)=>(
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.type}</td>
                    <td className="num">{fmt(r.stable)}</td>
                    <td className="num">{fmt(r.edge)}</td>
                    <td>{r.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


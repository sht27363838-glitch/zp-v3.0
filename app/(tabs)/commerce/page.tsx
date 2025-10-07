'use client'
import React, {useMemo, useState} from 'react'
import { readCsvLS, parseCsv, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import CohortSpark from '../../_components/CohortSpark'
import LtvCurve from '../../_components/LtvCurve'

type Row = Record<string, any>

export default function Commerce(){
  const raw = readCsvLS('kpi_daily')||''
  const tbl: CsvTable = useMemo(()=> raw? parseCsv(raw): {headers:[], rows:[]}, [raw])
  const rows = tbl.rows as Row[]

  // ===== AOV 워터폴 (단순 버전: 장바구니→주문 단계)
  const aovData = useMemo(()=>{
    const carts = rows.reduce((s,r)=> s+num(r.carts), 0)
    const orders = rows.reduce((s,r)=> s+num(r.orders), 0)
    const revenue = rows.reduce((s,r)=> s+num(r.revenue), 0)
    const aov = orders? revenue/orders : 0
    return { carts, orders, revenue, aov }
  },[rows])

  // ===== 전환 히트맵 (상품×소스) + 드릴다운
  const [focus, setFocus] = useState<{prod:string, ch:string}|null>(null)
  const xcats = useMemo(()=> Array.from(new Set(rows.map(r=> r.channel||'unknown'))), [rows])
  const prods = useMemo(()=> Array.from(new Set(rows.map(r=> r.product||r.sku||'generic'))), [rows])

  function cellValue(prod:string, ch:string){
    const filtered = rows.filter(r=> (r.channel||'unknown')===ch && (r.product||r.sku||'generic')===prod)
    const clicks = filtered.reduce((s,r)=> s+num(r.clicks), 0)
    const orders = filtered.reduce((s,r)=> s+num(r.orders), 0)
    return { clicks, orders, cr: clicks? orders/clicks : 0 }
  }

  // ===== 코호트/LTV (데모: 최근 8주 값 가정 — 실제 데이터 붙으면 교체)
  const cohort = useMemo(()=> {
    const weeks = 8
    const ordByW: number[] = Array.from({length:weeks},(_,i)=>{
      const picked = rows.filter(r=> (num(r.week_index)||0)===i)
      return picked.reduce((s,r)=> s+num(r.orders),0)
    })
    return ordByW
  },[rows])

  // ====== UI
  return (
    <div className="page">
      <h1>C2 — 전환/커머스 레이더</h1>

      {/* AOV 워터폴 */}
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
        <div className="card">
          <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
            <b>AOV 워터폴</b>
            <span className="badge">{fmt(aovData.aov)} / 주문</span>
          </div>
          <div className="waterfall" style={{display:'flex', gap:12}}>
            {[
              {label:'장바구니', val:aovData.carts},
              {label:'주문', val:aovData.orders},
              {label:'매출', val:aovData.revenue},
            ].map((s,i)=>(
              <div key={i} className="wf-seg" title={`${s.label}: ${fmt(s.val)}`} style={{
                flex:1, background:'var(--panel)', borderRadius:'var(--radius)',
                boxShadow:'var(--shadow)', padding:'var(--pad)'
              }}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>{s.label}</div>
                <div style={{fontWeight:700}}>{fmt(s.val)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 코호트/ltv */}
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
          <div className="card"><div className="muted" style={{fontSize:12, marginBottom:6}}>코호트(주간)</div><CohortSpark values={cohort}/></div>
          <LtvCurve cohort={cohort}/>
        </div>
      </div>

      {/* 히트맵 */}
      <div className="card" style={{marginTop:'var(--gap)'}}>
        <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
          <b>상품 × 소스 히트맵 (CR)</b>
          {focus && (
            <span className="badge">
              {focus.prod} / {focus.ch} — 클릭하면 상세
            </span>
          )}
        </div>
        <div className="scroll">
          <table className="table">
            <thead>
              <tr>
                <th>상품 \ 소스</th>
                {xcats.map(ch=> <th key={ch}>{ch}</th>)}
              </tr>
            </thead>
            <tbody>
              {prods.map(p=>{
                return (
                  <tr key={p}>
                    <td><b>{p}</b></td>
                    {xcats.map(ch=>{
                      const v = cellValue(p, ch)
                      const heat = Math.min(1, v.cr*3) // 간단 가중
                      return (
                        <td key={ch}>
                          <button
                            className="cell"
                            onClick={()=> setFocus({prod:p, ch})}
                            title={`CR ${pct(v.cr)} (orders ${fmt(v.orders)}, clicks ${fmt(v.clicks)})`}
                            style={{
                              width:'100%', padding:'8px',
                              background:`rgba(79,227,193,${0.08+0.35*heat})`,
                              borderRadius:8
                            }}
                          >
                            {pct(v.cr)}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* 드릴다운 모달(간단형) */}
        {focus && (
          <div className="modal" onClick={()=>setFocus(null)}>
            <div className="modal-body" onClick={e=>e.stopPropagation()}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <b>{focus.prod} / {focus.ch}</b>
                <button className="btn" onClick={()=>setFocus(null)}>닫기</button>
              </div>
              <div className="muted" style={{marginTop:6}}>최근 추이</div>
              <CohortSpark values={
                rows
                  .filter(r=> (r.channel||'unknown')===focus.ch && (r.product||r.sku||'generic')===focus.prod)
                  .slice(-20)
                  .map(r=> (num(r.orders)&&num(r.clicks))? num(r.orders)/Math.max(1,num(r.clicks)) : 0)
              }/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

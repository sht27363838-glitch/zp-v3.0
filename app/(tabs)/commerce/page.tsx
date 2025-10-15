'use client'

import React, { useMemo, useState, useDeferredValue } from 'react'
import { readCsvOrDemo, parseCsv, type CsvTable } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import CohortSpark from '../../_components/CohortSpark'
import LtvCurve from '../../_components/LtvCurve'
import useIdle from '../../_lib/useIdle'
import ScrollWrap from '../../_components/ScrollWrap'

type Row = Record<string, any>

const [focus, setFocus] = useState<{ prod: string; ch: string } | null>(null);

export default function Commerce(){
  // ✅ 데모 대체 로더
  const raw = readCsvOrDemo('kpi_daily')
  const tbl: CsvTable = useMemo(()=> raw? parseCsv(raw): {headers:[], rows:[]}, [raw])
  const rows = (tbl.rows as Row[]) || []

  // ===== AOV 워터폴 (장바구니→주문→매출)
  const aovData = useMemo(()=>{
    let carts=0, orders=0, revenue=0
    for(const r of rows){ carts+=num(r.carts); orders+=num(r.orders); revenue+=num(r.revenue) }
    return { carts, orders, revenue, aov: orders? revenue/orders : 0 }
  },[rows])

  // ===== 전환 히트맵 인덱스 캐시(상품×소스 집계 맵)
  const heatMapIndex = useMemo(()=>{
    const m = new Map<string,{clicks:number;orders:number}>()
    for(const r of rows){
      const ch = r.channel || 'unknown'
      const p  = r.product || r.sku || 'generic'
      const k  = `${p}__${ch}`
      const ref = m.get(k) || {clicks:0, orders:0}
      ref.clicks += num(r.clicks)
      ref.orders += num(r.orders)
      m.set(k, ref)
    }
    return m
  }, [rows])

  const xcats = useMemo(()=> Array.from(new Set(rows.map(r=> r.channel||'unknown'))), [rows])
  const prods = useMemo(()=> Array.from(new Set(rows.map(r=> r.product||r.sku||'generic'))), [rows])

  function cellValue(prod:string, ch:string){
    const k = `${prod}__${ch}`
    const v = heatMapIndex.get(k) || {clicks:0, orders:0}
    return { clicks: v.clicks, orders: v.orders, cr: v.clicks ? v.orders/Math.max(1,v.clicks) : 0 }
  }

  // ===== 코호트/LTV (데모: 최근 8주)
  const cohort = useMemo(()=> {
    const weeks = 8
    return Array.from({length:weeks},(_,i)=>{
      let s=0; for(const r of rows) if((num(r.week_index)||0)===i) s+=num(r.orders)
      return s
    })
  },[rows])

  // LTV용 누적 배열
  const cum = useMemo(()=>{ let s=0; return cohort.map(v=> (s+=Number(v)||0)) }, [cohort])

  // ===== 성능: 무거운 섹션은 한 박자 늦게 + 입력 지연
  const idleReady = useIdle(500)
  const deferredRows = useDeferredValue(rows)

  return (
    <div className="page">
      <h1>C2 — 전환/커머스 레이더</h1>

      {/* AOV 워터폴 + 코호트/LTV */}
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
        <div className="card">
          <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
            <b>AOV 워터폴</b>
            <span className="badge">{fmt(aovData.aov)} / 주문</span>
          </div>
          <div className="waterfall" style={{display:'flex', gap:12}}>
            {[
              {label:'장바구니', val:aovData.carts},
              {label:'주문',     val:aovData.orders},
              {label:'매출',     val:aovData.revenue},
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

        {!idleReady ? (
          <div className="skeleton" style={{ height: 180 }} />
        ) : (
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
            <div className="card">
              <div className="muted" style={{fontSize:12, marginBottom:6}}>코호트(주간)</div>
              <CohortSpark series={cohort}/>
            </div>
            <LtvCurve cum={cum}/>
          </div>
        )}
      </div>

      {/* 히트맵 */}
      {!idleReady ? (
        <div className="skeleton" style={{ height: 260, marginTop: 'var(--gap)' }} />
      ) : (
        <div className="card" style={{marginTop:'var(--gap)'}}>
          <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
            <b>상품 × 소스 히트맵 (CR)</b>
          </div>
          <ScrollWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>상품 \ 소스</th>
                  {xcats.map(ch=> <th key={ch}>{ch}</th>)}
                </tr>
              </thead>
              <tbody>
                {prods.map(p=>(
                  <tr key={p}>
                    <td><b>{p}</b></td>
                    {xcats.map(ch=>{
                      const v = cellValue(p, ch)
                      const heat = Math.min(1, v.cr*3)
                      return (
                        <td key={ch}>
                          <button
                            className="cell"
                            // 모달 드릴다운은 deferredRows 기준
                            onClick={()=> setFocus({prod:p, ch})}
                            aria-label={`CR ${pct(v.cr)} / 주문 ${fmt(v.orders)} / 클릭 ${fmt(v.clicks)}`}
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
                ))}
              </tbody>
            </table>
          </ScrollWrap>

          {/* 드릴다운 모달 */}
          {focus && (
            <div className="modal" onClick={()=>setFocus(null)}>
              <div className="modal-body" onClick={e=>e.stopPropagation()}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <b>{focus.prod} / {focus.ch}</b>
                  <button className="btn" onClick={()=>setFocus(null)}>닫기</button>
                </div>
                <div className="muted" style={{marginTop:6}}>최근 추이</div>
                <CohortSpark
                  series={
                    deferredRows
                      .filter(r=> (r.channel||'unknown')===focus.ch && (r.product||r.sku||'generic')===focus.prod)
                      .slice(-20)
                      .map(r=> (num(r.orders)&&num(r.clicks))? num(r.orders)/Math.max(1,num(r.clicks)) : 0)
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

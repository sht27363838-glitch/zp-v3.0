'use client'

import { sourceTag } from '@lib/csvSafe'
import React, { useMemo, useState, useDeferredValue } from 'react'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv, type CsvTable } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import CohortSpark from '@cmp/CohortSpark'
import LtvCurve from '@cmp/LtvCurve'
import useIdle from '@lib/useIdle'

type Row = Record<string, any>

export default function Commerce(){
  const raw = readCsvOrDemo('kpi_daily')
  const tbl: CsvTable = useMemo(()=> parseCsv(raw), [raw])
  const rows = (tbl.rows as Row[]) || []

  const aovData = useMemo(()=>{
    let carts=0, orders=0, revenue=0
    for(const r of rows){ carts+=num(r.carts); orders+=num(r.orders); revenue+=num(r.revenue) }
    return { carts, orders, revenue, aov: orders? revenue/orders : 0 }
  },[rows])

  // idle + deferred
  const idleReady = useIdle(500)
  const deferredRows = useDeferredValue(rows)

  // 코호트/누적
  const cohort = useMemo(()=>{
    const weeks = 8
    return Array.from({length:weeks},(_,i)=>{
      let s=0; for(const r of rows) if((num(r.week_index)||0)===i) s+=num(r.orders)
      return s
    })
  },[rows])
  const cum = useMemo(()=>{ let s=0; return cohort.map(v=> (s+=Number(v)||0)) },[cohort])

  // 히트맵 O(N) 집계: product×channel 키로 1패스
  const heat = useMemo(()=>{
    const map = new Map<string, {product:string; channel:string; clicks:number; orders:number}>()
    for(const r of deferredRows){
      const product = (r.product||r.sku||'generic') as string
      const channel = (r.channel||'unknown') as string
      const key = product+'|'+channel
      const o = map.get(key) || {product, channel, clicks:0, orders:0}
      o.clicks += num(r.clicks); o.orders += num(r.orders)
      map.set(key,o)
    }
    const prods = Array.from(new Set(deferredRows.map(r=> (r.product||r.sku||'generic') as string)))
    const chans = Array.from(new Set(deferredRows.map(r=> (r.channel||'unknown') as string)))
    return {
      products: prods,
      channels: chans,
      value(prod:string, ch:string){
        const m = map.get(prod+'|'+ch)
        const clicks = m?.clicks||0, orders=m?.orders||0
        const cr = clicks? orders/Math.max(1,clicks) : 0
        return {clicks, orders, cr}
      }
    }
  },[deferredRows])

  const [focus, setFocus] = useState<{prod:string; ch:string} | null>(null)

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
  <h1>C2 — 전환/커머스 레이더</h1>
  <span className="badge">{sourceTag('kpi_daily')}</span>
</div>


      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
        <div className="card">
          <div className="row" style={{justifyContent:'space-between', marginBottom:8, display:'flex'}}>
            <b>AOV 워터폴</b>
            <span className="badge">{fmt(aovData.aov)} / 주문</span>
          </div>
          <div className="waterfall" style={{display:'flex', gap:12}}>
            {[{label:'장바구니', val:aovData.carts},{label:'주문',val:aovData.orders},{label:'매출',val:aovData.revenue}]
              .map((s,i)=>(
                <div key={i} className="wf-seg" title={`${s.label}: ${fmt(s.val)}`} style={{
                  flex:1, background:'var(--panel)', borderRadius:'var(--radius)',
                  boxShadow:'var(--shadow)', padding:'var(--pad)'}}>
                  <div className="note" style={{marginBottom:6}}>{s.label}</div>
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
              <div className="note" style={{marginBottom:6}}>코호트(주간)</div>
              <CohortSpark series={cohort}/>
            </div>
            <LtvCurve cum={cum}/>
          </div>
        )}
      </div>

      {!idleReady ? (
        <div className="skeleton" style={{ height: 260, marginTop: 'var(--gap)' }} />
      ) : (
        <div className="card" style={{marginTop:'var(--gap)'}}>
          <div className="row" style={{justifyContent:'space-between', marginBottom:8, display:'flex'}}>
            <b>상품 × 소스 히트맵 (CR)</b>
            {focus && <span className="badge">{focus.prod} / {focus.ch} — 클릭하면 상세</span>}
          </div>
          <div className="scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>상품 \ 소스</th>
                  {heat.channels.map(ch=> <th key={ch}>{ch}</th>)}
                </tr>
              </thead>
              <tbody>
                {heat.products.map(p=>(
                  <tr key={p}>
                    <td><b>{p}</b></td>
                    {heat.channels.map(ch=>{
                      const v = heat.value(p,ch)
                      const t = Math.min(1, v.cr*3)
                      return (
                        <td key={ch}>
                          <button
                            className="cell"
                            onClick={()=> setFocus({prod:p, ch})}
                            aria-label={`CR ${pct(v.cr)} / 주문 ${fmt(v.orders)} / 클릭 ${fmt(v.clicks)}`}
                            style={{
                              width:'100%', padding:'8px',
                              background:`rgba(79,227,193,${0.08+0.35*t})`,
                              borderRadius:8
                            }}>
                            {pct(v.cr)}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {focus && (
            <div className="modal" onClick={()=>setFocus(null)}>
              <div className="modal-body" onClick={e=>e.stopPropagation()}>
                <div className="row" style={{justifyContent:'space-between', display:'flex'}}>
                  <b>{focus.prod} / {focus.ch}</b>
                  <button className="btn" onClick={()=>setFocus(null)}>닫기</button>
                </div>
                <div className="note" style={{marginTop:6}}>최근 추이</div>
                <CohortSpark series={
                  deferredRows
                    .filter(r=> (r.channel||'unknown')===focus.ch && (r.product||r.sku||'generic')===focus.prod)
                    .slice(-20)
                    .map(r=> (num(r.orders)&&num(r.clicks))? num(r.orders)/Math.max(1,num(r.clicks)) : 0)
                }/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

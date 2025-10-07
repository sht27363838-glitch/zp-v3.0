'use client'
import React, {useMemo} from 'react'

export default function LtvCurve({cohort}:{cohort:number[]}){
  const cum = useMemo(()=>{
    const a:number[] = []
    let s = 0
    for(const v of cohort){ s+= (v||0); a.push(s) }
    return a
  },[cohort])
  if(!cum.length) return null
  const w = 200, h = 60
  const max = Math.max(...cum, 1)
  const pts = cum.map((v,i)=>{
    const x = (i/(cum.length-1||1))*w
    const y = h - (v/max)*h
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="card" style={{padding:'var(--pad)'}}>
      <div className="muted" style={{fontSize:12, marginBottom:6}}>LTV(누적)</div>
      <svg width={w} height={h}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth={2}/></svg>
    </div>
  )
}

'use client'
import React from 'react'

export type ReportFilter = {
  channel: string   // ''면 전체
  from: string      // 'YYYY-MM-DD' | ''
  to: string        // same
}

export default function ReportFilterBar({
  value, onChange, channels
}:{
  value: ReportFilter
  onChange: (v:ReportFilter)=>void
  channels: string[]
}){
  return (
    <div className="row" style={{gap:8, margin:'8px 0'}}>
      <select className="btn" value={value.channel} onChange={e=>onChange({...value, channel:e.target.value})}>
        <option value="">전체 채널</option>
        {channels.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
      <input className="btn" type="date" value={value.from} onChange={e=>onChange({...value, from:e.target.value})}/>
      <span className="muted">~</span>
      <input className="btn" type="date" value={value.to} onChange={e=>onChange({...value, to:e.target.value})}/>
      <button className="btn" onClick={()=>onChange({channel:'', from:'', to:''})}>초기화</button>
    </div>
  )
}

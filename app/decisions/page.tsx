
'use client'
import React from 'react'
import { loadCSV } from '../_lib/patch_loader'
import { computeKpi, decisionGate, fmt } from '../_lib/patch_calc'

type Log = { ts:number, channel:string, action:string }

const btn = {
  base: { padding:'6px 10px', borderRadius:12, fontSize:12, fontWeight:600, border:'1px solid transparent', cursor:'pointer' } as React.CSSProperties,
  primary: { background:'#0EA5E9', color:'#0F1216', borderColor:'#0891B2' } as React.CSSProperties,
  neutral: { background:'#232A31', color:'#E6EAF0', borderColor:'#2f3944' } as React.CSSProperties,
  danger:  { background:'#EF4444', color:'#0F1216', borderColor:'#DC2626' } as React.CSSProperties,
}

export default function Decisions(){
  const [rows,setRows] = React.useState<any[]>([])
  const [log,setLog] = React.useState<Log[]>([])
  React.useEffect(()=>{
    (async()=>{
      const kpi = await loadCSV('kpi_daily.csv')
      const by:Record<string, any[]> = {}
      for(const r of kpi){ (by[r.channel||'unknown'] ||= []).push(r) }
      const list = Object.entries(by).map(([ch,rs])=>{
        const k = computeKpi(rs as any)
        const CPA = k.total.orders? k.total.ad_cost/k.total.orders : 0
        const CTR = (k.total.clicks||0) / Math.max(1, (k.total.visits||0))
        const act = decisionGate({ROAS:k.ROAS, AOV:k.AOV, CPA, CTR})
        return {channel:ch, ROAS:k.ROAS, AOV:k.AOV, CPA, CTR, action:act}
      }).sort((a,b)=> (b.ROAS||0) - (a.ROAS||0))
      setRows(list)
      const saved = JSON.parse(localStorage.getItem('dq_log')||'[]')
      setLog(saved)
    })()
  },[])

  const doAction=(ch:string, action:string)=>{
    const e = {ts:Date.now(), channel:ch, action}
    const next = [e, ...log].slice(0,50)
    setLog(next); localStorage.setItem('dq_log', JSON.stringify(next))
  }

  return <div className='container'>
    <div className='card'>
      <h3>Decision Queue</h3>
      <table className='table'>
        <thead><tr><th>채널</th><th>ROAS</th><th>CPA</th><th>AOV</th><th>CTR</th><th>권고</th><th>조치</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td>{r.channel}</td>
              <td>{r.ROAS.toFixed(2)}</td>
              <td>{fmt.n(Math.round(r.CPA||0))}</td>
              <td>{fmt.n(Math.round(r.AOV||0))}</td>
              <td>{(r.CTR*100).toFixed(2)}%</td>
              <td>
                <span className={'badge '+(r.action==='SCALE'?'success':r.action==='KEEP'?'primary':'danger')}>
                  {r.action}
                </span>
              </td>
              <td style={{display:'flex', gap:8}}>
                <button
                  aria-label='예산 증액'
                  style={{...btn.base, ...btn.primary}}
                  onClick={()=>doAction(r.channel,'예산↑')}>예산↑</button>
                <button
                  aria-label='보류'
                  style={{...btn.base, ...btn.neutral}}
                  onClick={()=>doAction(r.channel,'보류')}>보류</button>
                <button
                  aria-label='중지'
                  style={{...btn.base, ...btn.danger}}
                  onClick={()=>doAction(r.channel,'중지')}>중지</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='card'>
      <h3>최근 조치 로그</h3>
      <div className='mono'>{log.map(l=> new Date(l.ts).toLocaleString()+' • '+l.channel+' • '+l.action).join('\n')||'—'}</div>
    </div>
  </div>
}

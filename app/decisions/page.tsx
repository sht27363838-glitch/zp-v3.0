
'use client'
import React from 'react'
import { loadCSV } from '../_lib/patch_loader'
import { computeKpi, decisionGate, fmt } from '../_lib/patch_calc'

type Log = { ts:number, channel:string, action:string }

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
        // HOTFIX: CTR 은 clicks / visits 로 계산 (impressions 컬럼 의존 제거)
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
              <td><span className={'badge '+(r.action==='SCALE'?'success':r.action==='KEEP'?'primary':'danger')}>{r.action}</span></td>
              <td>
                <button className='badge primary' onClick={()=>doAction(r.channel,'예산↑')}>예산↑</button>{' '}
                <button className='badge' onClick={()=>doAction(r.channel,'보류')}>보류</button>{' '}
                <button className='badge danger' onClick={()=>doAction(r.channel,'중지')}>중지</button>
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

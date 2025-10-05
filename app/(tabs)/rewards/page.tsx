'use client'

import React from 'react'
import { readCsvFromLocal, parseCsv } from '../../_lib/readCsv'
import { num, fmt } from '../../_lib/num'

type LedgerRow = {
  date?: string
  quest_id?: string
  type?: string
  stable_amt?: string
  edge_amt?: string
  lock_until?: string
  proof_url?: string
}

export default function RewardsPage(){
  const [rows, setRows] = React.useState<LedgerRow[]>([])
  const [summary, setSummary] = React.useState({stable:0, edge:0, total:0})

  React.useEffect(()=>{
    const csv = readCsvFromLocal('ledger')
    const list = parseCsv(csv) as LedgerRow[]
    const stable = list.reduce((s,r)=> s + num(r.stable_amt), 0)
    const edge   = list.reduce((s,r)=> s + num(r.edge_amt), 0)
    setRows(list)
    setSummary({stable, edge, total: stable+edge})
  },[])

  return (
    <div className="page">
      <h1>Rewards (Ledger)</h1>
      <div className="kpis">
        <div className="tile">
          <div className="label">안정 합계</div>
          <div className="value">{fmt(summary.stable,0)} 원</div>
        </div>
        <div className="tile">
          <div className="label">엣지 합계</div>
          <div className="value">{fmt(summary.edge,0)} 원</div>
        </div>
        <div className="tile">
          <div className="label">총 보상</div>
          <div className="value">{fmt(summary.total,0)} 원</div>
        </div>
      </div>

      <div style={{overflow:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>일자</th>
              <th>미션</th>
              <th>유형</th>
              <th style={{textAlign:'right'}}>안정</th>
              <th style={{textAlign:'right'}}>엣지</th>
              <th>락업 종료</th>
              <th>증빙</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td>{r.date || ''}</td>
                <td>{r.quest_id || ''}</td>
                <td>{r.type || ''}</td>
                <td style={{textAlign:'right'}}>{fmt(num(r.stable_amt),0)}</td>
                <td style={{textAlign:'right'}}>{fmt(num(r.edge_amt),0)}</td>
                <td>{r.lock_until || ''}</td>
                <td>{r.proof_url ? <a href={r.proof_url} target="_blank" rel="noreferrer">링크</a> : '-'}</td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td colSpan={7} style={{opacity:.7}}>데이터가 없습니다. Tools 탭에서 ledger CSV를 저장해 주세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

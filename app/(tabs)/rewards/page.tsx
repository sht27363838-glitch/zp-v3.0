'use client'
import React, {useMemo} from 'react'
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'

type LedgerRow = {
  date?: string
  type?: string
  mission?: string
  stable?: string
  edge?: string
  stable_amt?: string
  edge_amt?: string
  note?: string
  lock_until?: string
}

export default function RewardsPage(){
  const raw = readCsvLS('ledger') || ''
  const data: CsvRows = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
    [raw]
  )
  const rows = data.rows as LedgerRow[]

  let stableSum = 0, edgeSum = 0
  for (const r of rows) {
    // v2 호환(stable_amt/edge_amt) + v3(stable/edge)
    const st = num(r.stable ?? r.stable_amt)
    const eg = num(r.edge ?? r.edge_amt)
    stableSum += st
    edgeSum   += eg
  }
  const total = stableSum + edgeSum
  const edgeShare = total ? edgeSum/total : 0

  return (
    <div className="page">
      <h1>Rewards (C4)</h1>

      <div className="kpi-grid">
        <KpiTile label="안정 합계" value={fmt(stableSum)} />
        <KpiTile label="엣지 합계" value={fmt(edgeSum)} />
        <KpiTile label="엣지 비중" value={pct(edgeShare)} />
      </div>

      <div className="table-wrap" style={{maxHeight:480, overflow:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>date</th><th>type</th><th>mission</th>
              <th>stable</th><th>edge</th><th>note</th><th>lock_until</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>{
              const st = num(r.stable ?? r.stable_amt)
              const eg = num(r.edge ?? r.edge_amt)
              return (
                <tr key={i}>
                  <td>{r.date||''}</td>
                  <td>{r.type||''}</td>
                  <td>{r.mission||''}</td>
                  <td>{fmt(st)}</td>
                  <td>{fmt(eg)}</td>
                  <td>{r.note||''}</td>
                  <td>{r.lock_until||''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KpiTile({label, value}:{label:string; value:string}){
  return (
    <div className="kpi-tile">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}


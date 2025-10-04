
'use client'
import React from 'react'
import { loadCSV } from '../_lib/patch_loader'
import { fmt, daysLeft, num } from '../_lib/patch_calc'

export default function Rewards(){
  const [rows,setRows] = React.useState<any[]>([])
  React.useEffect(()=>{ (async()=>{ setRows(await loadCSV('ledger.csv')) })() },[])
  const totalStable = rows.reduce((a,r)=> a+num(r.stable_amt),0)
  const totalEdge   = rows.reduce((a,r)=> a+num(r.edge_amt),0)
  return <div className='container'>
    <div className='grid'>
      <div className='col-12'>
        <div className='card'>
          <h3>보상 적립 타임라인</h3>
          <div className='hint'>누적 안정 {fmt.n(totalStable)} / 엣지 {fmt.n(totalEdge)}</div>
          <table className='table' style={{marginTop:10}}>
            <thead><tr><th>일자</th><th>미션</th><th>안정</th><th>엣지</th><th>락업</th><th>증빙</th></tr></thead>
            <tbody>
              {rows.map((r,i)=>{const d=daysLeft(String(r.lock_until||'')); return <tr key={i}>
                <td>{String(r.date)}</td>
                <td>{String(r.type||r.quest_id)}</td>
                <td>{fmt.n(num(r.stable_amt))}</td>
                <td>{fmt.n(num(r.edge_amt))}</td>
                <td>{d>0? d+'일 남음':'해제'}</td>
                <td><a href={String(r.proof_url||'#')} target='_blank'>링크</a></td>
              </tr>})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
}

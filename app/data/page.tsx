'use client'
import React from 'react'
import { loadCSV } from '../_lib/csv'

const FILES = ['settings.csv','kpi_daily.csv','creative_results.csv','ledger.csv','rebalance_log.csv','commerce_items.csv','returns.csv']

export default function Data(){
  const [map,setMap]=React.useState<Record<string,string>>({})
  const [status,setStatus]=React.useState('')

  React.useEffect(()=>{
    const raw = localStorage.getItem('zp_data_sources')
    setMap(raw? JSON.parse(raw) : {})
  },[])

  function save(){ localStorage.setItem('zp_data_sources', JSON.stringify(map)); setStatus('저장 완료'); setTimeout(()=>setStatus(''),2000) }
  function reset(){ localStorage.removeItem('zp_data_sources'); setMap({}); setStatus('초기화 완료'); setTimeout(()=>setStatus(''),2000) }
  async function test(name:string){
    setStatus('테스트 중...')
    const rows = await loadCSV(name)
    setStatus(`${name}: ${rows.length}행 확인`)
  }

  return <div>
    <div className='card'><b>데이터 파이프(반자동) — v3.0</b>
      <div className='hint'>Drive/Dropbox 링크 저장 → 각 화면에서 원격 CSV 사용</div>
    </div>
    {FILES.map(f=>
      <div className='card' key={f} style={{display:'flex',gap:8,alignItems:'center'}}>
        <div style={{minWidth:160,fontWeight:600}}>{f}</div>
        <input style={{flex:1}} value={map[f]||''} placeholder='공유 링크' onChange={e=>setMap({...map,[f]:e.target.value})}/>
        <button className='badge' onClick={()=>test(f)}>테스트</button>
      </div>
    )}
    <div className='badges'>
      <button className='badge success' onClick={save}>저장</button>
      <button className='badge warn' onClick={reset}>초기화</button>
    </div>
    {status && <div className='hint'>{status}</div>}
  </div>
}

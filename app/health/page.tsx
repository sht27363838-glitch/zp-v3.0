'use client'
import React from 'react'
import { loadCSV } from '../_lib/csv'

export default function Health(){
  const [state,setState] = React.useState<any>({})
  React.useEffect(()=>{
    (async()=>{
      const kpi = await loadCSV('kpi_daily.csv')
      const led = await loadCSV('ledger.csv')
      const mapEnv = (process.env.ZP_DATA_SOURCES||'')||'(env 비어있음)'
      const mapLS = typeof window!=='undefined' ? (localStorage.getItem('zp_data_sources')||'(localStorage 비어있음)') : '(브라우저 아님)'
      setState({kpiCount:kpi.length, ledCount:led.length, env: mapEnv, ls: mapLS})
    })()
  },[])
  return <div className='card'>
    <b>Vercel Health</b>
    <div className='mono' style={{whiteSpace:'pre-wrap', marginTop:8}}>
      kpi_daily.csv rows: {String(state.kpiCount)}{"\n"}
      ledger.csv rows:   {String(state.ledCount)}{"\n"}
      ZP_DATA_SOURCES (env): {String(state.env)}{"\n"}
      zp_data_sources (localStorage): {String(state.ls)}
    </div>
    <div className='hint' style={{marginTop:8}}>kpi/ledger 카운트가 0이면 /public/data/에 샘플 CSV가 없거나, 원격 링크 매핑이 비어있습니다.</div>
  </div>
}

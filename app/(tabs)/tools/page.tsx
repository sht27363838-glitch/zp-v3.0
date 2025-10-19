'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { injectDemo, resetDemo } from '@lib/csvSafe'  // resetDemo(keys: Array<'kpi_daily'|'ledger'|'settings'>)

const CsvWizard = dynamic(() => import('@cmp/CsvWizard'), { ssr:false })

export default function ToolsPage(){
  return (
    <div className="page">
      <h1>도구</h1>

      <div className="card" style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
        <button className="btn" onClick={()=>injectDemo('kpi_daily')}>데모 KPI 주입</button>
        <button className="btn" onClick={()=>injectDemo('ledger')}>데모 Ledger 주입</button>
        <button className="btn" onClick={()=>resetDemo(['kpi_daily'])}>KPI 초기화(LIVE)</button>
        <button className="btn" onClick={()=>resetDemo(['ledger'])}>Ledger 초기화(LIVE)</button>
      </div>

      <div style={{marginTop:12}}>
        <CsvWizard />
      </div>
    </div>
  )
}


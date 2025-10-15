'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import ErrorBanner from '@cmp/ErrorBanner'
import { injectDemo, clearToLive } from '@lib/csvSafe'

const CsvWizard = dynamic(() => import('@cmp/CsvWizard'), { ssr:false })

export default function ToolsPage(){
  return (
    <div className="container page">
      <h1>도구</h1>

      <ErrorBanner tone="info" title="데이터 소스 안내"
        message="아래 버튼으로 데모 데이터를 즉시 주입/초기화할 수 있습니다." show />

      <div className="row" style={{gap:8, margin:'8px 0', display:'flex'}}>
        <button className="btn" onClick={()=>injectDemo('kpi_daily')}>데모 KPI 주입</button>
        <button className="btn" onClick={()=>injectDemo('ledger')}>데모 Ledger 주입</button>
        <button className="btn" onClick={()=>clearToLive('kpi_daily')}>KPI 초기화(LIVE)</button>
        <button className="btn" onClick={()=>clearToLive('ledger')}>Ledger 초기화(LIVE)</button>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="title">CSV 관리</div>
        <div className="note" style={{marginBottom:8}}>업로드/다운로드</div>
        <CsvWizard />
      </div>
    </div>
  )
}

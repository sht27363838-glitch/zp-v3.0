// app/(tabs)/tools/page.tsx
'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// CsvWizard는 클라이언트 전용이므로 SSR 비활성
const CsvWizard = dynamic(() => import('@cmp/CsvWizard'), { ssr: false })

export default function ToolsPage() {
  return (
    <div className="page">
      <h1>Tools</h1>
      <p className="muted">CSV 업/다운로드 & 검증</p>

      <div className="row" style={{gap:8, margin:'8px 0'}}>
  <button className="btn" onClick={()=>injectDemo('kpi_daily')}>데모 KPI 주입</button>
  <button className="btn" onClick={()=>injectDemo('ledger')}>데모 Ledger 주입</button>
</div>

      <div className="card">
        <CsvWizard />
      </div>
    </div>
  )
}

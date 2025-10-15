// app/_components/ExportBar.tsx
'use client'

import React from 'react'
import { toCsv } from '@lib/readCsv'

type Props = {
  /** 캡처/인쇄할 DOM 선택자 (예: '.kpi-grid' 또는 '#report-table') */
  selector: string
  /** CSV를 내보낼 때만 전달 (헤더/rows) — 없으면 CSV 버튼 숨김 */
  csv?: { headers: string[]; rows: any[] }
}

export default function ExportBar({ selector, csv }: Props) {
  async function capturePrint() {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return alert('캡처 대상을 찾지 못했습니다.')

    // 의존성 없이 프린트/PDF 저장으로 캡처 대체
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800')
    if (!w) return
    const styles = Array.from(document.styleSheets)
      .map((s, i) => {
        try {
          const rules = (s as CSSStyleSheet).cssRules
          return rules ? Array.from(rules).map(r => r.cssText).join('\n') : ''
        } catch {
          return '' // CORS 등 접근 불가 스타일은 스킵
        }
      })
      .join('\n')

    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Export</title>
          <style>${styles}</style>
          <style>
            body{margin:16px;background:white}
            .table thead th{position:sticky;top:0}
          </style>
        </head>
        <body>${el.outerHTML}</body>
      </html>
    `)
    w.document.close()
    w.focus()
    w.print()
  }

  function downloadCsv() {
    if (!csv) return
    const blob = new Blob([toCsv({ headers: csv.headers, rows: csv.rows as any })], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="export-bar" style={{ display: 'inline-flex', gap: 8 }}>
      <button className="btn" onClick={capturePrint}>캡처/인쇄</button>
      {csv && <button className="btn" onClick={downloadCsv}>CSV</button>}
    </div>
  )
}
 

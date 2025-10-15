'use client'

import React from 'react'
import { toCsv } from '@lib/readCsv'
import ExportBar from '@cmp/ExportBar'  // == app/_components/ExportBar


export default function ExportBar({selector, csv}:{selector:string; csv?: {headers:string[], rows:any[]}}){
  async function capture(){
    const el = document.querySelector(selector) as HTMLElement | null
    if(!el) return alert('캡처 대상을 찾지 못했습니다.')
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a'); a.href=url; a.download='export.png'; a.click()
  }
  function downloadCsv(){
    if(!csv) return
    const blob = new Blob([toCsv(csv as any)], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'data.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="row" style={{gap:8}}>
      <button className="btn" onClick={capture}>PNG 캡처</button>
      {csv && <button className="btn" onClick={downloadCsv}>CSV 다운로드</button>}
    </div>
  )
}

'use client'
import React from 'react'
import { readCsvLS } from '../_lib/readCsv'

export default function DownloadCsv({keyName, label}:{
  keyName: 'kpi_daily'|'ledger'|'settings'|string; label?: string
}){
  const onClick = ()=>{
    const txt = readCsvLS(keyName) || ''
    const blob = new Blob([txt], {type:'text/csv;charset=utf-8;'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${keyName}.csv`
    document.body.appendChild(a); a.click(); a.remove()
  }
  return (
    <button className="btn" onClick={onClick} disabled={!readCsvLS(keyName)}>
      {label || `${keyName}.csv 다운로드`}
    </button>
  )
}

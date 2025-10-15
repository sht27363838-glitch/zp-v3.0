'use client'
import React from 'react'
import { readCsvLS } from '../_lib/readCsv'

export default function DownloadCsv({
  keyName,
  label = 'CSV 다운로드',
}: {
  keyName: string
  label?: string
}) {
  const onClick = () => {
    const raw = readCsvLS(keyName) || ''
    const blob = new Blob([raw], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${keyName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn" onClick={onClick}>
      {label}
    </button>
  )
}

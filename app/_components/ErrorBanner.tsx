'use client'
import React from 'react'

export default function ErrorBanner({
  tone='danger',
  title='문제가 발생했습니다',
  message='잠시 후 다시 시도해 주세요.',
  show=false,
}:{
  tone?: 'danger'|'warn'|'info'
  title?: string
  message?: string
  show?: boolean
}) {
  if(!show) return null
  const toneBg = tone==='danger' ? '#FEE2E2' : tone==='warn' ? '#FEF3C7' : '#E0F2FE'
  const toneTx = '#111'
  return (
    <div style={{background:toneBg, color:toneTx, border:'1px solid #00000010',
      borderRadius:12, padding:'10px 12px', margin:'8px 0'}}>
      <b style={{marginRight:6}}>{title}</b>
      <span style={{opacity:.95}}>{message}</span>
    </div>
  )
}

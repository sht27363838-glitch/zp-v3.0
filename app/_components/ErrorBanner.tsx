'use client'
import React from 'react'

export default function ErrorBanner(
  { title='확인 필요', message, tone='warn' }:
  { title?: string; message: string; tone?: 'warn'|'danger'|'info' }
){
  const bg = tone==='danger' ? 'rgba(255,107,107,.12)'
           : tone==='info'   ? 'rgba(79,227,193,.12)'
           : 'rgba(240,195,106,.12)'
  const color = tone==='danger' ? '#b3261e' : tone==='info' ? '#0b5' : '#8a6d3b'
  return (
    <div style={{
      background:bg, border:`1px solid ${color}33`, color,
      padding:'10px 12px', borderRadius:'12px', margin:'12px 0'
    }}>
      <b style={{marginRight:8}}>{title}</b>
      <span style={{opacity:.9}}>{message}</span>
    </div>
  )
}

'use client'
import React from 'react'

type Props = {
  /** 기본 권장 prop */
  series?: number[]
  /** 실수 방지용 별칭(하위 호환) */
  values?: number[]
}

export default function CohortSpark({ series, values }: Props){
  const data = (series ?? values ?? []).map((v, i) => ({ x: i, y: Number(v) || 0 }))

  if (!data.length) return <div className="muted" style={{fontSize:12}}>데이터 없음</div>

  // 아주 가벼운 스파크라인 (SVG)
  const width = 220, height = 42, pad = 4
  const max = Math.max(...data.map(d => d.y), 1)
  const step = (width - pad*2) / Math.max(data.length - 1, 1)
  const points = data
    .map((d, i) => {
      const x = pad + i * step
      const y = height - pad - (d.y / max) * (height - pad*2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} style={{display:'block', opacity:'var(--dim-1)'}}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}


// app/_components/Spark.tsx
'use client'
import React from 'react'

type Props = {
  /** 권장: values 사용 (이전 호환용으로 series도 허용) */
  values?: number[]
  series?: number[]
  width?: number
  height?: number
}

export default function Spark({ values, series, width = 240, height = 60 }: Props) {
  const data = (values ?? series ?? []).map(v => Number(v || 0))
  const n = data.length
  const w = width
  const h = height
  const pad = 4

  if (n <= 1) {
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="empty spark" />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1

  const sx = (i: number) => pad + i * ((w - 2 * pad) / (n - 1))
  const sy = (v: number) => h - pad - ((v - min) / span) * (h - 2 * pad)

  let d = `M ${sx(0)} ${sy(data[0])}`
  for (let i = 1; i < n; i++) {
    d += ` L ${sx(i)} ${sy(data[i])}`
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  )
}

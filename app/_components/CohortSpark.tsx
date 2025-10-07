'use client'
import React from 'react'

type Props = { values?: number[]; series?: number[]; height?: number }
export default function CohortSpark({ values, series, height = 56 }: Props) {
  const v = values ?? series ?? []
  if (!v.length) return <div style={{ height }} />
  const max = Math.max(...v, 1e-9)
  const min = Math.min(...v, 0)
  const width = Math.max(80, v.length * 10)
  const xs = v.map((_, i) => (i / Math.max(1, v.length - 1)) * (width - 2))
  const ys = v.map(n => height - 2 - ((n - min) / (max - min || 1)) * (height - 4))
  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x + 1},${ys[i] + 1}`).join(' ')
  return (
    <svg width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

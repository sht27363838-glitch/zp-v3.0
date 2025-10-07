'use client'
import React from 'react'

type Props = {
  /** 표준 prop */
  values?: number[]
  /** 과거 호환(있어도 되고 없어도 됨) */
  data?: number[]
  series?: number[]
  width?: number
  height?: number
}

export default function Spark({
  values, data, series, width = 160, height = 40,
}: Props) {
  const v = values ?? data ?? series ?? []
  if (!v.length) return <div style={{ width, height }} />

  const max = Math.max(...v, 1e-9)
  const min = Math.min(...v, 0)
  const xs = v.map((_, i) => (i / Math.max(1, v.length - 1)) * (width - 2))
  const ys = v.map(n => height - 2 - ((n - min) / (max - min || 1)) * (height - 4))

  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x + 1},${ys[i] + 1}`).join(' ')

  return (
    <svg width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

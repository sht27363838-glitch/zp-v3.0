'use client'
import React from 'react'

type Props = {
  /** 권장 */
  series?: number[]
  /** 하위호환(예전 코드에서 사용) */
  data?: number[]
  width?: number
  height?: number
  strokeWidth?: number
}

const Spark: React.FC<Props> = ({
  series, data,
  width = 160, height = 40, strokeWidth = 2,
}) => {
  const values = (series ?? data ?? []).map(v => Number(v) || 0)
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const span = (max - min) || 1
  const step = values.length > 1 ? (width - 4) / (values.length - 1) : (width - 4)

  const pts = values.map((v, i) => {
    const x = 2 + i * step
    const y = height - 2 - ((v - min) / span) * (height - 4)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} aria-label="sparkline">
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Spark

'use client'
import React from 'react'

export type Props = { values: number[]; width?: number; height?: number }
export default function Spark({ values, width=280, height=64 }: Props){
  const max = Math.max(1, ...values)
  const pts = values.map((v,i)=>{
    const x = (i/Math.max(1, values.length-1))*width
    const y = height - (v/max)*height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

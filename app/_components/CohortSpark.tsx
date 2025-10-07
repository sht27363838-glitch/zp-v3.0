'use client'
import React from 'react'

export default function CohortSpark({values}:{values:number[]}){
  if(!values?.length) return null
  const w = 160, h = 40
  const max = Math.max(...values, 1)
  const pts = values.map((v,i)=>{
    const x = (i/(values.length-1||1))*w
    const y = h - (v/max)*h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeOpacity={0.8} strokeWidth={2}/>
    </svg>
  )
}

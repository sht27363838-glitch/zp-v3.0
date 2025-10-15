'use client'
import React from 'react'

type Props<T> = {
  rows: T[]
  rowHeight?: number
  threshold?: number // rows 개수 이 이상일 때 가상화
  renderRow: (r:T, i:number)=> React.ReactNode
  header: React.ReactNode
  className?: string
}
export default function VirtualTable<T>({
  rows, rowHeight=40, threshold=2000, renderRow, header, className
}:Props<T>){
  if(rows.length < threshold){
    return (
      <table className={className}>
        {header}
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    )
  }
  // 아주 단순 가상화: 뷰포트 기준 slice
  const [scrollTop, setTop] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const vh = 520
  const start = Math.max(0, Math.floor(scrollTop/rowHeight) - 10)
  const end   = Math.min(rows.length, Math.ceil((scrollTop+vh)/rowHeight)+10)
  const padTop = start*rowHeight
  const padBot = (rows.length-end)*rowHeight
  return (
    <div ref={ref} style={{maxHeight:vh, overflow:'auto'}} onScroll={e=>setTop((e.target as HTMLDivElement).scrollTop)}>
      <table className={className}>{header}</table>
      <div style={{height:padTop}}/>
      <table className={className}><tbody>
        {rows.slice(start,end).map((r,i)=> renderRow(r, start+i))}
      </tbody></table>
      <div style={{height:padBot}}/>
    </div>
  )
}

'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string             // 예) 96, '120px', '12ch'
  className?: string                  // 'num' 주면 우측정렬
  render?: (row: T) => React.ReactNode
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number                     // 스크롤 높이
  rowHeight?: number                  // (옵션) 보기 좋게 일정 높이
}

export default function VirtualTable<T>({
  rows, columns, rowKey, className='table', height = 420, rowHeight = 40,
}: Props<T>) {

  return (
    <div className="card" style={{padding:0}}>
      <div className="scroll" style={{maxHeight: height, overflow:'auto'}}>
        <table className={className} style={{width:'100%'}}>
          {/* 1) 헤더/바디 열폭을 ‘완전히’ 일치시키는 colgroup */}
          <colgroup>
            {columns.map((c, i) => (
              <col key={i} style={c.width ? { width: typeof c.width==='number' ? `${c.width}px` : c.width } : undefined}/>
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={c.className || undefined}>{c.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={rowKey(r, idx)} style={{height: rowHeight}}>
                {columns.map((c, i) => {
                  const content = c.render ? c.render(r) : (r as any)[c.key as string]
                  return (
                    <td key={i} className={c.className || undefined}>
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

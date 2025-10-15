// app/_components/VirtualTable.tsx
'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'

type Props<T> = {
  rows: T[]
  renderRow: (row: T, index: number) => React.ReactNode
  header?: React.ReactNode
  className?: string
  /** 뷰포트 높이(px). 기본 480 */
  height?: number
  /** 행 높이(px). 기본 40 */
  rowHeight?: number
  /** 화면 밖으로 여분으로 그릴 행 수. 기본 8 */
  overscan?: number
  /** 각 행의 key. 기본: index */
  rowKey?: (row: T, index: number) => React.Key
}

export default function VirtualTable<T>({
  rows,
  renderRow,
  header,
  className,
  height = 480,
  rowHeight = 40,
  overscan = 8,
  rowKey,
}: Props<T>) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const total = rows.length
  const viewportCount = Math.max(1, Math.ceil(height / rowHeight))
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(total, start + viewportCount + overscan * 2)

  const padTop = start * rowHeight
  const padBottom = (total - end) * rowHeight
  const slice = useMemo(() => rows.slice(start, end), [rows, start, end])

  return (
    <div
      ref={wrapRef}
      style={{ maxHeight: height, overflow: 'auto', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
    >
      <table className={className || 'table'} style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        {header}
        <tbody>
          {padTop > 0 && (
            <tr aria-hidden>
              <td style={{ height: padTop, padding: 0 }} />
            </tr>
          )}
          {slice.map((row, i) => (
            <tr key={rowKey ? rowKey(row, start + i) : start + i} style={{ height: rowHeight }}>
              {renderRow(row, start + i)}
            </tr>
          ))}
          {padBottom > 0 && (
            <tr aria-hidden>
              <td style={{ height: padBottom, padding: 0 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

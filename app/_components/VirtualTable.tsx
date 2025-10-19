// app/_components/VirtualTable.tsx
'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string            // 96 | '120px' | '12ch'
  className?: string                 // 'num' → 우측정렬
  render?: (row: T) => React.ReactNode
  sortable?: boolean                 // 정렬 허용
  sortKey?: (row: T) => number|string
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number
  rowHeight?: number
  /** 행이 0건일 때 렌더할 컴포넌트(없으면 기본 “데이터 없음”) */
  emptySlot?: React.ReactNode
  /** 테이블 하단 고정 푸터(합계행 등) */
  footer?: React.ReactNode
}

type SortState = { key?: string; dir: 'asc' | 'desc' }

export default function VirtualTable<T>({
  rows,
  columns,
  rowKey,
  className = 'table',
  height = 420,
  rowHeight = 40,
  emptySlot,
  footer,
}: Props<T>) {
  const [sort, setSort] = React.useState<SortState>({ dir: 'asc' })

  const sortedRows = React.useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find(c => (c.key as string) === sort.key)
    if (!col) return rows
    const getVal = col.sortKey ?? ((r: any) => r[sort.key as string])

    const copy = [...rows]
    copy.sort((a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      // 숫자 우선 비교
      const na = typeof va === 'number' ? va : Number(va ?? NaN)
      const nb = typeof vb === 'number' ? vb : Number(vb ?? NaN)
      let cmp: number
      if (!Number.isNaN(na) && !Number.isNaN(nb)) cmp = na - nb
      else cmp = String(va ?? '').localeCompare(String(vb ?? ''), 'ko')
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sort, columns])

  function toggleSort(key: string) {
    setSort(prev => (prev.key !== key ? { key, dir: 'asc' } : { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  function thProps(c: Column<T>): React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
    if (!c.sortable) return {}
    const isActive = sort.key === (c.key as string)
    const ariaSort: React.AriaAttributes['aria-sort'] =
      isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
    return {
      role: 'button',
      tabIndex: 0,
      onClick: () => toggleSort(c.key as string),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleSort(c.key as string)
        }
      },
      'aria-sort': ariaSort,
      'aria-label': '정렬',
      className: `sortable ${isActive ? 'active' : ''} ${c.className || ''}`.trim(),
    }
  }

  const SortIcon = ({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) => (
    <svg
      aria-hidden
      width="10" height="10" viewBox="0 0 24 24"
      style={{ marginLeft: 6, opacity: active ? 1 : .35, transform: dir === 'asc' ? 'scaleY(-1)' : 'none' }}
    >
      <path d="M7 10l5-5 5 5H7zm0 4h10l-5 5-5-5z" fill="currentColor"/>
    </svg>
  )

  if (sortedRows.length === 0) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="scroll" style={{ maxHeight: height, overflow: 'auto' }}>
          {emptySlot ?? (
            <div style={{ padding: 16, color: 'var(--muted)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="scroll" style={{ maxHeight: height, overflow: 'auto' }}>
        <table className={className} style={{ width: '100%' }}>
          <colgroup>
            {columns.map((c, i) => (
              <col
                key={i}
                style={c.width ? { width: typeof c.width === 'number' ? `${c.width}px` : c.width } : undefined}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => {
                const key = c.key as string
                const active = sort.key === key
                return (
                  <th key={i} {...thProps(c)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {c.header}
                      {c.sortable && <SortIcon active={active} dir={active ? sort.dir : 'asc'} />}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r, idx) => (
              <tr key={rowKey(r, idx)} style={{ height: rowHeight }}>
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

          {footer && (
            <tfoot>
              <tr>
                <td colSpan={columns.length}>{footer}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}




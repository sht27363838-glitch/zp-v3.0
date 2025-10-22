// app/_components/VirtualTable.tsx
'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string
  className?: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  sortKey?: (row: T) => number | string
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number
  rowHeight?: number
  /** 0건일 때 보여줄 커스텀 뷰(없으면 공통 empty-state) */
  empty?: React.ReactNode
  /** 테이블 하단 고정 푸터(합계/평균 등) */
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
  empty,
  footer,
}: Props<T>) {
  const [sort, setSort] = React.useState<SortState>({ dir: 'asc' })

  const sortedRows = React.useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find(c => (c.key as string) === sort.key)
    if (!col) return rows
    const getVal = col.sortKey ? col.sortKey : (r: any) => r[sort.key as string]
    const copy = [...rows]
    copy.sort((a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      const na = typeof va === 'number' ? va : Number(va ?? NaN)
      const nb = typeof vb === 'number' ? vb : Number(vb ?? NaN)
      let cmp: number
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        cmp = na - nb
      } else {
        const sa = String(va ?? '')
        const sb = String(vb ?? '')
        cmp = sa.localeCompare(sb, 'ko')
      }
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
    const style: React.CSSProperties = {
      userSelect: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }
    return {
      role: 'button',
      tabIndex: 0,
      onClick: () => toggleSort(c.key as string),
      onKeyDown: (e: React.KeyboardEvent<HTMLTableHeaderCellElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleSort(c.key as string)
        }
      },
      'aria-sort': ariaSort,
      'aria-label': '정렬',
      style,
      className: `sortable${isActive ? ' active' : ''}${c.className ? ` ${c.className}` : ''}`,
    }
  }

  if (sortedRows.length === 0) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="empty-state">{empty ?? '데이터 없음'}</div>
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
              {columns.map((c, i) => (
                <th key={i} {...thProps(c)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>{c.header}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r, idx) => (
              <tr key={rowKey(r, idx)} style={{ height: rowHeight }}>
                {columns.map((c, i) => {
                  const content = c.render ? c.render(r) : (r as any)[c.key as string]
                  const cls = c.className ? c.className : undefined
                  return (
                    <td key={i} className={cls}>
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
                <td colSpan={columns.length}>
                  <div className="vt-footer">{footer}</div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}






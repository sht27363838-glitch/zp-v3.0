'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string              // 96 | '120px' | '12ch'
  className?: string                   // 'num' → 우측정렬
  render?: (row: T) => React.ReactNode
  sortable?: boolean                   // 정렬 허용
  sortKey?: (row: T) => number | string
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number
  rowHeight?: number
  /** 빈 상태일 때 보여줄 콘텐츠 (기본: '데이터 없음') */
  empty?: React.ReactNode
}

type SortState = { key?: string; dir: 'asc' | 'desc' }

export default function VirtualTable<T>({
  rows,
  columns,
  rowKey,
  className = 'table',
  height = 420,
  rowHeight = 40,
  empty = <div className="card" style={{padding:12}}>데이터 없음</div>,
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
      onKeyDown: (e: React.KeyboardEvent<HTMLTableHeaderCellElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleSort(c.key as string)
        }
      },
      'aria-sort': ariaSort,
      'aria-label': '정렬',
      className: `sortable ${isActive ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''} ${c.className || ''}`.trim(),
    }
  }

  if (!rows || rows.length === 0) {
    return <div className="card" style={{padding:0}}>{empty}</div>
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="scroll" style={{ maxHeight: height, overflow: 'auto' }}>
        <table className={className} style={{ width: '100%' }}>
          <colgroup>
            {columns.map((c, i) => (
              <col
                key={i}
                style={
                  c.width
                    ? { width: typeof c.width === 'number' ? `${c.width}px` : c.width }
                    : undefined
                }
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} {...thProps(c)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    {c.header}
                    {c.sortable && <span aria-hidden className="sort-indicator" />}
                  </span>
                </th>
              ))}
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
        </table>
      </div>

      <style jsx>{`
        :global(th.sortable){ user-select:none; cursor:pointer; }
        :global(th .sort-indicator){
          width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:6px solid currentColor; opacity:.45; transform:translateY(1px);
        }
        :global(th.sortable.asc .sort-indicator){ transform:rotate(180deg) translateY(-1px); opacity:1; }
        :global(th.sortable.desc .sort-indicator){ opacity:1; }
      `}</style>
    </div>
  )
}



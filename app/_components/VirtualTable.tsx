// app/_components/VirtualTable.tsx
'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string               // 96 | '120px' | '12ch'
  className?: string                    // 'num' → 우측정렬
  render?: (row: T) => React.ReactNode
  sortable?: boolean                    // 정렬 허용 여부
  sortKey?: (row: T) => number | string // 정렬용 키
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number
  rowHeight?: number
  /** ✅ 합계/요약 등을 위한 하단 슬롯 */
  footer?: React.ReactNode
}

type SortState = { key?: string; dir: 'asc' | 'desc' }

export default function VirtualTable<T>({
  rows, columns, rowKey, className='table', height = 420, rowHeight = 40, footer,
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
    const style: React.CSSProperties = { userSelect: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }
    return {
      role: 'button',
      tabIndex: 0,
      onClick: () => toggleSort(c.key as string),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort(c.key as string) }
      },
      'aria-sort': ariaSort,
      'aria-label': '정렬',
      style,
    }
  }

  const SortIcon = ({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) => (
    <span aria-hidden style={{ display: 'inline-block', marginLeft: 6, opacity: active ? 1 : .35, transform: dir === 'asc' ? 'rotate(180deg)' : 'none' }}>
      ▾
    </span>
  )

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="scroll" style={{ maxHeight: height, overflow: 'auto' }}>
        <table className={className} style={{ width: '100%' }}>
          {/* 헤더/바디 폭 일치 */}
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
                  <th key={i} className={c.className || undefined} {...thProps(c)}>
                    <span style={{ display:'inline-flex', alignItems:'center' }}>
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
        </table>
      </div>

      {/* ✅ 합계/요약 바 */}
      {footer && (
        <div className="table-footer" style={{
          display:'flex', justifyContent:'flex-end', gap:16,
          padding:'10px 12px', borderTop:'var(--border)', background:'color-mix(in oklab, var(--panel) 85%, transparent)'
        }}>
          {footer}
        </div>
      )}
    </div>
  )
}





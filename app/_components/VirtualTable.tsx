'use client'
import React from 'react'

type Column<T> = {
  key: keyof T | string
  header: React.ReactNode
  width?: number | string             // 예) 96, '120px', '12ch'
  className?: string                  // 'num' 주면 우측정렬
  render?: (row: T) => React.ReactNode
  sortable?: boolean                  // ✅ 클릭 정렬 활성화
  sortKey?: keyof T | string          // ✅ 따로 정렬 기준을 쓰고 싶을 때
  compare?: (a: T, b: T) => number    // ✅ 커스텀 비교 함수(옵션)
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T, idx: number) => React.Key
  className?: string
  height?: number                     // 스크롤 높이
  rowHeight?: number                  // (옵션) 보기 좋게 일정 높이
}

type SortState = { key?: string; dir: 'asc' | 'desc' }

export default function VirtualTable<T>({
  rows, columns, rowKey, className='table', height = 420, rowHeight = 40,
}: Props<T>) {

  // ✅ 정렬 상태
  const [sort, setSort] = React.useState<SortState>({ key: undefined, dir: 'asc' })

  // 정렬 로직(문자/숫자 안전 비교)
  const sortedRows = React.useMemo(() => {
    const col = columns.find(c => (c.sortable && (String(c.sortKey ?? c.key) === sort.key)))
    if (!col || !sort.key) return rows

    const dirMul = sort.dir === 'asc' ? 1 : -1
    const k = String(col.sortKey ?? col.key)

    // 커스텀 compare가 있으면 그걸 우선 사용
    if (col.compare) {
      return [...rows].sort((a, b) => col.compare!(a, b) * dirMul)
    }

    const get = (r: any) => r?.[k]
    return [...rows].sort((a: any, b: any) => {
      const av = get(a)
      const bv = get(b)

      // null/undefined 마지막으로 보냄
      const aU = (av === null || av === undefined)
      const bU = (bv === null || bv === undefined)
      if (aU && bU) return 0
      if (aU) return 1
      if (bU) return -1

      // 숫자 우선 비교
      const an = typeof av === 'number' ? av : Number(av)
      const bn = typeof bv === 'number' ? bv : Number(bv)
      const aIsNum = Number.isFinite(an)
      const bIsNum = Number.isFinite(bn)

      if (aIsNum && bIsNum) {
        if (an === bn) return 0
        return an > bn ? dirMul : -dirMul
      }

      // 문자열 비교(대소문자 무시)
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      if (as === bs) return 0
      return as > bs ? dirMul : -dirMul
    })
  }, [rows, columns, sort])

  // 🔽 헤더 클릭 핸들러/접근성 props
  function thProps(col: Column<T>) {
    if (!col.sortable) return {}
    const key = String(col.sortKey ?? col.key)
    const active = sort.key === key
    const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: () => setSort(s => ({
        key,
        dir: active ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc'
      })),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).click()
        }
      },
      'aria-sort': ariaSort,
      'aria-label': `정렬: ${key} (${active ? (sort.dir === 'asc' ? '오름차순' : '내림차순') : '클릭하여 정렬'})`,
      style: { cursor: 'pointer', userSelect: 'none' }
    }
  }

  // 정렬 표시 화살표
  function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
    if (!active) return <span style={{opacity:.35, marginLeft:6}}>↕</span>
    return <span style={{marginLeft:6}}>{dir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div className="card" style={{padding:0}}>
      <div className="scroll" style={{maxHeight: height, overflow:'auto'}}>
        <table className={className} style={{width:'100%'}}>
          {/* 1) 헤더/바디 열폭을 ‘완전히’ 일치시키는 colgroup */}
          <colgroup>
            {columns.map((c, i) => (
              <col
                key={i}
                style={c.width ? { width: typeof c.width==='number' ? `${c.width}px` : c.width } : undefined}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => {
                const key = String(c.sortKey ?? c.key)
                const active = sort.key === key
                return (
                  <th key={i} className={c.className || undefined} {...thProps(c)}>
                    <span style={{display:'inline-flex', alignItems:'center'}}>
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

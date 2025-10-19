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
  /** 데이터 없을 때 표시할 노드 */
  empty?: React.ReactNode
  /** 테이블 하단 합계·평균 등 푸터(TFOOT) */
  footer?: React.ReactNode
}

type SortState = { key?: string; dir: 'asc' | 'desc' }

export default function VirtualTable<T>({
  rows, columns, rowKey, className='table', height=420, rowHeight=40, empty, footer,
}: Props<T>) {

  const [sort, setSort] = React.useState<SortState>({ dir: 'asc' })

  const sortedRows = React.useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find(c => (c.key as string) === sort.key)
    if (!col) return rows
    const getVal = col.sortKey ?? ((r:any)=> r[sort.key as string])

    const copy = [...rows]
    copy.sort((a,b)=>{
      const va=getVal(a), vb=getVal(b)
      const na = typeof va==='number'? va : Number(va ?? NaN)
      const nb = typeof vb==='number'? vb : Number(vb ?? NaN)
      let cmp:number
      if(!Number.isNaN(na) && !Number.isNaN(nb)) cmp = na-nb
      else cmp = String(va??'').localeCompare(String(vb??''), 'ko')
      return sort.dir==='asc'? cmp : -cmp
    })
    return copy
  }, [rows, sort, columns])

  const toggleSort = (key:string)=>{
    setSort(prev => prev.key!==key ? ({key,dir:'asc'}) : ({key,dir:prev.dir==='asc'?'desc':'asc'}))
  }

  function thProps(c: Column<T>): React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
    if (!c.sortable) return {}
    const isActive = sort.key === (c.key as string)
    return {
      role: 'button',
      tabIndex: 0,
      onClick: ()=> toggleSort(c.key as string),
      onKeyDown: e=>{
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSort(c.key as string) }
      },
      'aria-sort': isActive? (sort.dir==='asc'?'ascending':'descending') : 'none',
      'aria-label': '정렬',
      style: { userSelect:'none', cursor:'pointer', whiteSpace:'nowrap' } as React.CSSProperties,
    }
  }

  const SortIcon = ({ active, dir }:{active:boolean; dir:'asc'|'desc'})=>(
    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" style={{marginLeft:6, opacity:active?1:.35}}>
      {dir==='asc'
        ? <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  )

  return (
    <div className="card" style={{padding:0}}>
      <div className="scroll" style={{maxHeight:height, overflow:'auto'}}>
        <table className={className} style={{width:'100%'}}>
          <colgroup>
            {columns.map((c,i)=>(
              <col key={i} style={c.width? {width: typeof c.width==='number'? `${c.width}px` : c.width}: undefined}/>
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c,i)=>{
                const key = c.key as string
                const active = sort.key===key
                return (
                  <th key={i} className={c.className||undefined} {...thProps(c)}>
                    <span style={{display:'inline-flex', alignItems:'center'}}>
                      {c.header}
                      {c.sortable && <SortIcon active={active} dir={active ? sort.dir : 'asc'}/>}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          {sortedRows.length===0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  {empty ?? <div className="empty-state">표시할 데이터가 없습니다.</div>}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {sortedRows.map((r,idx)=>(
                <tr key={rowKey(r,idx)} style={{height:rowHeight}}>
                  {columns.map((c,i)=>{
                    const v = c.render? c.render(r) : (r as any)[c.key as string]
                    return <td key={i} className={c.className||undefined}>{v}</td>
                  })}
                </tr>
              ))}
            </tbody>
          )}

          {footer && <tfoot><tr><td colSpan={columns.length}>{footer}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  )
}




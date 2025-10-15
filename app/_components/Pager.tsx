'use client'
import React, {useMemo, useState} from 'react'

export default function Pager<T>({
  data, pageSize=50, render,
}:{
  data: T[]
  pageSize?: number
  render: (page: T[], meta:{page:number; pages:number; total:number; setPage:(n:number)=>void}) => React.ReactNode
}) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil((data?.length||0) / pageSize))
  const safePage = Math.min(Math.max(1,page), pages)
  const slice = useMemo(()=>{
    const s = (safePage-1)*pageSize
    return (data||[]).slice(s, s+pageSize)
  },[data, pageSize, safePage])

  return (
    <>
      {render(slice, {page:safePage, pages, total:data?.length||0, setPage})}
      {pages>1 && (
        <div className="row" style={{gap:8, marginTop:8, display:'flex', alignItems:'center'}}>
          <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>이전</button>
          <span className="badge">{safePage} / {pages}</span>
          <button className="btn" onClick={()=>setPage(p=>Math.min(pages,p+1))}>다음</button>
        </div>
      )}
    </>
  )
}

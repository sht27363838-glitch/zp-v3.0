// app/_components/Pager.tsx
'use client'
import React, {useMemo, useState} from 'react'

export default function Pager<T>({
  data, pageSize = 50, render
}:{ data:T[]; pageSize?:number; render:(page:T[])=>React.ReactNode }){
  const [p,setP] = useState(1)
  const pages = Math.max(1, Math.ceil(data.length / pageSize))
  const page = useMemo(()=>{
    const s = (p-1)*pageSize
    return data.slice(s, s+pageSize)
  },[data, p, pageSize])

  if(!data.length) return null

  return (
    <div>
      {render(page)}
      {pages>1 && (
        <div className="row" style={{gap:8, marginTop:8, alignItems:'center'}}>
          <button className="btn" onClick={()=>setP(Math.max(1,p-1))} disabled={p===1}>이전</button>
          <span className="muted">{p} / {pages}</span>
          <button className="btn" onClick={()=>setP(Math.max(1,Math.min(pages,p+1)))} disabled={p===pages}>다음</button>
        </div>
      )}
    </div>
  )
}

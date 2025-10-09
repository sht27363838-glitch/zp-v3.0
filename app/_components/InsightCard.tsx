'use client'
import React from 'react'
import Spark from './Spark'

export default function InsightCard({
  title, note, series, right, children,
  h=68, w=420
}:{
  title:string
  note?:string
  series?:number[]
  right?:React.ReactNode
  children?:React.ReactNode
  h?:number
  w?:number
}){
  return (
    <div className="card" style={{display:'grid', gap:8}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontWeight:700}}>{title}</div>
          {note && <div className="muted" style={{fontSize:12}}>{note}</div>}
        </div>
        {right}
      </div>
      {series && <Spark series={series} height={h} width={w} />}
      {children}
    </div>
  )
}

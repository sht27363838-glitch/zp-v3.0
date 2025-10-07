'use client'
import React, {useState} from 'react'
import Modal from './Modal'
import Spark from './Spark'

type Cell = { product:string; source:string; cr:number; orders:number; clicks:number; series:number[] }

export default function HeatMap({cells}:{cells:Cell[]}){
  const [pick,setPick] = useState<Cell|null>(null)
  const open = (c:Cell)=> setPick(c)
  const close = ()=> setPick(null)

  return (
    <>
      <div className="grid" style={{display:'grid', gridTemplateColumns:'160px repeat(6,1fr)', gap:6}}>
        {cells.map((c,i)=>(
          <div key={i}
            className="cell"
            title={`CR ${ (c.cr||0).toFixed(2) }%  · 주문 ${c.orders} · 클릭 ${c.clicks}`}
            onClick={()=>open(c)}
            style={{background:heat(c.cr)}}
          />
        ))}
      </div>

      {pick && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3>{pick.product} × {pick.source}</h3>
              <button className="btn" onClick={close}>닫기</button>
            </div>
            <Spark series={pick.series} height={64}/>
          </div>
        </div>
      )}
    </>
  )
}

function heat(v:number){
  // 0~5% 범위 단순 보간 — 색 과장 없이 가독성 위주
  const t = Math.max(0, Math.min(1, v/5))
  const g = Math.round(180 + 50*t)
  const b = Math.round(180 - 80*t)
  return `rgb(40,${g},${b})`
}
